<?php
// update_schema.php
include_once __DIR__ . '/core/database.php';
$db = (new Database())->getConnection();

try {
    $db->exec("ALTER TABLE sirius_cycles ADD COLUMN details LONGTEXT DEFAULT NULL AFTER nodes");
    echo "Column 'details' added successfully.";
} catch (PDOException $e) {
    echo "Error (might already exist): " . $e->getMessage();
}
?>
