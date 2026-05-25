<?php
include_once 'core/database.php';
try {
    $database = new Database();
    $db = $database->getConnection();

    $name = "Admin Test";
    $email = "admin_test@local.com";
    $password = password_hash("123456", PASSWORD_BCRYPT);
    $status = "verified";
    $role = "admin";
    $tax_id = "1111111111";

    // Delete if exists first to avoid duplicates
    $db->prepare("DELETE FROM users WHERE email = :email")->execute([':email' => $email]);

    $sql = "INSERT INTO users (name, email, password, tax_id, role, status, created_at) VALUES (:name, :email, :password, :tax_id, :role, :status, NOW())";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $password);
    $stmt->bindParam(":tax_id", $tax_id);
    $stmt->bindParam(":role", $role);
    $stmt->bindParam(":status", $status);

    if ($stmt->execute()) {
        echo "Admin created: $email / 123456";
    } else {
        echo "Failed to create admin.";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
