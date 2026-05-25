<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include 'core/database.php';
$database = new Database();
$db = $database->getConnection();

echo "<h3>Users List</h3>";
$stmt = $db->query("SELECT id, name, email, tax_id FROM users");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']} | Name: {$row['name']} | Tax: {$row['tax_id']}<br>";
}

echo "<h3>Cycles List</h3>";
$stmt = $db->query("SELECT id, status, nodes FROM sirius_cycles");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']} | Status: {$row['status']} | Nodes: {$row['nodes']}<br>";
}
?>
