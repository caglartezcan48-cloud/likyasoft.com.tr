<?php
// Add Company Details Columns to Users Table
include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Veritabanı bağlantı hatası.");
    }

    echo "Veritabanı bağlantısı başarılı.\n";

    // Add address
    try {
        $db->exec("ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL");
        echo "Address kolonu eklendi.\n";
    } catch (PDOException $e) {
        echo "Address kolonu zaten var veya hata: " . $e->getMessage() . "\n";
    }

    // Add tax_office
    try {
        $db->exec("ALTER TABLE users ADD COLUMN tax_office VARCHAR(100) DEFAULT NULL");
        echo "Tax Office kolonu eklendi.\n";
    } catch (PDOException $e) {
        echo "Tax Office kolonu zaten var veya hata: " . $e->getMessage() . "\n";
    }

    // Add mersis_no
    try {
        $db->exec("ALTER TABLE users ADD COLUMN mersis_no VARCHAR(50) DEFAULT NULL");
        echo "Mersis No kolonu eklendi.\n";
    } catch (PDOException $e) {
        echo "Mersis No kolonu zaten var veya hata: " . $e->getMessage() . "\n";
    }
    
    // Add trade_registry_no (Ticaret Sicil No)
    try {
        $db->exec("ALTER TABLE users ADD COLUMN trade_registry_no VARCHAR(50) DEFAULT NULL");
        echo "Ticaret Sicil No kolonu eklendi.\n";
    } catch (PDOException $e) {
        echo "Ticaret Sicil No kolonu zaten var veya hata: " . $e->getMessage() . "\n";
    }

    echo "--- İşlem Tamamlandı ---";

} catch (Exception $e) {
    echo "Genel Hata: " . $e->getMessage();
}
?>
