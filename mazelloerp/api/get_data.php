<?php
/**
 * MAZELLO ERP - GENEL VERİ ÇEKME APİ v11.0 (PERFORMANCE EDITION)
 * Optimized: Uses Aggregation JOINs instead of Subqueries.
 * Added: LIMIT 1000 for history.
 */
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
error_reporting(0);
ini_set('display_errors', 0);

require_once 'db.php';
require_once 'auth_check.php'; // GÜVENLİK DUVARI

try {
    $only_customers = isset($_GET['only_customers']) && $_GET['only_customers'] == 'true';

    // 1. İSTATİSTİKLER (Hızlı)
    $stats = [
        "total_sales" => 0,
        "collected" => 0,
        "waiting" => 0,
        "critical_stock" => 0,
        "monthly_turnover" => 0,
        "vault_balance" => 0,
        "receivables" => 0,
        "pending_orders" => 0,
        "stock_value" => 0
    ];

    $products = [];

    if (!$only_customers) {
        $thisMonth = date('Y-m-01');

        // Ciro (Genel) - İADELER DÜŞÜLDÜ
        $r1 = $db->query("SELECT SUM(toplam_tutar) as t FROM teklifler WHERE durum = 'satis'")->fetch(PDO::FETCH_ASSOC);
        $r1_refund = $db->query("SELECT SUM(toplam_tutar) as t FROM teklifler WHERE durum = 'iade'")->fetch(PDO::FETCH_ASSOC);
        $stats['total_sales'] = (float) ($r1['t'] ?? 0) - (float) ($r1_refund['t'] ?? 0);

        // Ciro (Bu Ay) - İADELER DÜŞÜLDÜ
        $stmt_r1m = $db->prepare("SELECT SUM(toplam_tutar) as t FROM teklifler WHERE durum = 'satis' AND COALESCE(NULLIF(satis_tarihi, ''), created_at) >= '$thisMonth'");
        $stmt_r1m->execute();
        $r1m = $stmt_r1m->fetch(PDO::FETCH_ASSOC);
        $stmt_r1m_refund = $db->prepare("SELECT SUM(toplam_tutar) as t FROM teklifler WHERE durum = 'iade' AND created_at >= '$thisMonth'");
        $stmt_r1m_refund->execute();
        $r1m_refund = $stmt_r1m_refund->fetch(PDO::FETCH_ASSOC);
        $stats['monthly_turnover'] = (float) ($r1m['t'] ?? 0) - (float) ($r1m_refund['t'] ?? 0);

        // Tahsilat (Genel)
        $r2 = $db->query("SELECT SUM(tutar) as t FROM kasa_hareketleri WHERE turu = 'gelir' AND durum='aktif'")->fetch(PDO::FETCH_ASSOC);
        $stats['collected'] = (float) ($r2['t'] ?? 0);

        // Kasa Bakiyesi (Nakit + Banka - Giderler)
        $rVault = $db->query("SELECT SUM(CASE WHEN turu='gelir' THEN tutar ELSE -tutar END) as balance FROM kasa_hareketleri WHERE durum='aktif'")->fetch(PDO::FETCH_ASSOC);
        $stats['vault_balance'] = (float) ($rVault['balance'] ?? 0);

        // Alacaklar (Müşteri Bakiyeleri Toplamı)
        $rRec = $db->query("SELECT SUM(bakiye) as pending FROM teklifler WHERE durum = 'satis' AND bakiye > 0")->fetch(PDO::FETCH_ASSOC);
        $stats['receivables'] = (float) ($rRec['pending'] ?? 0);

        // Bekleyen Siparişler
        $rPend = $db->query("SELECT COUNT(*) as cnt FROM teklifler WHERE durum = 'satis' AND teslimat_durumu != 'teslim_edildi'")->fetch(PDO::FETCH_ASSOC);
        $stats['pending_orders'] = (int) ($rPend['cnt'] ?? 0);

        // Bekleyen Bakiye (Legacy support)
        $stats['waiting'] = max(0, $stats['total_sales'] - $stats['collected']);

        // Kritik Stok Sayısı
        $r3 = $db->query("SELECT COUNT(*) as c FROM urunler WHERE stok_miktari <= min_stok")->fetch(PDO::FETCH_ASSOC);
        $stats['critical_stock'] = (int) ($r3['c'] ?? 0);

        // Stok Değeri
        $rStockVal = $db->query("SELECT SUM(stok_miktari * alis_fiyati) as val FROM urunler")->fetch(PDO::FETCH_ASSOC);
        $stats['stock_value'] = (float) ($rStockVal['val'] ?? 0);

        // 2. ÜRÜNLER (Full Liste)
        $products = $db->query("SELECT * FROM urunler ORDER BY urun_adi ASC")->fetchAll(PDO::FETCH_ASSOC);
    }

    // 3. CARİLER & BAKİYE HESABI (SAYFALAMALI)
    $cari_limit = isset($_GET['cari_limit']) ? (int) $_GET['cari_limit'] : 50;
    $cari_page = isset($_GET['cari_page']) ? (int) $_GET['cari_page'] : 1;
    $cari_offset = ($cari_page - 1) * $cari_limit;

    // Cari arama (Opsiyonel)
    $cari_search = isset($_GET['cari_search']) ? $_GET['cari_search'] : '';
    $search_condition = "";
    $search_params = [];
    if (!empty($cari_search)) {
        $search_condition = " WHERE (ad_soyad LIKE ? OR telefon LIKE ? OR cari_kodu LIKE ?)";
        $search_val = "%{$cari_search}%";
        $search_params = [$search_val, $search_val, $search_val];
    }

    // Total count for Cariler
    $stmtCariCount = $db->prepare("SELECT tip, COUNT(*) as cnt FROM cariler $search_condition GROUP BY tip");
    $stmtCariCount->execute($search_params);
    $cari_counts = ['musteri' => 0, 'tedarikci' => 0, 'personel' => 0];
    while ($row = $stmtCariCount->fetch(PDO::FETCH_ASSOC)) {
        $cari_counts[$row['tip']] = (int) $row['cnt'];
    }

    // Arama varsa sayfalama iptal edilebilir veya hepsinde uygulanabilir.
    // Şimdilik sadece Frontend'de CustomerView'da sayfalama için ayrı endpoint yapılana kadar uyumlu hale getirelim.
    // DİKKAT: Diğer modüller get_data'dan TÜM müşterileri bekliyor olabilir (select box'lar için).
    // Bu sebeple cari_limit=-1 gönderilirse hepsini çekecek şekilde yapalım.
    if ($cari_limit !== -1) {
        $stmtCari = $db->prepare("SELECT * FROM cariler $search_condition ORDER BY ad_soyad ASC LIMIT $cari_limit OFFSET $cari_offset");
    } else {
        $stmtCari = $db->prepare("SELECT * FROM cariler $search_condition ORDER BY ad_soyad ASC");
    }
    $stmtCari->execute($search_params);
    $all_cariler = $stmtCari->fetchAll(PDO::FETCH_ASSOC);

    $customers = array_values(array_filter($all_cariler, fn($c) => $c['tip'] === 'musteri'));
    $suppliers = array_values(array_filter($all_cariler, fn($c) => $c['tip'] === 'tedarikci'));
    $employees = array_values(array_filter($all_cariler, fn($c) => $c['tip'] === 'personel'));

    // 4. SAYFALAMA PARAMETRELERİ (Pagination Integration for Sales)
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 500;
    $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;

    $quotesCount = 0;
    $quotesList = [];
    $salesCount = 0;
    $salesList = [];
    $archivedCount = 0;
    $archivedList = [];
    $returnsCount = 0;
    $returnsList = [];
    $kasa_hareketleri = null;
    $kasa_pagination = null;

    if (!$only_customers) {
        // 4. TEKLİFLER (İADELER HARİÇ)
        $quotesCount = $db->query("SELECT COUNT(*) as c FROM teklifler WHERE durum NOT IN ('satis', 'iade')")->fetch(PDO::FETCH_ASSOC)['c'];
        $quotes = $db->prepare("
            SELECT t.*, IFNULL(c.ad_soyad, 'Misafir') as customer_name, c.telefon, c.adres
            FROM teklifler t 
            LEFT JOIN cariler c ON t.musteri_id = c.id 
            WHERE t.durum NOT IN ('satis', 'iade')
            ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset
        ");
        $quotes->bindValue(':limit', $limit, PDO::PARAM_INT);
        $quotes->bindValue(':offset', $offset, PDO::PARAM_INT);
        $quotes->execute();
        $quotesList = $quotes->fetchAll(PDO::FETCH_ASSOC);

        // 5. SATIŞLAR (Dinamik Limit & Offset)
        $salesCount = $db->query("SELECT COUNT(*) as c FROM teklifler WHERE durum = 'satis' AND teslimat_durumu != 'teslim_edildi'")->fetch(PDO::FETCH_ASSOC)['c'];
        $sales = $db->prepare("
            SELECT t.*, IFNULL(c.ad_soyad, 'Misafir') as customer_name, c.telefon, c.adres
            FROM teklifler t 
            LEFT JOIN cariler c ON t.musteri_id = c.id 
            WHERE t.durum = 'satis' AND t.teslimat_durumu != 'teslim_edildi'
            ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset
        ");
        $sales->bindValue(':limit', $limit, PDO::PARAM_INT);
        $sales->bindValue(':offset', $offset, PDO::PARAM_INT);
        $sales->execute();
        $salesList = $sales->fetchAll(PDO::FETCH_ASSOC);

        // 6. ARŞİV (TESLİM EDİLENLER)
        $archivedCount = $db->query("SELECT COUNT(*) as c FROM teklifler WHERE durum = 'satis' AND teslimat_durumu = 'teslim_edildi'")->fetch(PDO::FETCH_ASSOC)['c'];
        $archived = $db->prepare("
            SELECT t.*, IFNULL(c.ad_soyad, 'Misafir') as customer_name, c.telefon, c.adres
            FROM teklifler t 
            LEFT JOIN cariler c ON t.musteri_id = c.id 
            WHERE t.durum = 'satis' AND t.teslimat_durumu = 'teslim_edildi'
            ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset
        ");
        $archived->bindValue(':limit', $limit, PDO::PARAM_INT);
        $archived->bindValue(':offset', $offset, PDO::PARAM_INT);
        $archived->execute();
        $archivedList = $archived->fetchAll(PDO::FETCH_ASSOC);

        // 7. İADELER (YENİ LİSTE)
        $returnsCount = $db->query("SELECT COUNT(*) as c FROM teklifler WHERE durum = 'iade'")->fetch(PDO::FETCH_ASSOC)['c'];
        $returns = $db->prepare("
            SELECT t.*, IFNULL(c.ad_soyad, 'Misafir') as customer_name, c.telefon, c.adres
            FROM teklifler t 
            LEFT JOIN cariler c ON t.musteri_id = c.id 
            WHERE t.durum = 'iade'
            ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset
        ");
        $returns->bindValue(':limit', $limit, PDO::PARAM_INT);
        $returns->bindValue(':offset', $offset, PDO::PARAM_INT);
        $returns->execute();
        $returnsList = $returns->fetchAll(PDO::FETCH_ASSOC);

        // 8. KASA HAREKETLERİ (İsteğe Bağlı & Sayfalamalı)
        if (isset($_GET['kasa_hareketleri']) && $_GET['kasa_hareketleri'] == 'true') {
            $k_page = isset($_GET['k_page']) ? (int) $_GET['k_page'] : 1;
            $k_limit = isset($_GET['k_limit']) ? (int) $_GET['k_limit'] : 50;
            $k_offset = ($k_page - 1) * $k_limit;

            $k_total_stmt = $db->query("SELECT COUNT(*) FROM kasa_hareketleri WHERE durum='aktif'");
            $k_total_records = $k_total_stmt->fetchColumn();
            $k_total_pages = ceil($k_total_records / $k_limit);

            $k_stmt = $db->prepare("SELECT * FROM kasa_hareketleri WHERE durum='aktif' ORDER BY id DESC LIMIT :limit OFFSET :offset");
            $k_stmt->bindValue(':limit', $k_limit, PDO::PARAM_INT);
            $k_stmt->bindValue(':offset', $k_offset, PDO::PARAM_INT);
            $k_stmt->execute();
            $kasa_hareketleri = $k_stmt->fetchAll(PDO::FETCH_ASSOC);

            $kasa_pagination = [
                'total_pages' => $k_total_pages,
                'current_page' => $k_page,
                'total_records' => $k_total_records
            ];
        }
    }

    // 9. PLANLI ÖDEMELER
    $db->exec("CREATE TABLE IF NOT EXISTS planli_odemeler (id INT AUTO_INCREMENT PRIMARY KEY, kategori VARCHAR(100), aciklama VARCHAR(255), tutar DECIMAL(15,2) DEFAULT 0.00, son_odeme_tarihi DATE, durum VARCHAR(50) DEFAULT 'bekliyor', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
    $planned_payments = $db->query("SELECT * FROM planli_odemeler WHERE durum = 'bekliyor' ORDER BY son_odeme_tarihi ASC")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "stats" => $stats,
        "products" => $products,
        "customers" => $customers,
        "suppliers" => $suppliers,
        "employees" => $employees,
        "quotes" => $quotesList,
        "sales" => $salesList,
        "archived_sales" => $archivedList,
        "returns" => $returnsList, // YENİ
        "planned_payments" => $planned_payments ?? [],
        "kasa_hareketleri" => isset($_GET['kasa_hareketleri']) ? $kasa_hareketleri : null,
        "kasa_pagination" => isset($_GET['kasa_hareketleri']) ? $kasa_pagination : null,
        "total_quotes" => (int) $quotesCount,
        "total_sales" => (int) $salesCount,
        "total_archived" => (int) $archivedCount,
        "total_returns" => (int) $returnsCount, // YENİ
        "cari_counts" => $cari_counts, // YENİ: Toplam cari kayıtları
        "cari_page" => $cari_page,
        "cari_limit" => $cari_limit,
        "limit" => $limit,
        "offset" => $offset
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON Encoding Error: " . json_last_error_msg());
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>