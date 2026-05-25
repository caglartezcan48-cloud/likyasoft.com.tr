<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'likyasoft_db';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $admin_user = 'admin';
    $admin_pass = '123456';
    $hashed_pass = password_hash($admin_pass, PASSWORD_DEFAULT);

    // Kullanıcı var mı kontrol et
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$admin_user]);
    
    if ($stmt->fetch()) {
        // Varsa şifresini güncelle
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
        $updateStmt->execute([$hashed_pass, $admin_user]);
        echo "<h2>Şifre Sıfırlandı!</h2>";
        echo "<p>Likyasoft admin şifreniz başarıyla <strong>123456</strong> olarak güncellendi.</p>";
    } else {
        // Yoksa yeniden oluştur
        $insertStmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $insertStmt->execute([$admin_user, $hashed_pass]);
        echo "<h2>Admin Hesabı Oluşturuldu!</h2>";
        echo "<p>Sistemde admin hesabı yoktu. Yeniden oluşturuldu ve şifresi <strong>123456</strong> olarak ayarlandı.</p>";
    }
    
    echo "<p>Artık Likyasoft paneline şu bilgilerle girebilirsiniz:</p>";
    echo "<ul><li><strong>Kullanıcı Adı:</strong> admin</li><li><strong>Şifre:</strong> 123456</li></ul>";

} catch (PDOException $e) {
    // Veritabanı yoksa oluştur ve setup'ı çalıştır
    if ($e->getCode() == 1049) {
        echo "<h2>Hata: likyasoft_db veritabanı bulunamadı!</h2>";
        echo "<p>Lütfen önce <b>http://localhost/likyasoft/setup.php</b> adresine giderek veritabanını kurun.</p>";
    } else {
        echo "Hata: " . $e->getMessage();
    }
}
?>
