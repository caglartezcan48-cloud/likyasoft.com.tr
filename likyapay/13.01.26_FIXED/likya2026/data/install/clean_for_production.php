<?php
// require_once '../../core/database.php'; // Skipping include to avoid variable scope issues

// Manual Connection
$host = 'localhost';
$db_name = 'likyapay';
$username = 'root';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Keep Admin (ID 1)
    $stmt = $db->prepare("DELETE FROM users WHERE id > 1");
    $stmt->execute();
    
    // 2. Truncate operational tables
    $db->exec("TRUNCATE TABLE transactions");
    $db->exec("TRUNCATE TABLE sirius_cycles");
    $db->exec("TRUNCATE TABLE sirius_requests");
    
    // 3. Reset Auto Increment
    $db->exec("ALTER TABLE users AUTO_INCREMENT = 2");
    
    echo "Veritabanı BAŞARIYLA temizlendi! Sadece Admin (ID: 1) kaldı. \n";
    echo "Artık gerçek verilerle çalışmaya başlayabilirsiniz.";
    
} catch (PDOException $e) {
    echo "Hata: " . $e->getMessage();
}
?>
