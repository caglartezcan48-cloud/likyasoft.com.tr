<?php
// Search API
// Path: data/api/search_companies.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

handleCors();
session_start();

// Ensure user is logged in (Any role: admin or user)
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Yetkisiz erişim."]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$query = $_GET['q'] ?? '';

if (strlen($query) < 2) {
    echo json_encode(["success" => true, "data" => []]);
    exit;
}

try {
    // Only select necessary fields for privacy
    // Exclude own company from results
    $sql = "SELECT id, name, tax_id, status FROM users 
            WHERE (name LIKE :q OR tax_id LIKE :q) 
            AND id != :my_id 
            AND role = 'user' 
            LIMIT 10";
            
    $stmt = $db->prepare($sql);
    $searchTerm = "%{$query}%";
    $stmt->bindParam(':q', $searchTerm);
    $stmt->bindParam(':my_id', $_SESSION['user_id']);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["success" => true, "data" => $results]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
