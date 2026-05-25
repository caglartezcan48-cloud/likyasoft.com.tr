<?php
// Register API
// Path: data/api/register.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

// Disable error display to prevent JSON corruption
error_reporting(0);
ini_set('display_errors', 0);

handleCors();
header('Content-Type: application/json'); // Fix: Ensure strictly JSON response

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Veritabanı bağlantı hatası.");
    }

    $data = json_decode(file_get_contents("php://input"));

    // Validation
    if (empty($data->email) || empty($data->password)) {
        throw new Exception("E-posta ve şifre zorunludur.");
    }

    // Check if email already exists
    $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(":email", $data->email);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        throw new Exception("Bu e-posta adresi zaten kayıtlı.");
    }

    // Check if tax_id exists (if provided)
    if (!empty($data->taxNumber)) {
        $checkTax = "SELECT id FROM users WHERE tax_id = :tax_id LIMIT 1";
        $stmtTax = $db->prepare($checkTax);
        $stmtTax->bindParam(":tax_id", $data->taxNumber);
        $stmtTax->execute();
        if ($stmtTax->rowCount() > 0) {
            throw new Exception("Bu vergi numarası zaten kayıtlı.");
        }
    }

    // Prepare Data
    $name = $data->companyName ?? 'Bilinmeyen Firma';
    $email = $data->email;
    $password = password_hash($data->password, PASSWORD_BCRYPT);
    // $phone = $data->phone ?? ''; // Column missing in DB
    $tax_id = $data->taxNumber ?? '';
    
    // Map Status to Database ENUM ('Aktif','Pasif','\u00d6n Kay\u0131t','\u0130zinli')
    $statusInput = $data->status ?? 'pending';
    switch ($statusInput) {
        case 'verified': $dbStatus = 'Aktif'; break;
        case 'banned': $dbStatus = 'Pasif'; break;
        default: $dbStatus = 'Ön Kayıt'; break;
    }

    $role = $data->role ?? 'user';
    $userType = $data->account_type ?? 'company';
    $permissions = isset($data->permissions) ? json_encode($data->permissions) : null;

    // Database structure might vary, ensure column names match setup
    // Assuming columns: name, email, password, role, tax_id, status, phone, user_type, permissions
    // Note: 'phone' might be missing in schema based on previous errors, handling carefully.
    
    // Let's use safer insert matching known schema from setup_accounting (users table update)
    $query = "INSERT INTO users (name, email, password, role, tax_id, status, phone, user_type, permissions, created_at) 
              VALUES (:name, :email, :password, :role, :tax_id, :status, :phone, :user_type, :permissions, NOW())";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $password);
    $stmt->bindParam(":role", $role);
    $stmt->bindParam(":tax_id", $tax_id);
    $stmt->bindParam(":status", $dbStatus);
    
    // Bind phone (from input or empty)
    $phone = $data->phone ?? '';
    $stmt->bindParam(":phone", $phone);

    // Bind New Fields
    $stmt->bindParam(":user_type", $userType);
    $stmt->bindParam(":permissions", $permissions);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array("success" => true, "message" => "Kullanıcı başarıyla oluşturuldu.", "id" => $db->lastInsertId()));
    } else {
        throw new Exception("Kullanıcı oluşturulamadı.");
    }

} catch (Exception $e) {
    http_response_code(400); // Bad Request
    echo json_encode(array("success" => false, "message" => $e->getMessage()));
}
?>
