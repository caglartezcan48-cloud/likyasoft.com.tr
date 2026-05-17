<?php
// LikyaPay - Sistem Sıfırlama Scripti
require_once __DIR__ . '/core/config.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h2>Sistem Sıfırlanıyor...</h2>";

    // 1. İlişkili Tabloları Temizle (TRUNCATE)
    $tables = ['transactions', 'user_companies', 'sirius_cycles', 'messages', 'system_transactions'];
    foreach ($tables as $table) {
        try {
            $pdo->exec("TRUNCATE TABLE $table");
            echo "✔ $table tablosu sıfırlandı.<br>";
        } catch (Exception $e) {
            echo "⚠ $table tablosu temizlenemedi (Muhtemelen henüz oluşturulmamış): " . $e->getMessage() . "<br>";
        }
    }

    // 2. Kullanıcıları Sil (Admin Hariç)
    $stmt = $pdo->prepare("DELETE FROM users WHERE role != 'admin'");
    $stmt->execute();
    $deletedUsers = $stmt->rowCount();

    echo "<h3>✔ İşlem Başarıyla Tamamlandı!</h3>";
    echo "<p><b>$deletedUsers</b> adet kullanıcı silindi.</p>";
    echo "<p>Sadece admin hesabı korundu. Sistem artık tertemiz.</p>";
    echo "<p style='color:red;'><b>DİKKAT:</b> Güvenliğiniz için bu dosyayı (clean_users_final.php) sunucudan hemen siliniz.</p>";

} catch (Exception $e) {
    echo "<h2 style='color:red;'>Hata Oluştu!</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
