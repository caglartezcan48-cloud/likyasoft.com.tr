<?php
include 'core/config.php';
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8";
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    
    // Check transactions table
    $stmt = $pdo->query("SHOW COLUMNS FROM transactions WHERE Field = 'amount'");
    $col = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<h3>Transactions 'amount' Column</h3>";
    echo "<pre>" . print_r($col, true) . "</pre>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
