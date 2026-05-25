<?php
// Check Session API
// Path: data/api/check_session.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

// Start Session
session_set_cookie_params(0, '/');
session_start();

error_reporting(0);
ini_set('display_errors', 0);

handleCors();

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    
    // Fetch fresh data from DB
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $stmt = $db->prepare("SELECT id, name, email, phone, role, authorized_person, invoice_address, address, tax_id, tax_office, mersis_no, trade_registry_no, city, district, iban FROM users WHERE id = :id");
        $stmt->execute([':id' => $_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
             // Session exists but user deleted?
             echo json_encode(["success" => false, "message" => "Kullanıcı bulunamadı."]);
             exit;
        }

        echo json_encode(array(
            "success" => true,
            "user" => array(
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $user['email'],
                "phone" => $user['phone'],
                "role" => $user['role'],
                "tax_id" => $user['tax_id'],
                "authorized_person" => $user['authorized_person'],
                "invoice_address" => $user['invoice_address'],
                "address" => $user['address'],
                "tax_office" => $user['tax_office'],
                "mersis_no" => $user['mersis_no'],
                "trade_registry_no" => $user['trade_registry_no'],
                "city" => $user['city'],
                "district" => $user['district'],
                "iban" => $user['iban'],
                "account_type" => 'company', // Default or from DB if added later
                "permissions" => $_SESSION['user_permissions'] ?? null
            )
        ));
    } catch(Exception $e) {
        // Fallback to session if DB fails
        echo json_encode(array(
            "success" => true,
            "user" => array(
                "id" => $_SESSION['user_id'],
                "name" => $_SESSION['user_name'],
                "role" => $_SESSION['user_role']
            )
        ));
    }

} else {
    echo json_encode(array(
        "success" => false,
        "message" => "Oturum bulunamadı."
    ));
}
?>
