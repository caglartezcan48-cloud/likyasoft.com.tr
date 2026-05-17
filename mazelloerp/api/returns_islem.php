<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

// IADE & DEGİSİM İŞLEMLERİ (Return & Exchange API)
require_once 'auth_check.php'; // GÜVENLİK DUVARI
header('Content-Type: application/json; charset=utf-8');

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'verify_check') {
    $code = $_GET['code'] ?? '';
    $stmt = $db->prepare("SELECT * FROM musteri_cekleri WHERE cek_kodu = ?");
    $stmt->execute([$code]);
    $cek = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cek) {
        if ($cek['durum'] !== 'aktif') {
            echo json_encode(['status' => 'error', 'message' => 'Bu çek daha önce kullanılmış veya iptal edilmiş.']);
        } else {
            // Tarih kontrolü
            if ($cek['son_kullanma_tarihi'] && strtotime($cek['son_kullanma_tarihi']) < time()) {
                echo json_encode(['status' => 'error', 'message' => 'Bu çekin kullanım süresi dolmuş.']);
            } else {
                echo json_encode(['status' => 'success', 'data' => $cek]);
            }
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz Çek Kodu.']);
    }
    exit;
}

if ($action === 'get_monthly_stats') {
    $month = date('m');
    $year = date('Y');

    // Nakit İade Toplamı
    $stmt1 = $db->prepare("SELECT SUM(toplam_tutar) as total FROM teklifler WHERE durum = 'iade' AND alim_tipi = 'iade' AND MONTH(created_at) = ? AND YEAR(created_at) = ?");
    $stmt1->execute([$month, $year]);
    $totalIade = $stmt1->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // Değişim Toplamı
    $stmt2 = $db->prepare("SELECT SUM(toplam_tutar) as total FROM teklifler WHERE durum = 'iade' AND alim_tipi = 'degisim' AND MONTH(created_at) = ? AND YEAR(created_at) = ?");
    $stmt2->execute([$month, $year]);
    $totalDegisim = $stmt2->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    echo json_encode([
        'status' => 'success',
        'iade_total' => (float) $totalIade,
        'degisim_total' => (float) $totalDegisim,
        'month_name' => strftime('%B') // Note: strftime might be deprecated in PHP 8.1, keeping simple for now or use IntlDateFormatter if needed later
    ]);
    exit;
}

if ($action === 'create_return') {
    $data = json_decode(file_get_contents('php://input'), true);

    $saleId = $data['id'];
    $items = $data['selected_items']; // [{urun_id, miktar, birim_fiyat}, ...]
    $note = isset($data['note']) ? $data['note'] : '';
    $user = "Admin"; // Session'dan alınabilir

    // YENİ: İade Yöntemi Kontrolü (Nakit mi, Çek mi, Cari mi?)
    $refundMethod = isset($data['refund_method']) ? $data['refund_method'] : 'cek'; // 'nakit', 'cek', 'cari'
    $urunDurumu = isset($data['urun_durumu']) ? $data['urun_durumu'] : 'saglam'; // 'saglam', 'hasarli'
    $iadeNedeni = isset($data['iade_nedeni']) ? $data['iade_nedeni'] : '';
    $targetWarehouse = isset($data['target_warehouse']) ? $data['target_warehouse'] : 'depo'; // 'depo', 'magaza'

    if (empty($saleId) || empty($items)) {
        echo json_encode(['status' => 'error', 'message' => 'Eksik veri.']);
        exit;
    }

    // YARDIMCI: Sütun Kontrol (DB Fix)
    // YARDIMCI: Sütun Kontrol (DB Fix) - Already in db.php
    // ensureColumnExists removed to prevent redeclaration fatal error

    // Tabloyu Güncelle (Eğer sütunlar yoksa ekle)
    ensureColumnExists($db, 'kasa_hareketleri', 'ilgili_id', "INT DEFAULT NULL");
    ensureColumnExists($db, 'kasa_hareketleri', 'belge_no', "VARCHAR(50) DEFAULT NULL");
    ensureColumnExists($db, 'teklifler', 'urun_durumu', "VARCHAR(50) DEFAULT 'saglam'");
    ensureColumnExists($db, 'teklifler', 'iade_nedeni', "TEXT DEFAULT NULL");

    // ÇEK TABLOSU OLUŞTUR (Eğer yoksa)
    $db->exec("CREATE TABLE IF NOT EXISTS musteri_cekleri (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cek_kodu VARCHAR(50) NOT NULL UNIQUE,
        musteri_id INT NOT NULL,
        tutar DECIMAL(10,2) NOT NULL,
        durum VARCHAR(20) DEFAULT 'aktif', /* aktif, kullanildi, iptal */
        olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
        son_kullanma_tarihi DATETIME DEFAULT NULL,
        referans_iade_id INT DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    try {
        $db->beginTransaction();

        // 1. Orijinal Satışı Bul
        $stmt = $db->prepare("SELECT * FROM teklifler WHERE id = ?");
        $stmt->execute([$saleId]);
        $sale = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$sale)
            throw new Exception("Referans satış bulunamadı.");

        // YENİ: Mükerrer İade Kontrolü (Double Check)
        $checkDup = $db->prepare("SELECT id, teklif_no FROM teklifler WHERE ref_teklif_id = ? AND durum = 'iade'");
        $checkDup->execute([$saleId]);
        $existingReturn = $checkDup->fetch(PDO::FETCH_ASSOC);

        if ($existingReturn) {
            throw new Exception("UYARI: Bu satış için daha önce iade/değişim işlemi yapılmıştır! (İade Fiş No: " . $existingReturn['teklif_no'] . ")");
        }

        // 2. İade Tutarını Hesapla (Vergi Dahil / Hariç)
        $subTotal = 0; // KDV Hariç Tutar (Ara Toplam)
        foreach ($items as $item) {
            $subTotal += ($item['miktar'] * $item['birim_fiyat']);
        }

        // Vergi Hesaplama (Orijinal Satıştan Miras Al)
        $taxRate = floatval($sale['vergi_orani'] ?? 0);
        $taxAmount = $subTotal * ($taxRate / 100);
        $grandTotal = $subTotal + $taxAmount;

        // 3. YENİ İADE KAYDI (Teklifler Tablosuna)
        // Her iki durumda da müşteri "Alacaklı" olur çünkü iade işlemi bakiyeden düşülür.

        $prefix = date('dmY');
        $stmtNum = $db->prepare("SELECT teklif_no FROM teklifler WHERE teklif_no LIKE ? ORDER BY LENGTH(teklif_no) DESC, teklif_no DESC LIMIT 1");
        $stmtNum->execute([$prefix . '%']);
        $lastRec = $stmtNum->fetch(PDO::FETCH_ASSOC);

        $newTeklifNo = $prefix . '-01';
        if ($lastRec) {
            $parts = explode('-', $lastRec['teklif_no']);
            $lastNum = intval(end($parts)) + 1;
            $newTeklifNo = $prefix . '-' . str_pad($lastNum, 2, '0', STR_PAD_LEFT);
        }

        $cekKodu = "MZ-" . strtoupper(substr(md5(uniqid()), 0, 6));
        $descMap = [
            'nakit' => "Nakit İade",
            'cek' => "Çek İadesi (" . $cekKodu . ")",
            'cari' => "Cari Hesaba Alacak"
        ];
        $desc = $descMap[$refundMethod] ?? "İade";
        $finalNote = "[İADE - " . $desc . "] Ref: " . $sale['teklif_no'] . ($iadeNedeni ? " - Sebep: " . $iadeNedeni : "") . ($note ? " - Not: " . $note : "");

        // TÜR BELİRLEME: Nakit -> 'iade', Çek/Cari -> 'degisim' (Cari de borç düşeceği için bakiye odaklıdır)
        $subType = ($refundMethod === 'nakit') ? 'iade' : 'degisim';

        // GÜNCELLENMİŞ INSERT: KDV ve Ara Toplam Alanları Eklendi
        $sql = "INSERT INTO teklifler (
                    teklif_no, musteri_id, ara_toplam, kdv_toplam, genel_toplam, toplam_tutar, iskonto_tipi, iskonto_tutar, 
                    vergi_orani, genel_not, taksit_plani, durum, 
                    teslimat_tarihi, satis_tarihi, olusturan_id, teslimat_durumu, ref_teklif_id, alim_tipi, urun_durumu, iade_nedeni, created_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, 'TL', 0, 
                    ?, ?, '[]', 'iade', 
                    NOW(), NOW(), 1, 'tamamlandi', ?, ?, ?, ?, NOW()
                )";

        $stmtIns = $db->prepare($sql);
        $stmtIns->execute([
            $newTeklifNo,
            $sale['musteri_id'],
            $subTotal,      // Ara Toplam
            $taxAmount,     // KDV Toplam
            $grandTotal,    // Genel Toplam
            $grandTotal,    // Toplam Tutar (Eskisiyle uyumlu)
            $taxRate,       // Vergi Oranı
            $finalNote,
            $saleId,
            $subType,
            $urunDurumu,
            $iadeNedeni
        ]);
        $newId = $db->lastInsertId();

        // 4. Detayları Ekle ve Stok Güncelle
        $stmtDetay = $db->prepare("INSERT INTO teklif_detaylari (teklif_id, urun_id, miktar, birim_fiyat, satir_toplam, detay_not, urun_gorsel) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmtStock = $db->prepare("UPDATE urunler SET stok_miktari = stok_miktari + ? WHERE id = ?");
        $stmtMove = $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama) VALUES (?, 'giris', ?, '+', ?)");

        foreach ($items as $item) {
            $lineTotal = $item['miktar'] * $item['birim_fiyat'];
            $img = $item['urun_gorsel'] ?? '';
            $stmtDetay->execute([$newId, $item['urun_id'], $item['miktar'], $item['birim_fiyat'], $lineTotal, "İade", $img]);

            // STOK GÜNCELLEME (Hasarlı -> Hasarlı Stok | Sağlam -> Depo veya Mağaza)
            if ($urunDurumu === 'hasarli') {
                $stmtHasarli = $db->prepare("UPDATE urunler SET stok_hasarli = stok_hasarli + ? WHERE id = ?");
                $stmtHasarli->execute([$item['miktar'], $item['urun_id']]);
                $moveDesc = "İade (HASARLI): " . $newTeklifNo;
            } else {
                if ($targetWarehouse === 'magaza') {
                    $stmtStore = $db->prepare("UPDATE urunler SET magaza_stok = magaza_stok + ? WHERE id = ?");
                    $stmtStore->execute([$item['miktar'], $item['urun_id']]);
                    $moveDesc = "İade (MAĞAZA): " . $newTeklifNo;
                } else {
                    $stmtStock->execute([$item['miktar'], $item['urun_id']]);
                    $moveDesc = "İade (DEPO): " . $newTeklifNo;
                }
            }

            $stmtMove->execute([$item['urun_id'], $item['miktar'], $moveDesc]);
        }

        // 5. İADE YÖNTEMİNE GÖRE FİNANSAL İŞLEM
        $responseDetails = [];

        if ($refundMethod === 'nakit') {
            // A) NAKİT / BANKA İADE: Kasa Bakiyesinden Düş (Gider Pusulası)
            // Bu gerçek bir para çıkışıdır.

            // Eğer frontend banka bilgisi gönderirse al, yoksa nakit varsay
            $bankId = isset($data['refund_bank_id']) ? $data['refund_bank_id'] : '';
            $payType = (!empty($bankId) || isset($data['refund_bank_name'])) ? 'havale' : 'nakit';
            $bankName = $data['refund_bank_name'] ?? '';
            $kasaId = ($payType === 'nakit') ? 1 : 0; // Kasa 1: Nakit Kasa
            $hesapKodu = ($payType === 'nakit') ? '100' : '102';

            $stmtKasa = $db->prepare("INSERT INTO kasa_hareketleri (tarih, turu, kategori, aciklama, tutar, kullanici, ilgili_id, belge_no, cari_id, odeme_tipi, banka_bilgisi, kasa_id, hesap_kodu, durum) VALUES (NOW(), 'gider', 'İade', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif')");
            $kasaAciklama = ($payType === 'nakit' ? "Nakit İade: " : "Banka İadesi: ") . $newTeklifNo . " (Ref: " . $sale['teklif_no'] . ")";

            $stmtKasa->execute([
                $kasaAciklama,
                $grandTotal,
                $user,
                $newId,
                $newTeklifNo,
                $sale['musteri_id'], // CARI ID EKLENDİ
                $payType,
                $bankName,
                $kasaId,
                $hesapKodu
            ]);

            $responseDetails['message_type'] = $payType;
            $responseDetails['info'] = ($payType === 'nakit' ? 'Kasa bakiyesinden' : 'Banka hesabından') . ' iade yapıldı.';
        } elseif ($refundMethod === 'cek') {
            // B) ÇEK / DEĞİŞİM: Kasa Bakiyesi Düşmez!
            // Müşteri çeki oluşturulur. Para kasada kalır ama müşteriye borçlanılmış olur.
            $stmtCek = $db->prepare("INSERT INTO musteri_cekleri (cek_kodu, musteri_id, tutar, durum, referans_iade_id, son_kullanma_tarihi) VALUES (?, ?, ?, 'aktif', ?, DATE_ADD(NOW(), INTERVAL 1 YEAR))");
            $stmtCek->execute([$cekKodu, $sale['musteri_id'], $grandTotal, $newId]);

            $responseDetails['cek_kodu'] = $cekKodu;
            $responseDetails['cek_tutar'] = $grandTotal;
            $responseDetails['message_type'] = 'cek';
            $responseDetails['info'] = 'İade Çeki oluşturuldu.';
        } else {
            // C) CARİ ALACAK: Kasa Bakiyesi Düşmez, Çek Oluşmaz.
            // Sadece teklifler kaydı yeterli, get_customer_balance bu iade kaydını borçtan düşecek.
            $responseDetails['message_type'] = 'cari';
            $responseDetails['info'] = 'Cari hesaba alacak olarak kaydedildi.';
        }

        updateCariBakiye($db, $sale['musteri_id']);

        $db->commit();
        echo json_encode(array_merge([
            'status' => 'success',
            'message' => 'İade İşlemi Başarılı',
            'new_id' => $newId
        ], $responseDetails));

    } catch (Exception $e) {
        if ($db->inTransaction())
            $db->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'İade Hatası: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz işlem']);
}
?>