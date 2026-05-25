<?php
require_once 'api/db.php';

try {
    $conn->exec("ALTER TABLE projects ADD COLUMN status VARCHAR(20) DEFAULT 'completed' AFTER project_url");
    echo "Veritabanı başarıyla güncellendi: 'status' sütunu eklendi.";
} catch (PDOException $e) {
    if ($e->getCode() == "42S21") {
        echo "Sütun zaten mevcut.";
    } else {
        echo "Hata: " . $e->getMessage();
    }
}
?>
