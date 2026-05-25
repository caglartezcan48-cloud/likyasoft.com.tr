<?php
// fix_schema.php - Veritabanı Eksiklerini Tamamlama Aracı
// Bu dosyayı ana dizine atıp tarayıcıdan çalıştırın: likyapaydemo.gt.tc/fix_schema.php

require 'core/config.php';

echo "<h1>Veritabanı Onarım Başlatıldı...</h1>";

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $db = new PDO($dsn, DB_USER, DB_PASS);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $updates = [
        // 1. User Type (Tedarikçi İçin Gerekli)
        "ALTER TABLE users ADD COLUMN user_type ENUM('company', 'supplier', 'employee') DEFAULT 'company'",
        
        // 2. Permissions (Personel Yetkileri İçin)
        "ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT NULL",
        
        // 3. Detay Bilgileri
        "ALTER TABLE users ADD COLUMN sector VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN kep_address VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN username VARCHAR(100) DEFAULT NULL",
        
        // 4. Telefon (Eğer yoksa)
        "ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL"
    ];

    foreach ($updates as $sql) {
        try {
            $db->exec($sql);
            echo "<div style='color:green; margin:10px 0;'>✅ BAŞARILI: $sql</div>";
        } catch (PDOException $e) {
            // "Duplicate column name" hatası (State 42S21) ise yoksay, zaten var demektir.
            if ($e->getCode() == '42S21') {
                 echo "<div style='color:orange; margin:10px 0;'>⚠️ Zaten Mevcut: $sql</div>";
            } else {
                 echo "<div style='color:red; margin:10px 0;'>❌ HATA: " . $e->getMessage() . "</div>";
            }
        }
    }

    echo "<h2>İşlem Tamamlandı. Lütfen bu dosyayı sunucudan silin!</h2>";

} catch (PDOException $e) {
    echo "<h2 style='color:red;'>Veritabanı Bağlantı Hatası!</h2>";
    echo "<p>Config dosyasındaki bilgiler yanlış olabilir: " . $e->getMessage() . "</p>";
}
?>
