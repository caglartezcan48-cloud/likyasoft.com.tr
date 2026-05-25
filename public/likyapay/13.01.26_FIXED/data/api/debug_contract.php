<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/plain; charset=utf-8');

include_once '../../core/database.php';

try {
    $db = (new Database())->getConnection();
    echo "=== TABLE STRUCTURE ===\n";
    $stmt = $db->query("DESCRIBE sirius_cycles");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($columns as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ")\n";
    }

    echo "\n=== LAST RECORD ===\n";
    $stmt = $db->query("SELECT * FROM sirius_cycles ORDER BY id DESC LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    print_r($row);

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
