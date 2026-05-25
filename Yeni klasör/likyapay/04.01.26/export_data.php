<?php
// export_data_for_demo.php
// Exports key tables to JSON for embedding in offline HTML

include_once 'core/database.php';

$database = new Database();
$db = $database->getConnection();

$data = [];

// 1. Users
$stmt = $db->query("SELECT * FROM users");
$data['users'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2. Transactions
$stmt = $db->query("SELECT * FROM transactions ORDER BY created_at DESC");
$data['transactions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 3. Sirius Cycles
$stmt = $db->query("SELECT * FROM sirius_cycles ORDER BY id DESC");
$data['cycles'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 4. Sirius Requests
$stmt = $db->query("SELECT * FROM sirius_requests ORDER BY id DESC");
$data['requests'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($data, JSON_PRETTY_PRINT);
?>
