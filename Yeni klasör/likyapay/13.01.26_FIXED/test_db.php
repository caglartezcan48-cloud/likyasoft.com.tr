<?php
// Test Database Connection
// Upload this to htdocs/test_db.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Veritabanı Bağlantı Testi</h1>";

// Config dosyasini bulmaya calis
if (file_exists('core/config.php')) {
    require_once 'core/config.php';
} elseif (file_exists('../core/config.php')) {
    require_once '../core/config.php';
} else {
    die("HATA: config.php dosyası bulunamadı! 'core' klasöründe olduğundan emin olun.");
}

echo "<b>Ayarlar:</b><br>";
echo "Host: " . DB_HOST . "<br>";
echo "DB Name: " . DB_NAME . "<br>";
echo "User: " . DB_USER . "<br>";

try {
    $conn = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<h2 style='color:green'>BAŞARILI: Veritabanına bağlanıldı! ✅</h2>";
    
    // Tablo Testi
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<b>Tablolar:</b> " . implode(", ", $tables);
    
} catch(PDOException $e) {
    echo "<h2 style='color:red'>HATA: Bağlantı Başarısız! ❌</h2>";
    echo "<b>Hata Detayı:</b> " . $e->getMessage();
}
?>
