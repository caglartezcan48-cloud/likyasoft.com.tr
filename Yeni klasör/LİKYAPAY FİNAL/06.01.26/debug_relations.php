<?php
include_once 'core/database.php';
$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, type, amount, status, user_id, related_user_id FROM transactions";
$stmt = $db->prepare($query);
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total Count: " . count($data) . "\n";
echo str_pad("ID", 5) . str_pad("TYPE", 8) . str_pad("AMOUNT", 12) . str_pad("UID", 5) . str_pad("REL_ID", 8) . "\n";
echo str_repeat("-", 50) . "\n";

foreach ($data as $row) {
    echo str_pad($row['id'], 5) . 
         str_pad($row['type'], 8) . 
         str_pad($row['amount'], 12) . 
         str_pad($row['user_id'], 5) . 
         str_pad($row['related_user_id'] ?? 'NULL', 8) . "\n";
}
?>
