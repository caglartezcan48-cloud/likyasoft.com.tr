<?php
// Mazello ERP - Cari Hareket Yönetim Merkezi v1.0
require_once 'auth_check.php'; // GÜVENLİK DUVARI
require_once 'db.php';
header("Content-Type: application/json");

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

try {
    if ($action === 'get_ekstre') {
        $cariId = $_GET['id'];
        $stmt = $db->prepare("SELECT * FROM cari_hareketleri WHERE cari_id = ? ORDER BY islem_tarihi DESC");
        $stmt->execute([$cariId]);
        echo json_encode(["status" => "success", "hareketler" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } elseif ($action === 'add_hareket') {
        // borc: Borçlandırma (Mal satışı, personelin maaş hak edişi vb.)
        // alacak: Tahsilat/Ödeme (Para girişi veya personeline ödeme yapma)
        $stmt = $db->prepare("INSERT INTO cari_hareketleri (cari_id, islem_turu, evrak_no, borc, alacak, aciklama) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['cari_id'],
            $data['islem_turu'],
            $data['evrak_no'] ?? 'ELDEN-' . time(),
            $data['borc'] ?? 0,
            $data['alacak'] ?? 0,
            $data['aciklama'] ?? ''
        ]);

        // Cari bakiyesini güncelle
        $diff = ($data['borc'] ?? 0) - ($data['alacak'] ?? 0);
        $db->prepare("UPDATE cariler SET bakiye = bakiye + ? WHERE id = ?")->execute([$diff, $data['cari_id']]);

        echo json_encode(["status" => "success"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>