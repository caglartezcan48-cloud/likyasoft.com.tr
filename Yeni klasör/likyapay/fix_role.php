<?php
// Fix Role Script
// Upload and run to force 'accountant' role
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'core/config.php';

echo "<h1>Role Fixer & Debugger</h1>";
echo "Host: " . DB_HOST . "<br>";

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8";
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $email = 'muhasebe@muhasebe';

    // 1. Check BEFORE
    echo "<h3>1. Checking Current State...</h3>";
    $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        die("❌ User not found! Please run create_accountant.php first.");
    }

    echo "Current Data: <pre>" . print_r($user, true) . "</pre>";

    // 2. FORCE UPDATE
    echo "<h3>2. Forcing Update...</h3>";
    $upd = $pdo->prepare("UPDATE users SET role = 'accountant' WHERE id = ?");
    $result = $upd->execute([$user['id']]);

    if ($result) {
        echo "✅ Update Command Executed.<br>";
    } else {
        echo "❌ Update Command Failed.<br>";
    }

    // 3. Check AFTER
    echo "<h3>3. Verifying Result...</h3>";
    $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $userAfter = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "New Data: <pre>" . print_r($userAfter, true) . "</pre>";
    
    // 4. Force Session Update (if running in same browser session)
    session_start();
    $_SESSION['user_role'] = 'accountant';
    echo "✅ Session variable manually updated to 'accountant'.";

} catch (PDOException $e) {
    echo "Create Error: " . $e->getMessage();
}
?>
