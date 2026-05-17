<?php
// api/trash_islem.php
require_once 'db.php';
require_once 'auth_check.php'; // GÜVENLİK DUVARI
header("Content-Type: application/json; charset=UTF-8");

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

try {
    if (!$db)
        throw new Exception("Veritabanı bağlantısı yok.");

    // 1. GET ALL TRASH
    if ($action === 'get_trash') {
        $q = $db->query("SELECT * FROM recycle_bin ORDER BY deleted_at DESC");
        echo json_encode(["status" => "success", "data" => $q->fetchAll(PDO::FETCH_ASSOC)]);

        // 2. PERMANENT DELETE (Yok Et)
    } elseif ($action === 'permanent_delete') {
        $id = $_GET['id'] ?? null;
        if (!$id)
            throw new Exception("ID gerekli.");

        // Kalıcı sil
        $stmt = $db->prepare("DELETE FROM recycle_bin WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "message" => "Öğe kalıcı olarak silindi."]);

        // 3. RESTORE (Geri Yükle - Basit Versiyon)
    } elseif ($action === 'restore') {
        $id = $_GET['id'] ?? null;
        if (!$id)
            throw new Exception("ID gerekli.");

        // Veriyi al
        $stmt = $db->prepare("SELECT * FROM recycle_bin WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$item)
            throw new Exception("Kayıt bulunamadı.");

        $jsonData = json_decode($item['deleted_data'], true);
        if (!$jsonData)
            throw new Exception("Veri bozuk.");

        $db->beginTransaction();

        // SADECE 'teklifler' tablosu için geri yükleme mantığı
        // Diğer tablolar eklendikçe burası switch-case ile genişletilebilir.
        if ($item['table_name'] === 'teklifler') {
            $main = $jsonData['main'];
            $items = $jsonData['items'];

            // 1. Ana kaydı geri ekle (ID'yi koruyarak!) - insert ignore veya duplicate key update kullanılabilir ama basit insert yeterli (ID çakışması yoksa)
            // Sütunları dinamik oluştur
            $cols = array_keys($main);
            $vals = array_values($main);
            $placeholders = str_repeat('?,', count($cols) - 1) . '?';

            $sql = "INSERT INTO teklifler (" . implode(',', $cols) . ") VALUES ($placeholders)";
            $ins = $db->prepare($sql);
            $ins->execute($vals);

            // 2. Detayları geri ekle
            if (!empty($items)) {
                $colsDet = array_keys($items[0]);
                $sqlDet = "INSERT INTO teklif_detaylari (" . implode(',', $colsDet) . ") VALUES (" . str_repeat('?,', count($colsDet) - 1) . "?)";
                $insDet = $db->prepare($sqlDet);
                foreach ($items as $row) {
                    $insDet->execute(array_values($row));
                }
            }
        }

        // Geri dönüşümden sil
        $db->prepare("DELETE FROM recycle_bin WHERE id = ?")->execute([$id]);

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Başarıyla geri yüklendi."]);

    }
} catch (Exception $e) {
    if ($db->inTransaction())
        $db->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>