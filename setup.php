<?php
// Database Configuration
$host = "localhost";
$username = "root";
$password = "";
$db_name = "likyasoft_db";

try {
    // 1. Connect without DB to create it
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Create Database
    echo "Veritabanı kontrol ediliyor...<br>";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `$db_name`;");

    // 3. Create Tables
    echo "Tablolar oluşturuluyor...<br>";
    
    // Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `username` varchar(50) NOT NULL,
      `password` varchar(255) NOT NULL,
      `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `username` (`username`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Projects Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `projects` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `title` varchar(255) NOT NULL,
      `slug` varchar(100) NOT NULL,
      `category` varchar(100) DEFAULT NULL,
      `description` text DEFAULT NULL,
      `image_url` varchar(500) DEFAULT NULL,
      `project_url` varchar(500) DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `order_index` int(11) DEFAULT 0,
      PRIMARY KEY (`id`),
      UNIQUE KEY `slug` (`slug`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 4. Create Default Admin
    $admin_user = 'admin';
    $admin_pass = password_hash('likyasoft2024', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$admin_user]);
    if (!$stmt->fetch()) {
        $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->execute([$admin_user, $admin_pass]);
        echo "Varsayılan admin hesabı oluşturuldu (admin / likyasoft2024).<br>";
    }

    echo "<strong>Kurulum Başarılı!</strong><br>";
    echo "Artık siteyi kullanmaya başlayabilirsiniz.<br>";
    echo "<a href='index.html'>Siteye Git</a> | <a href='admin/'>Panele Git</a>";

} catch (PDOException $e) {
    die("HATA: " . $e->getMessage());
}
?>
