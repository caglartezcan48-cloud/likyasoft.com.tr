<?php
require_once __DIR__ . '/../../core/database.php';

try {
    $db = (new Database())->getConnection();
    echo "Updating sirius_cycles schema for Cycle ID...\n";

    // Add cycle_code column if not exists
    try {
        $db->query("SELECT cycle_code FROM sirius_cycles LIMIT 1");
        echo "Column 'cycle_code' already exists.\n";
    } catch (PDOException $e) {
        $db->query("ALTER TABLE sirius_cycles ADD COLUMN cycle_code VARCHAR(30) DEFAULT NULL AFTER id");
        echo "Added 'cycle_code' column.\n";
    }

    echo "Schema update completed.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
