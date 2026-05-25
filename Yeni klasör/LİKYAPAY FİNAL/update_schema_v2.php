<?php
// update_schema_v2.php
include_once __DIR__ . '/core/database.php';
$db = (new Database())->getConnection();

try {
    $db->exec("ALTER TABLE sirius_cycles ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    echo "Column 'updated_at' added successfully.";
} catch (PDOException $e) {
    echo "Error (might already exist): " . $e->getMessage();
}
?>
