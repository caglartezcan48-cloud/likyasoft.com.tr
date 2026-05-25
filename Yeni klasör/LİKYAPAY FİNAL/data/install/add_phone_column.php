<?php
// Path: data/install/add_phone_column.php
$root = dirname(dirname(__DIR__));
require_once $root . '/core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if column exists
    $stmt = $db->prepare("SHOW COLUMNS FROM users LIKE 'phone'");
    $stmt->execute();
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER email");
        echo "✅ 'phone' sütunu eklendi.<br>";
    } else {
        echo "'phone' sütunu zaten var.<br>";
    }

} catch (PDOException $e) {
    echo "Hata: " . $e->getMessage();
}
?>
