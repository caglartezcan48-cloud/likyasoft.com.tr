<?php
require 'c:/Users/Casper/Desktop/xampp/htdocs/likyapay/core/database.php';
$db = (new Database())->getConnection();

// Check columns
$cols = $db->query("DESCRIBE system_accounting")->fetchAll(PDO::FETCH_ASSOC);
echo "Columns:\n";
foreach($cols as $c) echo $c['Field'] . "\n";

// Check distinct categories
$cats = $db->query("SELECT DISTINCT category FROM system_accounting")->fetchAll(PDO::FETCH_COLUMN);
echo "\nCategories:\n" . implode(", ", $cats) . "\n";

// Sample Data
$data = $db->query("SELECT * FROM system_accounting LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
echo "\nSample Data:\n";
print_r($data);
?>
