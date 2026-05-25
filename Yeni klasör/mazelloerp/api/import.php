<?php
/**
 * MAZELLO ERP - BULK IMPORT API
 * Handles CSV uploads for Products, Customers, and Stock Counts.
 * 
 * Features:
 * - CSV Parsing (UTF-8, Semicolon or Comma detection)
 * - UPSERT Logic (Update if exists, Insert if new)
 * - Transaction Safety
 */
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 0);
require_once 'auth_check.php'; // GÜVENLİK DUVARI
require_once 'db.php';

$action = $_GET['action'] ?? '';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Only POST allowed.");
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Dosya yükleme hatası veya dosya seçilmedi.");
    }

    $fileTmpPath = $_FILES['file']['tmp_name'];
    $fileName = $_FILES['file']['name'];
    $fileSize = $_FILES['file']['size'];
    $fileType = $_FILES['file']['type'];

    // Check extension
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    if ($fileExtension !== 'csv') {
        throw new Exception("Sadece CSV dosyaları yüklenebilir.");
    }

    // Read CSV
    $csvData = array_map('str_getcsv', file($fileTmpPath));
    if (!$csvData || count($csvData) < 2) {
        throw new Exception("Dosya boş veya geçersiz format.");
    }

    // Detect delimiter (semicolon or comma)
    $firstLine = $csvData[0][0];
    $delimiter = (strpos($firstLine, ';') !== false) ? ';' : ',';

    // Re-read with correct delimiter
    $handle = fopen($fileTmpPath, "r");
    // Remove BOM if exists
    $bom = fread($handle, 3);
    if ($bom !== "\xEF\xBB\xBF")
        rewind($handle);

    $header = fgetcsv($handle, 0, $delimiter);
    $rows = [];
    while (($data = fgetcsv($handle, 0, $delimiter)) !== FALSE) {
        // Skip empty rows
        if (array_filter($data)) {
            $rows[] = $data;
        }
    }
    fclose($handle);

    $db->beginTransaction();
    $stats = ['inserted' => 0, 'updated' => 0, 'skipped' => 0];

    // --- ACTION: IMPORT PRODUCTS ---
    // --- ACTION: IMPORT PRODUCTS ---
    if ($action === 'import_products') {
        // Expected Header (18 Cols): 
        // 0:Stok Kodu, 1:Barkod, 2:Mazello Ürün Adı, 3:Tedarikçi Adı, 4:Tedarikçi Ürün Adı, 
        // 5:Kategori, 6:Alt Kategori, 7:Alış, 8:Satış, 
        // 9:En, 10:Boy, 11:Yükseklik, 12:M3, 13:KG, 
        // 14:Kumaş, 15:Sünger, 16:Termin, 17:Görsel URL

        $stmtCheck = $db->prepare("SELECT id FROM urunler WHERE stok_kodu = ?");
        $stmtSupplier = $db->prepare("SELECT id FROM cariler WHERE ad_soyad = ? AND tip = 'tedarikci'");

        // Full Insert
        $sqlInsert = "INSERT INTO urunler (stok_kodu, barkod, urun_adi, tedarikci_id, tedarikci_urun_adi, 
                      kategori, alis_fiyati, satis_fiyati, urun_olculeri, urun_ozellikleri, gorsel, kdv_orani, stok_miktari, min_stok) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 18, 0, 5)";
        $stmtInsert = $db->prepare($sqlInsert);

        // Full Update
        $sqlUpdate = "UPDATE urunler SET barkod=?, urun_adi=?, tedarikci_id=?, tedarikci_urun_adi=?, 
                      kategori=?, alis_fiyati=?, satis_fiyati=?, urun_olculeri=?, urun_ozellikleri=?, gorsel=? 
                      WHERE id=?";
        $stmtUpdate = $db->prepare($sqlUpdate);

        foreach ($rows as $row) {
            // Basic validation
            if (count($row) < 3)
                continue;

            $stok_kodu = trim($row[0]);
            if (empty($stok_kodu)) {
                $stats['skipped']++;
                continue;
            }

            $barkod = trim($row[1] ?? '');
            $urun_adi = trim($row[2] ?? '');
            $tedarikci_adi = trim($row[3] ?? '');
            $tedarikci_urun_adi = trim($row[4] ?? '');
            $kategori = trim($row[5] ?? 'Genel');
            $alt_kategori = trim($row[6] ?? '');

            $alis = (float) str_replace(',', '.', $row[7] ?? 0);
            $satis = (float) str_replace(',', '.', $row[8] ?? 0);

            // Dimensions
            $en = trim($row[9] ?? '');
            $boy = trim($row[10] ?? '');
            $yuk = trim($row[11] ?? '');
            $urun_olculeri = ($en && $boy && $yuk) ? "$en x $boy x $yuk" : "";

            // Details
            $m3 = trim($row[12] ?? '');
            $kg = trim($row[13] ?? '');
            $kumas = trim($row[14] ?? '');
            $sunger = trim($row[15] ?? '');
            $termin = trim($row[16] ?? '');

            // 1. Auto-Generate Supplier-Product Name if Mazello Name is empty
            if (empty($urun_adi) && $alt_kategori && $tedarikci_urun_adi) {
                $urun_adi = "$alt_kategori - $tedarikci_urun_adi";
            } else if (empty($urun_adi)) {
                $urun_adi = $tedarikci_urun_adi; // Fallback
            }

            // 2. Auto-Generate Barcode (EAN-13 random)
            if (empty($barkod)) {
                $rnd = "869" . str_pad(mt_rand(0, 999999999), 9, '0', STR_PAD_LEFT);
                $sum = 0;
                for ($i = 0; $i < 12; $i++)
                    $sum += (int) $rnd[$i] * ($i % 2 === 0 ? 1 : 3);
                $checksum = (10 - ($sum % 10)) % 10;
                $barkod = $rnd . $checksum;
            }

            // Convert Supplier Name to ID (Need this early for Code Generation)
            $tedarikci_id = 0;
            if ($tedarikci_adi) {
                $stmtSupplier->execute([$tedarikci_adi]);
                $sup = $stmtSupplier->fetch(PDO::FETCH_ASSOC);
                if ($sup) {
                    $tedarikci_id = $sup['id'];
                } else {
                    // Optional: Create new supplier on the fly? Or skip?
                    // For now, let's keep it 0 or maybe create it?
                    // Let's create a logic to autocreate supplier if simple name provided
                    // $stmtNewSup = $db->prepare("INSERT INTO cariler (ad_soyad, tip) VALUES (?, 'tedarikci')");
                    // $stmtNewSup->execute([$tedarikci_adi]);
                    // $tedarikci_id = $db->lastInsertId();
                    // NOTE: User didn't ask for this, let's stick to matching existing.
                }
            }

            // 3. Auto-Generate Stock Code: [SUP_PREFIX][PROD_PREFIX][SEQ]
            if (empty($stok_kodu) && $tedarikci_id && $tedarikci_urun_adi) {
                // Supplier Prefix: First 3 consonants or letters
                $supName = preg_replace('/[^a-zA-Z]/', '', $tedarikci_adi);
                $supPre = strtoupper(substr($supName, 0, 3));

                // Product Prefix
                $prodName = preg_replace('/[^a-zA-Z]/', '', $tedarikci_urun_adi);
                $prodPre = strtoupper(substr($prodName, 0, 3));

                // Find existing count for this supplier to increment
                $stmtCount = $db->prepare("SELECT COUNT(*) FROM urunler WHERE tedarikci_id = ?");
                $stmtCount->execute([$tedarikci_id]);
                $count = $stmtCount->fetchColumn() + 1 + ($stats['inserted'] ?? 0); // Approx

                // Try to find a unique code
                do {
                    $stok_kodu = $supPre . $prodPre . str_pad($count, 4, '0', STR_PAD_LEFT);
                    $stmtCheck->execute([$stok_kodu]);
                    $isTaken = $stmtCheck->fetchColumn();
                    if ($isTaken)
                        $count++;
                } while ($isTaken);
            } else if (empty($stok_kodu)) {
                // Fallback if no supplier info
                $stok_kodu = "STK-" . uniqid();
            }

            // Build Feature String: "Tip: AltKat | Kumaş: X | Sünger: Y | Termin: Z | M3: A | KG: B"
            $features = [];
            if ($alt_kategori)
                $features[] = "Tip: $alt_kategori";
            if ($kumas)
                $features[] = "Kumaş: $kumas";
            if ($sunger)
                $features[] = "Sünger: $sunger";
            if ($termin)
                $features[] = "Termin: $termin";
            if ($m3)
                $features[] = "M3: $m3";
            if ($kg)
                $features[] = "KG: $kg";
            $urun_ozellikleri = implode(' | ', $features);

            $gorsel = trim($row[17] ?? '');

            // Supplier ID is already resolved above for auto-generation logic

            $stmtCheck->execute([$stok_kodu]);
            $exists = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($exists) {
                // UPDATE
                $stmtUpdate->execute([
                    $barkod,
                    $urun_adi,
                    $tedarikci_id,
                    $tedarikci_urun_adi,
                    $kategori,
                    $alis,
                    $satis,
                    $urun_olculeri,
                    $urun_ozellikleri,
                    $gorsel,
                    $exists['id']
                ]);
                $stats['updated']++;
            } else {
                // INSERT
                $stmtInsert->execute([
                    $stok_kodu,
                    $barkod,
                    $urun_adi,
                    $tedarikci_id,
                    $tedarikci_urun_adi,
                    $kategori,
                    $alis,
                    $satis,
                    $urun_olculeri,
                    $urun_ozellikleri,
                    $gorsel
                ]);
                $stats['inserted']++;
            }
        }
    }

    // --- ACTION: IMPORT CUSTOMERS ---
    elseif ($action === 'import_customers') {
        // Expected Header (10 Cols - NO TYPE): 
        // 0:Cari Kodu, 1:Ad Soyad/Firma, 2:Yetkili, 3:Telefon, 4:E-Posta, 
        // 5:Adres, 6:Vergi Dairesi, 7:Vergi No, 8:TC No, 9:IBAN

        // STRICT TYPE FROM URL PARAM
        $tip = strtolower(trim($_GET['type'] ?? 'musteri'));
        if (!in_array($tip, ['musteri', 'tedarikci', 'personel']))
            $tip = 'musteri';

        $stmtCheck = $db->prepare("SELECT id FROM cariler WHERE cari_kodu = ?");
        $stmtInsert = $db->prepare("INSERT INTO cariler (cari_kodu, tip, ad_soyad, yetkili_kisi, telefon, eposta, adres, vergi_dairesi, vergi_no, tc_no, iban) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtUpdate = $db->prepare("UPDATE cariler SET tip=?, ad_soyad=?, yetkili_kisi=?, telefon=?, eposta=?, adres=?, vergi_dairesi=?, vergi_no=?, tc_no=?, iban=? WHERE id=?");

        foreach ($rows as $row) {
            if (count($row) < 2)
                continue;

            // Updated Indexing because 'Type' column is removed
            $cari_kodu = trim($row[0]);
            $ad_soyad = trim($row[1]);

            if (empty($ad_soyad)) {
                $stats['skipped']++;
                continue;
            }

            $yetkili = trim($row[2] ?? '');
            $telefon = trim($row[3] ?? '');
            $eposta = trim($row[4] ?? '');
            $adres = trim($row[5] ?? '');
            $vd = trim($row[6] ?? '');
            $vn = trim($row[7] ?? '');
            $tc = trim($row[8] ?? '');
            $iban = trim($row[9] ?? '');

            // AUTO-GENERATE CARI KODU if empty
            if (empty($cari_kodu)) {
                $prefix = 'M';
                if ($tip === 'tedarikci')
                    $prefix = 'T';
                if ($tip === 'personel')
                    $prefix = 'P';

                $stmtCount = $db->prepare("SELECT COUNT(*) FROM cariler WHERE tip = ?");
                $stmtCount->execute([$tip]);
                $count = $stmtCount->fetchColumn() + 1 + ($stats['inserted'] ?? 0);

                do {
                    $cari_kodu = $prefix . "-" . str_pad($count, 4, '0', STR_PAD_LEFT);
                    $stmtCheck->execute([$cari_kodu]);
                    $isTaken = $stmtCheck->fetchColumn();
                    if ($isTaken)
                        $count++;
                } while ($isTaken);
            }

            $stmtCheck->execute([$cari_kodu]);
            $exists = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($exists) {
                // UPDATE (also updates type to ensure consistency if code matches)
                $stmtUpdate->execute([$tip, $ad_soyad, $yetkili, $telefon, $eposta, $adres, $vd, $vn, $tc, $iban, $exists['id']]);
                $stats['updated']++;
            } else {
                // INSERT
                $stmtInsert->execute([$cari_kodu, $tip, $ad_soyad, $yetkili, $telefon, $eposta, $adres, $vd, $vn, $tc, $iban]);
                $stats['inserted']++;
            }
        }
    }


    // --- ACTION: IMPORT COUNTS (STOCK UPDATE ONLY) ---
    elseif ($action === 'import_counts') {
        // Expected Header: Stok Kodu, Sayılan Miktar
        $stmtCheck = $db->prepare("SELECT id, stok_miktari FROM urunler WHERE stok_kodu = ?");
        $stmtUpdate = $db->prepare("UPDATE urunler SET stok_miktari=? WHERE id=?");

        foreach ($rows as $row) {
            if (count($row) < 2)
                continue;

            $stok_kodu = trim($row[0]);
            $miktar = (int) ($row[1] ?? 0);

            $stmtCheck->execute([$stok_kodu]);
            $exists = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($exists) {
                if ($exists['stok_miktari'] != $miktar) {
                    $stmtUpdate->execute([$miktar, $exists['id']]);
                    $stats['updated']++;
                } else {
                    $stats['skipped']++; // Değişiklik yok
                }
            } else {
                $stats['skipped']++; // Ürün bulunamadı
            }
        }
    }

    $db->commit();
    echo json_encode(['success' => true, 'stats' => $stats, 'message' => 'İşlem başarıyla tamamlandı.']);

} catch (Exception $e) {
    if ($db->inTransaction())
        $db->rollBack();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>