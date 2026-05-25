<?php
// list_cycles_no_auth.php
// Simulate list_all_cycles logic

include_once 'core/database.php';
// Note: Adjusted path assuming this file is in ROOT/data/ just like other test scripts
// If in ROOT/data/, path to core is ../core/database.php
// Let's use __DIR__ for safety.

include_once __DIR__ . '/../core/database.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$sql = "SELECT * FROM sirius_cycles ORDER BY status ASC, total_volume DESC";
$stmt = $db->prepare($sql);
$stmt->execute();
$cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($cycles as &$cycle) {
    // Decode nodes
    $nodes = json_decode($cycle['nodes'], true);
    if (!is_array($nodes)) {
        $cycle['node_names'] = ["Error parsing nodes"];
        continue;
    }
    
    $names = [];
    foreach ($nodes as $tax) {
        $nStmt = $db->prepare("SELECT name FROM users WHERE tax_id = :tax LIMIT 1");
        $nStmt->bindParam(":tax", $tax);
        $nStmt->execute();
        $res = $nStmt->fetch(PDO::FETCH_ASSOC);
        $names[] = $res['name'] ?? $tax;
    }
    $cycle['node_names'] = $names;
    $cycle['count'] = count($nodes);
}

echo json_encode(["success" => true, "data" => $cycles], JSON_PRETTY_PRINT);
?>
