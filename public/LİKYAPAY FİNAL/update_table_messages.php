<?php
// Script to update messages table for attachments
// Path: update_table_messages.php

include_once 'core/config.php';
include_once 'core/database.php';

// Mock server variables for CLI execution if needed
if (php_sapi_name() === 'cli') {
    $_SERVER['HTTP_HOST'] = 'localhost';
    $_SERVER['REQUEST_URI'] = '/update_table_messages.php';
}

echo "Updating 'messages' table...\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Connection failed.");
    }

    // Check if column exists
    $check = $db->query("SHOW COLUMNS FROM messages LIKE 'attachment_path'");
    
    if ($check->rowCount() == 0) {
        // Add column
        $sql = "ALTER TABLE messages ADD COLUMN attachment_path VARCHAR(255) NULL AFTER message";
        $db->exec($sql);
        echo "SUCCESS: Column 'attachment_path' added to 'messages' table.\n";
    } else {
        echo "INFO: Column 'attachment_path' already exists.\n";
    }

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
