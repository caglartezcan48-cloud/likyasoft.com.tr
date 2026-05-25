<?php
// V3 Script to bypass cache
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'core/database.php';

$database = new Database();
$db = $database->getConnection();

header('Content-Type: text/plain; charset=utf-8');

try {
    echo "=== CURRENT TIME: " . date('Y-m-d H:i:s') . " ===\n\n";

    echo "=== 1. SIRIUS CYCLES (All) ===\n";
    $stmt = $db->query("SELECT * FROM sirius_cycles");
    $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($cycles as $c) {
        $id = $c['id'];
        $code = $c['cycle_code'] ?? $c['code'] ?? 'UNDEFINED';
        $status = $c['status'];
        $nodes = $c['nodes'];
        $vol = $c['total_volume'];
        
        echo "Cycle [#$id] Code: $code\n";
        echo "  Status: '$status' (Len: " . strlen($status) . ")\n";
        echo "  Nodes Raw: $nodes\n";
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
