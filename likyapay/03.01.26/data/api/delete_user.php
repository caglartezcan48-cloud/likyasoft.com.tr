<?php
// Delete User API
// Path: data/api/delete_user.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

header('Content-Type: application/json');
handleCors();
session_start();

// Security: Only Admin
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Yetkisiz işlem."]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->id)) {
        throw new Exception("ID gerekli.");
    }

    $id = $data->id;

    // 1. Check for existing transactions
    $checkQuery = "SELECT COUNT(*) as count FROM transactions WHERE user_id = :id OR related_user_id = :id";
    $stmt = $db->prepare($checkQuery);
    $stmt->bindParam(":id", $id);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result['count'] > 0) {
        throw new Exception("Bu kullanıcının işlem geçmişi mevcut. Silmek yerine 'Hesap Durumu'nu 'Engelliler' veya 'Pasif' olarak güncelleyiniz.");
    }

    // 2. Perform Delete
    $query = "DELETE FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Kullanıcı başarıyla silindi."]);
    } else {
        throw new Exception("Silme işlemi sırasında veritabanı hatası.");
    }

} catch (Exception $e) {
    http_response_code(500); // Or 400
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
