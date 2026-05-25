<?php
include_once 'core/database.php';
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("❌ Connection failed!");
}

echo "✅ Connected to database: " . DB_NAME . "\n";

try {
    $query = "SELECT id, name, email, role, status FROM users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    echo "Users found: " . $stmt->rowCount() . "\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: " . $row['id'] . " | Name: " . $row['name'] . " | Email: " . $row['email'] . " | Role: " . $row['role'] . " | Status: " . $row['status'] . "\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
