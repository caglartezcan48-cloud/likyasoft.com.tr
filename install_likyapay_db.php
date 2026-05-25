<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'likyapay';
$sql_file = __DIR__ . '/public/likyapay/likyapay_full_backup.sql';

echo "<h2>LikyaPay Veritabanı Kurulumu</h2>";

try {
    // MySQL Sunucusuna Bağlan (Veritabanı olmadan)
    $pdo = new PDO("mysql:host=$host;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Veritabanını Oluştur
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<p style='color:green;'>✔ Veritabanı ('$dbname') başarıyla oluşturuldu veya zaten var.</p>";

    // Veritabanını Seç
    $pdo->exec("USE `$dbname`");

    // SQL Dosyasını Oku ve Yükle
    if (file_exists($sql_file)) {
        $sql = file_get_contents($sql_file);
        
        // UTF-16LE (Windows PowerShell export) sorununu çöz
        if (substr($sql, 0, 2) === "\xFF\xFE") {
            $sql = mb_convert_encoding(substr($sql, 2), 'UTF-8', 'UTF-16LE');
        } elseif (substr($sql, 0, 2) === "\xFE\xFF") {
            $sql = mb_convert_encoding(substr($sql, 2), 'UTF-8', 'UTF-16BE');
        }
        
        if (!empty($sql)) {
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
            $pdo->exec($sql);
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
            echo "<p style='color:green;'>✔ SQL yedek dosyası (Tablolar ve Veriler) başarıyla yüklendi!</p>";
        } else {
            echo "<p style='color:orange;'>⚠ SQL dosyası boş, tablolar yüklenemedi.</p>";
        }
    } else {
        echo "<p style='color:red;'>✘ HATA: SQL yedek dosyası bulunamadı! ($sql_file)</p>";
    }
    
    echo "<h3>Kurulum Tamamlandı! Artık LikyaPay'e (admin@likyapay.com / 123456) ile giriş yapabilirsiniz.</h3>";

} catch (PDOException $e) {
    echo "<p style='color:red;'><b>Veritabanı Hatası:</b> " . $e->getMessage() . "</p>";
}
?>
