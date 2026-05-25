<?php
require_once 'api/db.php';
try {
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $results = [];
    foreach ($tables as $table) {
        $stmt = $conn->query("SELECT * FROM $table LIMIT 10");
        $results[$table] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
