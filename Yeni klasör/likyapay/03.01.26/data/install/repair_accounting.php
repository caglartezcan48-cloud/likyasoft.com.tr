<?php
// Check & Repair System Accounting Table
// Path: data/install/repair_accounting.php

include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "<h3>System Accounting Table Check</h3>";

    // 1. Check if table exists
    $check = $db->query("SHOW TABLES LIKE 'system_transactions'");
    if ($check->rowCount() > 0) {
        echo "<p style='color:green'>✅ 'system_transactions' tablosu MEVCUT.</p>";
        
        // Show columns to verify structure
        $cols = $db->query("SHOW COLUMNS FROM system_transactions");
        echo "<ul>";
        while($col = $cols->fetch(PDO::FETCH_ASSOC)) {
            echo "<li>" . $col['Field'] . " (" . $col['Type'] . ")</li>";
        }
        echo "</ul>";

    } else {
        echo "<p style='color:red'>❌ 'system_transactions' tablosu EKSİK. Oluşturuluyor...</p>";
        
        $sql = "CREATE TABLE IF NOT EXISTS system_transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type ENUM('income', 'expense') NOT NULL,
            category VARCHAR(100) NOT NULL,
            entity_name VARCHAR(255) NULL,
            description TEXT,
            amount DECIMAL(15,2) NOT NULL,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        
        $db->exec($sql);
        echo "<p style='color:green'>✅ Tablo başarıyla oluşturuldu.</p>";
    }

    // 2. Test Insert
    // $db->exec("INSERT INTO system_transactions (type, category, description, amount, date) VALUES ('income', 'Test Gelir', 'Sistem kontrolü', 1.00, CURDATE())");
    // echo "<p>Test verisi eklendi.</p>";

} catch (PDOException $e) {
    echo "<p style='color:red'>HATA: " . $e->getMessage() . "</p>";
}
?>
