<?php
include_once '../../core/database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT id, name, email, role FROM users");
while($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$r['id']} | Name: {$r['name']} | Email: {$r['email']} | Role: '{$r['role']}'\n";
}
?>
