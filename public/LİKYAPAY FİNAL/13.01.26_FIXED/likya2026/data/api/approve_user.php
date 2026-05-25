<?php
// Approve User API
// Path: data/api/approve_user.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

handleCors();
session_start();

// Only Admin
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Yetkisiz işlem."]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (empty($data->id) || empty($data->status)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Eksik veri."]);
    exit;
}

try {
    $dbStatus = 'Ön Kayıt';
    switch($data->status) {
        case 'verified': $dbStatus = 'Aktif'; break;
        case 'rejected': $dbStatus = 'Pasif'; break; // or delete
        case 'pending': $dbStatus = 'Ön Kayıt'; break;
        default: $dbStatus = 'Ön Kayıt';
    }

    if ($data->status === 'rejected') {
        // Reddedilenleri pasif yapalım
         $sql = "UPDATE users SET status = 'Pasif' WHERE id = :id";
    } else {
        $sql = "UPDATE users SET status = :status WHERE id = :id";
    }

    $stmt = $db->prepare($sql);
    $stmt->bindParam(':id', $data->id);
    
    if ($data->status !== 'rejected') {
        $stmt->bindParam(':status', $dbStatus);
    }
    
    if ($stmt->execute()) {
         echo json_encode(["success" => true, "message" => "İşlem başarılı."]);
    } else {
         throw new Exception("Veritabanı hatası.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
