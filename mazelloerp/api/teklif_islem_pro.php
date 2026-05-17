<?php
// EN BAŞTA HATALARI GİZLE
ini_set('display_errors', 0);
error_reporting(0);

/**
 * MAZELLO PRO TEKLİF & SATIŞ MOTORU v12.1 (Performance Edition)
 * Backend for js/sales.js
 */
require_once 'auth_check.php'; // GÜVENLİK DUVARI
require_once 'db.php';

// ROBUST ERROR HANDLING TO CATCH 500 ERRORS
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Register Shutdown Function to catch Fatal Errors
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_CORE_ERROR || $error['type'] === E_COMPILE_ERROR)) {
        // Clean any existing output buffer
        if (ob_get_length())
            ob_clean();

        http_response_code(500);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode([
            'status' => 'error',
            'message' => 'CRITICAL FATAL ERROR: ' . $error['message'],
            'file' => $error['file'],
            'line' => $error['line']
        ]);
        exit;
    }
});

header("Content-Type: application/json; charset=UTF-8");

// GLOBAL TRY BLOCK REMOVED (Unclosed)

// DBO: Sütun Kontrolü - Using function from db.php
// (ensureColumnExists is already defined in db.php)

// START OPTIMIZATION: Check columns ONLY ONCE per session to boost speed
if (!isset($_SESSION['db_checks_done_pro'])) {
    try {
        if (!isset($db))
            throw new Exception("Database connection failing!");

        // 1. Column Checks
        ensureColumnExists($db, 'teklifler', 'ref_teklif_id', 'INT DEFAULT NULL');
        ensureColumnExists($db, 'teklifler', 'alim_tipi', "VARCHAR(50) DEFAULT 'stok'");
        ensureColumnExists($db, 'teklifler', 'teslimat_durumu', "VARCHAR(50) DEFAULT 'hazirlik'");
        ensureColumnExists($db, 'teklifler', 'plasiyer_id', "INT DEFAULT 0"); // EKSİK KOLON EKLENDİ (Fix for 500 Error)
        ensureColumnExists($db, 'urunler', 'magaza_stok', 'INT DEFAULT 0');
        ensureColumnExists($db, 'urunler', 'musteri_stok', 'INT DEFAULT 0');

        // TEKLİF DETAYLARI - EKSİK KOLON KONTROLLERİ (Self-Healing)
        ensureColumnExists($db, 'teklif_detaylari', 'urun_gorsel', "VARCHAR(255) DEFAULT ''");
        ensureColumnExists($db, 'teklif_detaylari', 'detay_not', "TEXT");
        ensureColumnExists($db, 'teklif_detaylari', 'en', "DECIMAL(10,2) DEFAULT 0");
        ensureColumnExists($db, 'teklif_detaylari', 'boy', "DECIMAL(10,2) DEFAULT 0");
        ensureColumnExists($db, 'teklif_detaylari', 'yukseklik', "DECIMAL(10,2) DEFAULT 0");
        ensureColumnExists($db, 'teklif_detaylari', 'm3', "DECIMAL(10,4) DEFAULT 0");
        ensureColumnExists($db, 'teklif_detaylari', 'agirlik', "DECIMAL(10,2) DEFAULT 0");
        ensureColumnExists($db, 'teklif_detaylari', 'paket_sayisi', "INT DEFAULT 1");
        ensureColumnExists($db, 'teklif_detaylari', 'fiyat', "DECIMAL(15,2) DEFAULT 0.00");

        // Mark as checked for this session
        $_SESSION['db_checks_done_pro'] = true;
    } catch (Exception $e) {
        // Log initialization error but continue
        error_log("DB Checks Init Error: " . $e->getMessage());
    }
}
// END OPTIMIZATION

// Yardımcı Fonksiyon: ID Üretici
function generateNextID($db, $prefixType = 'date')
{
    $prefix = date('dmY');
    if ($prefixType === 'AL') {
        $prefix = 'AL-' . date('Ym');
    }

    $stmt = $db->prepare("SELECT teklif_no FROM teklifler WHERE teklif_no LIKE ? ORDER BY LENGTH(teklif_no) DESC, teklif_no DESC LIMIT 1");
    $stmt->execute([$prefix . '%']);
    $lastRecord = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($lastRecord) {
        $parts = explode('-', $lastRecord['teklif_no']);
        $lastNumStr = end($parts);
        $nextNum = intval($lastNumStr) + 1;
        return $prefix . '-' . str_pad($nextNum, 2, '0', STR_PAD_LEFT);
    }
    return $prefix . '-01';
}

// 1. GET İSTEKLERİ
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    if ($_GET['action'] === 'get_next_id' || $_GET['action'] === 'get_next_id_purchase') {
        try {
            $type = ($_GET['action'] === 'get_next_id_purchase') ? 'AL' : 'date';
            echo json_encode(['next_id' => generateNextID($db, $type)]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($_GET['action'] === 'get_details' && isset($_GET['id'])) {
        try {
            $stmt = $db->prepare("
                SELECT t.*, 
                c.ad_soyad, c.telefon, c.adres, c.vergi_dairesi, c.vergi_no, c.tc_kimlik, c.cari_kodu,
                (SELECT COALESCE(SUM(tutar),0) FROM kasa_hareketleri WHERE (satis_id = t.id OR (ilgili_id = t.id AND kategori='Tahsilat')) AND turu = 'gelir' AND durum = 'aktif') as odenen_tutar,
                (t.toplam_tutar - (SELECT COALESCE(SUM(tutar),0) FROM kasa_hareketleri WHERE (satis_id = t.id OR (ilgili_id = t.id AND kategori='Tahsilat')) AND turu = 'gelir' AND durum = 'aktif')) as guncel_bakiye
                FROM teklifler t 
                LEFT JOIN cariler c ON t.musteri_id = c.id 
                WHERE t.id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $teklif = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($teklif) {
                $stmtItems = $db->prepare("
                    SELECT d.*, u.urun_adi, u.stok_kodu, u.resim_url as urun_gorsel_orj 
                    FROM teklif_detaylari d 
                    LEFT JOIN urunler u ON d.urun_id = u.id 
                    WHERE d.teklif_id = ?
                ");
                $stmtItems->execute([$_GET['id']]);
                $teklif['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['status' => 'success', 'success' => true, 'data' => $teklif], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                if (json_last_error() !== JSON_ERROR_NONE)
                    throw new Exception("JSON Encoding Error: " . json_last_error_msg());
            } else {
                echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Kayıt bulunamadı.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Veritabanı Hatası: ' . $e->getMessage()]);
        }
        exit;
    }
}

// 2. SİLME (ARŞİVLEME / GERİ DÖNÜŞÜM) - GET/POST FARK ETMEZ
if (isset($_GET['action']) && $_GET['action'] === 'delete_quote') {
    try {
        // GET veya POST verisinden ID al
        $input = file_get_contents("php://input");
        $postData = json_decode($input, true) ?? [];
        $id = $postData['id'] ?? $_GET['id'] ?? null;

        if (!$id)
            throw new Exception("ID Gerekli");

        // 1. Veriyi çek
        $s = $db->prepare("SELECT * FROM teklifler WHERE id = ?");
        $s->execute([$id]);
        $mainData = $s->fetch(PDO::FETCH_ASSOC);

        if ($mainData) {
            // 2. Detayları çek
            $s2 = $db->prepare("SELECT * FROM teklif_detaylari WHERE teklif_id = ?");
            $s2->execute([$id]);
            $details = $s2->fetchAll(PDO::FETCH_ASSOC);

            // 3. Paketle
            $fullData = [
                'main' => $mainData,
                'items' => $details
            ];

            // 4. Çöp Kutusuna At (Tablo Kontrolü ile)
            $db->exec("CREATE TABLE IF NOT EXISTS recycle_bin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                table_name VARCHAR(50) NOT NULL,
                original_id INT NOT NULL,
                deleted_data LONGTEXT,
                deleted_by VARCHAR(50) DEFAULT 'System',
                baslik VARCHAR(255) DEFAULT '',
                deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Check baslik column
            try {
                $db->query("SELECT baslik FROM recycle_bin LIMIT 1");
            } catch (Exception $e) {
                $db->exec("ALTER TABLE recycle_bin ADD COLUMN baslik VARCHAR(255) DEFAULT ''");
            }

            $baslik = "Teklif #" . $mainData['teklif_no'] . " (Tutar: " . ($mainData['genel_toplam'] ?? 0) . ")";

            $ins = $db->prepare("INSERT INTO recycle_bin (table_name, original_id, deleted_data, deleted_by, baslik) VALUES (?, ?, ?, ?, ?)");
            $ins->execute([
                'teklifler',
                $id,
                json_encode($fullData, JSON_UNESCAPED_UNICODE),
                'Admin', // Session'dan alınabilir
                $baslik
            ]);

            // 5. Asıl tablodan sil
            $db->prepare("DELETE FROM teklifler WHERE id = ?")->execute([$id]);
        }

        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// 2. POST İSTEKLERİ
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz JSON Verisi']);
        exit;
    }




    if (isset($_GET['action']) && $_GET['action'] === 'mark_delivered') {
        try {
            $id = $data['id'];

            // 1. Sipariş ve kalemlerini çek
            $stmtOrder = $db->prepare("SELECT teklif_no, alim_tipi, satis_tarihi FROM teklifler WHERE id = ?");
            $stmtOrder->execute([$id]);
            $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                throw new Exception("Sipariş bulunamadı.");
            }

            $stmtItems = $db->prepare("SELECT urun_id, miktar FROM teklif_detaylari WHERE teklif_id = ?");
            $stmtItems->execute([$id]);
            $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

            $db->beginTransaction();

            // 2. Stok Düşümü (Hangi depodan gittiyse)
            $alim_tipi = $order['alim_tipi'] ?? 'stok';
            $field = ($alim_tipi === 'magaza') ? 'magaza_stok' : (($alim_tipi === 'musteri') ? 'musteri_stok' : 'stok_miktari');

            foreach ($items as $item) {
                $uID = $item['urun_id'];
                $mik = $item['miktar'];

                // Stok düş
                $db->prepare("UPDATE urunler SET $field = $field - ? WHERE id = ?")->execute([$mik, $uID]);

                // Stok hareketi ekle
                $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama) VALUES (?, 'cikis', ?, '-', ?)")
                    ->execute([$uID, $mik, "Teslimat: {$order['teklif_no']}"]);
            }

            // 3. Durum ve Tarih Güncelleme
            $satis_tarihi = !empty($order['satis_tarihi']) ? $order['satis_tarihi'] : date('Y-m-d H:i:s');
            $db->prepare("UPDATE teklifler SET teslimat_durumu = 'teslim_edildi', satis_tarihi = ? WHERE id = ?")
                ->execute([$satis_tarihi, $id]);

            $db->commit();
            echo json_encode(['status' => 'success']);
        } catch (Exception $e) {
            if ($db->inTransaction())
                $db->rollBack();
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        exit;
    }

    // --- NORMAL KAYIT (SAVE / UPDATE) ---
    try {
        $db->beginTransaction();

        $teklifId = $data['id'] ?? 0;
        $musteri_id = $data['musteri_id'] ?? 0;
        $teklif_no = $data['teklif_no'] ?? '';
        $toplam_tutar = $data['toplam_tutar'] ?? 0;
        $iskonto_tipi = $data['iskonto_tipi'] ?? 'TL';
        $iskonto_tutar = $data['iskonto_tutar'] ?? 0;
        $vergi_orani = $data['vergi_orani'] ?? 0;
        $genel_not = $data['genel_not'] ?? '';
        $durum = $data['durum'] ?? 'teklif';
        $taksit_plani = isset($data['taksit_plani']) ? json_encode($data['taksit_plani'], JSON_UNESCAPED_UNICODE) : '[]';
        $teslimat_tarihi = !empty($data['teslimat_tarihi']) ? $data['teslimat_tarihi'] : null;
        $satis_tarihi = !empty($data['satis_tarihi']) ? $data['satis_tarihi'] : null;
        $ref_teklif_id = !empty($data['ref_teklif_id']) ? $data['ref_teklif_id'] : null;
        $alim_tipi = !empty($data['alim_tipi']) ? $data['alim_tipi'] : 'stok';
        $teslimat_durumu = 'hazirlik';
        $oldStatus = 'teklif';

        if ($teklifId) {
            $stmtInfo = $db->prepare("SELECT durum, teslimat_durumu FROM teklifler WHERE id = ?");
            $stmtInfo->execute([$teklifId]);
            $current = $stmtInfo->fetch(PDO::FETCH_ASSOC);
            if (!$current)
                throw new Exception("Güncellenecek kayıt bulunamadı.");

            $oldStatus = $current['durum'];
            $teslimat_durumu = $current['teslimat_durumu'];

            $userRole = $_SESSION['user_role'] ?? '';
            if (($oldStatus === 'satis' || $oldStatus === 'iade') && $durum !== 'arsiv' && $userRole !== 'boss' && $userRole !== 'muhasebe') {
                throw new Exception("KESİNLEŞMİŞ SATIŞLAR DÜZENLENEMEZ!");
            }

            if ($oldStatus !== 'satis' && $durum === 'satis') {
                $teslimat_durumu = 'hazirlik';
            }

            $sql = "UPDATE teklifler SET 
                    teklif_no=?, musteri_id=?, plasiyer_id=?, toplam_tutar=?, iskonto_tipi=?, iskonto_tutar=?, 
                    vergi_orani=?, genel_not=?, taksit_plani=?, durum=?, 
                    teslimat_tarihi=?, satis_tarihi=?, teslimat_durumu=?, ref_teklif_id=?, alim_tipi=?,
                    alinan_tutar=?, bakiye=?
                    WHERE id=?";
            $db->prepare($sql)->execute([
                $teklif_no,
                $musteri_id,
                $data['plasiyer_id'] ?? 0,
                $toplam_tutar,
                $iskonto_tipi,
                $iskonto_tutar,
                $vergi_orani,
                $genel_not,
                $taksit_plani,
                $durum,
                $teslimat_tarihi,
                $satis_tarihi,
                $teslimat_durumu,
                $ref_teklif_id,
                $alim_tipi,
                $data['alinan_tutar'] ?? 0,
                $data['bakiye'] ?? $toplam_tutar,
                $teklifId
            ]);
            $db->prepare("DELETE FROM teklif_detaylari WHERE teklif_id = ?")->execute([$teklifId]);
        } else {
            $teklif_no = generateNextID($db, ($durum === 'alis' ? 'AL' : 'date'));
            if ($durum === 'satis')
                $teslimat_durumu = 'hazirlik';
            $stmt = $db->prepare("INSERT INTO teklifler (
                teklif_no, musteri_id, plasiyer_id, durum, toplam_tutar, 
                iskonto_tipi, iskonto_tutar, vergi_orani, 
                taksit_plani, genel_not, created_at, satis_tarihi, teslimat_tarihi, 
                teslimat_durumu, olusturan_id, ref_teklif_id, alim_tipi,
                alinan_tutar, bakiye
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, 1, ?, ?, ?, ?)");
            $stmt->execute([
                $teklif_no,
                $musteri_id,
                $data['plasiyer_id'] ?? 0,
                $durum,
                $toplam_tutar,
                $iskonto_tipi,
                $iskonto_tutar,
                $vergi_orani,
                $taksit_plani,
                $genel_not,
                $satis_tarihi,
                $teslimat_tarihi,
                $teslimat_durumu,
                $ref_teklif_id,
                $alim_tipi,
                0, // alinan_tutar initially 0
                $toplam_tutar // bakiye initially full
            ]);
            $teklifId = $db->lastInsertId();
        }

        if (isset($data['items']) && is_array($data['items'])) {
            $stmtDetay = $db->prepare("INSERT INTO teklif_detaylari (teklif_id, urun_id, miktar, birim_fiyat, satir_toplam, detay_not, urun_gorsel) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['items'] as $item) {
                $uID = $item['urun_id'] ?? 0;
                $mik = $item['miktar'] ?? 1;
                $fiy = $item['birim_fiyat'] ?? 0;
                $top = $item['satir_toplam'] ?? 0;
                $not = $item['not'] ?? '';
                $img = $item['gorsel'] ?? '';
                $stmtDetay->execute([$teklifId, $uID, $mik, $fiy, $top, $not, $img]);

                /* Eski Mantık: Satış anında stok düşme (Teslimat anına taşındı)
                $isNewSale = ($oldStatus !== 'satis' && $durum === 'satis');
                if ($isNewSale && !empty($item['stok_dus'])) {
                    $db->prepare("UPDATE urunler SET stok_miktari = stok_miktari - ? WHERE id = ?")->execute([$mik, $uID]);
                    $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama) VALUES (?, 'cikis', ?, '-', ?)")->execute([$uID, $mik, "Satış: $teklif_no"]);
                }
                */

                $isNewPurchase = ($oldStatus !== 'alis' && $durum === 'alis');
                if ($isNewPurchase) {
                    $field = ($alim_tipi === 'magaza') ? 'magaza_stok' : (($alim_tipi === 'musteri') ? 'musteri_stok' : 'stok_miktari');
                    $db->prepare("UPDATE urunler SET $field = $field + ? WHERE id = ?")->execute([$mik, $uID]);
                    $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama) VALUES (?, 'giris', ?, '+', ?)")->execute([$uID, $mik, "Alım: $teklif_no"]);
                    if ($fiy > 0)
                        $db->prepare("UPDATE urunler SET alis_fiyati = ? WHERE id = ?")->execute([$fiy, $uID]);
                }
            }
        }

        $downPayment = floatval($data['down_payment'] ?? 0);
        if ($oldStatus !== 'satis' && $durum === 'satis' && $downPayment > 0) {
            $downMethod = $data['down_payment_method'] ?? 'nakit';
            $downBankId = intval($data['down_payment_bank_id'] ?? 0);
            $hesapKodu = ($downMethod === 'havale') ? '102' : (($downMethod === 'kart') ? '108' : '100');
            $bankaBilgisi = '';
            if ($downBankId > 0) {
                $stmtBank = $db->prepare("SELECT banka_adi FROM banka_hesaplari WHERE id = ?");
                $stmtBank->execute([$downBankId]);
                $bankRow = $stmtBank->fetch(PDO::FETCH_ASSOC);
                if ($bankRow)
                    $bankaBilgisi = $bankRow['banka_adi'] . ($downMethod === 'kart' ? ' (POS)' : '');
            }
            $db->prepare("INSERT INTO kasa_hareketleri (cari_id, turu, tutar, tarih, aciklama, odeme_tipi, hesap_kodu, banka_bilgisi, kasa_id, satis_id, durum) VALUES (?, 'gelir', ?, NOW(), ?, ?, ?, ?, 1, ?, 'aktif')")
                ->execute([$musteri_id, $downPayment, "Sipariş Peşinatı (#$teklif_no)", $downMethod, $hesapKodu, $bankaBilgisi, $teklifId]);

            // UPDATE TEKLİF BAKİYE ON DOWN PAYMENT
            $db->prepare("UPDATE teklifler SET alinan_tutar = alinan_tutar + ?, bakiye = bakiye - ? WHERE id = ?")->execute([$downPayment, $downPayment, $teklifId]);
        }

        if (isset($data['used_checks']) && is_array($data['used_checks'])) {
            $totalCheck = 0;
            $stmtC = $db->prepare("SELECT tutar FROM musteri_cekleri WHERE cek_kodu=?");
            $stmtU = $db->prepare("UPDATE musteri_cekleri SET durum='kullanildi', referans_iade_id=? WHERE cek_kodu=? AND durum='aktif'");
            foreach ($data['used_checks'] as $cCode) {
                $stmtC->execute([$cCode]);
                $row = $stmtC->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $totalCheck += $row['tutar'];
                    $stmtU->execute([$teklifId, $cCode]);
                }
            }
            if ($totalCheck > 0) {
                $db->prepare("UPDATE teklifler SET alinan_tutar = alinan_tutar + ?, bakiye = bakiye - ? WHERE id = ?")->execute([$totalCheck, $totalCheck, $teklifId]);
                try {
                    $db->prepare("INSERT INTO cari_hareketleri (cari_id, islem_turu, fis_no, tutar, aciklama, tarih) VALUES (?, 'alacak', ?, ?, ?, NOW())")
                        ->execute([$musteri_id, $teklif_no, $totalCheck, "Çek Tahsilat: " . implode(',', $data['used_checks'])]);
                } catch (Exception $eC) {
                }
            }
        }

        require_once 'bi_helper.php';
        refreshBIDailyStats($db, date('Y-m-d'));

        if (isset($musteri_id) && $musteri_id > 0) {
            updateCariBakiye($db, $musteri_id);
        }

        $db->commit();
        echo json_encode(['status' => 'success', 'message' => 'Kayıt Başarılı', 'id' => $teklifId, 'teklif_no' => $teklif_no]);
    } catch (Exception $e) {
        if ($db->inTransaction())
            $db->rollBack();

        // LOG ERROR TO FILE
        file_put_contents('error_log_pro.txt', date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);

        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => "Sistem Hatası: " . $e->getMessage()]);
    }
}
