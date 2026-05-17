<?php
include_once 'core/database.php';
$database = new Database();
$db = $database->getConnection();

echo "--- User Table Columns ---\n";
$q = $db->query("DESCRIBE users");
$columns = $q->fetchAll(PDO::FETCH_ASSOC);

foreach ($columns as $col) {
    echo $col['Field'] . " (" . $col['Type'] . ")\n";
}
?>
