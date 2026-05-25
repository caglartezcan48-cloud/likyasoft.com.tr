<?php
// update_schema_company_details.php
// Adds accounting details columns to users table

require 'core/config.php';

echo "<h1>Veritabanı Güncellemesi Başlatıldı...</h1>";

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $db = new PDO($dsn, DB_USER, DB_PASS);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $updates = [
        "ALTER TABLE users ADD COLUMN tax_office VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN district VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN city VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN trade_registry_no VARCHAR(50) DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN mersis_no VARCHAR(50) DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN iban VARCHAR(50) DEFAULT NULL"
    ];

    foreach ($updates as $sql) {
        try {
            $db->exec($sql);
            echo "<div style='color:green; margin:5px 0;'>✅ BAŞARILI: $sql</div>";
        } catch (PDOException $e) {
            // "Duplicate column name" state code is 42S21
            if ($e->getCode() == '42S21') {
                echo "<div style='color:orange; margin:5px 0;'>⚠️ Zaten Mevcut: $sql</div>";
            } else {
                echo "<div style='color:red; margin:5px 0;'>❌ HATA: " . $e->getMessage() . " (" . $sql . ")</div>";
            }
        }
    }

    echo "<h2>İşlem Tamamlandı. Lütfen bu dosyayı sunucudan silin!</h2>";

} catch (PDOException $e) {
    echo "<h2 style='color:red;'>Veritabanı Bağlantı Hatası!</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
