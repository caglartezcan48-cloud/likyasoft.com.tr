<?php
require_once 'api/db.php';

try {
    // Tabloyu temizle ve taze bir admin ekle
    $conn->exec("DELETE FROM site_users");
    
    $username = 'admin';
    $password = 'likyasoft2024';
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $query = "INSERT INTO site_users (username, password) VALUES (:username, :password)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $hashed_password);

    if ($stmt->execute()) {
        echo "<b>SÜPER SIFIRLAMA BAŞARILI!</b><br>";
        echo "Kullanıcı Adı: admin<br>";
        echo "Şifre: likyasoft2024<br>";
        echo "Lütfen şimdi giriş yapmayı deneyin.";
    }

} catch (PDOException $e) {
    echo "HATA: " . $e->getMessage();
}
?>
