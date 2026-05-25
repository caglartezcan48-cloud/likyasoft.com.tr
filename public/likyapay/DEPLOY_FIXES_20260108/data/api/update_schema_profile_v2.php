<?php
// update_schema_profile_v2.php
// Simplified Version to avoid 502 Errors

include_once '../../core/database.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<html><head><title>Veritabanı Güncelleme</title></head><body>";
echo "<h2>Veritabanı Güncellemesi Başlatıldı (V2)</h2>";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("<h3 style='color:red'>Veritabanına Bağlanılamadı!</h3>");
    }

    // Try one by one with a simple message
    $commands = [
        "authorized_person" => "ALTER TABLE users ADD COLUMN authorized_person VARCHAR(255) NULL AFTER name",
        "invoice_address" => "ALTER TABLE users ADD COLUMN invoice_address TEXT NULL AFTER email",
        "address" => "ALTER TABLE users ADD COLUMN address TEXT NULL AFTER invoice_address",
        "tax_office" => "ALTER TABLE users ADD COLUMN tax_office VARCHAR(100) NULL AFTER tax_id",
        "mersis_no" => "ALTER TABLE users ADD COLUMN mersis_no VARCHAR(50) NULL AFTER tax_office",
        "trade_registry_no" => "ALTER TABLE users ADD COLUMN trade_registry_no VARCHAR(50) NULL AFTER mersis_no",
        "phone_check" => "ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email"
    ];

    foreach ($commands as $key => $sql) {
        try {
            $db->exec($sql);
            echo "<div style='color:green'>✅ $key eklendi.</div>";
        } catch (Exception $e) {
            // Check for duplicate column error (1060)
            if (strpos($e->getMessage(), 'duplicate') !== false || strpos($e->getMessage(), '1060') !== false) {
                echo "<div style='color:orange'>ℹ️ $key zaten mevcut.</div>";
            } else {
                // Ignore other errors to keep going?
                echo "<div style='color:gray'>⚠️ $key işlemi geçildi: " . $e->getMessage() . "</div>";
            }
        }
        // Small pause prevent server overload
        usleep(100000); 
    }

    echo "<br><h3>🎉 İşlem Tamamlandı!</h3>";
    echo "Artık bu pencereyi kapatıp Profil kaydetmeyi deneyebilirsiniz.";

} catch (Exception $e) {
    echo "<h3 style='color:red'>Kritik Hata: " . $e->getMessage() . "</h3>";
}
echo "</body></html>";
?>
