<?php
require_once 'api/db.php';
try {
    $stmt = $conn->query("SELECT username, password FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
