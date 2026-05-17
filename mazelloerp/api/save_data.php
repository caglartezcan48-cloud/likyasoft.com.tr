<?php
// MAZELLO API - CORE DATA HANDLER v4.4 (Financial Stats Added)
ini_set('display_errors', 0);
header("Content-Type: application/json; charset=UTF-8");
require_once 'auth_check.php'; // GÜVENLİK DUVARI
require_once 'db.php';

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $action = $_GET['action'] ?? '';

    // --- ROUTER ---

    // 1. CARİ KAYIT
    if ($action === 'save_cari') {
        ensureColumnExists($db, 'cariler', 'teslimat_adresi', 'TEXT DEFAULT NULL');
        ensureColumnExists($db, 'cariler', 'maas', 'DECIMAL(10,2) DEFAULT NULL');
        ensureColumnExists($db, 'cariler', 'yetki_json', 'TEXT DEFAULT NULL');
        ensureColumnExists($db, 'cariler', 'isten_cikis_tarihi', 'DATE DEFAULT NULL');
        ensureColumnExists($db, 'cariler', 'durum', "VARCHAR(10) DEFAULT 'aktif'");

        $id = $data['id'] ?? null;
        $tip = $data['cari_tipi'] ?? $data['tip'] ?? 'musteri';
        $durum = $data['durum'] ?? 'aktif';

        // --- DUPLICATE CHECK START ---
        $tel = trim($data['telefon'] ?? '');
        $tc = trim($data['tc_no'] ?? '');
        $tax = trim($data['vergi_no'] ?? '');

        // Sadece dolu olan alanlarda kontrol yap
        $conditions = [];
        $params = [];

        if ($tel !== '') {
            $conditions[] = "telefon = ?";
            $params[] = $tel;
        }
        if ($tc !== '') {
            $conditions[] = "tc_no = ?";
            $params[] = $tc;
        }
        if ($tax !== '') {
            $conditions[] = "vergi_no = ?";
            $params[] = $tax;
        }

        if (!empty($conditions)) {
            $sqlCheck = "SELECT id, ad_soyad FROM cariler WHERE (" . implode(" OR ", $conditions) . ")";
            $stmtCheck = $db->prepare($sqlCheck);
            $stmtCheck->execute($params);
            $found = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($found) {
                // Eğer bulunan kayıt, güncellenen kayıt değilse (Yeni kayıt veya başkasının kaydı)
                if (!$id || ($id && $found['id'] != $id)) {
                    echo json_encode([
                        "status" => "error",
                        "message" => "BU KAYIT ZATEN VAR!\n\nBulunan Cari: " . $found['ad_soyad'] . "\n\n(Aynı Telefon, TC veya Vergi No kullanılamaz.)"
                    ]);
                    exit;
                }
            }
        }
        // --- DUPLICATE CHECK END ---

        // Personel yetkileri
        $yetki_json = null;
        if ($tip === 'personel' && isset($data['yetkiler'])) {
            $yetki_json = json_encode($data['yetkiler'], JSON_UNESCAPED_UNICODE);
        }

        if ($id) {
            // UPDATE
            $stmt = $db->prepare("UPDATE cariler SET ad_soyad=?, yetkili_kisi=?, vergi_no=?, tc_no=?, vergi_dairesi=?, telefon=?, eposta=?, adres=?, teslimat_adresi=?, iban=?, notlar=?, dogum_tarihi=?, sgk_no=?, ise_giris_tarihi=?, isten_cikis_tarihi=?, maas=?, yetki_json=?, tip=?, durum=? WHERE id=?");
            $stmt->execute([
                $data['ad_soyad'],
                $data['yetkili_kisi'] ?? '',
                $data['vergi_no'] ?? '',
                $data['tc_no'] ?? '',
                $data['vergi_dairesi'] ?? '',
                $data['telefon'] ?? '',
                $data['eposta'] ?? '',
                $data['adres'] ?? '',
                $data['teslimat_adresi'] ?? '',
                $data['iban'] ?? '',
                $data['notlar'] ?? '',
                empty($data['dogum_tarihi']) ? null : $data['dogum_tarihi'],
                $data['sgk_no'] ?? null,
                empty($data['ise_giris_tarihi']) ? null : $data['ise_giris_tarihi'],
                empty($data['isten_cikis_tarihi']) ? null : $data['isten_cikis_tarihi'],
                isset($data['maas']) && $data['maas'] !== '' ? floatval($data['maas']) : null,
                $yetki_json,
                $tip,
                $durum,
                $id
            ]);
        } else {
            // INSERT
            $prefix = ($tip == 'tedarikci') ? 'T' : (($tip == 'personel') ? 'P' : 'M');

            // Auto Code Logic
            $count = $db->query("SELECT COUNT(*) FROM cariler")->fetchColumn();
            $next = ($count ?: 0) + 1000;
            $newCode = $prefix . '-' . $next;

            $stmt = $db->prepare("INSERT INTO cariler (cari_kodu, tip, ad_soyad, yetkili_kisi, vergi_no, tc_no, vergi_dairesi, telefon, eposta, adres, teslimat_adresi, iban, notlar, dogum_tarihi, sgk_no, ise_giris_tarihi, isten_cikis_tarihi, maas, yetki_json, durum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $newCode,
                $tip,
                $data['ad_soyad'],
                $data['yetkili_kisi'] ?? '',
                $data['vergi_no'] ?? '',
                $data['tc_no'] ?? '',
                $data['vergi_dairesi'] ?? '',
                $data['telefon'] ?? '',
                $data['eposta'] ?? '',
                $data['adres'] ?? '',
                $data['teslimat_adresi'] ?? '',
                $data['iban'] ?? '',
                $data['notlar'] ?? '',
                empty($data['dogum_tarihi']) ? null : $data['dogum_tarihi'],
                $data['sgk_no'] ?? null,
                empty($data['ise_giris_tarihi']) ? null : $data['ise_giris_tarihi'],
                empty($data['isten_cikis_tarihi']) ? null : $data['isten_cikis_tarihi'],
                isset($data['maas']) && $data['maas'] !== '' ? floatval($data['maas']) : null,
                $yetki_json,
                $durum
            ]);
            $id = $db->lastInsertId();
        }
        echo json_encode(["status" => "success", "id" => $id]);

        // 2. ÜRÜN KAYIT
    } elseif ($action === 'save_product') {
        $db->beginTransaction();
        try {
            // TEDARİKÇİ ID (Frontend 'supplierId' veya 'tedarikci_id' gönderiyor olabilir)
            $tedarikciId = $data['supplierId'] ?? ($data['tedarikci_id'] ?? null);
            // Boş string gelirse NULL yap
            if ($tedarikciId === '')
                $tedarikciId = null;

            // --- BARKOD KONTROLÜ (DUPLICATE CHECK) ---
            $barkod = $data['barkod'] ?? null;
            if ($barkod) {
                // Eğer güncelleme ise (id varsa), kendi id'si haricindekilere bak.
                $ignoreId = ($data['id'] ?? 0);
                $stmtCheck = $db->prepare("SELECT id, urun_adi FROM urunler WHERE barkod = ? AND id != ?");
                $stmtCheck->execute([$barkod, $ignoreId]);
                $dup = $stmtCheck->fetch(PDO::FETCH_ASSOC);

                if ($dup) {
                    echo json_encode([
                        "status" => "error",
                        "message" => "BU BARKOD KULLANIMDA!\n\n'" . $dup['urun_adi'] . "' ürününde kayıtlı.\nLütfen başka bir barkod üretin."
                    ]);
                    exit;
                }
            }
            // ----------------------------------------

            if (isset($data['id']) && $data['id'] > 0) {
                // UPDATE
                $sql = "UPDATE urunler SET stok_kodu=?, urun_adi=?, tedarikci_urun_adi=?, urun_ozellikleri=?, urun_olculeri=?, kategori=?, alis_fiyati=?, satis_fiyati=?, kdv_orani=?, resim_url=?, min_stok=?, stok_miktari=?, tedarikci_id=?, barkod=? WHERE id=?";
                $db->prepare($sql)->execute([
                    $data['stok_kodu'],
                    $data['urun_adi'],
                    $data['tedarikci_urun_adi'] ?? null,
                    $data['urun_ozellikleri'] ?? null,
                    $data['urun_olculeri'] ?? null,
                    $data['kategori'] ?? 'Mobilya',
                    $data['alis_fiyati'] ?? 0,
                    $data['satis_fiyati'] ?? 0,
                    $data['kdv_orani'] ?? 18,
                    $data['resim_url'] ?? null,
                    $data['min_stok'] ?? 5,
                    $data['stock'] ?? 0,
                    $tedarikciId,
                    $data['barkod'] ?? null,
                    $data['id']
                ]);
                $productId = $data['id'];
            } else {
                // GÜVENLİK VE STANDARTLAŞTIRMA
                $f_stok_kodu = $data['stok_kodu'];
                $f_urun_adi = $data['urun_adi'];
                $f_ted_urun_adi = $data['tedarikci_urun_adi'] ?? '';
                $f_ozellikler = $data['urun_ozellikleri'] ?? '';
                $f_olculer = $data['urun_olculeri'] ?? '';
                $f_kategori = $data['kategori'] ?? 'Mobilya';
                $f_alis = floatval($data['alis_fiyati'] ?? 0);
                $f_satis = floatval($data['satis_fiyati'] ?? 0);
                $f_kdv = intval($data['kdv_orani'] ?? 18);
                $f_resim = $data['resim_url'] ?? '';
                $f_min = intval($data['min_stok'] ?? 5);
                $f_stok = intval($data['stock'] ?? 0);
                $f_ted_id = intval($tedarikciId); // NULL gelirse 0 olur, güvenli.
                $f_barkod = $data['barkod'] ?? '';

                $sql = "INSERT INTO urunler (stok_kodu, urun_adi, tedarikci_urun_adi, urun_ozellikleri, urun_olculeri, kategori, alis_fiyati, satis_fiyati, kdv_orani, resim_url, min_stok, stok_miktari, tedarikci_id, barkod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $db->prepare($sql)->execute([
                    $f_stok_kodu,
                    $f_urun_adi,
                    $f_ted_urun_adi,
                    $f_ozellikler,
                    $f_olculer,
                    $f_kategori,
                    $f_alis,
                    $f_satis,
                    $f_kdv,
                    $f_resim,
                    $f_min,
                    $f_stok,
                    $f_ted_id,
                    $f_barkod
                ]);
                $productId = $db->lastInsertId();
            }
            $db->commit();
            echo json_encode(["status" => "success", "id" => $productId]);
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }

        // 3. ÜRÜN SİL
    } elseif ($action === 'delete_product') {
        $role = $data['role'] ?? ($_SESSION['mz_role_v2'] ?? 'depo');
        if ($role === 'depo') {
            echo json_encode(["status" => "error", "message" => "Yetkiniz Yok: Depo personeli ürün silemez!"]);
            exit;
        }
        $db->prepare("DELETE FROM urunler WHERE id = ?")->execute([$data['id']]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'product_acceptance') {
        $id = $data['product_id'];
        $qty = intval($data['qty']);
        $note = $data['note'] ?? 'MAL KABUL';
        $role = $data['role'] ?? 'depo';

        $db->beginTransaction();
        try {
            // Update Depo Stock
            $stmt = $db->prepare("UPDATE urunler SET stok_miktari = stok_miktari + ? WHERE id = ?");
            $stmt->execute([$qty, $id]);

            // Log Movement
            $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama, kullanici) VALUES (?, 'mal_kabul', ?, '+', ?, ?)")
                ->execute([$id, $qty, $note, $role]);

            $db->commit();
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }

        // 5. STOK TRANSFERİ (DEPO <-> MAĞAZA)
    } elseif ($action === 'save_stock_transfer') {
        $id = $data['urun_id'];
        $qty = intval($data['qty']);
        $from = $data['from']; // 'depo' or 'magaza'
        $to = $data['to'];     // 'depo' or 'magaza'
        $note = $data['note'] ?? '';

        if ($from === $to) {
            echo json_encode(["status" => "error", "message" => "Aynı yere transfer yapılamaz."]);
            exit;
        }

        $db->beginTransaction();
        try {
            $stmt = $db->prepare("SELECT stok_miktari, magaza_stok FROM urunler WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row)
                throw new Exception("Ürün bulunamadı.");

            $oldDepo = intval($row['stok_miktari'] ?? 0);
            $oldMagaza = intval($row['magaza_stok'] ?? 0);

            if ($from === 'depo') {
                if ($oldDepo < $qty)
                    throw new Exception("Depoda yeterli stok yok. (Mevcut: $oldDepo)");
                $newDepo = $oldDepo - $qty;
                $newMagaza = $oldMagaza + $qty;
            } else {
                if ($oldMagaza < $qty)
                    throw new Exception("Mağazada yeterli stok yok. (Mevcut: $oldMagaza)");
                $newMagaza = $oldMagaza - $qty;
                $newDepo = $oldDepo + $qty;
            }

            // Update Product
            $db->prepare("UPDATE urunler SET stok_miktari=?, magaza_stok=? WHERE id=?")->execute([$newDepo, $newMagaza, $id]);

            // Log Movement
            $desc = "Transfer ($from -> $to): $note";
            $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama) VALUES (?, ?, ?, ?, ?)")
                ->execute([$id, 'transfer', $qty, ($from === 'depo' ? '-' : '+'), $desc]);

            $db->commit();
            echo json_encode(["status" => "success", "new_depo" => $newDepo, "new_magaza" => $newMagaza]);
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }

        // 6. STOK SAYIM KAYDI
    } elseif ($action === 'save_stock_count') {
        $location = $data['location']; // 'depo' | 'magaza'
        $items = $data['items']; // [{id, actual}, ...]
        $role = $data['role'];

        $db->beginTransaction();
        try {
            $count = 0;
            foreach ($items as $item) {
                $isNew = $item['is_new'] ?? false;
                $urunId = 0;
                $actual = intval($item['actual']);
                $oldVal = 0;

                if ($isNew) {
                    // YENİ ÜRÜN OLUŞTUR
                    $urunAdi = trim($item['name'] ?? '');
                    if ($urunAdi === '')
                        continue;

                    // Otomatik Stok Kodu Üret (STK + Zaman Damgası son 6 hane)
                    $stokKodu = 'STK-' . substr(time(), -6) . rand(10, 99);

                    $sqlNew = "INSERT INTO urunler (stok_kodu, urun_adi, kategori, alis_fiyati, satis_fiyati, stok_miktari, magaza_stok) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    $db->prepare($sqlNew)->execute([
                        $stokKodu,
                        $urunAdi,
                        'Mobilya', // Varsayılan kategori
                        0,
                        0,
                        0,
                        0
                    ]);
                    $urunId = $db->lastInsertId();
                    $oldVal = 0;
                } else {
                    $urunId = intval($item['id']);
                    // Mevcut stoğu çek (farkı loglamak için)
                    $targetCol = ($location === 'magaza') ? 'stok_magaza' : 'stok_miktari';
                    $stmt = $db->prepare("SELECT $targetCol FROM urunler WHERE id = ?");
                    $stmt->execute([$urunId]);
                    $oldRow = $stmt->fetch(PDO::FETCH_ASSOC);
                    if (!$oldRow)
                        continue;
                    $oldVal = intval($oldRow[$targetCol] ?? 0);
                }

                $targetCol = ($location === 'magaza') ? 'magaza_stok' : 'stok_miktari';
                $diff = $actual - $oldVal;

                if ($diff !== 0 || $isNew) {
                    // Stoğu Güncelle
                    $db->prepare("UPDATE urunler SET $targetCol = ? WHERE id = ?")->execute([$actual, $urunId]);

                    // Hareketi Logla
                    $yon = $diff >= 0 ? '+' : '-';
                    $absDiff = abs($diff);
                    $prefix = ($role === 'depo' ? '[ÖN SAYIM] ' : '[SAYIM] ');
                    $desc = $prefix . ($isNew ? "Hızlı Giriş (Yeni Ürün) " : "Düzeltme ") . "($location): $oldVal -> $actual";

                    $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama, kullanici) VALUES (?, ?, ?, ?, ?, ?)")
                        ->execute([$urunId, 'sayim', $absDiff, $yon, $desc, $role]);

                    $count++;
                }
            }
            $db->commit();
            echo json_encode(["status" => "success", "processed_count" => $count]);
        } catch (Exception $e) {
            $db->rollBack();
            // Kolon hatası olabilir
            echo json_encode(["status" => "error", "message" => "Veritabanı hatası (Muhtemelen Mağaza stoğu kolonu yok): " . $e->getMessage()]);
        }

        // 6.5 FİRE / ZAYİ KAYDI
    } elseif ($action === 'save_waste_loss') {
        $urunId = intval($data['urun_id']);
        $qty = intval($data['qty']);
        $location = $data['location']; // 'depo' | 'magaza'
        $reason = $data['reason'] ?? 'Fire Belirtilmedi';
        $role = $data['role'] ?? 'System';

        if ($qty <= 0) {
            echo json_encode(["status" => "error", "message" => "Miktar sıfırdan büyük olmalıdır."]);
            exit;
        }

        $db->beginTransaction();
        try {
            $targetCol = ($location === 'magaza') ? 'magaza_stok' : 'stok_miktari';

            // Mevcut stoğu kontrol et
            $stmt = $db->prepare("SELECT $targetCol as mevcut_stok FROM urunler WHERE id = ?");
            $stmt->execute([$urunId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                throw new Exception("Ürün bulunamadı.");
            }

            if ($row['mevcut_stok'] < $qty) {
                throw new Exception("Yetersiz Stok. Mevcut " . strtoupper($location) . " stoğu: " . $row['mevcut_stok']);
            }

            // Stoğu Düş
            $db->prepare("UPDATE urunler SET $targetCol = $targetCol - ? WHERE id = ?")->execute([$qty, $urunId]);

            // Hareketi Logla
            $desc = "[$location] $reason";
            $db->prepare("INSERT INTO stok_hareketleri (urun_id, islem_turu, miktar, yon, aciklama, kullanici) VALUES (?, 'FIRE', ?, '-', ?, ?)")
                ->execute([$urunId, $qty, $desc, $role]);

            $db->commit();
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }

        // 6.6 SABİT KIYMETLER (FIXED ASSETS)
    } elseif ($action === 'get_sabit_kiymetler') {
        try {
            // Tablo yoksa otomatik oluştur (Failed to fetch hatasını engellemek için)
            $db->exec("CREATE TABLE IF NOT EXISTS sabit_kiymetler (
                id INT AUTO_INCREMENT PRIMARY KEY, 
                name VARCHAR(255) NOT NULL, 
                category VARCHAR(100) DEFAULT 'Demirbaş', 
                value DECIMAL(15,2) DEFAULT 0.00, 
                purchase_date DATE, 
                status VARCHAR(50) DEFAULT 'Aktif', 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

            $stmt = $db->query("SELECT * FROM sabit_kiymetler ORDER BY purchase_date DESC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }

    } elseif ($action === 'save_sabit_kiymet') {
        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? 'Demirbaş');
        $value = (float) ($data['value'] ?? 0);
        $purchase_date = trim($data['date'] ?? date('Y-m-d'));
        $status = trim($data['status'] ?? 'Aktif');

        if (!$name || $value <= 0) {
            echo json_encode(["status" => "error", "message" => "Eksik veya hatalı bilgi girdiniz."]);
            exit;
        }

        try {
            $stmt = $db->prepare("INSERT INTO sabit_kiymetler (name, category, value, purchase_date, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $category, $value, $purchase_date, $status]);
            echo json_encode(["status" => "success", "message" => "Sabit kıymet eklendi."]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }

    } elseif ($action === 'delete_sabit_kiymet') {
        $id = intval($data['id'] ?? 0);
        try {
            $db->prepare("DELETE FROM sabit_kiymetler WHERE id = ?")->execute([$id]);
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }

        // 6. MÜŞTERİ HESAP EKSTRESİ
    } elseif ($action === 'get_customer_balance') {
        $id = intval($_GET['id']);

        // --- SECURITY: Personnel Data Access Control ---
        $cariCheck = $db->prepare("SELECT tip FROM cariler WHERE id = ?");
        $cariCheck->execute([$id]);
        $cariInfo = $cariCheck->fetch(PDO::FETCH_ASSOC);

        if ($cariInfo && $cariInfo['tip'] === 'personel') {
            $allowedRoles = ['boss', 'ceo', 'muhasebe'];
            if (!in_array($_SESSION['user_role'] ?? $_SESSION['role'] ?? '', $allowedRoles)) {
                echo json_encode(["status" => "error", "message" => "Yetki Reddedildi: Personel verilerine erişim izniniz yok."]);
                exit;
            }
        }

        // A. Tüm Sipariş ve Teklifler (Satış / İade / Değişim)
        $orders = $db->prepare("SELECT * FROM teklifler WHERE musteri_id = ? ORDER BY created_at DESC");
        $orders->execute([$id]);
        $allOrders = $orders->fetchAll(PDO::FETCH_ASSOC);

        // B. Tüm Satın Almalar (Tedarikçi hareketleri)
        $purchases = $db->prepare("SELECT * FROM satin_almalar WHERE tedarikci_id = ? ORDER BY created_at DESC");
        $purchases->execute([$id]);
        $allPurchases = $purchases->fetchAll(PDO::FETCH_ASSOC);

        // C. Tahsilatlar (KASA - Gelir ve Gider)
        $pay = $db->prepare("SELECT * FROM kasa_hareketleri WHERE cari_id = ? AND turu IN ('gelir', 'gider')");
        $pay->execute([$id]);
        $payRows = $pay->fetchAll(PDO::FETCH_ASSOC);

        $ledger = [];

        // --- 1. SATIŞLAR / İADELER ---
        foreach ($allOrders as $r) {
            $stmtDet = $db->prepare("SELECT u.urun_adi, d.miktar as adet, d.birim_fiyat as fiyat FROM teklif_detaylari d LEFT JOIN urunler u ON d.urun_id = u.id WHERE d.teklif_id = ?");
            $stmtDet->execute([$r['id']]);
            $details = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

            $productSummary = count($details) > 0 ? $details[0]['urun_adi'] : 'Ürün Yok';
            if (count($details) > 1)
                $productSummary .= ' (+' . (count($details) - 1) . ')';

            $isDebt = ($r['durum'] === 'satis');
            $isReturn = ($r['durum'] === 'iade');

            $typeLabel = 'Satis';
            if ($isReturn)
                $typeLabel = 'Iade';
            else if ($r['durum'] === 'teklif')
                $typeLabel = 'Teklif (Pasif)';

            $ledger[] = [
                'date' => $r['satis_tarihi'] ?: $r['created_at'],
                'type' => $isReturn ? 'credit' : 'debt',
                'islem_turu' => $typeLabel,
                'status' => $r['durum'],
                'desc' => ($isReturn ? "[İADE] " : "") . "#" . $r['teklif_no'] . " - " . $productSummary,
                'amount' => floatval($r['toplam_tutar']),
                'is_effective_debt' => ($isDebt || $isReturn),
                'details' => $details
            ];
        }

        // --- 2. SATIN ALMALAR ---
        foreach ($allPurchases as $p) {
            $stmtDet = $db->prepare("SELECT u.urun_adi, d.miktar as adet, d.alis_fiyati as fiyat FROM satin_alma_detaylari d LEFT JOIN urunler u ON d.urun_id = u.id WHERE d.satin_alma_id = ?");
            $stmtDet->execute([$p['id']]);
            $details = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

            $productSummary = count($details) > 0 ? $details[0]['urun_adi'] : 'Ürün Yok';
            if (count($details) > 1)
                $productSummary .= ' (+' . (count($details) - 1) . ')';

            $ledger[] = [
                'date' => $p['tarih'],
                'type' => 'credit', // Biz borçlanırız -> Alacaklı olur tedarikçi
                'islem_turu' => 'Satin Alma',
                'status' => $p['durum'],
                'desc' => "Satın Alma #" . $p['id'] . " - " . $productSummary . " (" . $p['hedef'] . ")",
                'amount' => floatval($p['toplam_tutar']),
                'is_effective_debt' => true,
                'details' => $details
            ];
        }

        // --- 3. ÖDEMELER / TAHSİLATLAR ---
        foreach ($payRows as $r) {
            $ledger[] = [
                'id' => $r['id'],
                'date' => $r['tarih'],
                'type' => ($r['turu'] === 'gider') ? 'debt' : 'credit',
                'islem_turu' => ($r['turu'] === 'gider') ? 'Ödeme' : 'Tahsilat',
                'status' => 'odeme',
                'desc' => ($r['turu'] === 'gider' ? "Ödeme: " : "Tahsilat: ") . $r['aciklama'] . " (" . ($r['odeme_tipi'] ?? 'nakit') . ")",
                'amount' => floatval($r['tutar']),
                'is_effective_debt' => true
            ];
        }

        // --- 4. PERSONEL HAKEDİŞLERİ ---
        $hakedis = $db->prepare("SELECT * FROM personel_hakedis WHERE personel_id = ?");
        $hakedis->execute([$id]);
        $hRows = $hakedis->fetchAll(PDO::FETCH_ASSOC);

        foreach ($hRows as $r) {
            $ledger[] = [
                'id' => $r['id'],
                'date' => $r['tarih'],
                'type' => 'credit', // Hakediş personeli alacaklandırır
                'islem_turu' => 'Hakediş',
                'status' => 'aktif',
                'desc' => "Hakediş: " . $r['aciklama'],
                'amount' => floatval($r['tutar']),
                'is_effective_debt' => true
            ];
        }

        // --- SORT & BALANCE ---
        usort($ledger, function ($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });

        $bal = 0;
        $final = [];
        foreach ($ledger as $l) {
            if ($l['is_effective_debt']) {
                if ($l['type'] == 'debt')
                    $bal += $l['amount'];
                else
                    $bal -= $l['amount'];
            }
            $l['balance'] = $bal;
            $final[] = $l;
        }

        echo json_encode(["status" => "success", "ledger" => $final, "total_debt" => $bal]);

        // 6.7 GÜNLÜK KASA İŞLEMLERİ (YENİ - YASAL KODLU)
    } elseif ($action === 'add_kasa_islem') {
        $turu = $data['turu'] ?? 'gelir'; // gelir, gider
        $meblag = floatval($data['meblag'] ?? 0);
        $aciklama = trim($data['aciklama'] ?? '');
        $yasal_kod = trim($data['yasal_kod'] ?? '100');
        $kullanici = $_SESSION['mz_user'] ?? 'Sistem';

        $kategori = trim($data['kategori'] ?? 'Diğer');
        $tahakkuk_id = $data['tahakkuk_id'] ?? null;
        $cari_id = $data['cari_id'] ?? null;
        $cari_tipi = $data['cari_tipi'] ?? null; // musteri, tedarikci, personel
        $belge_id = $data['belge_id'] ?? null; // e.g. teklif_id
        $odeme_yontemi = $data['odeme_yontemi'] ?? 'Nakit';
        $odeme_detayi = $data['odeme_detayi'] ?? null;
        $tarih = date('Y-m-d H:i:s');

        if ($meblag <= 0) {
            echo json_encode(["status" => "error", "message" => "Geçerli bir tutar girin."]);
            exit;
        }

        try {
            // Check if cari_tipi column exists in kasa_hareketleri, if not add it silently (Robustness)
            try {
                $db->exec("ALTER TABLE kasa_hareketleri ADD COLUMN cari_tipi VARCHAR(50) DEFAULT NULL");
                $db->exec("ALTER TABLE kasa_hareketleri ADD COLUMN belge_id INT DEFAULT NULL");
                $db->exec("ALTER TABLE kasa_hareketleri ADD COLUMN odeme_yontemi VARCHAR(50) DEFAULT 'Nakit'");
                $db->exec("ALTER TABLE kasa_hareketleri ADD COLUMN odeme_detayi VARCHAR(255) DEFAULT NULL");
            } catch (Exception $e) {
            }

            $stmt = $db->prepare("INSERT INTO kasa_hareketleri (turu, tutar, aciklama, yasal_kod, kategori, kullanici, cari_id, cari_tipi, belge_id, odeme_yontemi, odeme_detayi, tarih) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$turu, $meblag, $aciklama, $yasal_kod, $kategori, $kullanici, $cari_id, $cari_tipi, $belge_id, $odeme_yontemi, $odeme_detayi, $tarih]);

            // Kasa İşlemi Bağlantılı Cari/Belge Etkileşimleri

            // 1. Tahakkuk (Ay İçi Planlı Ödemeler) Kapatma Kontrolü
            if ($tahakkuk_id && $turu === 'gider') {
                $db->prepare("UPDATE odeme_tahakkuklari 
                              SET odenen_tutar = odenen_tutar + ?, 
                                  durum = CASE WHEN (tutar - (odenen_tutar + ?)) <= 0 THEN 'odendi' ELSE 'kismi_odendi' END
                              WHERE id = ?")
                    ->execute([$meblag, $meblag, $tahakkuk_id]);
            }

            // 2. Müşteri Faturasına/Satışa Tahsilat Ekleme (Gelir)
            if ($turu === 'gelir' && $cari_tipi === 'müşteri' && $belge_id) {
                // Burada pesinat kolonunu veya odenen_tutar tarzı bir kolonu güncelliyoruz.
                // İdealde teklifler tablosunda odenen kısmını tutmak harika olurdu, pesinat şimdilik tahsilatı temsil ediyor.
                $db->prepare("UPDATE teklifler SET pesinat = pesinat + ? WHERE id = ?")
                    ->execute([$meblag, $belge_id]);
            }

            echo json_encode(["status" => "success", "message" => "Kasa işlemi kaydedildi ve ilgili hesaplara yansıtıldı."]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }

        // 6.8 YENİ PLANLI GİDER ŞABLONU EKLE
    } elseif ($action === 'save_planned_master') {
        $isim = trim($data['isim'] ?? '');
        $kategori = trim($data['kategori'] ?? 'Kira');
        $tutar = floatval($data['tutar'] ?? 0);

        if (empty($isim) || $tutar <= 0) {
            echo json_encode(["status" => "error", "message" => "İsim ve tutar alanları geçerli olmalıdır."]);
            exit;
        }

        try {
            // Check if table exists
            $db->exec("CREATE TABLE IF NOT EXISTS planli_odemeler (
                id INT AUTO_INCREMENT PRIMARY KEY,
                isim VARCHAR(255) NOT NULL,
                kategori VARCHAR(100) DEFAULT 'Kira',
                tutar DECIMAL(10,2) NOT NULL,
                durum ENUM('aktif', 'pasif') DEFAULT 'aktif',
                eklenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $stmt = $db->prepare("INSERT INTO planli_odemeler (isim, kategori, tutar, durum) VALUES (?, ?, ?, 'aktif')");
            $stmt->execute([$isim, $kategori, $tutar]);
            echo json_encode(["status" => "success", "message" => "Şablon başarıyla eklendi."]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }

        // 7. ÖLÜ STOK ANALİZİ (YENİ)
    } elseif ($action === 'get_dead_stock') {
        $months = intval($_GET['months'] ?? 3);

        $sql = "
            SELECT p.* 
            FROM urunler p
            WHERE p.id NOT IN (
                SELECT DISTINCT urun_id FROM stok_hareketleri 
                WHERE tarih >= DATE_SUB(NOW(), INTERVAL ? MONTH)
            )
            AND p.stok_miktari > 0
            ORDER BY p.stok_miktari DESC
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute([$months]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $rows]);

    } elseif ($action === 'get_abc_analysis') {
        // ABC Analizi: Stok Değerine Göre Sınıflandırma
        $sql = "
            SELECT id, urun_adi, stok_kodu, resim_url, 
                   (stok_miktari + magaza_stok) as toplam_stok,
                   alis_fiyati,
                   ((stok_miktari + magaza_stok) * alis_fiyati) as toplam_deger
            FROM urunler
            WHERE (stok_miktari + magaza_stok) > 0
            ORDER BY toplam_deger DESC
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $totalVal = array_sum(array_column($rows, 'toplam_deger'));
        $runningSum = 0;
        foreach ($rows as &$row) {
            $runningSum += $row['toplam_deger'];
            $ratio = ($totalVal > 0) ? ($runningSum / $totalVal) : 0;
            if ($ratio <= 0.8)
                $row['abc_class'] = 'A';
            elseif ($ratio <= 0.95)
                $row['abc_class'] = 'B';
            else
                $row['abc_class'] = 'C';
        }
        echo json_encode(["status" => "success", "data" => $rows, "total_value" => $totalVal]);

    } elseif ($action === 'get_fast_movers') {
        // En Çok Satan/Hareket Gören Ürünler (Son 30 Gün)
        $sql = "
            SELECT p.id, p.urun_adi, p.stok_kodu, p.resim_url,
                   SUM(h.miktar) as satis_miktari
            FROM stok_hareketleri h
            JOIN urunler p ON h.urun_id = p.id
            WHERE h.yon = '-' 
              AND h.tarih >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              AND h.islem_turu != 'transfer'
            GROUP BY p.id
            ORDER BY satis_miktari DESC
            LIMIT 15
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'get_inventory_valuation') {
        // Kategori Bazlı Envanter Değeri
        $sql = "
            SELECT kategori,
                   SUM(stok_miktari + magaza_stok) as toplam_adet,
                   SUM((stok_miktari + magaza_stok) * alis_fiyati) as toplam_maliyet,
                   SUM((stok_miktari + magaza_stok) * satis_fiyati) as toplam_satis_degeri
            FROM urunler
            GROUP BY kategori
            ORDER BY toplam_maliyet DESC
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);


        // 7. FİNANSAL İSTATİSTİKLER (DASHBOARD)
    } elseif ($action === 'get_financial_stats') {
        try {
            $stats = [];
            $start = date('Y-m-01');
            $end = date('Y-m-t');

            // 1. PERSONEL AYLIK BAKİYE (Hakediş - Ödeme) SADECE BU AY
            // Hakedişler (Alacak) for period
            $sqlHakedis = "SELECT SUM(tutar) as total FROM personel_hakedis WHERE MONTH(tarih) = MONTH(CURRENT_DATE()) AND YEAR(tarih) = YEAR(CURRENT_DATE())";
            $stmtHakedis = $db->prepare($sqlHakedis);
            $stmtHakedis->execute();
            $hakedisTotal = $stmtHakedis->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Ödemeler (Borç/Gider) - Personel cari ID'lerini bul
            $sqlPers = "SELECT GROUP_CONCAT(id) as ids FROM cariler WHERE tip='personel'";
            $stmtPers = $db->prepare($sqlPers);
            $stmtPers->execute();
            $pIds = $stmtPers->fetch(PDO::FETCH_ASSOC)['ids'];

            $odemeTotal = 0;
            if ($pIds) {
                // Sadece Turu='gider' + Kategori='Maaş/Avans' vb kontrolü yapılabilir ama
                // şimdilik tüm giderleri 'ödeme' sayalım.
                $sqlOdeme = "SELECT SUM(tutar) as total FROM kasa_hareketleri 
                             WHERE cari_id IN ($pIds) AND turu = 'gider' AND MONTH(tarih) = MONTH(CURRENT_DATE()) AND YEAR(tarih) = YEAR(CURRENT_DATE())";
                $stmtOdeme = $db->prepare($sqlOdeme);
                $stmtOdeme->execute();
                $odemeTotal = $stmtOdeme->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
            }

            // Net Değişim: (Hak edilen - Ödenen)
            // Eksi çıkarsa fazladan ödeme yapılmış (Avans vb). Artı çıkarsa borçluyuz.
            $stats['personel_month'] = (float) $hakedisTotal - (float) $odemeTotal;


            // 2. TAHSİLAT BEKLEYEN (Tüm Müşterilerin Toplam Güncel Borcu)
            // Sadece Pozitif Bakiyeler (Bize borçlu olanlar)
            $sqlPending = "SELECT SUM(bakiye) as total FROM cariler WHERE tip='musteri' AND bakiye > 0";
            $stmtPending = $db->prepare($sqlPending);
            $stmtPending->execute();
            $stats['pending_collection'] = (float) ($stmtPending->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);


            // 3. AYLIK PLANLANAN TAHSİLAT (Sadece bu ay teslim edilecek olanların bakiye toplamı)
            // Bu ay teslim edilecek olan satışların kalan bakiyesi
            $sqlMonthly = "SELECT SUM(bakiye) as total FROM teklifler 
                           WHERE durum = 'satis' 
                           AND MONTH(teslimat_tarihi) = MONTH(CURRENT_DATE()) AND YEAR(teslimat_tarihi) = YEAR(CURRENT_DATE())";
            $stmtMonthly = $db->prepare($sqlMonthly);
            $stmtMonthly->execute();
            $stats['monthly_collection'] = (float) ($stmtMonthly->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

            echo json_encode(['status' => 'success', 'data' => $stats]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }


        // 6. FİNANSAL İŞLEM
    } elseif ($action === 'save_transaction') {
        $id = $data['id'] ?? null;
        $cariId = $data['cari_id'] ?? $data['id'] ?? null; // Handle both key styles
        $type = $data['islem_tipi'] ?? $data['type'] ?? 'gelir';
        $amount = floatval($data['tutar'] ?? $data['amount'] ?? 0);
        $date = $data['tarih'] ?? $data['date'] ?? date('Y-m-d');
        $desc = $data['aciklama'] ?? $data['description'] ?? '';

        // YENİ ALANLAR
        $odemeTipi = $data['odeme_yontemi'] ?? $data['odeme_tipi'] ?? 'nakit';
        $banka = $data['banka_id'] ?? $data['banka_bilgisi'] ?? '';
        $kasaId = $data['kasa_id'] ?? 1;
        $hesapKodu = $data['hesap_kodu'] ?? null;

        // OTOMATİK HESAP KODU BELİRLEME
        if (!$hesapKodu) {
            if ($odemeTipi === 'kart')
                $hesapKodu = '108';
            elseif ($odemeTipi === 'havale')
                $hesapKodu = '102';
            elseif ($odemeTipi === 'cek')
                $hesapKodu = '101';
            elseif ($odemeTipi === 'nakit')
                $hesapKodu = '100';
        }

        // Kategori Belirleme (Cari İşlemi olduğu için varsayılanlar)
        $kategori = ($type === 'gelir') ? 'Tahsilat' : 'Tedarikçi';

        // --- SECURITY & CUSTOM LOGIC: Personnel ---
        $cariCheck = $db->prepare("SELECT tip FROM cariler WHERE id = ?");
        $cariCheck->execute([$cariId]);
        $cari = $cariCheck->fetch(PDO::FETCH_ASSOC);

        if ($cari && $cari['tip'] === 'personel') {
            $allowedRoles = ['boss', 'ceo', 'muhasebe'];
            if (!in_array($_SESSION['user_role'] ?? $_SESSION['role'] ?? '', $allowedRoles)) {
                echo json_encode(["status" => "error", "message" => "Yetki Reddedildi."]);
                exit;
            }

            if ($data['islem_tipi'] === 'hakedis') {
                $db->exec("CREATE TABLE IF NOT EXISTS personel_hakedis (id INT AUTO_INCREMENT PRIMARY KEY, personel_id INT, tutar DECIMAL(15,2), tarih DATE, aciklama TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

                $hakedisler = [];
                if (isset($data['hakedis_list']) && is_array($data['hakedis_list'])) {
                    $hakedisler = $data['hakedis_list'];
                } else {
                    // Fallback to single entry if list is not provided
                    if ($amount > 0) {
                        $hakedisler[] = [
                            'amount' => $amount,
                            'date' => $date,
                            'desc' => $desc
                        ];
                    }
                }

                if (empty($hakedisler)) {
                    echo json_encode(["status" => "error", "message" => "Hakediş tutarı girilmedi."]);
                    exit;
                }

                $ins = $db->prepare("INSERT INTO personel_hakedis (personel_id, tutar, tarih, aciklama) VALUES (?, ?, ?, ?)");
                $updBakiye = $db->prepare("UPDATE cariler SET bakiye = bakiye - ? WHERE id = ?");

                foreach ($hakedisler as $h) {
                    $h_amt = floatval($h['amount']);
                    if ($h_amt <= 0)
                        continue;

                    $ins->execute([$cariId, $h_amt, $h['date'], $h['desc']]);
                    $updBakiye->execute([$h_amt, $cariId]);
                }

                echo json_encode(["status" => "success"]);
                exit;
            }
        }

        if ($id) {
            // UPDATE (Not handling bakiye diff complexly here for simplicity, assuming bakiye is recalculated or diffed)
            // Existing logic didn't update bakiye in save_data.php, so I'll keep it but add bakiye update for new entries.
            $sql = "UPDATE kasa_hareketleri SET turu=?, tutar=?, tarih=?, aciklama=?, odeme_tipi=?, banka_bilgisi=?, kasa_id=?, hesap_kodu=? WHERE id=?";
            $db->prepare($sql)->execute([$type, $amount, $date, $desc, $odemeTipi, $banka, $kasaId, $hesapKodu, $id]);
        } else {
            // INSERT
            $sql = "INSERT INTO kasa_hareketleri (cari_id, turu, tutar, tarih, aciklama, odeme_tipi, banka_bilgisi, kasa_id, hesap_kodu, kategori, durum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif')";
            $db->prepare($sql)->execute([$cariId, $type, $amount, $date, $desc, $odemeTipi, $banka, $kasaId, $hesapKodu, $kategori]);

            // Update Bakiye for normal transactions: 
            // Gelir (Tahsilat) -> Müşteri borcu azalır (Bakiye -)
            // Gider (Ödeme) -> Tedarikçi alacağı azalır (Bizim borcumuz azalır -> Bakiye +)
            $diff = ($type === 'gelir') ? -$amount : $amount;
            $db->prepare("UPDATE cariler SET bakiye = bakiye + ? WHERE id = ?")->execute([$diff, $cariId]);
        }
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'delete_transaction') {
        $id = $data['id'];
        $db->prepare("DELETE FROM kasa_hareketleri WHERE id = ?")->execute([$id]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'save_planned_payment') {
        $kategori = $data['kategori'];
        $aciklama = $data['aciklama'];
        $tutar = (float) $data['tutar'];
        $tarih = $data['son_odeme_tarihi'];
        if (!$kategori || $tutar <= 0)
            throw new Exception("Eksik bilgi");
        $db->prepare("INSERT INTO planli_odemeler (kategori, aciklama, tutar, son_odeme_tarihi) VALUES (?, ?, ?, ?)")->execute([$kategori, $aciklama, $tutar, $tarih]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'pay_planned_payment') {
        $id = (int) $data['id'];
        $kasaId = $data['kasa_id'] ?? 1;
        $kullanici = $_SESSION['mz_user'] ?? 'Sistem';

        $db->beginTransaction();
        try {
            $row = $db->query("SELECT * FROM planli_odemeler WHERE id=$id")->fetch();
            if (!$row)
                throw new Exception("Bulunamadı.");

            $db->prepare("UPDATE planli_odemeler SET durum='odendi' WHERE id=?")->execute([$id]);
            $db->prepare("INSERT INTO kasa_hareketleri (turu, kategori, aciklama, tutar, kasa_id, kullanici, durum) VALUES ('gider', ?, ?, ?, ?, ?, 'aktif')")->execute([$row['kategori'], $row['aciklama'], $row['tutar'], $kasaId, $kullanici]);

            $db->commit();
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>