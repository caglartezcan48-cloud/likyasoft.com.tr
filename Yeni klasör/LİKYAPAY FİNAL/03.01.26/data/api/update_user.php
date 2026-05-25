<?php
// Update User API
// Path: data/api/update_user.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

header('Content-Type: application/json');
handleCors();
session_start();

// Security: Only Admin can update other users (for now)
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
        throw new Exception("Kullanıcı ID gereklidir.");
    }

    // Build Dynamic Query
    $fields = [];
    $params = [':id' => $data->id];

    if (!empty($data->companyName)) {
        $fields[] = "name = :name";
        $params[':name'] = $data->companyName;
    }
    if (!empty($data->email)) {
        // Check uniqueness if email changing? Skipping for speed, assume admin knows best
        $fields[] = "email = :email";
        $params[':email'] = $data->email;
    }
    if (!empty($data->taxNumber)) {
        $fields[] = "tax_id = :tax_id";
        $params[':tax_id'] = $data->taxNumber;
    }
    if (!empty($data->status)) {
        // Map frontend status 'verified' -> DB 'Aktif'
        $dbStatus = $data->status;
        if ($data->status === 'verified') $dbStatus = 'Aktif';
        elseif ($data->status === 'pending') $dbStatus = 'Ön Kayıt';
        elseif ($data->status === 'banned') $dbStatus = 'Pasif';
        
        $fields[] = "status = :status";
        $params[':status'] = $dbStatus;
    }
    if (!empty($data->role)) {
        $fields[] = "role = :role";
        $params[':role'] = $data->role;
    }
    // Password update (optional)
    if (!empty($data->password)) {
        $fields[] = "password = :password";
        $params[':password'] = password_hash($data->password, PASSWORD_BCRYPT);
    }

    // RBAC Fields
    if (!empty($data->account_type)) {
        $fields[] = "user_type = :user_type";
        $params[':user_type'] = $data->account_type;
    }
    if (isset($data->permissions)) {
        $fields[] = "permissions = :permissions";
        // Ensure it is stored as JSON string
        $params[':permissions'] = (is_array($data->permissions) || is_object($data->permissions)) 
            ? json_encode($data->permissions) 
            : $data->permissions;
    }

    if (empty($fields)) {
        throw new Exception("Güncellenecek veri yok.");
    }

    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
    
    $stmt = $db->prepare($sql);
    
    if ($stmt->execute($params)) {
        echo json_encode(["success" => true, "message" => "Kullanıcı güncellendi."]);
    } else {
        throw new Exception("Güncelleme başarısız.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
