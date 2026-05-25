<?php
// Canlı Sunucu Onarım Dosyası
require_once __DIR__ . '/core/config.php';

try {
    // Sunucu bilgilerini config.php'den otomatik çekiyoruz
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h2>Canlı Sunucu Veritabanı Onarılıyor...</h2>";

    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $required_columns = [
        'username' => "VARCHAR(100) NULL",
        'phone' => "VARCHAR(20) NULL",
        'user_type' => "VARCHAR(50) DEFAULT 'company'",
        'permissions' => "TEXT NULL",
        'tax_id' => "VARCHAR(50) NULL",
        'status' => "VARCHAR(20) DEFAULT 'Aktif'",
        'authorized_person' => "VARCHAR(100) NULL",
        'invoice_address' => "TEXT NULL",
        'address' => "TEXT NULL",
        'tax_office' => "VARCHAR(100) NULL",
        'mersis_no' => "VARCHAR(50) NULL",
        'trade_registry_no' => "VARCHAR(50) NULL",
        'city' => "VARCHAR(50) NULL",
        'district' => "VARCHAR(50) NULL",
        'iban' => "VARCHAR(50) NULL"
    ];

    $added = 0;
    foreach ($required_columns as $col => $definition) {
        if (!in_array($col, $columns)) {
            $pdo->exec("ALTER TABLE users ADD COLUMN $col $definition");
            $added++;
        }
    }

    echo "<p style='color:green;'><b>✔ Başarılı!</b> Eksik olan $added adet sütun canlı sunucuya eklendi.</p>";
    echo "<p>Artık profil güncelleme ve kayıt işlemleri sorunsuz çalışacaktır.</p>";

} catch (Exception $e) {
    echo "<p style='color:red;'>Hata: " . $e->getMessage() . "</p>";
}
?>
