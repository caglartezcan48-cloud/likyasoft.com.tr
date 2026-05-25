<?php
// Database Migration: Create system_logs table
include_once '../../core/database.php';
$database = new Database();
$db = $database->getConnection();

$sql = "CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id),
    INDEX (action),
    INDEX (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;";

header('Content-Type: text/plain');
try {
    $db->exec($sql);
    echo "Table 'system_logs' created or already exists.\n";
} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}
?>
