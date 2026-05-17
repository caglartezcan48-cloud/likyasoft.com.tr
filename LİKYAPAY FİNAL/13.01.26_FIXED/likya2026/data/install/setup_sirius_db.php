<?php
// Setup Sirius Database
// Path: data/install/setup_sirius_db.php


$root = dirname(dirname(__DIR__));
include_once $root . '/core/database.php';


try {
    $database = new Database();
    $db = $database->getConnection();

    echo "<h3>Sirius Veritabanı Kurulumu</h3>";

    // 1. Sirius Requests Table
    $sql = "CREATE TABLE IF NOT EXISTS sirius_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        requester_id INT NOT NULL,
        target_tax_id VARCHAR(20) NOT NULL,
        target_name VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        document_type ENUM('invoice','check','bond','contract','other') DEFAULT 'invoice',
        description TEXT,
        status ENUM('pending','matched','completed','cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (requester_id),
        INDEX (target_tax_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql);
    echo "<p style='color:green'>✅ 'sirius_requests' tablosu oluşturuldu.</p>";

    // 2. Sirius Cycles Table (Matches)
    // 2. Sirius Cycles Table (Matches)
    // Dropping first to ensure partial schema doesn't persist
    $db->exec("DROP TABLE IF EXISTS sirius_cycles");

    $sql2 = "CREATE TABLE IF NOT EXISTS sirius_cycles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cycle_code VARCHAR(64) UNIQUE, -- Human readable ID or Hash
        node_names JSON NOT NULL, -- Array of names for display
        details JSON NOT NULL, -- Full edge details (from, to, amount)
        total_volume DECIMAL(15,2) NOT NULL,
        payment_status JSON DEFAULT NULL, -- Status of each user's payment
        legal_status JSON DEFAULT NULL, -- Status of legal docs
        status ENUM('detected','approved','processing','completed') DEFAULT 'detected',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql2);
    echo "<p style='color:green'>✅ 'sirius_cycles' tablosu oluşturuldu.</p>";

} catch (PDOException $e) {
    echo "<p style='color:red'>HATA: " . $e->getMessage() . "</p>";
}
?>
