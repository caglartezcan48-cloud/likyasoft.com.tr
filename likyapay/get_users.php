<?php
include 'core/database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT id, name, email FROM users ORDER BY id ASC LIMIT 5");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
