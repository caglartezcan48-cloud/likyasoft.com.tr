<?php
// Update Schema for RBAC (Role Based Access Control)
$host = "localhost";
$db_name = "likyapay";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Add user_type column (Firma, Tedarikçi, Çalışan)
    // Note: 'employee' here refers to System/Admin Employees or Company Employees depending on context.
    $sql = "ALTER TABLE users ADD COLUMN user_type ENUM('company', 'supplier', 'employee') DEFAULT 'company' AFTER role";
    try { 
        $conn->exec($sql); 
        echo "Added user_type column.\n"; 
    } catch(Exception $e) { 
        // Ignore if exists
        echo "user_type column might already exist.\n"; 
    }

    // 2. Add permissions column (JSON String)
    $sql = "ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT NULL AFTER user_type";
    try { 
        $conn->exec($sql); 
        echo "Added permissions column.\n"; 
    } catch(Exception $e) { 
        echo "permissions column might already exist.\n"; 
    }

} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
