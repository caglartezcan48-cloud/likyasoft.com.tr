<?php
// MAZELLO ACCOUNTING API
// Finansal İşlemlerin Yönetimi
header("Content-Type: application/json; charset=UTF-8");
ini_set('display_errors', 0);
require_once 'auth_check.php'; // GÜVENLİK DUVARI
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';
$filter = $_GET['filter'] ?? 'all';
$category = $_GET['category'] ?? 'all';

try {
    if ($action === 'get_overview') {
        ob_clean();
        $sqlList = "SELECT * FROM kasa_hareketleri WHERE 1=1";
        $params = [];

        if ($filter === 'month') {
            $sqlList .= " AND YEAR(tarih) = YEAR(CURDATE()) AND MONTH(tarih) = MONTH(CURDATE())";
        } elseif ($filter === 'today') {
            $sqlList .= " AND DATE(tarih) = CURDATE()";
        } elseif ($filter === 'week') {
            $sqlList .= " AND YEARWEEK(tarih, 1) = YEARWEEK(CURDATE(), 1)";
        } elseif ($filter === 'custom' && !empty($_GET['start_date']) && !empty($_GET['end_date'])) {
            $sqlList .= " AND DATE(tarih) BETWEEN ? AND ?";
            $params[] = $_GET['start_date'];
            $params[] = $_GET['end_date'];
        }

        if ($category !== 'all') {
            $sqlList .= " AND kategori = ?";
            $params[] = $category;
        }

        // --- SAYFALAMA (PAGINATION) MANTIĞI EKLENDİ ---
        // Toplam kayıt sayısını bul (Filtersız veya filtreli)
        $countSql = str_replace("SELECT *", "SELECT COUNT(*) as total", $sqlList);
        $stmtCount = $db->prepare($countSql);
        $stmtCount->execute($params);
        $totalRecords = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 50; // Sayfa başı 50 kayıt varsayılan

        // Eğer limit -1 gelirse hepsini getir (Örn: Rapor ekranları için özel durumlar)
        if ($limit !== -1) {
            $offset = ($page - 1) * $limit;
            $sqlList .= " ORDER BY tarih DESC LIMIT $limit OFFSET $offset";
        } else {
            $sqlList .= " ORDER BY tarih DESC";
        }
        // ----------------------------------------------

        $stmtList = $db->prepare($sqlList);
        $stmtList->execute($params);
        $transactions = $stmtList->fetchAll(PDO::FETCH_ASSOC);

        $formattedList = [];
        $totalVault = 0;
        $monthlyExpense = 0;

        $stmtGlobal = $db->query("SELECT SUM(CASE WHEN turu='gelir' THEN tutar ELSE -tutar END) as bakiye FROM kasa_hareketleri WHERE durum='aktif'");
        $rowGlobal = $stmtGlobal->fetch(PDO::FETCH_ASSOC);
        $totalVault = $rowGlobal['bakiye'] ?? 0;

        $sqlExp = "SELECT SUM(tutar) as gider FROM kasa_hareketleri WHERE turu='gider' AND durum='aktif'";
        $expParams = [];
        if ($filter === 'month') {
            $sqlExp .= " AND YEAR(tarih) = YEAR(CURDATE()) AND MONTH(tarih) = MONTH(CURDATE())";
        } elseif ($filter === 'custom' && !empty($_GET['start_date']) && !empty($_GET['end_date'])) {
            $sqlExp .= " AND DATE(tarih) BETWEEN ? AND ?";
            $expParams[] = $_GET['start_date'];
            $expParams[] = $_GET['end_date'];
        } else {
            // Default to month if no custom or filter specified specifically for the "monthly" cards
            $sqlExp .= " AND YEAR(tarih) = YEAR(CURDATE()) AND MONTH(tarih) = MONTH(CURDATE())";
        }
        $stmtExp = $db->prepare($sqlExp);
        $stmtExp->execute($expParams);
        $rowExp = $stmtExp->fetch(PDO::FETCH_ASSOC);
        $monthlyExpense = $rowExp['gider'] ?? 0;

        $sqlTurnover = "SELECT SUM(toplam_tutar) as ciro FROM teklifler WHERE durum='satis'";
        $turnParams = [];
        if ($filter === 'month') {
            $sqlTurnover .= " AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())";
        } elseif ($filter === 'custom' && !empty($_GET['start_date']) && !empty($_GET['end_date'])) {
            $sqlTurnover .= " AND DATE(created_at) BETWEEN ? AND ?";
            $turnParams[] = $_GET['start_date'];
            $turnParams[] = $_GET['end_date'];
        } else {
            $sqlTurnover .= " AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())";
        }
        $stmtTurnover = $db->prepare($sqlTurnover);
        $stmtTurnover->execute($turnParams);
        $rowTurnover = $stmtTurnover->fetch(PDO::FETCH_ASSOC);
        $monthlyTurnover = $rowTurnover['ciro'] ?? 0;

        $stmtAllDebt = $db->query("SELECT SUM(toplam_tutar) as borc FROM teklifler WHERE durum='satis'");
        $totalDebt = $stmtAllDebt->fetch(PDO::FETCH_ASSOC)['borc'] ?? 0;

        $stmtAllReturn = $db->query("SELECT SUM(toplam_tutar) as iade FROM teklifler WHERE durum='iade'");
        $totalReturn = $stmtAllReturn->fetch(PDO::FETCH_ASSOC)['iade'] ?? 0;

        $stmtAllPay = $db->query("SELECT SUM(tutar) as tahsilat FROM kasa_hareketleri WHERE turu='gelir' AND durum='aktif'");
        $totalPay = $stmtAllPay->fetch(PDO::FETCH_ASSOC)['tahsilat'] ?? 0;

        $receivables = ($totalDebt - $totalReturn) - $totalPay;

        $customerNames = [];
        $stmtCust = $db->query("SELECT id, ad_soyad, telefon FROM cariler");
        while ($c = $stmtCust->fetch(PDO::FETCH_ASSOC)) {
            $customerNames[$c['id']] = $c;
        }

        foreach ($transactions as $t) {
            $formattedList[] = [
                'id' => $t['id'],
                'date' => $t['tarih'],
                'type' => $t['turu'],
                'category' => $t['kategori'],
                'odeme_tipi' => $t['odeme_tipi'],
                'hesap_kodu' => $t['hesap_kodu'],
                'kasa_id' => $t['kasa_id'],
                'status' => $t['durum'],
                'amount' => floatval($t['tutar']),
                'description' => $t['aciklama'],
                'user' => $t['kullanici'],
                'cari_id' => $t['cari_id'],
                'cari_name' => $customerNames[$t['cari_id']]['ad_soyad'] ?? '',
                'satis_id' => $t['satis_id'],
                'banka_bilgisi' => $t['banka_bilgisi'] ?? '',
                'seri_no' => $t['seri_no'] ?? '',
                'vade_tarihi' => $t['vade_tarihi'] ?? '',
                'asil_borclu' => $t['asil_borclu'] ?? '',
                'alt_kategori' => $t['alt_kategori'] ?? ''
            ];
        }

        $pendingTotal = 0;
        $todayCollect = 0;
        $pendingList = [];

        $stmtSales = $db->query("SELECT id, musteri_id, taksit_plani FROM teklifler WHERE taksit_plani IS NOT NULL AND durum = 'satis'");
        $sales = $stmtSales->fetchAll(PDO::FETCH_ASSOC);

        foreach ($sales as $sale) {
            $plan = json_decode($sale['taksit_plani'], true);
            if (is_array($plan)) {
                foreach ($plan as $inst) {
                    if (isset($inst['odendi']) && !$inst['odendi']) {
                        $amount = floatval($inst['tutar']);
                        $date = $inst['tarih'];
                        $pendingTotal += $amount;
                        if (date('Y-m-d', strtotime($date)) === date('Y-m-d'))
                            $todayCollect += $amount;
                        $pendingList[] = [
                            'date' => $date,
                            'customer_id' => $sale['musteri_id'],
                            'contract_id' => $sale['id'],
                            'customer_name' => $customerNames[$sale['musteri_id']]['ad_soyad'] ?? 'Bilinmeyen Müşteri',
                            'phone' => $customerNames[$sale['musteri_id']]['telefon'] ?? '',
                            'amount' => $amount,
                            'no' => $inst['taksit_no'] ?? 1
                        ];
                    }
                }
            }
        }

        usort($pendingList, function ($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });

        echo json_encode([
            "status" => "success",
            "stats" => [
                "vault" => floatval($totalVault),
                "monthly_expense" => floatval($monthlyExpense),
                "pending_collect" => floatval($pendingTotal),
                "today_collect" => floatval($todayCollect),
                "monthly_turnover" => floatval($monthlyTurnover),
                "total_receivables" => floatval($receivables),
                "pending_list" => array_slice($pendingList, 0, 50)
            ],
            "pagination" => [
                "total_records" => (int) $totalRecords,
                "total_pages" => $limit !== -1 ? ceil($totalRecords / $limit) : 1,
                "current_page" => $page,
                "limit" => $limit
            ],
            "list" => $formattedList
        ]);

    } elseif ($action === 'get_payments_summary') {
        // --- 1. Tablo Kurulumları ---
        $db->exec("CREATE TABLE IF NOT EXISTS planli_odemeler (
            id INT AUTO_INCREMENT PRIMARY KEY,
            isim VARCHAR(100) NOT NULL,
            kategori VARCHAR(50) DEFAULT 'Diger',
            tutar DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            durum VARCHAR(20) DEFAULT 'aktif', 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $db->exec("CREATE TABLE IF NOT EXISTS odeme_tahakkuklari (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tur ENUM('personel', 'sabit_gider') NOT NULL,
            ilgili_id INT NOT NULL,
            isim VARCHAR(100) NOT NULL,
            donem VARCHAR(7) NOT NULL, /* YYYY-MM */
            tutar DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            odenen_tutar DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            durum ENUM('bekliyor', 'odendi', 'kismi_odendi', 'iptal') DEFAULT 'bekliyor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unq_donem_odeme (tur, ilgili_id, donem)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $currentDonem = date('Y-m');

        // --- 2. Aylık Personel Maaş Tahakkuku (Otomatik) ---
        // Sadece durumu aktif olan ve maaşı tanımlı olanları ekler, o ay için varsa atlar (INSERT IGNORE)
        $db->exec("INSERT IGNORE INTO odeme_tahakkuklari (tur, ilgili_id, isim, donem, tutar)
                   SELECT 'personel', id, ad_soyad, '$currentDonem', maas 
                   FROM cariler 
                   WHERE tip = 'personel' AND durum = 'aktif' AND maas > 0");

        // --- 3. Aylık Sabit Gider Tahakkuku (Otomatik) ---
        $db->exec("INSERT IGNORE INTO odeme_tahakkuklari (tur, ilgili_id, isim, donem, tutar)
                   SELECT 'sabit_gider', id, isim, '$currentDonem', tutar 
                   FROM planli_odemeler 
                   WHERE durum = 'aktif' AND tutar > 0");

        // --- 4. Verileri Toplama ---

        // A. Bekleyen Sabit Giderler
        $stmtG = $db->query("SELECT id, isim, donem as tarih, tutar as toplam_tutar, (tutar - odenen_tutar) as bakiye, 'sabit_gider' as type 
                             FROM odeme_tahakkuklari 
                             WHERE tur = 'sabit_gider' AND durum IN ('bekliyor', 'kismi_odendi') ORDER BY donem DESC");
        $sabitGiderler = $stmtG->fetchAll(PDO::FETCH_ASSOC);

        // B. Bekleyen Personel Ödemeleri
        $stmtP = $db->query("SELECT id, ilgili_id as cari_id, isim, donem as tarih, tutar as toplam_tutar, (tutar - odenen_tutar) as bakiye, 'personel' as type 
                             FROM odeme_tahakkuklari 
                             WHERE tur = 'personel' AND durum IN ('bekliyor', 'kismi_odendi') ORDER BY donem DESC");
        $personelOdemeleri = $stmtP->fetchAll(PDO::FETCH_ASSOC);

        // C. Tedarikçi Borçları (Bakiye hesaplaması cariler üzerinden)
        // cariler tablosunda tip=tedarikci olanların satın almaları ve onlara yapılan ödemelerin (kasa_hareketleri) farkı
        $stmtT = $db->query("SELECT 
                                c.id as cari_id, 
                                c.ad_soyad as isim, 
                                (SELECT IFNULL(SUM(genel_toplam), 0) FROM satin_almalar WHERE tedarikci_id = c.id) as toplam_alis,
                                (SELECT IFNULL(SUM(tutar), 0) FROM kasa_hareketleri WHERE cari_id = c.id AND turu = 'gider') as toplam_odeme
                             FROM cariler c 
                             WHERE c.tip = 'tedarikci' AND c.durum = 'aktif'");
        $rawTedarikciler = $stmtT->fetchAll(PDO::FETCH_ASSOC);

        $tedarikciBorclari = [];
        foreach ($rawTedarikciler as $t) {
            $bakiye = floatval($t['toplam_alis']) - floatval($t['toplam_odeme']);
            if ($bakiye != 0) { // Sadece alacağı (bize borcu) veya borcumuz olanları listele (Genelde borç veririz ama iade durumu olabilir)
                $tedarikciBorclari[] = [
                    'cari_id' => $t['cari_id'],
                    'isim' => $t['isim'],
                    'bakiye' => $bakiye, // + bakiye = tedarikçiye borcumuz var, - bakiye = tedarikçi bize borçlu
                    'type' => 'tedarikci'
                ];
            }
        }

        echo json_encode([
            "status" => "success",
            "sabit_giderler" => $sabitGiderler,
            "personel_odemeleri" => $personelOdemeleri,
            "tedarikci_borclari" => $tedarikciBorclari
        ]);

    } elseif ($action === 'get_customer_contracts') {
        $customerId = intval($_GET['id']);
        if (!$customerId) {
            echo json_encode(["status" => "error", "message" => "Gecersiz musteri"]);
            exit;
        }
        $stmt = $db->prepare("SELECT id, 'Sipariş' as urunler, genel_toplam as toplam_tutar, ifnull(odeme_tarihi, created_at) as tarih FROM teklifler WHERE musteri_id = ? AND durum = 'satis' ORDER BY id DESC");
        $stmt->execute([$customerId]);
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $list = [];
        foreach ($sales as $s) {
            $list[] = ['id' => $s['id'], 'summary' => $s['id'] . " Nolu Sipariş", 'total' => floatval($s['toplam_tutar']), 'date' => $s['tarih']];
        }
        echo json_encode(["status" => "success", "contracts" => $list]);

    } elseif ($action === 'get_aging_report') {
        $stmtSales = $db->query("SELECT id, musteri_id, taksit_plani FROM teklifler WHERE taksit_plani IS NOT NULL AND durum = 'satis'");
        $sales = $stmtSales->fetchAll(PDO::FETCH_ASSOC);
        $customerNames = [];
        $stmtCust = $db->query("SELECT id, ad_soyad FROM cariler");
        while ($c = $stmtCust->fetch(PDO::FETCH_ASSOC)) {
            $customerNames[$c['id']] = $c['ad_soyad'];
        }
        $summary = ['range_0_30' => 0, 'range_31_60' => 0, 'range_61_90' => 0, 'range_90_plus' => 0];
        $details = [];
        foreach ($sales as $sale) {
            $plan = json_decode($sale['taksit_plani'], true);
            if (!is_array($plan))
                continue;
            foreach ($plan as $inst) {
                if (isset($inst['odendi']) && !$inst['odendi']) {
                    $diffDays = floor((time() - strtotime($inst['tarih'])) / 86400);
                    if ($diffDays > 0) {
                        $amt = floatval($inst['tutar']);
                        if ($diffDays <= 30)
                            $summary['range_0_30'] += $amt;
                        elseif ($diffDays <= 60)
                            $summary['range_31_60'] += $amt;
                        elseif ($diffDays <= 90)
                            $summary['range_61_90'] += $amt;
                        else
                            $summary['range_90_plus'] += $amt;
                    }
                }
            }
        }
        echo json_encode(["status" => "success", "summary" => $summary]);

    } elseif ($action === 'save_transaction') {
        $type = $data['type'] === 'in' ? 'gelir' : 'gider';
        if (isset($data['islem_tipi'])) {
            $type = $data['islem_tipi'] === 'gelir' ? 'gelir' : 'gider';
        }

        $cat = $data['category'] ?? $data['kategori'] ?? 'Diğer';
        $amt = floatval($data['amount'] ?? $data['tutar'] ?? 0);
        $desc = $data['description'] ?? $data['aciklama'] ?? '';
        $date = $data['date'] ?? $data['tarih'] ?? date('Y-m-d H:i:s');

        $cariId = $data['customerId'] ?? $data['cari_id'] ?? null;
        if (empty($cariId) && !empty($data['personelId']))
            $cariId = $data['personelId'];

        $satisId = $data['contractId'] ?? $data['satis_id'] ?? null;
        $hesapKodu = $data['hesap_kodu'] ?? null;
        $kasaId = $data['kasaId'] ?? $data['kasa_id'] ?? 1;
        $odemeTipi = $data['paymentMethod'] ?? $data['odeme_tipi'] ?? 'nakit';
        $tahakkukId = $data['plannedPaymentId'] ?? $data['tahakkuk_id'] ?? null;

        $user = $_SESSION['full_name'] ?? $_SESSION['user_name'] ?? 'Admin';

        $belgeNo = $data['docNo'] ?? $data['belge_no'] ?? null;
        $kdvOrani = isset($data['taxRate']) ? intval($data['taxRate']) : (isset($data['kdv_orani']) ? intval($data['kdv_orani']) : 0);
        $netTutar = isset($data['netAmount']) ? floatval($data['netAmount']) : (isset($data['net_tutar']) ? floatval($data['net_tutar']) : 0);
        $vergiTutar = isset($data['taxAmount']) ? floatval($data['taxAmount']) : (isset($data['vergi_tutar']) ? floatval($data['vergi_tutar']) : 0);

        if (empty($hesapKodu)) {
            if ($cat === 'Tahsilat') {
                if ($odemeTipi === 'kart')
                    $hesapKodu = '108';
                elseif ($odemeTipi === 'havale')
                    $hesapKodu = '102';
                elseif ($odemeTipi === 'cek')
                    $hesapKodu = '101';
                elseif ($odemeTipi === 'nakit')
                    $hesapKodu = '100';
            } else {
                // Fallback TDHP mapping on backend if needed
                $tdhp_map = [
                    'Tahsilat' => '120',
                    'Ek Gelir' => '602',
                    'Sermaye' => '500',
                    'Kredi' => '300',
                    'İade' => '610',
                    'Demirbaş' => '255',
                    'Fatura' => '770',
                    'Kira' => '770',
                    'Maaş' => '335',
                    'Tedarikçi' => '320',
                    'Yemek' => '770',
                    'Akaryakıt' => '760',
                    'Vergi' => '360',
                    'SGK' => '361',
                    'Kargo' => '760',
                    'Reklam' => '760',
                    'Bakım/Onarım' => '770',
                    'Diğer' => '770'
                ];
                $hesapKodu = $tdhp_map[$cat] ?? null;
            }
        }

        $stmt = $db->prepare("INSERT INTO kasa_hareketleri (turu, kategori, alt_kategori, odeme_tipi, hesap_kodu, kasa_id, tutar, aciklama, kullanici, cari_id, satis_id, tarih, banka_bilgisi, seri_no, vade_tarihi, asil_borclu, durum, belge_no, kdv_orani, net_tutar, vergi_tutar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?, ?, ?)");
        $stmt->execute([$type, $cat, $data['alt_kategori'] ?? null, $odemeTipi, $hesapKodu, $kasaId, $amt, $desc, $user, $cariId, $satisId, $date, $data['banka_bilgisi'] ?? '', $data['seri_no'] ?? '', $data['vade_tarihi'] ?? null, $data['asil_borclu'] ?? '', $belgeNo, $kdvOrani, $netTutar, $vergiTutar]);
        $lastId = $db->lastInsertId();

        if ($type === 'gelir' && $satisId) {
            $stmtSale = $db->prepare("SELECT taksit_plani FROM teklifler WHERE id = ?");
            $stmtSale->execute([$satisId]);
            $sale = $stmtSale->fetch(PDO::FETCH_ASSOC);
            if ($sale && !empty($sale['taksit_plani'])) {
                $plan = json_decode($sale['taksit_plani'], true);
                if (is_array($plan)) {
                    $remainingAmt = $amt;
                    $updated = false;
                    foreach ($plan as &$inst) {
                        if ($remainingAmt <= 0)
                            break;
                        if (!isset($inst['odendi']) || !$inst['odendi']) {
                            $instAmt = floatval($inst['tutar']);
                            $inst['odendi'] = true;
                            $inst['odeme_tarihi'] = date('Y-m-d H:i:s');
                            $remainingAmt -= $instAmt;
                            $updated = true;
                        }
                    }
                    if ($updated) {
                        $db->prepare("UPDATE teklifler SET taksit_plani = ?, alinan_tutar = alinan_tutar + ?, bakiye = bakiye - ? WHERE id = ?")
                            ->execute([json_encode($plan, JSON_UNESCAPED_UNICODE), $amt, $amt, $satisId]);
                    }
                }
            }
        }

        // EĞER BU ÖDEME BİR KİRA VEYA MAAŞ TAHAKKUKU İÇİN YAPILDIYSA BAKİYEYİ DÜŞ
        if ($tahakkukId && $type === 'gider') {
            $db->prepare("UPDATE odeme_tahakkuklari 
                          SET odenen_tutar = odenen_tutar + ?, 
                              durum = CASE 
                                        WHEN (tutar - (odenen_tutar + ?)) <= 0 THEN 'odendi' 
                                        ELSE 'kismi_odendi' 
                                      END
                          WHERE id = ?")
                ->execute([$amt, $amt, $tahakkukId]);
        }

        if ($cariId)
            updateCariBakiye($db, $cariId);
        echo json_encode(["status" => "success", "id" => $lastId]);

    } elseif ($action === 'void_transaction') {
        $id = intval($data['id']);
        $stmtC = $db->prepare("SELECT cari_id FROM kasa_hareketleri WHERE id = ?");
        $stmtC->execute([$id]);
        $cId = $stmtC->fetchColumn();
        $db->prepare("UPDATE kasa_hareketleri SET durum='iptal' WHERE id = ?")->execute([$id]);
        if ($cId)
            updateCariBakiye($db, $cId);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'get_vaults') {
        $stmt = $db->query("SELECT k.*, (SELECT SUM(CASE WHEN turu='gelir' THEN tutar ELSE -tutar END) FROM kasa_hareketleri WHERE kasa_id = k.id AND durum='aktif') as bakiye FROM kasalar k");
        echo json_encode(["status" => "success", "vaults" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'get_all_banks') {
        $stmt = $db->query("SELECT * FROM kasalar WHERE turu = 'banka'");
        echo json_encode(["status" => "success", "banks" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'get_orders') {
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $sql = "SELECT t.id, t.created_at as tarih, t.toplam_tutar, t.durum, c.ad_soyad as musteri_adi 
                FROM teklifler t 
                LEFT JOIN cariler c ON t.cari_id = c.id 
                WHERE t.durum = 'satis'";
        $params = [];
        if ($id) {
            $sql .= " AND (t.musteri_id = ? OR t.cari_id = ?)";
            $params[] = $id;
            $params[] = $id;
        }
        $sql .= " ORDER BY t.created_at DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'export_to_excel') {
        $filename = "Mazello_Muhasebe_Hareketi_" . date('Ymd_His') . ".xls";
        header("Content-Type: application/vnd.ms-excel; charset=utf-8");
        header("Content-Disposition: attachment; filename=\"$filename\"");

        $sql = "SELECT * FROM kasa_hareketleri WHERE durum='aktif' ORDER BY tarih DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>
        <body>
        <h1>MAZELLO FİNANSAL HAREKET DÖKÜMÜ</h1>
        <table border="1">
            <tr style="background:#0f172a; color:white;">
                <th>Tarih</th><th>Tür</th><th>Kategori</th><th>Ödeme</th><th>Hesap</th><th>Tutar</th><th>Açıklama</th><th>Kullanıcı</th>
            </tr>';
        foreach ($rows as $r) {
            echo "<tr>
                    <td>{$r['tarih']}</td>
                    <td>" . strtoupper($r['turu']) . "</td>
                    <td>{$r['kategori']}</td>
                    <td>{$r['odeme_tipi']}</td>
                    <td>{$r['hesap_kodu']}</td>
                    <td>{$r['tutar']}</td>
                    <td>{$r['aciklama']}</td>
                    <td>{$r['kullanici']}</td>
                  </tr>";
        }
        echo '</table></body></html>';
        exit;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>