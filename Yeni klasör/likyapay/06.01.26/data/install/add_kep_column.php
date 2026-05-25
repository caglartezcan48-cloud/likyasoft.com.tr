<?php
// data/install/add_kep_column.php
include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "Checking 'kep_address' column in 'users' table...\n";

    // Check if column exists
    $stmt = $db->prepare("SHOW COLUMNS FROM users LIKE 'kep_address'");
    $stmt->execute();
    
    if ($stmt->fetch()) {
        echo "Column 'kep_address' already exists.\n";
    } else {
        // Add column
        $sql = "ALTER TABLE users ADD COLUMN kep_address VARCHAR(255) DEFAULT NULL AFTER sector";
        $db->exec($sql);
        echo "Column 'kep_address' added successfully.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
