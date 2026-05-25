<?php
require_once 'api/db.php';

try {
    echo "Veritabanı tamiri başlıyor (Düzeltilmiş)...<br>";
    
    // Check if slug exists
    $checkSlug = $conn->query("SHOW COLUMNS FROM `projects` LIKE 'slug'");
    if ($checkSlug->rowCount() == 0) {
        $conn->exec("ALTER TABLE `projects` ADD COLUMN `slug` VARCHAR(255) AFTER `title` ");
        echo "✅ 'slug' sütunu eklendi.<br>";
    }

    // Check if status exists
    $checkStatus = $conn->query("SHOW COLUMNS FROM `projects` LIKE 'status'");
    if ($checkStatus->rowCount() == 0) {
        $conn->exec("ALTER TABLE `projects` ADD COLUMN `status` VARCHAR(50) DEFAULT 'completed' AFTER `description` ");
        echo "✅ 'status' sütunu eklendi.<br>";
    }

    echo "<b>Tamir başarıyla tamamlandı!</b> Artık seed_projects.php dosyasını çalıştırabilirsiniz.";

} catch (PDOException $e) {
    echo "❌ HATA: " . $e->getMessage();
}
?>
