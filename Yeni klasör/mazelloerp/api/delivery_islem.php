<?php
require_once 'db.php';
// DELIVERY MANAGEMENT API
require_once 'auth_check.php'; // GÜVENLİK DUVARI
header("Content-Type: application/json; charset=UTF-8");

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

try {
    // START DB MIGRATION: KALDIRILDI (Performans için ayrı migration scriptine taşınacaktır)

    if ($action === 'get_pending') {
        $list = $db->query("
            SELECT t.id, t.teklif_no as no, c.ad_soyad as customer_name, c.adres as address, c.telefon as phone,
            IFNULL(t.teslimat_durumu, 'hazirlik') as status, t.satis_tarihi as date, t.durum as quote_status,
            t.teslimat_tarihi as delivery_date,
            t.teslimat_ekibi as team, t.teslimat_araci as vehicle, t.teslimat_notu as note,
            t.toplam_tutar as total_amount, t.musteri_id as customer_id,
            (
                SELECT GROUP_CONCAT(
                    CONCAT(u.stok_kodu, ' - ', u.urun_adi, 
                        ' [SATIŞ: ', td.miktar, '] ',
                        ' [NOT: ', IFNULL(td.aciklama, ''), '] ', 
                        IF(IFNULL((SELECT SUM(td2.miktar) FROM teklif_detaylari td2 JOIN teklifler t2 ON td2.teklif_id = t2.id WHERE t2.ref_teklif_id = t.id AND t2.durum = 'iade' AND td2.urun_id = td.urun_id), 0) > 0,
                            CONCAT('[İADE: ', (SELECT SUM(td2.miktar) FROM teklif_detaylari td2 JOIN teklifler t2 ON td2.teklif_id = t2.id WHERE t2.ref_teklif_id = t.id AND t2.durum = 'iade' AND td2.urun_id = td.urun_id), ']'),
                            ''
                        ),
                        '|', IFNULL(sup.ad_soyad, 'Tedarikci Yok'), '|', IFNULL(sup.telefon, ''), '|', IFNULL(sup.eposta, '')
                        )
                    SEPARATOR ';;'
                    SEPARATOR ';;'
                ) 
                FROM teklif_detaylari td 
                JOIN urunler u ON td.urun_id = u.id 
                LEFT JOIN cariler sup ON u.tedarikci_id = sup.id 
                WHERE td.teklif_id = t.id
            ) as items_summary
            FROM teklifler t 
            LEFT JOIN cariler c ON t.musteri_id = c.id
            WHERE (t.durum = 'satis' AND (t.teslimat_durumu IS NULL OR t.teslimat_durumu != 'iptal') AND (t.teslimat_durumu != 'teslim' OR t.satis_tarihi >= DATE_SUB(NOW(), INTERVAL 7 DAY)))
               OR (t.durum = 'iptal' AND t.teslimat_durumu IN ('uretim', 'hazirlik', 'yolda'))
            ORDER BY (CASE WHEN t.durum = 'iptal' THEN 0 ELSE 1 END) ASC, t.satis_tarihi DESC
            LIMIT 100
        ")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "list" => array_values($list)]);

    } elseif ($action === 'confirm_cancellation') {
        $id = intval($data['id']);
        // Warehouseman confirmed cancellation -> Mark delivery status as 'iptal' to archive it from Kanban
        $db->prepare("UPDATE teklifler SET teslimat_durumu = 'iptal' WHERE id = ?")->execute([$id]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'update_status') {
        if (!$data || !isset($data['id']))
            throw new Exception("ID eksik");
        $status = $data['status'] ?? 'hazirlik';
        $db->prepare("UPDATE teklifler SET teslimat_durumu = ? WHERE id = ?")->execute([$status, $data['id']]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'assign_logistics') {
        $id = intval($data['id']);
        $team = $data['team'] ?? '';
        $vehicle = $data['vehicle'] ?? '';
        $note = $data['note'] ?? '';

        $stmt = $db->prepare("UPDATE teklifler SET teslimat_ekibi = ?, teslimat_araci = ?, teslimat_notu = ? WHERE id = ?");
        $stmt->execute([$team, $vehicle, $note, $id]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'get_form_data') {
        $id = intval($_GET['id']);
        $stmt = $db->prepare("SELECT t.*, c.ad_soyad as customer_name, c.adres as customer_address, c.telefon as customer_phone FROM teklifler t JOIN cariler c ON t.musteri_id = c.id WHERE t.id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get items and include return stats
        $sqlItems = "
            SELECT td.*, u.urun_adi, u.stok_kodu,
            IFNULL((SELECT SUM(td2.miktar) FROM teklif_detaylari td2 JOIN teklifler t2 ON td2.teklif_id = t2.id WHERE t2.ref_teklif_id = ? AND t2.durum = 'iade' AND td2.urun_id = td.urun_id), 0) as returned_qty
            FROM teklif_detaylari td 
            JOIN urunler u ON td.urun_id = u.id 
            WHERE td.teklif_id = ?
        ";
        $stmtItems = $db->prepare($sqlItems);
        $stmtItems->execute([$id, $id]);
        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "order" => $order, "items" => $items]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>