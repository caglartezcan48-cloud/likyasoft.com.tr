<?php
require_once 'db.php';
header("Content-Type: application/json");
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($data['action'])) {
    echo json_encode(["status" => "error", "message" => "Hatalı istek"]);
    exit;
}

try {
    if ($data['action'] === 'update_delivery') {
        $stmt = $db->prepare("UPDATE satislar SET teslimat_durumu = ?, durum_isigi = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['light'], $data['id']]);
    } elseif ($data['action'] === 'pay_installment') {
        $stmt = $db->prepare("UPDATE taksitler SET durum = 'odendi', odeme_tarihi = CURDATE() WHERE id = ?");
        $stmt->execute([$data['id']]);
    }
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>