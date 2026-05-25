<?php
require_once __DIR__ . '/../../core/database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT * FROM sirius_cycles ORDER BY id DESC LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
