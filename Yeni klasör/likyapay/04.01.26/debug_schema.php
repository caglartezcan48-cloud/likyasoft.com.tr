<?php
// debug_schema.php
include_once __DIR__ . '/core/database.php';
$db = (new Database())->getConnection();

echo "<h1>Table Schema Debugger</h1>";

$tables = ['sirius_cycles'];
foreach ($tables as $table) {
    echo "<h3>$table</h3>";
    $stmt = $db->query("DESCRIBE $table");
    echo "<pre>";
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    echo "</pre>";
}
?>
