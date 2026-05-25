<?php
// Validates connection and lists users
include_once __DIR__ . '/../../core/database.php';

try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("SELECT id, name, tax_id FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($users);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
