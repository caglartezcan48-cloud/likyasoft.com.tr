<?php
include_once '../core/database.php';
$database = new Database();
$db = $database->getConnection();

$email = "admin@likyapay.com";
$new_pass = "123456";
$new_hash = password_hash($new_pass, PASSWORD_DEFAULT);

try {
    // Try to update existing user
    $stmt = $db->prepare("UPDATE users SET password = :pass, role = 'admin' WHERE email = :email");
    $stmt->bindParam(":pass", $new_hash);
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "Password updated successfully for $email.<br>";
    } else {
        // If not updated, maybe user doesn't exist? Try Insert
        echo "User not found or password same. Attempting insert...<br>";
        $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES ('Likya Admin', :email, :pass, 'admin')");
        $stmt->bindParam(":pass", $new_hash);
        $stmt->bindParam(":email", $email);
        try {
            $stmt->execute();
            echo "Admin user created successfully.<br>";
        } catch (Exception $e) {
            echo "Insert failed (maybe user exists but pw same): " . $e->getMessage();
        }
    }
    echo "Done. New password is: $new_pass";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
