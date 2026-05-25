<?php
// Script to create/update Accountant User (Direct Connection Version)
// Upload this to root and run.

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Accountant User Creator</h1>";

if (!file_exists('core/config.php')) {
    die("Error: core/config.php not found.");
}

require_once 'core/config.php';

echo "Using Host: " . DB_HOST . "<br>";

try {
    // Direct PDO Connection (Same as Debug Script)
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8";
    $db = new PDO($dsn, DB_USER, DB_PASS);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database Connected.<br>";

    $email = 'muhasebe@muhasebe';
    $password = '123456'; 
    $name = 'Şirket Muhasebecisi';
    $role = 'accountant';

    // 1. Check if user exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Update existing
        $upd = $db->prepare("UPDATE users SET role = :role, name = :name WHERE id = :id");
        $upd->execute([':role' => $role, ':name' => $name, ':id' => $user['id']]);
        echo "<h2 style='color:blue'>✅ Kullanıcı GÜNCELLENDİ.</h2>";
        echo "Email: $email <br> Role: $role";
    } else {
        // Create new
        $hash = password_hash($password, PASSWORD_BCRYPT);
        // Ensure table has these columns. If 'status' or 'user_type' missing, might error, so we try specific columns.
        $ins = $db->prepare("INSERT INTO users (name, email, password, role, status, user_type) VALUES (:name, :email, :pass, :role, 'Aktif', 'employee')");
        $ins->execute([
            ':name' => $name,
            ':email' => $email,
            ':pass' => $hash,
            ':role' => $role
        ]);
        echo "<h2 style='color:green'>✅ Yeni Kullanıcı OLUŞTURULDU.</h2>";
        echo "Email: $email <br> Şifre: $password <br> Role: $role";
    }

} catch (PDOException $e) {
    echo "<h2 style='color:red'>❌ Error!</h2>";
    echo "Message: " . $e->getMessage();
    
    if($e->getCode() == 2002) {
         echo "<br><br><strong>Timeout detected.</strong> InfinityFree servers might be slow. Please refresh this page to try again.";
    }
}
?>
