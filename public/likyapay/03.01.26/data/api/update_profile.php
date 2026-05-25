<?php
// Update Profile API
// Path: data/api/update_profile.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

header('Content-Type: application/json');
handleCors();
session_start();

// Security: User must be logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Oturum açmanız gerekiyor."]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));
    $user_id = $_SESSION['user_id'];

    // Fields allowed to be updated by the user
    $fields = [];
    $params = [':id' => $user_id];

    if (!empty($data->email)) {
        // Optional: Check email uniqueness if changed
        $fields[] = "email = :email";
        $params[':email'] = $data->email;
    }
    if (!empty($data->phone)) {
        $fields[] = "phone = :phone";
        $params[':phone'] = $data->phone;
    }
    if (!empty($data->invoice_address)) {
        $fields[] = "invoice_address = :invoice_address";
        $params[':invoice_address'] = $data->invoice_address;
    }
    if (!empty($data->authorized_person)) {
        $fields[] = "authorized_person = :authorized_person";
        $params[':authorized_person'] = $data->authorized_person;
    }

    // Password Change Logic
    if (!empty($data->new_password)) {
        if (empty($data->current_password)) {
            throw new Exception("Şifre değiştirmek için mevcut şifrenizi girmelisiniz.");
        }
        
        // Verify current password first
        $stmt = $db->prepare("SELECT password FROM users WHERE id = :id");
        $stmt->execute([':id' => $user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($data->current_password, $user['password'])) {
            throw new Exception("Mevcut şifreniz hatalı.");
        }
        
        $fields[] = "password = :password";
        $params[':password'] = password_hash($data->new_password, PASSWORD_BCRYPT);
    }

    if (empty($fields)) {
        throw new Exception("Değişiklik yapılmadı.");
    }

    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    
    if ($stmt->execute($params)) {
        echo json_encode(["success" => true, "message" => "Profiliniz güncellendi."]);
    } else {
        throw new Exception("Güncelleme başarısız.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
