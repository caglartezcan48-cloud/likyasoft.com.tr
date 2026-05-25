<?php
// Setup Script to Initialize Database
// Run this once by visiting http://localhost/likyapay/data/setup_db.php (Temporary location)

$host = "localhost";
$username = "root";
$password = "";

try {
    // 1. Connect to MySQL Server (No DB selected)
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Create Database
    echo "Creating database 'likyapay'...<br>";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `likyapay` CHARACTER SET utf8 COLLATE utf8_general_ci");
    echo "Database created or already exists.<br>";

    // 3. Select Database
    $pdo->exec("USE `likyapay`");

    // 4. Create Users Table (Firmalar)
    echo "Creating 'users' table...<br>";
    $sql_users = "CREATE TABLE IF NOT EXISTS `users` (
        `id` INT(11) AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) NOT NULL UNIQUE,
        `password_hash` VARCHAR(255) NOT NULL,
        `tax_number` VARCHAR(50),
        `role` ENUM('admin', 'user') DEFAULT 'user',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql_users);
    echo "Table 'users' ready.<br>";

    // 5. Create Transactions Table (Borç/Alacak İlişkileri)
    echo "Creating 'transactions' table...<br>";
    $sql_trans = "CREATE TABLE IF NOT EXISTS `transactions` (
        `id` INT(11) AUTO_INCREMENT PRIMARY KEY,
        `debtor_id` INT(11) NOT NULL,
        `creditor_id` INT(11) NOT NULL,
        `amount` DECIMAL(15, 2) NOT NULL,
        `status` ENUM('pending', 'approved', 'cleared', 'partial') DEFAULT 'pending',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`debtor_id`) REFERENCES `users`(`id`),
        FOREIGN KEY (`creditor_id`) REFERENCES `users`(`id`)
    )";
    $pdo->exec($sql_trans);
    echo "Table 'transactions' ready.<br>";

    // 6. Seed Admin User
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['admin@likyapay.com']);
    if (!$stmt->fetch()) {
        $pass = password_hash('123456', PASSWORD_DEFAULT);
        $sql_seed = "INSERT INTO users (name, email, password_hash, role) VALUES ('Likya Admin', 'admin@likyapay.com', '$pass', 'admin')";
        $pdo->exec($sql_seed);
        echo "<b>Admin user created:</b> email: admin@likyapay.com, pass: 123456<br>";
    }

    echo "<hr><b>SETUP COMPLETE!</b> You can now delete this file.";

} catch (PDOException $e) {
    die("DB ERROR: " . $e->getMessage());
}
?>
