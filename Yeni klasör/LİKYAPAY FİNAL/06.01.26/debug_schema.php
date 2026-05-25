<?php
include_once 'core/database.php';
$database = new Database();
$db = $database->getConnection();

$table = 'sirius_requests';
$stmt = $db->prepare("DESCRIBE $table");
$stmt->execute();
$columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "Columns in $table:\n";
print_r($columns);
?>
