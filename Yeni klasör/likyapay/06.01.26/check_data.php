<?php
// Root level script
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Adjust path as needed. Assuming script is in D:\xampp\htdocs\likyapay\
// and db is in core/database.php
if (file_exists('core/database.php')) {
    require_once 'core/database.php';
} elseif (file_exists('data/db.php')) {
    require_once 'data/db.php';
} else {
    die("Database connection file not found!");
}

$database = new Database();
$db = $database->getConnection();

header('Content-Type: text/plain; charset=utf-8');

try {
    echo "=== CURRENT TIME: " . date('Y-m-d H:i:s') . " ===\n\n";

    echo "=== 1. SIRIUS CYCLES (All) ===\n";
    $stmt = $db->query("SELECT id, code, status, total_volume, nodes, payment_status, legal_status FROM sirius_cycles");
    $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($cycles as $c) {
        echo "Cycle [#{$c['id']}] Code: {$c['code']}\n";
        echo "  Status: '{$c['status']}' (Length: " . strlen($c['status']) . ")\n";
        echo "  Nodes Raw: {$c['nodes']}\n";
        echo "  Decoded Nodes: " . print_r(json_decode($c['nodes'], true), true);
        echo "  Details: Vol={$c['total_volume']}\n";
        echo "--------------------------\n";
    }

    echo "\n=== 2. USERS (Tax IDs) ===\n";
    $stmt = $db->query("SELECT id, name, tax_id FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($users as $u) {
        echo "User [ID: {$u['id']}] Name: {$u['name']} | TaxID: '{$u['tax_id']}'\n";
    }

} catch (Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage();
}
