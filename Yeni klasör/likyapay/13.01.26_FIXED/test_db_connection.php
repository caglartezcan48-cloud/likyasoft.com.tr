<?php
// Test Database Connection
// Upload this to htdocs/test_db_connection.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Veritabanı Bağlantı Testi</h1>";

if (!file_exists('core/config.php')) {
    die("HATA: core/config.php dosyası bulunamadı! Lütfen dosya adının 'config.php' olduğundan emin olun.");
}

require_once 'core/config.php';

echo "<b>Ayarlar:</b><br>";
echo "Host: " . DB_HOST . "<br>";
echo "User: " . DB_USER . "<br>";
echo "DB Name: " . DB_NAME . "<br>";
echo "Password: " . substr(DB_PASS, 0, 3) . "*** (Güvenlik için gizlendi)<br><hr>";

try {
    $conn = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<h2 style='color:green'>BAŞARILI: Veritabanına bağlanıldı! ✅</h2>";
    
    // Test Query
    $stmt = $conn->query("SELECT count(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "Users tablosunda $count kayıt var.";
    
} catch(PDOException $e) {
    echo "<h2 style='color:red'>HATA: Bağlantı Başarısız! ❌</h2>";
    echo "<b>Hata Detayı:</b> " . $e->getMessage();
    echo "<br><br><b>Olası Sebepler:</b><br>";
    echo "1. Şifre yanlıştır (InfinityFree vPanel şifresi olmalı).<br>";
    echo "2. Veritabanı adı yanlıştır (Panelde if0_... ile başlayan tam isim).<br>";
    echo "3. Host adresi yanlıştır (sqlXXX.infinityfree.com).";
}
?>
