<?php
// Force Database Cleanup & Inspection
// Path: data/install/force_clean.php

include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "<h1>Veritabanı Durumu ve Temizlik</h1>";

    // 1. DELETE Non-Admin Users
    $delete = $db->prepare("DELETE FROM users WHERE role != 'admin'");
    $delete->execute();
    $deletedCount = $delete->rowCount();
    echo "<p>❌ Silinen Kullanıcı Sayısı (Admin hariç): <strong>$deletedCount</strong></p>";

    // 2. Truncate Transactions to correspond with user deletion
    $db->query("TRUNCATE TABLE transactions");
    echo "<p>❌ Tüm finansal işlemler silindi.</p>";

    // 3. Inspect Remaining Users (Should be only Admin)
    $stmt = $db->query("SELECT id, name, email, role, status FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h3>Kalan Kullanıcılar (Veritabanındaki Mevcut Durum):</h3>";
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse; width: 50%;'>";
    echo "<tr><th>ID</th><th>İsim</th><th>Email</th><th>Rol</th><th>Durum</th></tr>";
    
    foreach ($users as $u) {
        echo "<tr>";
        echo "<td>{$u['id']}</td>";
        echo "<td>{$u['name']}</td>";
        echo "<td>{$u['email']}</td>";
        echo "<td>{$u['role']}</td>";
        echo "<td>{$u['status']}</td>";
        echo "</tr>";
    }
    echo "</table>";

    if (count($users) == 0) {
        echo "<p style='color: red; font-weight: bold;'>⚠️ DİKKAT: Hiç kullanıcı kalmadı! Admin de silinmiş olabilir. Acilen admin oluşturmalısınız.</p>";
        // Emergency Admin Creation if needed
        // $pass = password_hash('123456', PASSWORD_DEFAULT);
        // $db->query("INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@likyapay.com', '$pass', 'admin')");
    }

} catch (Exception $e) {
    echo "<h1>HATA</h1>";
    echo $e->getMessage();
}
?>
