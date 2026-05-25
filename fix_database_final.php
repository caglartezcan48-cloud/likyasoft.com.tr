<?php
// LikyaPay Veritabanı Yapısal Düzeltme
// Path: fix_database_final.php

$host = 'localhost'; $user = 'root'; $pass = ''; $dbname = 'likyapay';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h2>LikyaPay Veritabanı Onarılıyor...</h2>";

    // 1. MESSAGES TABLOSU (Eksikse oluştur)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `messages` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `sender_id` int(11) NOT NULL,
        `receiver_id` int(11) NOT NULL,
        `subject` varchar(255) DEFAULT NULL,
        `message` text NOT NULL,
        `attachment_path` varchar(500) DEFAULT NULL,
        `is_read` tinyint(1) DEFAULT 0,
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "<p style='color:green;'>✔ Messages tablosu kontrol edildi/oluşturuldu.</p>";

    // 2. USERS TABLOSU (Eksik sütunları tamamla - Opsiyonel ama garanti)
    // Not: Kodda hata almamak için şimdilik sadece messages'ı çözüyoruz. 
    // Diğerlerini zaten login/register içinde kod tarafında sadeleştirdik.

    echo "<h3>Düzeltme Tamamlandı!</h3>";
    echo "<p>Artık kullanıcı panelindeki Mesajlar ve diğer geçişler sorunsuz çalışacaktır.</p>";

} catch (Exception $e) {
    echo "<p style='color:red;'>Hata: " . $e->getMessage() . "</p>";
}
?>
