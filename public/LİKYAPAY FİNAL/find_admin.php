<?php
include 'core/config.php';
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8";
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $stmt = $pdo->query("SELECT id, name, email, role FROM users WHERE role='admin'");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($admins) {
        echo "Admins found:\n";
        print_r($admins);
    } else {
        echo "No admin users found.\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
