<?php
include_once 'core/database.php';
$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, name, type, status FROM users";
$stmt = $db->prepare($query);
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total Users: " . count($data) . "\n";
echo str_pad("ID", 5) . str_pad("NAME", 20) . str_pad("TYPE", 10) . str_pad("STATUS", 10) . "\n";
echo str_repeat("-", 50) . "\n";

foreach ($data as $row) {
    echo str_pad($row['id'], 5) . 
         str_pad(substr($row['name'], 0, 18), 20) . 
         str_pad($row['type'] ?? '-', 10) . 
         str_pad($row['status'], 10) . "\n";
}
?>
