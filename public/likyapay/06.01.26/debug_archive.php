<?php
// Debug User Archive
include_once 'core/database.php';
header('Content-Type: text/plain');

// Simulate User ID (You might need to adjust this ID to match the user who is complaining)
// Let's assum user_id = 1 (or find a user who has completed cycles)
// Actually, let's list ALL completed cycles first, then check their nodes.

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "--- All Completed Cycles ---\n";
    $stmt = $db->query("SELECT id, nodes FROM sirius_cycles WHERE status = 'completed'");
    $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($cycles as $c) {
        echo "Cycle ID: " . $c['id'] . "\n";
        echo "Nodes Raw: " . $c['nodes'] . "\n";
        $nodes = json_decode($c['nodes'], true);
        echo "Nodes Arr: " . print_r($nodes, true) . "\n";
        echo "----------------\n";
    }

    echo "\n--- Checking User Tax IDs ---\n";
    // List first 5 users
    $stmt = $db->query("SELECT id, name, tax_id FROM users LIMIT 10");
    while($u = $stmt->fetch(PDO::FETCH_ASSOC)){
        echo "User ID: {$u['id']} | Name: {$u['name']} | Tax: {$u['tax_id']}\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
