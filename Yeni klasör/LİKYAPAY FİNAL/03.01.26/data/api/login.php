<?php
// Login API
// Path: data/api/login.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

// Disable error display for production to prevent JSON corruption
error_reporting(0);
ini_set('display_errors', 0);

handleCors();

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Veritabanı bağlantı hatası.");
    }

    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->email) || empty($data->password)) {
        throw new Exception("E-posta ve şifre gereklidir.");
    }

    $email = $data->email;
    $password = $data->password;

    $query = "SELECT id, name, email, password, role, tax_id, status, user_type, permissions FROM users WHERE email = :email LIMIT 0,1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row['status'] !== 'Aktif') {
            throw new Exception("Üyeliğiniz onay sürecindedir veya pasif durumdadır. Lütfen yönetici onayı bekleyiniz.");
        }

        if (password_verify($password, $row['password'])) {
            // Success
            session_start();
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_name'] = $row['name'];
            $_SESSION['user_role'] = $row['role'];
            $_SESSION['user_type'] = $row['user_type'] ?? 'company';
            $_SESSION['user_permissions'] = $row['permissions'] ? json_decode($row['permissions'], true) : [];

            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Giriş başarılı.",
                "user" => array(
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "email" => $row['email'],
                    "role" => $row['role'],
                    "account_type" => $row['user_type'] ?? 'company',
                    "permissions" => $row['permissions'] ? json_decode($row['permissions']) : null
                )
            ));
        } else {
            throw new Exception("Hatalı şifre.");
        }
    } else {
         throw new Exception("Kullanıcı bulunamadı.");
    }

} catch (Exception $e) {
    http_response_code(400); // Bad Request for logical errors
    echo json_encode(array(
        "success" => false, 
        "message" => $e->getMessage()
    ));
}
?>
