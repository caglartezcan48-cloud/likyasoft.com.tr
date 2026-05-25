<?php
include_once 'core/database.php';
$database = new Database();
$db = $database->getConnection();

try {
    $sql = "ALTER TABLE sirius_requests ADD COLUMN doc_path VARCHAR(255) NULL AFTER description";
    $db->exec($sql);
    echo "Column 'doc_path' added successfully.";
} catch (PDOException $e) {
    echo "Error (or column exists): " . $e->getMessage();
}
?>
