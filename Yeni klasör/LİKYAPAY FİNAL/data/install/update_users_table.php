<?php
// Path: data/install/update_users_table.php
$root = dirname(dirname(__DIR__));
require_once $root . '/core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if column exists
    $stmt = $db->prepare("SHOW COLUMNS FROM users LIKE 'username'");
    $stmt->execute();
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE users ADD COLUMN username VARCHAR(50) DEFAULT NULL AFTER name");
        echo "Added 'username' column.<br>";
    } else {
        echo "'username' column already exists.<br>";
    }

    $stmt = $db->prepare("SHOW COLUMNS FROM users LIKE 'sector'");
    $stmt->execute();
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE users ADD COLUMN sector VARCHAR(100) DEFAULT NULL AFTER tax_id");
        echo "Added 'sector' column.<br>";
    } else {
        echo "'sector' column already exists.<br>";
    }

    echo "Kullanıcı tablosu güncellendi!";

} catch (PDOException $e) {
    echo "Hata: " . $e->getMessage();
}
?>
