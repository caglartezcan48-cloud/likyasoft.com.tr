<?php
// Update Schema for Employee Roles & Finances
$host = "localhost";
$db_name = "likyapay";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Add employee_role column
    $sql = "ALTER TABLE users ADD COLUMN employee_role ENUM('white_collar', 'blue_collar') DEFAULT 'white_collar' AFTER user_type";
    try { 
        $conn->exec($sql); 
        echo "Added employee_role column.\n"; 
    } catch(Exception $e) { 
        echo "employee_role column might already exist.\n"; 
    }

    // 2. Add Salary & Balance columns (Quick implementation for demo)
    // In a real huge system, this would be a separate 'salaries' table, but for now putting it in users is efficient.
    $sql = "ALTER TABLE users ADD COLUMN salary DECIMAL(15,2) DEFAULT 0.00 AFTER permissions, 
            ADD COLUMN salary_balance DECIMAL(15,2) DEFAULT 0.00 AFTER salary";
    try { 
        $conn->exec($sql); 
        echo "Added salary & balance columns.\n"; 
    } catch(Exception $e) { 
        echo "Finance columns might already exist.\n"; 
    }

} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
