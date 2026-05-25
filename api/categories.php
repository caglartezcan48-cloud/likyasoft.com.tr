<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

// Veritabanı tablosunu oluştur (YOKSA)
$sql = "CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$conn->exec($sql);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all categories
    $stmt = $conn->prepare("SELECT * FROM categories ORDER BY name ASC");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($categories);
} 
elseif ($method === 'POST') {
    // Create new category
    $data = json_decode(file_get_contents("php://input"));
    if (!empty($data->name)) {
        try {
            $stmt = $conn->prepare("INSERT INTO categories (name) VALUES (:name)");
            $stmt->bindParam(':name', $data->name);
            if($stmt->execute()) {
                echo json_encode(array("status" => "success", "message" => "Sektör eklendi."));
            }
        } catch(PDOException $e) {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Bu sektör zaten var."));
        }
    }
}
elseif ($method === 'DELETE') {
    // Delete category
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    if ($id) {
        $stmt = $conn->prepare("DELETE FROM categories WHERE id = :id");
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Sektör silindi."]);
        }
    }
}
$conn = null;
?>
