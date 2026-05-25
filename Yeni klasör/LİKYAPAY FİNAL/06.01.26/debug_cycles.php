<?php
include_once 'core/database.php';
header('Content-Type: text/plain');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->query("SELECT id, status, created_at FROM sirius_cycles ORDER BY id DESC");
    $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total Cycles: " . count($cycles) . "\n\n";
    foreach ($cycles as $c) {
        echo "ID: " . $c['id'] . " | Status: [" . $c['status'] . "] | Date: " . $c['created_at'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
