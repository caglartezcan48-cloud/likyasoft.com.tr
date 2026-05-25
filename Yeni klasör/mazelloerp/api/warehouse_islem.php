<?php
/**
 * MAZELLO ADVANCED WAREHOUSE API (v1.0)
 * Handles 3-way stock: Backup, Reserved (Customer), Store
 */
require_once 'auth_check.php'; // GÜVENLİK DUVARI
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

$action = $_GET['action'] ?? '';

try {
    if ($action === 'get_stock_summary') {
        // 1. BACKUP & STORE (Total Stock Value)
        $stockTotals = $db->query("
            SELECT 
                SUM(stok_miktari) as backup_qty,
                SUM(magaza_stok) as store_qty,
                SUM(stok_miktari * satis_fiyati) as backup_psf,
                SUM(stok_miktari * alis_fiyati) as backup_taf,
                SUM(magaza_stok * satis_fiyati) as store_psf,
                SUM(magaza_stok * alis_fiyati) as store_taf
            FROM urunler
        ")->fetch(PDO::FETCH_ASSOC);

        // 2. RESERVED (Confirmed Orders waiting for delivery) - Calculate based on Order Price (PSF) and Product Cost (TAF)
        $reservedQuery = "
            SELECT 
                SUM(net_qty) as reserved_qty,
                SUM(net_qty * order_price) as reserved_psf,
                SUM(net_qty * cost_price) as reserved_taf
            FROM (
                SELECT 
                    (td.miktar - IFNULL((SELECT SUM(td2.miktar) FROM teklif_detaylari td2 JOIN teklifler t2 ON td2.teklif_id = t2.id WHERE t2.ref_teklif_id = t.id AND t2.durum = 'iade' AND td2.urun_id = td.urun_id), 0)) as net_qty,
                    td.birim_fiyat as order_price,
                    p.alis_fiyati as cost_price
                FROM teklif_detaylari td
                JOIN teklifler t ON td.teklif_id = t.id
                JOIN urunler p ON td.urun_id = p.id
                WHERE t.durum = 'satis' AND t.teslimat_durumu != 'teslim' AND td.urun_durumu = 'rezerve'
            ) as sub
            WHERE net_qty > 0
        ";
        $stmtReserved = $db->prepare($reservedQuery);
        $stmtReserved->execute();
        $reservedTotal = $stmtReserved->fetch(PDO::FETCH_ASSOC);

        // 3. PENDING (Orders waiting for stock/production)
        $pendingQuery = "
            SELECT 
                SUM(td.miktar) as pending_qty,
                SUM(td.miktar * td.birim_fiyat) as pending_psf,
                SUM(td.miktar * p.alis_fiyati) as pending_taf
            FROM teklif_detaylari td
            JOIN teklifler t ON td.teklif_id = t.id
            JOIN urunler p ON td.urun_id = p.id
            WHERE t.durum = 'satis' AND t.teslimat_durumu != 'teslim' AND td.urun_durumu = 'bekliyor'
        ";
        $stmtPending = $db->prepare($pendingQuery);
        $stmtPending->execute();
        $pendingTotal = $stmtPending->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "summary" => [
                "backup" => [
                    "qty" => (int) $stockTotals['backup_qty'],
                    "psf" => (float) $stockTotals['backup_psf'],
                    "taf" => (float) $stockTotals['backup_taf']
                ],
                "store" => [
                    "qty" => (int) $stockTotals['store_qty'],
                    "psf" => (float) $stockTotals['store_psf'],
                    "taf" => (float) $stockTotals['store_taf']
                ],
                "reserved" => [
                    "qty" => (int) $reservedTotal['reserved_qty'],
                    "psf" => (float) $reservedTotal['reserved_psf'],
                    "taf" => (float) $reservedTotal['reserved_taf']
                ],
                "pending" => [
                    "qty" => (int) $pendingTotal['pending_qty'],
                    "psf" => (float) $pendingTotal['pending_psf'],
                    "taf" => (float) $pendingTotal['pending_taf']
                ]
            ]
        ]);

    } elseif ($action === 'get_stock_list') {
        $products = $db->query("
            SELECT p.*,
            IFNULL((
                SELECT SUM(td.miktar - IFNULL((SELECT SUM(td2.miktar) FROM teklif_detaylari td2 JOIN teklifler t2 ON td2.teklif_id = t2.id WHERE t2.ref_teklif_id = t.id AND t2.durum = 'iade' AND td2.urun_id = td.urun_id), 0))
                FROM teklif_detaylari td
                JOIN teklifler t ON td.teklif_id = t.id
                WHERE t.durum = 'satis' AND t.teslimat_durumu != 'teslim' AND td.urun_id = p.id AND td.urun_durumu = 'rezerve'
            ), 0) as reserved_qty
            FROM urunler p
            ORDER BY p.urun_adi ASC
        ")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $products]);

    } elseif ($action === 'get_reserved_details') {
        // Show both 'rezerve' (Ready in Stock) and 'bekliyor' (Waiting for Production/Supply)
        $details = $db->query("
            SELECT td.miktar, td.urun_id, p.urun_adi, p.stok_kodu, t.teklif_no, c.ad_soyad as customer_name, t.satis_tarihi, t.id as order_id, td.urun_durumu,
            (td.miktar - IFNULL((SELECT SUM(td2.miktar) FROM teklif_detaylari td2 JOIN teklifler t2 ON td2.teklif_id = t2.id WHERE t2.ref_teklif_id = t.id AND t2.durum = 'iade' AND td2.urun_id = td.urun_id), 0)) as net_qty
            FROM teklif_detaylari td
            JOIN teklifler t ON td.teklif_id = t.id
            JOIN cariler c ON t.musteri_id = c.id
            JOIN urunler p ON td.urun_id = p.id
            WHERE t.durum = 'satis' AND t.teslimat_durumu != 'teslim' AND (td.urun_durumu = 'rezerve' OR td.urun_durumu = 'bekliyor')
            HAVING net_qty > 0
            ORDER BY t.satis_tarihi DESC
        ")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $details]);

        // --- DEPO v3 NEW ACTIONS ---

    } elseif ($action === 'get_pending_orders') {
        $details = $db->query("
            SELECT td.id as detail_id, td.miktar, td.urun_id, p.urun_adi, p.stok_kodu, p.stok_miktari as current_stock, t.teklif_no, c.ad_soyad as customer_name, t.satis_tarihi
            FROM teklif_detaylari td
            JOIN teklifler t ON td.teklif_id = t.id
            JOIN cariler c ON t.musteri_id = c.id
            JOIN urunler p ON td.urun_id = p.id
            WHERE t.durum = 'satis' AND td.urun_durumu = 'bekliyor'
            ORDER BY t.satis_tarihi ASC
        ")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $details]);

    } elseif ($action === 'allocate_item') {
        // source: 'stock' (Deduct Backup) or 'production' (No Deduct)
        $detailId = $data['detail_id'];
        $source = $data['source'];
        $qty = $data['qty'];
        $urunId = $data['urun_id'];

        $db->beginTransaction();
        try {
            // 1. Mark as Reserved
            $db->prepare("UPDATE teklif_detaylari SET urun_durumu = 'rezerve' WHERE id = ?")->execute([$detailId]);

            // 2. If Source is Stock, Deduct
            if ($source === 'stock') {
                $db->prepare("UPDATE urunler SET stok_miktari = stok_miktari - ? WHERE id = ?")->execute([$qty, $urunId]);
                // Log Movement
                $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama) VALUES (?, 'cikis', ?, '-', 'Rezerve (Stoktan): Siparis')")->execute([$urunId, $qty]);
            } else {
                // Log Movement (Virtual In -> Out)
                $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama) VALUES (?, 'giris', ?, '+', 'Rezerve (Üretimden): Siparis')")->execute([$urunId, $qty]);
            }
            $db->commit();
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }

    } elseif ($action === 'update_bin_location') {
        $db->prepare("UPDATE urunler SET raf_kodu = ? WHERE id = ?")->execute([$data['raf_kodu'], $data['id']]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'transfer_stock') {
        // from 'depo' to 'magaza' OR 'magaza' to 'depo'
        $dir = $data['direction']; // 'to_store' or 'to_warehouse'
        $qty = $data['qty'];
        $id = $data['id']; // product id

        $db->beginTransaction();
        try {
            if ($dir === 'to_store') {
                $db->prepare("UPDATE urunler SET stok_miktari = stok_miktari - ?, magaza_stok = magaza_stok + ? WHERE id = ?")->execute([$qty, $qty, $id]);
                $desc = "Transfer: Depo -> Mağaza";
            } else {
                $db->prepare("UPDATE urunler SET stok_miktari = stok_miktari + ?, magaza_stok = magaza_stok - ? WHERE id = ?")->execute([$qty, $qty, $id]);
                $desc = "Transfer: Mağaza -> Depo";
            }
            // Log for history
            $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama) VALUES (?, 'transfer', ?, '=', ?)")->execute([$id, $qty, $desc]);

            $db->commit();
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }

    } elseif ($action === 'get_item_history') {
        // Simple preview (keep for other modules if used)
        $stmt = $db->prepare("SELECT * FROM stok_hareketleri WHERE urun_id = ? ORDER BY tarih DESC LIMIT 5");
        $stmt->execute([intval($_GET['id'])]);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'get_full_item_history') {
        // Full History: Sales, Purchases, Returns, Manual Moves, Creation
        $id = intval($_GET['id']);

        $sql = "
        (
            -- 1. STOK HAREKETLERİ (Manuel, Transfer, Sayım)
            SELECT sh.tarih, 
                   UPPER(sh.islem_turu) as islem_turu, 
                   sh.miktar as adet, 
                   sh.yon, 
                   sh.aciklama, 
                   sh.kullanici -- Artık gerçek kullanıcıyı çekiyoruz
            FROM stok_hareketleri sh
            WHERE sh.urun_id = :id AND sh.islem_turu NOT IN ('satis', 'alis', 'iade') -- Tekrara düşmemesi için
        )
        UNION ALL
        (
            -- 2. SATIŞLAR
            SELECT t.satis_tarihi as tarih, 
                   'SATIŞ' as islem_turu, 
                   td.miktar as adet, 
                   '-' as yon, 
                   CONCAT('Müşteri: ', IFNULL(c.ad_soyad, 'Misafir'), ' (#', t.teklif_no, ')') as aciklama,
                   IFNULL(u.ad_soyad, 'Satis Temsilcisi') as kullanici
            FROM teklif_detaylari td
            JOIN teklifler t ON td.teklif_id = t.id
            LEFT JOIN cariler c ON t.musteri_id = c.id
            LEFT JOIN kullanicilar u ON t.olusturan_id = u.id
            WHERE td.urun_id = :id AND t.durum IN ('satis', 'fatura_kesildi')
        )
        UNION ALL
        (
            -- 3. SATIN ALMA (GİRİŞ)
            SELECT t.satis_tarihi as tarih, 
                   'SATIN ALMA' as islem_turu, 
                   td.miktar as adet, 
                   '+' as yon, 
                   CONCAT('Tedarikçi: ', IFNULL(c.ad_soyad, 'Bilinmiyor'), ' (#', t.teklif_no, ')') as aciklama,
                   IFNULL(u.ad_soyad, 'Depo') as kullanici
            FROM teklif_detaylari td
            JOIN teklifler t ON td.teklif_id = t.id
            LEFT JOIN cariler c ON t.musteri_id = c.id
            LEFT JOIN kullanicilar u ON t.olusturan_id = u.id
            WHERE td.urun_id = :id AND t.durum = 'alis'
        )
        UNION ALL
        (
            -- 4. İADELER (GİRİŞ)
            SELECT t.satis_tarihi as tarih, 
                   'İADE ALIMI' as islem_turu, 
                   td.miktar as adet, 
                   '+' as yon, 
                   CONCAT('İade Eden: ', IFNULL(c.ad_soyad, 'Müşteri'), ' | Neden: ', IFNULL(t.iade_nedeni, '-')) as aciklama,
                   IFNULL(u.ad_soyad, 'Servis') as kullanici
            FROM teklif_detaylari td
            JOIN teklifler t ON td.teklif_id = t.id
            LEFT JOIN cariler c ON t.musteri_id = c.id
            LEFT JOIN kullanicilar u ON t.olusturan_id = u.id
            WHERE td.urun_id = :id AND t.durum = 'iade'
        )
        UNION ALL
        (
            -- 5. OLUŞTURMA
            SELECT p.created_at as tarih, 
                   'OLUŞTURMA' as islem_turu, 
                   p.stok_miktari as adet, 
                   '+' as yon, 
                   'Stok Kartı Oluşturuldu' as aciklama, 
                   'Admin' as kullanici
            FROM urunler p
            WHERE p.id = :id
        )";
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
        $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

        $sql .= " ORDER BY tarih DESC LIMIT $limit OFFSET $offset";

        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $data, "hasMore" => count($data) === $limit]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
