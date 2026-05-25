<?php
// Restore Admin User
// Path: data/install/restore_admin.php

include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if admin exists
    $stmt = $db->query("SELECT id FROM users WHERE role = 'admin'");
    if ($stmt->rowCount() == 0) {
        $email = 'admin@likyapay.com';
        // Password: password123 (or whatever you prefer)
        $pass = password_hash('password123', PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (name, email, password, role, status, created_at) 
                VALUES ('System Administrator', '$email', '$pass', 'admin', 'active', NOW())";
        
        $db->query($sql);
        echo "✅ Yeni Admin kullanıcısı oluşturuldu.<br>";
        echo "Email: $email<br>";
        echo "Şifre: password123<br>";
    } else {
        echo "ℹ️ Admin kullanıcısı zaten mevcut.";
    }

} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
