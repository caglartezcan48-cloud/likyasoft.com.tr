<?php
// Test User Generator
// Creates a user with 'Ön Kayıt' status directly in DB to test Admin Panel visibility

include_once 'core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $name = "Test Onay Bekleyen A.Ş.";
    $email = "bekleyen" . rand(100,999) . "@test.com";
    $password = password_hash("123456", PASSWORD_BCRYPT);
    $status = "Ön Kayıt"; // DB Value
    $role = "user";
    $tax_id = "999999" . rand(1000,9999);

    $sql = "INSERT INTO users (name, email, password, tax_id, role, status, created_at) VALUES (:name, :email, :password, :tax_id, :role, :status, NOW())";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $password);
    $stmt->bindParam(":tax_id", $tax_id);
    $stmt->bindParam(":role", $role);
    $stmt->bindParam(":status", $status);

    if ($stmt->execute()) {
        echo "Başarılı: Yeni 'Ön Kayıt' kullanıcısı oluşturuldu.\n";
        echo "Email: $email\n";
        echo "ID: " . $db->lastInsertId() . "\n";
    } else {
        echo "Hata: Kullanıcı oluşturulamadı.\n";
    }

} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
