<?php
// Database Migration: Add 'sector' column to users
include_once '../../core/database.php';
$database = new Database();
$db = $database->getConnection();

$sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS sector VARCHAR(100) DEFAULT 'Genel Ticaret' AFTER tax_id;";

header('Content-Type: text/plain');
try {
    $db->exec($sql);
    echo "Column 'sector' added successfully or already exists.\n";
} catch (PDOException $e) {
    echo "Error updating table: " . $e->getMessage() . "\n";
}
?>
