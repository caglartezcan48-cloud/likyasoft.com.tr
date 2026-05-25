<?php
// Admin Transactions API
// Path: data/api/admin_transactions.php

include_once '../../core/cors.php';
include_once '../../core/database.php';

handleCors();
session_start();

// Security: Only Admin
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
header('Content-Type: application/json');

try {
    // Fetch ALL verified/pending transactions with user names
    $query = "
        SELECT t.*, 
               u1.name as debter_name, 
               u2.name as creditor_name 
        FROM transactions t
        LEFT JOIN users u1 ON t.user_id = u1.id
        LEFT JOIN users u2 ON t.related_user_id = u2.id
        ORDER BY t.created_at DESC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "count" => count($data),
        "data" => $data
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
