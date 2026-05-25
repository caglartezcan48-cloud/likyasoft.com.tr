<?php
// Bütün oturumları (session) kökten sil ve yenile
session_start();
session_unset();
session_destroy();

$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'likyapay';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Tablodaki tüm rolleri koda uydur
    $pdo->exec("UPDATE users SET role = 'admin' WHERE id = 1 OR role LIKE '%YÖNETİCİ%' OR role LIKE '%admin%'");
    $pdo->exec("UPDATE users SET role = 'user' WHERE role LIKE '%KULLANICI%' OR role = ''");
    
    // Test amaçlı şifresi 123456 olan kesin bir admin oluştur (eğer yoksa)
    $stmt = $pdo->query("SELECT * FROM users WHERE email = 'admin@likyapay.com'");
    if ($stmt->rowCount() == 0) {
        $hash = password_hash('123456', PASSWORD_DEFAULT);
        $pdo->exec("INSERT INTO users (name, email, password, role, status) VALUES ('Sistem Yöneticisi', 'admin@likyapay.com', '$hash', 'admin', 'Aktif')");
    } else {
        // Varsa şifresini kesin olarak 123456 yap ve admin yap
        $hash = password_hash('123456', PASSWORD_DEFAULT);
        $pdo->exec("UPDATE users SET password = '$hash', role = 'admin', status='Aktif' WHERE email = 'admin@likyapay.com'");
    }

    echo "<h2>Sistem Kökten Temizlendi!</h2>";
    echo "<p>Eski hatalı oturum bilgileriniz çerezlerden (cookies) ve sunucudan tamamen silindi.</p>";
    echo "<p><strong>admin@likyapay.com</strong> hesabı kesin olarak <strong>admin</strong> yapıldı ve şifresi <strong>123456</strong> olarak ayarlandı.</p>";
    
} catch (PDOException $e) {
    echo "Hata: " . $e->getMessage();
}
?>
