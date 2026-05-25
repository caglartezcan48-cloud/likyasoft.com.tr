<?php
// debug_sirius_list.php
include 'core/config.php';
include 'core/database.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Check Raw Table
    $stmt = $conn->query("SELECT id, status, code FROM sirius_cycles");
    $all = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "count" => count($all),
        "data" => $all,
        "completed_count" => count(array_filter($all, function($c){ 
            return strtolower($c['status']) == 'completed'; 
        }))
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo $e->getMessage();
}
?>
