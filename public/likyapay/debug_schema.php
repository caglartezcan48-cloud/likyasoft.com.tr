<?php
// Debug Schema
// Upload and run to check table columns

ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'core/config.php';

echo "<h1>Schema Debugger</h1>";

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8";
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    
    echo "<h3>Column Details for 'users'</h3>";
    $stmt = $pdo->query("SHOW COLUMNS FROM users WHERE Field = 'role'");
    $col = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<pre>" . print_r($col, true) . "</pre>";
    
    if (strpos($col['Type'], 'enum') !== false) {
        echo "<h2 style='color:red'>ALERT: Column is ENUM!</h2>";
        echo "Allowed values: " . $col['Type'] . "<br>";
        echo "Value 'accountant' is NOT in the list, so it fails silently to empty string.";
        
        echo "<h3>Attempting to Fix (ALTER TABLE)...</h3>";
        // Attempt to convert to VARCHAR to be safe and flexible
        $alter = $pdo->exec("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user'");
        echo "ALTER Result: " . ($alter === false ? "Failed" : "Success (Converted to VARCHAR)") . "<br>";
        
        // Retry Update
        $upd = $pdo->prepare("UPDATE users SET role = 'accountant' WHERE email = 'muhasebe@muhasebe'");
        $upd->execute();
        echo "Retried Update Result: " . ($upd->rowCount() ? "Updated!" : "No change") . "<br>";
    } else {
        echo "Column is NOT Enum. Strange.";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
