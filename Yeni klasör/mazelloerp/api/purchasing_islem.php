<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';
require_once 'auth_check.php'; // Güvenlik

$action = isset($_GET['action']) ? $_GET['action'] : '';

// --- HELPER FUNC ---
function sendError($msg, $code = 400)
{
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $msg]);
    exit;
}

function sendSuccess($data = [])
{
    echo json_encode(array_merge(['status' => 'success'], $data));
    exit;
}

try {
    switch ($action) {

        // 1. GET PURCHASE LIST
        case 'get_purchases':
            ob_clean();
            $sql = "SELECT s.*, c.ad_soyad as tedarikci_adi 
                    FROM satin_almalar s 
                    LEFT JOIN cariler c ON s.tedarikci_id = c.id 
                    ORDER BY s.created_at DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $purchases = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format dates and numbers for convenience if needed, but frontend can handle it
            sendSuccess(['data' => $purchases]);
            break;

        // 2. GET PURCHASE DETAILS
        case 'get_purchase_details':
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if (!$id)
                sendError('ID Gerekli');

            $stmt = $db->prepare("SELECT * FROM satin_alma_detaylari WHERE satin_alma_id = ?");
            $stmt->execute([$id]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch product names
            foreach ($items as &$item) {
                $pStmt = $db->prepare("SELECT urun_adi, stok_kodu FROM urunler WHERE id = ?");
                $pStmt->execute([$item['urun_id']]);
                $prod = $pStmt->fetch(PDO::FETCH_ASSOC);
                $item['urun_adi'] = $prod ? $prod['urun_adi'] : 'Silinmiş Ürün';
                $item['stok_kodu'] = $prod ? $prod['stok_kodu'] : '';
            }

            sendSuccess(['items' => $items]);
            break;

        // 3. CREATE PURCHASE (Main Logic)
        case 'create_purchase':
            // Verify Boss/Admin Role? Usually purchasing is restricted, but we'll allow all auth users for now.

            $data = json_decode(file_get_contents("php://input"), true);

            $tedarikci_id = $data['tedarikci_id'];
            $tarih = $data['tarih'] ?? date('Y-m-d H:i:s');
            $hedef = $data['hedef']; // 'depo', 'magaza', 'musteri'
            $aciklama = $data['aciklama'] ?? '';
            $items = $data['items']; // Array of {urun_id, miktar, alis_fiyati}

            if (!$tedarikci_id || empty($items))
                sendError('Eksik bilgi: Tedarikçi ve ürünler zorunludur.');
            if (!in_array($hedef, ['depo', 'magaza', 'musteri']))
                sendError('Geçersiz hedef Depo/Mağaza/Müşteri');

            // --- ROLE BASED VALIDATION ---
            $userRole = $_SESSION['role'] ?? 'guest';
            if ($userRole === 'depo' && $hedef === 'magaza') {
                sendError('Depocu yetkisiyle sadece Depo veya Müşteri için mal kabul yapabilirsiniz.');
            }
            if ($userRole === 'plasiyer' && $hedef === 'depo') {
                sendError('Plasiyer yetkisiyle sadece Mağaza veya Müşteri için mal kabul yapabilirsiniz.');
            }

            $db->beginTransaction();

            // A. Create Purchase Record
            $total = 0;
            foreach ($items as $i)
                $total += ($i['miktar'] * $i['alis_fiyati']);

            $stmt = $db->prepare("INSERT INTO satin_almalar (tedarikci_id, tarih, toplam_tutar, durum, hedef, aciklama) VALUES (?, ?, ?, 'tamamlandi', ?, ?)");
            $stmt->execute([$tedarikci_id, $tarih, $total, $hedef, $aciklama]);
            $purchaseId = $db->lastInsertId();

            // B. Add Items & Update Stock
            foreach ($items as $item) {
                $uid = $item['urun_id'];
                $qty = $item['miktar'];
                $price = $item['alis_fiyati'];
                $rowTotal = $qty * $price;

                // Insert Detail
                $stmtDet = $db->prepare("INSERT INTO satin_alma_detaylari (satin_alma_id, urun_id, miktar, alis_fiyati, toplam_tutar) VALUES (?, ?, ?, ?, ?)");
                $stmtDet->execute([$purchaseId, $uid, $qty, $price, $rowTotal]);

                // Update Price in Product Card (Last Buy Price logic - optional but good)
                // $db->prepare("UPDATE urunler SET alis_fiyati = ? WHERE id = ?")->execute([$price, $uid]);

                // Update Stock
                if ($hedef === 'depo') {
                    $db->prepare("UPDATE urunler SET stok_miktari = stok_miktari + ? WHERE id = ?")->execute([$qty, $uid]);
                    // Add Stock Movement Log
                    $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, aciklama, tarih) VALUES (?, 'giris', ?, ?, NOW())")
                        ->execute([$uid, $qty, "Satın Alma (Depo) - ID:$purchaseId"]);

                } elseif ($hedef === 'magaza') {
                    $db->prepare("UPDATE urunler SET magaza_stok = magaza_stok + ? WHERE id = ?")->execute([$qty, $uid]);
                    // Add Stock Movement Log
                    $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, aciklama, tarih) VALUES (?, 'magaza_giris', ?, ?, NOW())")
                        ->execute([$uid, $qty, "Satın Alma (Mağaza) - ID:$purchaseId"]);

                } elseif ($hedef === 'musteri') {
                    $db->prepare("UPDATE urunler SET musteri_stok = musteri_stok + ? WHERE id = ?")->execute([$qty, $uid]);
                    // Customer stock logic is tricky. 
                    // 'musteri_stok' usually means 'Reserved for Customer'. 
                    // Buying directly for a customer implies it's reserved immediately.
                    $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, aciklama, tarih) VALUES (?, 'rezerve_giris', ?, ?, NOW())")
                        ->execute([$uid, $qty, "Satın Alma (Müşteri) - ID:$purchaseId"]);
                }
            }

            // C. Financial Update (Increase Supplier Balance - We Owe Them)
            // 'Alacak' (Credit) for Supplier means they have credit with us (We owe them).
            // Current 'bakiye' logic: Positive means they owe us? Or we owe them?
            // Usually for Customers: (+ / Borç) = They Owe Us. (- / Alacak) = We Owe Them (Advance payment).
            // For Suppliers: It should be consistent.
            // If we maintain "Always from Company Perspective":
            // - Receivable (Borç) = Positive
            // - Payable (Alacak) = Negative
            // So buying goods INCREASES our debt, i.e., makes the balance more NEGATIVE (Alacak).
            // Let's check 'borc_alacak_ekle' logic in 'save_data.php' if exists.

            // Assuming standard accounting:
            // Purchase -> Supplier Credit (Alacak).
            // Payment -> Supplier Debit (Borç).

            // UPDATE: In 'cariler' table, 'bakiye' usually tracks the net.
            // Let's decrease bakiye (Subtract total).

            // --- BAKIYE GUNCELLEME ---
            updateCariBakiye($db, $tedarikci_id);

            $db->commit();
            sendSuccess(['message' => 'Satın alma başarıyla oluşturuldu.']);
            break;

        default:
            sendError('Geçersiz işlem');
    }

} catch (PDOException $e) {
    if ($db->inTransaction())
        $db->rollBack();
    sendError('Veritabanı Hatası: ' . $e->getMessage(), 500);
}
?>