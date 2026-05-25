<?php
require 'c:/Users/Casper/Desktop/xampp/htdocs/likyapay/core/database.php';
$db = (new Database())->getConnection();

try {
    // Add 'details' column for JSON data (Address, Tax ID, Items etc)
    $db->exec("ALTER TABLE system_transactions ADD COLUMN details TEXT DEFAULT NULL");
    echo "Added details column successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Verify
$cols = $db->query("DESCRIBE system_transactions")->fetchAll(PDO::FETCH_ASSOC);
foreach($cols as $c) echo $c['Field'] . "\n";
?>
