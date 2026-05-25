<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

// GET - Listeleme veya Tekil Gösterim
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $conn->prepare("SELECT * FROM blogs WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } elseif (isset($_GET['slug'])) {
        $stmt = $conn->prepare("SELECT * FROM blogs WHERE slug = ?");
        $stmt->execute([$_GET['slug']]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } else {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $stmt = $conn->prepare("SELECT * FROM blogs ORDER BY created_at DESC LIMIT ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

// POST - Ekleme, Güncelleme veya Silme (Windows/Plesk Uyumluluğu için tek metod)
if ($method === 'POST') {
    $action = $data['action'] ?? 'save';

    if ($action === 'delete') {
        $stmt = $conn->prepare("DELETE FROM blogs WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['status' => 'success', 'message' => 'Yazı silindi']);
    } else {
        // Kaydet veya Güncelle
        if (isset($data['id']) && !empty($data['id'])) {
            // GÜNCELLE
            $stmt = $conn->prepare("UPDATE blogs SET title=?, slug=?, summary=?, content=?, image_url=?, category=?, status=? WHERE id=?");
            $stmt->execute([
                $data['title'],
                $data['slug'],
                $data['summary'],
                $data['content'],
                $data['image_url'],
                $data['category'],
                $data['status'],
                $data['id']
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Yazı güncellendi']);
        } else {
            // YENİ EKLE
            $stmt = $conn->prepare("INSERT INTO blogs (title, slug, summary, content, image_url, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['title'],
                $data['slug'],
                $data['summary'],
                $data['content'],
                $data['image_url'],
                $data['category'],
                $data['status'] ?? 'published'
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Yazı eklendi']);
        }
    }
}
?>
