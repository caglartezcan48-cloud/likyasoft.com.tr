<?php
// MAZELLO API - CEO DASHBOARD HANDLER
// v2.0 - Robust & Null-Safe

ini_set('display_errors', 0);
// DASHBOARD API
require_once 'auth_check.php'; // GÜVENLİK DUVARI
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';
// SELF-HEALING DB CHECK KALDIRILDI (Performans için update_db_schema.php dosyasına taşınacak)

$input = file_get_contents('php://input');
$data = json_decode($input, true);
$action = $_GET['action'] ?? ($data['action'] ?? '');

// FİLTRE PARAMETRELERİ
$startDate = $_GET['startDate'] ?? ($data['startDate'] ?? null);
$endDate = $_GET['endDate'] ?? ($data['endDate'] ?? null);
$plasiyerId = $_GET['plasiyerId'] ?? ($data['plasiyerId'] ?? null);
$category = $_GET['category'] ?? ($data['category'] ?? null);

// Tarih Filtresi Yardımcısı
if (!function_exists('getDateFilter')) {
    function getDateFilter($col = 'created_at', $start = null, $end = null)
    {
        if (!$start || !$end)
            return " 1=1 ";
        return " DATE($col) BETWEEN '$start' AND '$end' ";
    }
}

// Global Koşullar
$params = [];
$tWhere = getDateFilter('COALESCE(t.satis_tarihi, t.created_at)', $startDate, $endDate);
if ($plasiyerId) {
    $tWhere .= " AND t.plasiyer_id = :plasiyerId ";
    $params[':plasiyerId'] = $plasiyerId;
}

$catFilter = "";
if ($category) {
    $catFilter = " AND t.id IN (SELECT DISTINCT td.teklif_id FROM teklif_detaylari td JOIN urunler ur ON td.urun_id = ur.id WHERE ur.kategori = :category) ";
    $tWhere .= $catFilter;
    $params[':category'] = $category;
}

try {
    // 1. CEO İSTATİSTİKLERİ
    if ($action === 'get_ceo_stats') {
        $stats = [
            'vault_balance' => 0,
            'receivables' => 0,
            'monthly_turnover' => 0,
            'pending_orders' => 0,
            'stock_value' => 0
        ];

        try {
            // Kasa (Nakit + Banka - Giderler)
            $q1 = $db->query("SELECT SUM(CASE WHEN turu='gelir' THEN tutar ELSE -tutar END) as balance FROM kasa_hareketleri WHERE durum='aktif'");
            $r1 = $q1->fetch(PDO::FETCH_ASSOC);
            $stats['vault_balance'] = (float) ($r1['balance'] ?? 0);

            // Alacaklar
            $q2 = $db->query("SELECT SUM(bakiye) as pending FROM teklifler WHERE durum = 'satis'");
            $r2 = $q2->fetch(PDO::FETCH_ASSOC);
            $stats['receivables'] = (float) ($r2['pending'] ?? 0);

            // Aylık Ciro (COALESCE ile satis_tarihi veya created_at kullanımı)
            $q3 = $db->prepare("SELECT SUM(toplam_tutar) as turnover FROM teklifler t WHERE t.durum = 'satis' AND $tWhere");
            $q3->execute($params);
            $r3 = $q3->fetch(PDO::FETCH_ASSOC);
            $stats['monthly_turnover'] = (float) ($r3['turnover'] ?? 0);

            // Bekleyen Siparişler
            $q4 = $db->prepare("SELECT COUNT(*) as cnt FROM teklifler t WHERE t.durum = 'satis' AND t.teslimat_durumu != 'teslim_edildi' AND $tWhere");
            $q4->execute($params);
            $r4 = $q4->fetch(PDO::FETCH_ASSOC);
            $stats['pending_orders'] = (int) ($r4['cnt'] ?? 0);

            // Stok Değeri
            $q5 = $db->query("SELECT SUM(stok_miktari * alis_fiyati) as val FROM urunler");
            $r5 = $q5->fetch(PDO::FETCH_ASSOC);
            $stats['stock_value'] = (float) ($r5['val'] ?? 0);

        } catch (Exception $ex) {
        }

        echo json_encode(["status" => "success", "stats" => $stats]);

        // 2. PLASİYER PERFORMANSI (NEW)
    } elseif ($action === 'get_plasiyer_stats') {
        $thisMonth = date('Y-m-01');
        $sql = "SELECT 
                    COALESCE(u.ad_soyad, 'Sistem / Diğer') as plasiyer,
                    COUNT(t.id) as satis_adedi,
                    SUM(t.toplam_tutar) as toplam_ciro,
                    SUM(t.toplam_tutar - (SELECT SUM(d.miktar * ur.alis_fiyati) FROM teklif_detaylari d JOIN urunler ur ON d.urun_id = ur.id WHERE d.teklif_id = t.id)) as tahmini_kar
                FROM teklifler t
                LEFT JOIN cariler u ON t.plasiyer_id = u.id AND u.tip = 'personel'
                WHERE t.durum = 'satis' AND COALESCE(NULLIF(t.satis_tarihi, ''), t.created_at) >= '$thisMonth'
                GROUP BY t.plasiyer_id
                ORDER BY toplam_ciro DESC";
        $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $data]);

    } elseif ($action === 'get_most_profitable_orders') {
        // EN KARLI SİPARİŞLER (MARJ BAZLI)
        $sql = "SELECT 
                    t.id, 
                    t.teklif_no, 
                    c.ad_soyad as musteri,
                    t.toplam_tutar as ciro,
                    (t.toplam_tutar - (SELECT SUM(td.miktar * ur.alis_fiyati) FROM teklif_detaylari td JOIN urunler ur ON td.urun_id = ur.id WHERE td.teklif_id = t.id)) as kar,
                    t.created_at as tarih
                FROM teklifler t
                JOIN cariler c ON t.musteri_id = c.id
                WHERE t.durum = 'satis' AND $tWhere
                ORDER BY kar DESC
                LIMIT 10";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Marjı PHP tarafında hesaplayalım
        foreach ($data as &$row) {
            $row['margin'] = $row['ciro'] > 0 ? round(($row['kar'] / $row['ciro']) * 100, 1) : 0;
        }
        echo json_encode(["status" => "success", "data" => $data]);

        // 3. FİNANSAL KIRILIM (Kasa/Banka/POS) (NEW)
    } elseif ($action === 'get_financial_breakdown') {
        // Alt Kategoriye göre grupla (Nakit, Havale, Garanti POS vb.)
        $sql = "SELECT 
                    alt_kategori as tur,
                    SUM(tutar) as toplam
                FROM kasa_hareketleri
                WHERE turu = 'gelir' AND durum = 'aktif'
                GROUP BY alt_kategori
                ORDER BY toplam DESC";
        $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $data]);

        // 4. BEKLEYEN ÖDEMELER (NEW)
    } elseif ($action === 'get_pending_payments') {
        // Taksit Planlarını Çözümle (JOIN ile optimize edildi)
        $sql = "SELECT t.taksit_plani, c.ad_soyad as musteri 
                FROM teklifler t 
                LEFT JOIN cariler c ON t.musteri_id = c.id
                WHERE t.durum='satis' AND t.bakiye > 0 AND t.taksit_plani IS NOT NULL";
        $sales = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

        $pending = [];
        $today = date('Y-m-d');

        foreach ($sales as $sale) {
            $plans = json_decode($sale['taksit_plani'], true);
            if (is_array($plans)) {
                foreach ($plans as $p) {
                    // tarih veya denen_tarih kontrolü
                    $vade = $p['tarih'] ?? ($p['denen_tarih'] ?? null);
                    // $today filtresini kaldırdık ki vadesi geçmiş ama ödenmemişler de görünsün
                    if ($vade && (isset($p['odendi']) && !$p['odendi'] || empty($p['odendi']))) {
                        $pending[] = [
                            'tarih' => $vade,
                            'musteri' => $sale['musteri'],
                            'tutar' => (float) $p['tutar'],
                            'aciklama' => $p['aciklama'] ?? 'Taksit'
                        ];
                    }
                }
            }
        }

        // Tarihe göre sırala
        usort($pending, function ($a, $b) {
            return strtotime($a['tarih']) - strtotime($b['tarih']);
        });

        // İlk 20 kaydı döndür
        echo json_encode(["status" => "success", "data" => array_slice($pending, 0, 20)]);

    } elseif ($action === 'get_top_selling_products') {
        // Çok Satanlar (Top 5)
        $sql = "SELECT u.urun_adi, SUM(d.miktar) as total_qty, SUM(d.satir_toplam) as total_revenue
                FROM teklif_detaylari d
                JOIN urunler u ON d.urun_id = u.id
                JOIN teklifler t ON d.teklif_id = t.id
                WHERE t.durum = 'satis' AND $tWhere
                GROUP BY u.id
                ORDER BY total_qty DESC
                LIMIT 5";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $data]);

    } elseif ($action === 'get_boss_alerts') {
        $alerts = [
            'overdue_deliveries' => [],
            'hot_money' => ['today' => 0, 'overdue' => 0, 'count' => 0],
            'plasiyer_performance' => [],
            'critical_stock' => []
        ];

        // 1. Geciken Teslimatlar
        $sqlOverdue = "SELECT t.teklif_no, c.ad_soyad as musteri, t.teslimat_tarihi 
                       FROM teklifler t 
                       JOIN cariler c ON t.musteri_id = c.id 
                       WHERE t.durum = 'satis' AND t.teslimat_durumu != 'teslim_edildi' 
                       AND t.teslimat_tarihi IS NOT NULL AND t.teslimat_tarihi != '' AND t.teslimat_tarihi < CURDATE()
                       ORDER BY t.teslimat_tarihi ASC LIMIT 10";
        $alerts['overdue_deliveries'] = $db->query($sqlOverdue)->fetchAll(PDO::FETCH_ASSOC);

        // 2. Sıcak Para (Bugün + Geciken Taksitler)
        $sqlPlans = "SELECT taksit_plani FROM teklifler WHERE durum='satis' AND bakiye > 0 AND taksit_plani IS NOT NULL";
        $sales = $db->query($sqlPlans)->fetchAll(PDO::FETCH_ASSOC);
        $today = date('Y-m-d');
        foreach ($sales as $sale) {
            $plans = json_decode($sale['taksit_plani'], true);
            if (is_array($plans)) {
                foreach ($plans as $p) {
                    $vade = $p['tarih'] ?? ($p['denen_tarih'] ?? null);
                    if ($vade && empty($p['odendi'])) {
                        $vadeDate = date('Y-m-d', strtotime($vade));
                        if ($vadeDate == $today) {
                            $alerts['hot_money']['today'] += (float) $p['tutar'];
                            $alerts['hot_money']['count']++;
                        } elseif ($vadeDate < $today) {
                            $alerts['hot_money']['overdue'] += (float) $p['tutar'];
                            $alerts['hot_money']['count']++;
                        }
                    }
                }
            }
        }

        // 3. Plasiyer Performansı (Bu Ay)
        $thisMonth = date('Y-m-01');
        $sqlPlas = "SELECT 
                        COALESCE(u.ad_soyad, 'Sistem / Diğer') as plasiyer,
                        SUM(t.toplam_tutar) as ciro
                    FROM teklifler t
                    LEFT JOIN cariler u ON t.plasiyer_id = u.id AND u.tip = 'personel'
                    WHERE t.durum = 'satis' AND COALESCE(NULLIF(t.satis_tarihi, ''), t.created_at) >= '$thisMonth'
                    GROUP BY t.plasiyer_id
                    ORDER BY ciro DESC";
        $alerts['plasiyer_performance'] = $db->query($sqlPlas)->fetchAll(PDO::FETCH_ASSOC);

        // 4. Kritik Stok
        $sqlStock = "SELECT urun_adi, stok_miktari FROM urunler WHERE stok_miktari <= 10 ORDER BY stok_miktari ASC LIMIT 5";
        $alerts['critical_stock'] = $db->query($sqlStock)->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $alerts]);

    } elseif ($action === 'get_monthly_sales_chart') {
        // Grafikler için COALESCE ile tarih kontrolü (Dinamik Filtreli)
        // $tWhere değişkeni yukarıda zaten tanımlı (tarih, plasiyer, kategori içeriyor)
        // DİKKAT: Kategori filtresi varsa, sadece o kategorideki ürünlerin cirosunu toplamalıyız.
        // Ayrıca JOIN kullanıldığı için t.toplam_tutar tekrar eder, bu yüzden td.satir_toplam kullanılmalı.

        $sql = "SELECT DATE(COALESCE(NULLIF(t.satis_tarihi, ''), t.created_at)) as date, SUM(td.satir_toplam) as total 
                FROM teklifler t
                JOIN teklif_detaylari td ON t.id = td.teklif_id
                JOIN urunler ur ON td.urun_id = ur.id
                WHERE t.durum = 'satis' AND $tWhere 
                GROUP BY date
                ORDER BY date ASC";

        // Eğer kategori filtresi yoksa JOIN'lere gerek yok, performans için ayıralım ve DOĞRU TOPLAM için
        if (!$category) {
            $sql = "SELECT DATE(COALESCE(NULLIF(t.satis_tarihi, ''), t.created_at)) as date, SUM(t.toplam_tutar) as total 
                    FROM teklifler t
                    WHERE t.durum = 'satis' AND $tWhere 
                    GROUP BY date
                    ORDER BY date ASC";
        }
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } elseif ($action === 'get_cash_flow_chart') {
        // Cash Flow Trend (Income vs Expense)
        $kWhere = getDateFilter('tarih', $startDate, $endDate);
        if ($plasiyerId) {
            // Plasiyer filtresi kasa hareketlerinde yoksa (normalde yok), genel duruma bakalım veya cari_id üzerinden personeli bulalım.
            // Ama şimdilik plasiyer filtresini kasa hareketleri için yok sayabiliriz veya kısıtlayabiliriz.
        }
        $sql = "SELECT DATE(tarih) as date, 
                       SUM(CASE WHEN turu='gelir' THEN tutar ELSE 0 END) as income,
                       SUM(CASE WHEN turu='gider' THEN tutar ELSE 0 END) as expense
                FROM kasa_hareketleri 
                WHERE durum='aktif' AND $kWhere 
                GROUP BY date
                ORDER BY date ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $data]);

    } elseif ($action === 'get_critical_stock') {
        $sql = "SELECT urun_adi, stok_miktari FROM urunler WHERE stok_miktari <= 10 ORDER BY stok_miktari ASC LIMIT 5";
        $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $data]);

    } elseif ($action === 'get_recent_activities') {
        // JOIN ile müşteri isimlerini alarak Son Hareketler (Eksik tablo referansı düzeltildi)
        $sql = "
        (SELECT 'satis' as type, t.created_at as tarih, c.ad_soyad as baslik, 'Sipariş' as aciklama, t.toplam_tutar as tutar 
         FROM teklifler t 
         LEFT JOIN cariler c ON t.musteri_id = c.id
         WHERE t.durum = 'satis' AND $tWhere 
         ORDER BY t.created_at DESC LIMIT 50)
        UNION ALL
        (SELECT 'kasa' as type, tarih, aciklama as baslik, turu as aciklama, tutar 
         FROM kasa_hareketleri WHERE durum='aktif' AND $tWhere ORDER BY tarih DESC LIMIT 50)
        ORDER BY tarih DESC LIMIT 50";

        // Yalnızca UNION kullanıldığı için aynı değişkenleri ikiye katlıyoruz
        $unionParams = array_merge($params, $params);
        $stmt = $db->prepare($sql);
        $stmt->execute($unionParams);
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $activities]);

        // 6. BANKA & POS DURUMU (NEW REQUEST)
    } elseif ($action === 'get_bank_status') {
        // A. Banka Bakiyeleri (Giren - Çıkan)
        // Banka bilgisi boş olmayanları getir
        $sqlBanks = "SELECT 
                        banka_bilgisi as banka, 
                        SUM(CASE WHEN turu='gelir' THEN tutar ELSE -tutar END) as bakiye
                     FROM kasa_hareketleri 
                     WHERE durum='aktif' AND banka_bilgisi IS NOT NULL AND banka_bilgisi != ''
                     GROUP BY banka_bilgisi 
                     ORDER BY bakiye DESC";
        $banks = $db->query($sqlBanks)->fetchAll(PDO::FETCH_ASSOC);

        // B. Toplam Kredi Kartı Cirosu (Sadece Gelir)
        $sqlPOS = "SELECT SUM(tutar) as total_pos 
                   FROM kasa_hareketleri 
                   WHERE durum='aktif' AND odeme_tipi='kart' AND turu='gelir'";
        $totalPOS = $db->query($sqlPOS)->fetch(PDO::FETCH_ASSOC)['total_pos'] ?? 0;

        echo json_encode([
            "status" => "success",
            "banks" => $banks,
            "total_pos" => (float) $totalPOS
        ]);

    } elseif ($action === 'get_daily_pulse') {
        // 7. GÜNÜN NABZI (DAILY PULSE)
        $today = date('Y-m-d');
        $yesterday = date('Y-m-d', strtotime('-1 day'));

        // CİRO (Bugün vs Dün) - COALESCE ile tarih güvenliği
        $sqlSalesT = "SELECT SUM(toplam_tutar) FROM teklifler WHERE durum='satis' AND DATE(COALESCE(satis_tarihi, created_at)) = '$today'";
        $salesToday = $db->query($sqlSalesT)->fetchColumn() ?: 0;

        $sqlSalesY = "SELECT SUM(toplam_tutar) FROM teklifler WHERE durum='satis' AND DATE(COALESCE(satis_tarihi, created_at)) = '$yesterday'";
        $salesYesterday = $db->query($sqlSalesY)->fetchColumn() ?: 0;

        // TAHSİLAT (Bugün vs Dün)
        $sqlColT = "SELECT SUM(tutar) FROM kasa_hareketleri WHERE turu='gelir' AND durum='aktif' AND DATE(tarih) = '$today'";
        $colToday = $db->query($sqlColT)->fetchColumn() ?: 0;

        $sqlColY = "SELECT SUM(tutar) FROM kasa_hareketleri WHERE turu='gelir' AND durum='aktif' AND DATE(tarih) = '$yesterday'";
        $colYesterday = $db->query($sqlColY)->fetchColumn() ?: 0;

        echo json_encode([
            "status" => "success",
            "sales" => ["today" => (float) $salesToday, "yesterday" => (float) $salesYesterday],
            "collection" => ["today" => (float) $colToday, "yesterday" => (float) $colYesterday]
        ]);

    } elseif ($action === 'get_neural_insights') {
        // MAZELLO NEURAL CENTER v4.0 (CFO MODE)

        // 1. PROFIT GUARD (Kârlılık Bekçisi) - Bugünün Satışları
        $profitStats = ['revenue' => 0, 'cost' => 0, 'profit' => 0, 'margin' => 0, 'status' => 'neutral'];
        try {
            $today = date('Y-m-d');
            $sqlProfit = "
                SELECT 
                    SUM(d.satir_toplam) as revenue,
                    SUM(d.miktar * u.alis_fiyati) as cost
                FROM teklif_detaylari d
                JOIN teklifler t ON d.teklif_id = t.id
                JOIN urunler u ON d.urun_id = u.id
                WHERE t.durum = 'satis' AND DATE(COALESCE(NULLIF(t.satis_tarihi, ''), t.created_at)) = '$today'
            ";
            $row = $db->query($sqlProfit)->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $rev = (float) $row['revenue'];
                $cost = (float) $row['cost'];
                $profit = $rev - $cost;
                $margin = $rev > 0 ? ($profit / $rev) * 100 : 0;

                $profitStats['revenue'] = $rev;
                $profitStats['cost'] = $cost;
                $profitStats['profit'] = $profit;
                $profitStats['margin'] = round($margin, 1);

                if ($rev > 0) {
                    if ($margin < 15)
                        $profitStats['status'] = 'danger';
                    elseif ($margin < 25)
                        $profitStats['status'] = 'warning';
                    else
                        $profitStats['status'] = 'success';
                }
            }
        } catch (Exception $e) {
        }

        // 2. CASH RADAR (Nakit Radarı) - Önümüzdeki 7 Gün
        $cashRadar = ['in' => 0, 'out' => 0, 'net' => 0, 'alerts' => []];
        $start = date('Y-m-d');
        $end = date('Y-m-d', strtotime('+7 days'));

        try {
            // A. GİRECEKLER (Tahsilat Bekleyenler)
            // 1. Çek/Senet Gelirleri
            $sqlInChecks = "SELECT SUM(tutar) FROM kasa_hareketleri WHERE turu='gelir' AND durum='aktif' AND odeme_tipi IN ('cek', 'senet') AND vade_tarihi BETWEEN '$start' AND '$end'";
            $valInChecks = $db->query($sqlInChecks)->fetchColumn();
            $cashRadar['in'] += (float) $valInChecks;

            // 2. Satış Taksitleri
            $stmtSales = $db->query("SELECT taksit_plani FROM teklifler WHERE durum='satis' AND taksit_plani IS NOT NULL");
            while ($row = $stmtSales->fetch(PDO::FETCH_ASSOC)) {
                $plans = json_decode($row['taksit_plani'], true);
                if (is_array($plans)) {
                    foreach ($plans as $p) {
                        // Ödenmemiş taksitleri bul
                        if (empty($p['odendi'])) {
                            $vade = $p['tarih'] ?? ($p['denen_tarih'] ?? null);
                            if ($vade) {
                                $d = date('Y-m-d', strtotime($vade));
                                if ($d >= $start && $d <= $end) {
                                    $cashRadar['in'] += (float) $p['tutar'];
                                }
                            }
                        }
                    }
                }
            }

            // B. ÇIKACAKLAR (Ödemeler)
            // 1. Çek/Senet Giderleri
            $sqlOutChecks = "SELECT SUM(tutar) FROM kasa_hareketleri WHERE turu='gider' AND durum='aktif' AND odeme_tipi IN ('cek', 'senet') AND vade_tarihi BETWEEN '$start' AND '$end'";
            $valOutChecks = $db->query($sqlOutChecks)->fetchColumn();
            $cashRadar['out'] += (float) $valOutChecks;

            $cashRadar['net'] = $cashRadar['in'] - $cashRadar['out'];
        } catch (Exception $e) {
            $cashRadar['alerts'][] = "Radar Error: " . $e->getMessage();
        }

        // 3. INVENTORY HEALTH (Stok Sağlığı)
        $inventory = ['opportunities' => [], 'traps' => []];
        try {
            // A. Fırsatlar: Çok Satan (Son 30 gün) ama Stoğu Az (< 15 gün)
            // Önce satış hızlarını bul
            $sqlSales = "
                SELECT u.id, u.urun_adi, u.stok_miktari, SUM(d.miktar) as monthly_sales
                FROM teklif_detaylari d
                JOIN teklifler t ON d.teklif_id = t.id
                JOIN urunler u ON d.urun_id = u.id
                WHERE t.durum = 'satis' 
                AND (t.satis_tarihi >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) OR t.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY))
                GROUP BY u.id
                HAVING monthly_sales > 0
            ";
            $rows = $db->query($sqlSales)->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $r) {
                $daily = $r['monthly_sales'] / 30;
                $daysLeft = $daily > 0 ? ($r['stok_miktari'] / $daily) : 999;

                if ($daysLeft < 15) {
                    $inventory['opportunities'][] = [
                        'name' => $r['urun_adi'],
                        'days' => ceil($daysLeft),
                        'daily_sales' => number_format($daily, 1)
                    ];
                }
            }
            // Sort by lowest days
            usort($inventory['opportunities'], function ($a, $b) {
                return $a['days'] - $b['days'];
            });
            $inventory['opportunities'] = array_slice($inventory['opportunities'], 0, 3);

            // B. Tuzaklar: Stokta çok var (> 10.000 TL) ama 90 gündür satmıyor
            $sqlTraps = "
                SELECT u.urun_adi, (u.stok_miktari * u.alis_fiyati) as total_val
                FROM urunler u
                WHERE (u.stok_miktari * u.alis_fiyati) > 10000
                AND u.id NOT IN (
                    SELECT DISTINCT urun_id FROM stok_hareketleri WHERE tarih >= DATE_SUB(NOW(), INTERVAL 90 DAY)
                )
                ORDER BY total_val DESC
                LIMIT 3
            ";
            $inventory['traps'] = $db->query($sqlTraps)->fetchAll(PDO::FETCH_ASSOC);

        } catch (Exception $e) {
        }

        echo json_encode([
            "status" => "success",
            "profit" => $profitStats,
            "cash" => $cashRadar,
            "inventory" => $inventory
        ]);

    } elseif ($action === 'get_profitability') {
        // 8. BRÜT KÂRLILIK (Bu Ay)
        // Satış Fiyatı - (Şu anki) Alış Fiyatı
        // Not: Gerçek FIFO/LIFO maliyeti için stok hareketlerine bakmak lazım ama bu basit ERP'de anlık maliyet üzerinden gidiyoruz.

        $monthStart = date('Y-m-01');

        $sql = "SELECT 
                    SUM(d.satir_toplam) as total_revenue,
                    SUM(d.miktar * u.alis_fiyati) as total_cost
                FROM teklif_detaylari d
                JOIN teklifler t ON d.teklif_id = t.id
                JOIN urunler u ON d.urun_id = u.id
                WHERE t.durum = 'satis' AND $tWhere
        ";
        $stmtProf = $db->prepare($sql);
        $stmtProf->execute($params);
        $row = $stmtProf->fetch(PDO::FETCH_ASSOC);

        $rev = (float) ($row['total_revenue'] ?? 0);
        $cost = (float) ($row['total_cost'] ?? 0);
        $profit = $rev - $cost;
        $margin = $rev > 0 ? ($profit / $rev) * 100 : 0;

        echo json_encode([
            "status" => "success",
            "revenue" => $rev,
            "cost" => $cost,
            "profit" => $profit,
            "margin" => round($margin, 2)
        ]);

    } elseif ($action === 'get_cash_flow_forecast') {
        // 9. NAKİT AKIŞ TAHMİNİ (Gelecek 7 Gün)
        // Alacaklar (Satış Taksitleri) vs Borçlar (Alış Taksitleri)

        $start = date('Y-m-d');
        $end = date('Y-m-d', strtotime('+7 days'));

        // ALACAKLAR (Inflow)
        $sqlIn = "SELECT id, taksit_plani FROM teklifler WHERE durum='satis' AND bakiye > 0";
        $sales = $db->query($sqlIn)->fetchAll(PDO::FETCH_ASSOC);

        $inflow = 0;
        foreach ($sales as $s) {
            $plans = json_decode($s['taksit_plani'], true);
            if (is_array($plans)) {
                foreach ($plans as $p) {
                    if ($p['denen_tarih'] >= $start && $p['denen_tarih'] <= $end && ($p['durum'] ?? '') != 'odend') {
                        $inflow += (float) $p['tutar'];
                    }
                }
            }
        }

        // BORÇLAR (Outflow) -> Tedarikçi Bakiyeleri ve Alış Taksitleri
        // Basitlik için: Alış siparişlerinin taksitleri (varsa) veya manuel girilecek gider planı (yok).
        // Şu an sadece Alış Siparişi (durum='alis') taksitlerine bakalım.
        $sqlOut = "SELECT id, taksit_plani FROM teklifler WHERE durum='alis' AND bakiye > 0";
        $purchases = $db->query($sqlOut)->fetchAll(PDO::FETCH_ASSOC);

        $outflow = 0;
        foreach ($purchases as $pOrder) {
            $plans = json_decode($pOrder['taksit_plani'], true);
            if (is_array($plans)) {
                foreach ($plans as $p) {
                    if ($p['denen_tarih'] >= $start && $p['denen_tarih'] <= $end) {
                        $outflow += (float) $p['tutar'];
                    }
                }
            }
        }

        echo json_encode([
            "status" => "success",
            "inflow" => $inflow,
            "outflow" => $outflow,
            "net" => $inflow - $outflow
        ]);

    } elseif ($action === 'get_dead_stock') {
        // 10. HAREKETSİZ STOK (Dead Stock) - Son 90 gün
        // Hareketi olmayan ve Stoğu > 0 olan ürünler.
        // Hız için: Stok Hareketleri tablosunda son 90 günde kaydı OLMAYAN ürünler.

        $sql = "SELECT u.id, u.urun_adi, u.stok_miktari, u.alis_fiyati, (u.stok_miktari * u.alis_fiyati) as total_val
                FROM urunler u
                WHERE u.stok_miktari > 0
                AND u.id NOT IN (
                    SELECT DISTINCT urun_id FROM stok_hareketleri 
                    WHERE tarih >= DATE_SUB(NOW(), INTERVAL 90 DAY)
                )
                ORDER BY total_val DESC
                LIMIT 10";

        $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        $totalDeadValue = 0;
        // Eğer LIMIT olmasaydı hepsini toplardık, ama dashboard için sadece top 10 ve toplam değer tahmini yeterli mi?
        // Toplam değeri ayrı sorgulayalım.

        $sqlTotal = "SELECT SUM(stok_miktari * alis_fiyati) 
                     FROM urunler 
                     WHERE stok_miktari > 0 
                     AND id NOT IN (SELECT DISTINCT urun_id FROM stok_hareketleri WHERE tarih >= DATE_SUB(NOW(), INTERVAL 90 DAY))";
        $totalDeadValue = $db->query($sqlTotal)->fetchColumn() ?: 0;

        echo json_encode([
            "status" => "success",
            "top_items" => $data,
            "total_value" => (float) $totalDeadValue
        ]);

    } elseif ($action === 'get_executive_insights') {
        // MAZELLO EXECUTIVE INTELLIGENCE ENGINE v1.0

        // 1. TARGET TRACKING (Hedef Takibi)
        // Sabit bir aylık ciro hedefi koyalım (örn: 1M TL) - İleride ayarlardan çekilebilir
        $monthlyTarget = 1000000;
        $sqlActual = "SELECT SUM(toplam_tutar) FROM teklifler t WHERE durum='satis' AND $tWhere";
        $stmtAct = $db->prepare($sqlActual);
        $stmtAct->execute($params);
        $actualRevenue = $stmtAct->fetchColumn() ?: 0;

        $targetData = [
            "target" => $monthlyTarget,
            "actual" => (float) $actualRevenue,
            "percent" => $monthlyTarget > 0 ? round(($actualRevenue / $monthlyTarget) * 100, 1) : 0
        ];

        // 2. PARETO ANALYSIS (Müşteri 80/20 - Top VIP Customers)
        $sqlPareto = "SELECT 
                        c.ad_soyad as musteri,
                        SUM(t.toplam_tutar) as toplam_ciro,
                        c.bakiye as risk
                      FROM teklifler t
                      JOIN cariler c ON t.musteri_id = c.id
                      WHERE t.durum = 'satis' AND $tWhere
                      GROUP BY t.musteri_id
                      ORDER BY toplam_ciro DESC
                      LIMIT 10";
        $stmtPareto = $db->prepare($sqlPareto);
        $stmtPareto->execute($params);
        $paretoData = $stmtPareto->fetchAll(PDO::FETCH_ASSOC);

        // 3. CATEGORY DISTRIBUTION (Kategori Dağılımı)
        $sqlCat = "SELECT 
                    u.kategori,
                    SUM(td.satir_toplam) as ciro
                  FROM teklif_detaylari td
                  JOIN teklifler t ON td.teklif_id = t.id
                  JOIN urunler u ON td.urun_id = u.id
                  WHERE t.durum = 'satis' AND $tWhere
                  GROUP BY u.kategori
                  ORDER BY ciro DESC";
        $stmtCat = $db->prepare($sqlCat);
        $stmtCat->execute($params);
        $categoryData = $stmtCat->fetchAll(PDO::FETCH_ASSOC);

        // 4. BURN RATE & OPEX (Günlük Operasyonel Analiz)
        // Günlük ortalama ciro vs Günlük ortalama gider
        $daysRange = 30; // Son 30 gün üzerinden analiz
        $sqlExp = "SELECT SUM(tutar) FROM kasa_hareketleri WHERE turu='gider' AND durum='aktif' AND tarih >= DATE_SUB(NOW(), INTERVAL $daysRange DAY)";
        $totalExp = $db->query($sqlExp)->fetchColumn() ?: 0;

        $sqlRev30 = "SELECT SUM(toplam_tutar) FROM teklifler WHERE durum='satis' AND created_at >= DATE_SUB(NOW(), INTERVAL $daysRange DAY)";
        $totalRev30 = $db->query($sqlRev30)->fetchColumn() ?: 0;

        $dailyExp = $totalExp / $daysRange;
        $dailyRev = $totalRev30 / $daysRange;

        $burnData = [
            "daily_revenue" => round($dailyRev, 2),
            "daily_expense" => round($dailyExp, 2),
            "status" => ($dailyRev > $dailyExp) ? 'healthy' : 'risk'
        ];

        echo json_encode([
            "status" => "success",
            "targets" => $targetData,
            "pareto" => $paretoData,
            "categories" => $categoryData,
            "burn" => $burnData
        ]);

    } elseif ($action === 'get_filter_options') {
        // Personeller (Plasiyerler)
        $staff = $db->query("SELECT id, ad_soyad FROM kullanicilar WHERE aktif = 1")->fetchAll(PDO::FETCH_ASSOC);
        // Kategoriler
        $categories = $db->query("SELECT DISTINCT kategori FROM urunler WHERE kategori IS NOT NULL AND kategori != ''")->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode(["status" => "success", "staff" => $staff, "categories" => $categories]);

    } else {
        echo json_encode(["status" => "error", "message" => "Bilinmeyen işlem"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>