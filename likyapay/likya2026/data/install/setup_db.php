<?php
// Database Setup Script
// Path: data/install/setup_db.php

include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Veritabanı bağlantısı kurulamadı.");
    }

    echo "Veritabanı bağlantısı başarılı.\n";

    // Transactions Table
    $sql = "CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('debt', 'credit') NOT NULL,
        party_name VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        due_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        doc_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql);
    echo "Tablo 'transactions' kontrol edildi/oluşturuldu.\n";

} catch (PDOException $e) {
    die("Hata: " . $e->getMessage());
}
?>
