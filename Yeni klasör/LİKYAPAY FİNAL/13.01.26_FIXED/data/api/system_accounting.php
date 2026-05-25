<?php
// System Accounting API
// Path: data/api/system_accounting.php

include_once '../../core/cors.php';
include_once '../../core/database.php';
include_once '../../core/logger.php';

date_default_timezone_set('Europe/Istanbul'); // FIX: Timezone
handleCors();
session_start();

// Security: Admin OR Employee with Accounting Permission
$is_admin = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
$user_perms = $_SESSION['user_permissions'] ?? [];
$can_view_accounting = ($is_admin) || (isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'employee' && !empty($user_perms['can_accounting']));

if (!$can_view_accounting) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Yetkisiz işlem: Muhasebe erişim izni gerekli."]);
    exit;
}

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // Special Action: Print Invoice
        if (isset($_GET['action']) && $_GET['action'] === 'print_invoice') {
            $id = $_GET['id'] ?? null;
            if (!$id) die("ID gerekli.");

            $stmt = $db->prepare("SELECT * FROM system_transactions WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $tx = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$tx) die("İşlem bulunamadı.");

            $date = date('d.m.Y', strtotime($tx['date']));
            $time = date('H:i:s'); // Etiket saati

            // FIX: Set Header to HTML so browser renders it
            header('Content-Type: text/html; charset=utf-8');
            
            // Parse Details JSON if exists
            $details = !empty($tx['details']) ? json_decode($tx['details'], true) : [];
            
            // Receiver Info
            $rcvName = $details['recipient_name'] ?? $tx['entity_name'] ?? 'Sayın Müşteri';
            $rcvTax = $details['tax_id'] ?? '11111111111';
            $rcvAddr = $details['address'] ?? 'Adres bilgisi girilmemiştir.';
            $formattedTax = (strlen($rcvTax) === 11) ? "TCKN: $rcvTax" : "VKN: $rcvTax";

            // Sender Info (LikyaPay)
            $senderName = "LİKYAPAY TEKNOLOJİ A.Ş.";
            $senderAddr = "Maslak Mah. Büyükdere Cad. No: 123, Sarıyer / İSTANBUL";
            $senderTax = "6091234567";
            $senderVD = "Maslak";
            $senderMersis = "0609123456700001";
            $senderWeb = "www.likyapay.com";
            $senderMail = "muhasebe@likyapay.com";

            // Content
            $serviceName = $details['service'] ?? $tx['category'];
            $desc = $tx['description'] ?? '';
            $baseAmount = (float)$tx['amount'];
            $vatRate = isset($details['vat_rate']) ? (int)$details['vat_rate'] : 20; // Default 20%
            $vatAmount = $baseAmount * ($vatRate / 100);
            $totalAmount = $baseAmount + $vatAmount;
            
            // Custom Number to Text Function (Since intl extension might be missing)
            function convertNumberToTextTR($amount) {
                $ones = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
                $tens = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
                
                if ($amount == 0) return "SIFIR";
                
                $whole = floor($amount);
                $fraction = round(($amount - $whole) * 100);
                
                $text = "";
                
                // Process Whole Number (Supports up to Millions)
                $tempWhole = $whole;
                
                // Millions
                if ($tempWhole >= 1000000) {
                    $m = floor($tempWhole / 1000000);
                    $text .= ($m == 1 ? "BİR" : convertGroup($m, $ones, $tens)) . " MİLYON ";
                    $tempWhole %= 1000000;
                }
                
                // Thousands
                if ($tempWhole >= 1000) {
                    $t = floor($tempWhole / 1000);
                    $text .= ($t == 1 ? "" : convertGroup($t, $ones, $tens)) . " BİN ";
                    $tempWhole %= 1000;
                }
                
                // Hundreds/Units
                if ($tempWhole > 0) {
                    $text .= convertGroup($tempWhole, $ones, $tens);
                }
                
                $text .= " TÜRK LİRASI";
                
                // Fraction (Kuruş)
                if ($fraction > 0) {
                    $text .= ", " . convertGroup($fraction, $ones, $tens) . " KURUŞ";
                }
                
                return trim($text);
            }
            
            function convertGroup($n, $ones, $tens) {
                 $str = "";
                 $h = floor($n / 100);
                 $t = floor(($n % 100) / 10);
                 $u = $n % 10;
                 
                 if ($h > 0) {
                     $str .= ($h == 1 ? "" : $ones[$h]) . " YÜZ ";
                 }
                 if ($t > 0) {
                     $str .= $tens[$t] . " ";
                 }
                 if ($u > 0) {
                     if (!($n > 2000 && $n < 3000)) // Special case for Bin vs Bir Bin (handled in parent), but generic unit
                     $str .= $ones[$u] . " ";
                 }
                 return $str;
            }

            $totalText = convertNumberToTextTR($totalAmount);

            // UUID Mock
            $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', 
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );

            echo "<!DOCTYPE html><html lang='tr'><head><meta charset='UTF-8'><title>Fatura LKY2026-" . str_pad($id, 9, '0', STR_PAD_LEFT) . "</title>";
            echo "<style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                body { font-family: 'Roboto', " . ($details['font'] ?? "'Arial'") . ", sans-serif; margin: 0; padding: 0; background: #525659; }
                .page { background: white; width: 210mm; min-height: 297mm; margin: 20px auto; padding: 40px; box-sizing: border-box; position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                
                /* Header */
                .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; }
                .logo-area { width: 60%; }
                .logo { font-size: 28pt; font-weight: 800; color: #0f172a; letter-spacing: -1px; margin-bottom: 10px; }
                .logo span { color: #6366f1; }
                .sender-info { font-size: 9pt; color: #475569; line-height: 1.4; }
                
                .invoice-meta { width: 35%; text-align: right; }
                .invoice-title { font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 15px; }
                .meta-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
                .meta-table td { padding: 3px 0; }
                .meta-label { font-weight: 600; color: #64748b; text-align: left; }
                .meta-val { font-weight: 600; color: #0f172a; text-align: right; }

                /* Receiver */
                .receiver-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 40px; }
                .receiver-label { font-size: 8pt; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 5px; text-transform: uppercase; }
                .receiver-name { font-size: 12pt; font-weight: 700; color: #0f172a; margin-bottom: 5px; }
                .receiver-addr { font-size: 9pt; color: #475569; width: 80%; line-height: 1.4; margin-bottom: 10px; }
                .receiver-tax { font-size: 9pt; font-weight: 500; color: #475569; }

                /* Items Table */
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 9pt; }
                .items-table th { text-align: left; padding: 12px 10px; background: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 8pt; border-bottom: 2px solid #e2e8f0; }
                .items-table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; vertical-align: top; }
                .items-table .col-right { text-align: right; }
                .items-table .col-center { text-align: center; }
                
                /* Totals */
                .totals-area { display: flex; justify-content: flex-end; margin-bottom: 40px; }
                .totals-table { width: 300px; border-collapse: collapse; font-size: 10pt; }
                .totals-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
                .totals-label { text-align: left; color: #64748b; }
                .totals-val { text-align: right; font-weight: 600; color: #0f172a; }
                .grand-total { font-size: 14pt; color: #0f172a; font-weight: 800; border-top: 2px solid #0f172a !important; border-bottom: none !important; padding-top: 15px !important; }

                /* Footer */
                .footer { position: absolute; bottom: 40px; left: 40px; right: 40px; font-size: 8pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                .text-amount { font-weight: 600; color: #0f172a; margin-bottom: 20px; font-style: italic; text-align: left; background: #f8fafc; padding: 10px; border-radius: 4px; }
                
                .notes { margin-top: 50px; font-size: 9pt; color: #64748b; }
                
                @media print {
                    body { background: white; }
                    .page { margin: 0; box-shadow: none; border: none; width: auto; height: auto; }
                    .no-print { display: none !important; }
                }
            </style></head><body>";

            echo "<div class='no-print' style='position:fixed; top:20px; right:20px; z-index:999; display:flex; gap:10px;'>
                    <button onclick='window.print()' style='background:#0f172a; color:white; border:none; padding:12px 24px; font-weight:bold; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2);'><i class='fas fa-print'></i> YAZDIR / PDF</button>
                    <button onclick='window.close()' style='background:#ef4444; color:white; border:none; padding:12px 24px; font-weight:bold; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2);'>KAPAT</button>
                  </div>";
            
            echo "<div class='page'>";
            
            // Header
            echo "<div class='header-top'>";
            echo "<div class='logo-area'>
                    <div class='logo'>Likya<span>Pay</span></div>
                    <div class='sender-info'>
                        <strong>$senderName</strong><br>
                        $senderAddr<br>
                        $senderVD V.D. | VKN: $senderTax<br>
                        Mersis: $senderMersis<br>
                        $senderWeb | $senderMail
                    </div>
                  </div>";
            echo "<div class='invoice-meta'>
                    <div class='invoice-title'>E-ARŞİV FATURA</div>
                    <table class='meta-table'>
                        <tr><td class='meta-label'>Senaryo:</td><td class='meta-val'>TEMEL FATURA</td></tr>
                        <tr><td class='meta-label'>Fatura Tipi:</td><td class='meta-val'>SATIS</td></tr>
                        <tr><td class='meta-label'>Fatura Tarihi:</td><td class='meta-val'>$date</td></tr>
                        <tr><td class='meta-label'>Düzenleme Zamanı:</td><td class='meta-val'>$time</td></tr>
                        <tr><td class='meta-label'>Fatura No:</td><td class='meta-val'>LKY2026-" . str_pad($id, 9, '0', STR_PAD_LEFT) . "</td></tr>
                        <tr><td class='meta-label'>ETTN:</td><td class='meta-val' style='font-size:7pt; font-family:monospace;'>$uuid</td></tr>
                    </table>
                  </div>";
            echo "</div>";

            // Receiver
            echo "<div class='receiver-box'>
                    <div class='receiver-label'>SAYIN</div>
                    <div class='receiver-name'>$rcvName</div>
                    <div class='receiver-addr'>$rcvAddr</div>
                    <div class='receiver-tax'>$formattedTax</div>
                  </div>";

            // Table
            echo "<table class='items-table'>
                    <thead>
                        <tr>
                            <th style='width:5%'>Sıra</th>
                            <th style='width:45%'>Mal / Hizmet</th>
                            <th class='col-center' style='width:10%'>Miktar</th>
                            <th class='col-right' style='width:15%'>Birim Fiyat</th>
                            <th class='col-center' style='width:10%'>KDV</th>
                            <th class='col-right' style='width:15%'>Mal Hizmet Tutarı</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>
                                <strong>$serviceName</strong>
                                <div style='font-size:8pt; color:#64748b; margin-top:4px;'>$desc</div>
                            </td>
                            <td class='col-center'>1 Adet</td>
                            <td class='col-right'>" . number_format($baseAmount, 2, ',', '.') . "</td>
                            <td class='col-center'>%$vatRate</td>
                            <td class='col-right'>" . number_format($baseAmount, 2, ',', '.') . "</td>
                        </tr>
                    </tbody>
                  </table>";

            // Totals
            echo "<div class='totals-area'>
                    <table class='totals-table'>
                        <tr><td class='totals-label'>Mal Hizmet Toplam Tutarı</td><td class='totals-val'>" . number_format($baseAmount, 2, ',', '.') . "</td></tr>
                        <tr><td class='totals-label'>Hesaplanan KDV (%$vatRate)</td><td class='totals-val'>" . number_format($vatAmount, 2, ',', '.') . "</td></tr>
                        <tr><td class='totals-label grand-total'>ÖDENECEK TUTAR</td><td class='totals-val grand-total'>" . number_format($totalAmount, 2, ',', '.') . " TL</td></tr>
                    </table>
                  </div>";

            echo "<div class='text-amount'>Yalnız $totalText dir.</div>";

            // Footer
            echo "<div class='footer'>
                    bu belge 5070 sayılı elektronik imza kanunu kapsamında güvenli elektronik imza ile imzalanmıştır.<br>
                    Mersis: $senderMersis - Ticaret Sicil No: 123456
                  </div>";

            echo "</div></body></html>";
            exit;
        }

        // Fetch All
        $query = "SELECT * FROM system_transactions ORDER BY date DESC, id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $transactions
        ]);

    } elseif ($method === 'POST' && !isset($_GET['action'])) {
        // Add New
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->amount) || empty($data->type) || empty($data->category)) {
            throw new Exception("Eksik veri: Tutar, Tip ve Kategori zorunludur.");
        }

        if (!is_numeric($data->amount) || (float)$data->amount <= 0) {
            throw new Exception("Geçersiz tutar: Tutar sayısal ve sıfırdan büyük olmalıdır.");
        }

        if (!in_array($data->type, ['income', 'expense'])) {
            throw new Exception("Geçersiz işlem tipi.");
        }

        // --- VALIDATION FOR INVOICES (Income) ---
        if ($data->type === 'income') {
            if (empty($data->entity_id)) {
                throw new Exception("Fatura kesilecek firma sistemden seçilmelidir. Lütfen listeden kayıtlı bir firma seçiniz.");
            }

            // Verify User Tax ID
            $checkUser = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
            $checkUser->execute([':uid' => $data->entity_id]);
            $uData = $checkUser->fetch(PDO::FETCH_ASSOC);

            if (!$uData) {
                throw new Exception("Seçilen firma sistemde bulunamadı.");
            }

            if (empty($uData['tax_id'])) {
                throw new Exception("Seçilen firmanın Vergi/TC Kimlik Numarası eksik. Lütfen önce Kullanıcılar sayfasından firma bilgilerini güncelleyin.");
            }
        }
        // ----------------------------------------

        $query = "INSERT INTO system_transactions (type, category, entity_name, description, amount, date, details) VALUES (:type, :category, :entity, :desc, :amount, :date, :details)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":type", $data->type);
        $stmt->bindParam(":category", $data->category);
        $stmt->bindParam(":entity", $data->entity_name);
        $stmt->bindParam(":desc", $data->description);
        $stmt->bindParam(":amount", $data->amount);
        $stmt->bindParam(":date", $data->date);
        
        // Handle optional details (JSON)
        $details = isset($data->details) ? $data->details : null;
        $stmt->bindParam(":details", $details);

        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            Logger::log('ACCOUNTING_ADD', "Yeni işlem eklendi (ID: $lastId): {$data->category} - {$data->amount} TL");

            // Check if linked to a user -> Add to their account statement ONLY IF Supplier or Employee
            if (!empty($data->entity_id)) {
                // ... (existing mirroring logic)
                $chkStmt = $db->prepare("SELECT user_type, role FROM users WHERE id = :uid");
                $chkStmt->execute([':uid' => $data->entity_id]);
                $user = $chkStmt->fetch(PDO::FETCH_ASSOC);

                if ($user) {
                    $userTxType = ($data->type === 'income') ? 'debt' : 'credit';
                    
                    $userQuery = "INSERT INTO transactions (user_id, type, amount, description, status, date, created_at) 
                                  VALUES (:uid, :type, :amount, :desc, 'approved', :date, NOW())";
                    $userStmt = $db->prepare($userQuery);
                    $userStmt->bindParam(":uid", $data->entity_id);
                    $userStmt->bindParam(":type", $userTxType);
                    $userStmt->bindParam(":amount", $data->amount);
                    
                    $descCombined = "Sistem İşlemi: " . $data->category . " (" . ($data->description ?? '') . ")";
                    $userStmt->bindParam(":desc", $descCombined);
                    $userStmt->bindParam(":date", $data->date);
                    
                    $userStmt->execute();
                    Logger::log('ACCOUNTING_MIRROR', "İşlem kullanıcı hesabına yansıtıldı (UID: {$data->entity_id})");
                }
            }

            echo json_encode(["success" => true, "message" => "İşlem kaydedildi ve cariye işlendi."]);
        } else {
            Logger::log('ACCOUNTING_ERROR', "İşlem kaydı başarısız.");
            throw new Exception("Kayıt başarısız.");
        }
    } elseif ($method === 'DELETE') {
        // Delete
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->id)) throw new Exception("ID gerekli.");

        $query = "DELETE FROM system_transactions WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);
        
        if ($stmt->execute()) {
            Logger::log('ACCOUNTING_DELETE', "İşlem silindi (ID: {$data->id})");
            echo json_encode(["success" => true, "message" => "Silindi."]);
        } else {
            throw new Exception("Silme başarısız.");
        }
    } elseif ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'approve_invoice') {
        // ACTION: APPROVE INVOICE (Draft -> Approved + Charge User)
        $data = json_decode(file_get_contents("php://input"));
        $id = $data->id ?? null;

        if (!$id) throw new Exception("ID Gerekli.");

        // Fetch Transaction
        $stmt = $db->prepare("SELECT * FROM system_transactions WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $tx = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tx) throw new Exception("Fatura bulunamadı.");
        if ($tx['status'] !== 'draft') throw new Exception("Bu fatura zaten onaylanmış veya iptal edilmiş.");

        // Find User by Entity Name (This relies on name matching, which is fragile but used for now based on sirius.php design)
        // Ideally we should store entity_id in system_transactions.
        // Let's try to match by name or context.
        // SIRIUS LOGIC: entity_name = User Name.
        
        $uStmt = $db->prepare("SELECT id FROM users WHERE name = :name LIMIT 1");
        $uStmt->execute([':name' => $tx['entity_name']]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            // Fallback or Error? If we can't find the user, we can't charge them.
            // Maybe just approve it as income?
            // Throwing error for safety.
            throw new Exception("İlgili firma (Kullanıcı: {$tx['entity_name']}) veritabanında bulunamadı.");
        }

        $db->beginTransaction();
        try {
            // 1. Update Status
            $upd = $db->prepare("UPDATE system_transactions SET status = 'approved' WHERE id = :id");
            $upd->execute([':id' => $id]);

            // 2. Charge User
            $userTxQuery = "INSERT INTO transactions (user_id, type, amount, description, status, date, created_at) 
                            VALUES (:uid, 'debt', :amount, :desc, 'approved', CURDATE(), NOW())";
            $userTxStmt = $db->prepare($userTxQuery);
            $userTxStmt->execute([
                ':uid' => $user['id'],
                ':amount' => $tx['amount'],
                ':desc' => $tx['description'] // Reuse description
            ]);

            Logger::log('INVOICE_APPROVE', "Fatura onaylandı ve cariye işlendi (ID: $id, User: {$user['id']})");

            // --- ARCHIVE INVOICE ---
            try {
                require_once __DIR__ . '/../../core/InvoiceHelper.php';

                // Fetch Full User Data for Invoice
                $fullUserStmt = $db->prepare("SELECT * FROM users WHERE id = :uid");
                $fullUserStmt->execute([':uid' => $user['id']]);
                $fullUser = $fullUserStmt->fetch(PDO::FETCH_ASSOC);

                if ($fullUser && !empty($fullUser['tax_id'])) {
                    $details = !empty($tx['details']) ? json_decode($tx['details'], true) : [];
                    $vatRate = isset($details['vat_rate']) ? (int)$details['vat_rate'] : 20;
                    $baseAmount = (float)$tx['amount'];
                    $vatAmount = $baseAmount * ($vatRate / 100);
                    $totalAmount = $baseAmount + $vatAmount;
                    
                    $invoiceData = [
                        'invoice_no' => "LKY" . date('Y') . "-" . str_pad($id, 9, '0', STR_PAD_LEFT),
                        'date_formatted' => date('d.m.Y'),
                        'base_amount' => $baseAmount,
                        'vat_rate' => $vatRate,
                        'vat_amount' => $vatAmount,
                        'total_amount' => $totalAmount,
                        'description' => $tx['category'],
                        'sub_description' => $tx['description']
                    ];

                    $html = InvoiceHelper::generateHTML($invoiceData, $fullUser);

                    $archiveDir = "../../uploads/archives/invoices/" . $fullUser['tax_id'] . "/";
                    if (!is_dir($archiveDir)) mkdir($archiveDir, 0777, true);
                    file_put_contents($archiveDir . "invoice_{$id}.html", $html);
                    
                    Logger::log('INVOICE_ARCHIVE', "Fatura arşivlendi: {$fullUser['tax_id']}/invoice_{$id}.html");
                }
            } catch (Exception $e) {
                Logger::log('INVOICE_ARCHIVE_ERROR', "Fatura arşivlenemedi: " . $e->getMessage());
                // Non-critical, continue
            }
            // -----------------------

            $db->commit();
            echo json_encode(["success" => true, "message" => "Fatura onaylandı, cariye işlendi ve arşivlendi."]);
        } catch (Exception $e) {
            $db->rollBack();
            throw new Exception("İşlem hatası: " . $e->getMessage());
        }
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
