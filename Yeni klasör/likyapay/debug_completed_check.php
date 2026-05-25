<?php
require_once __DIR__ . '/core/database.php';

header('Content-Type: text/plain');

try {
    echo "=== Completed Sirius Cycles ===\n";
    $stmt = $db->query("SELECT id, code, status, updated_at, nodes FROM sirius_cycles WHERE status = 'completed'");
    $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($cycles) . " completed cycles.\n";

    foreach ($cycles as $c) {
        echo "[ID: {$c['id']}] Code: {$c['code']} | Status: {$c['status']} | Updated: {$c['updated_at']}\n";
        echo "Nodes: " . $c['nodes'] . "\n";
        echo "--------------------------------\n";
    }

    echo "\n=== Users ===\n";
    $stmt = $db->query("SELECT id, name, tax_id FROM users WHERE tax_id IN (1234567890, 5555566666, 9876543210)");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $u) {
        echo "User: {$u['name']} (ID: {$u['id']}, Tax: {$u['tax_id']})\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
