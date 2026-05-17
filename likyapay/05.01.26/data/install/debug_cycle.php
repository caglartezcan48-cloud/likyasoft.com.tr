<?php
// Debug Cycle Status
include_once '../../core/database.php';

$database = new Database();
$db = $database->getConnection();

$code = $argv[1] ?? 'pay030126-01';

$stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE cycle_code = :code");
$stmt->execute([':code' => $code]);
$cycle = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$cycle) {
    echo "Cycle not found: $code\n";
    // Try by ID implies looking at all
    $stmt = $db->query("SELECT id, cycle_code FROM sirius_cycles LIMIT 5");
    echo "Available cycles:\n";
    foreach($stmt->fetchAll() as $c) echo $c['cycle_code'] . "\n";
    exit;
}

echo "Cycle: " . $cycle['cycle_code'] . " (ID: " . $cycle['id'] . ")\n";
echo "--------------------------------------------------\n";
echo "Payment Status (Raw JSON):\n";
echo $cycle['payment_status'] . "\n\n";

echo "Legal Status (Raw JSON):\n";
echo $cycle['legal_status'] . "\n\n";

$ps = json_decode($cycle['payment_status'], true);
$ls = json_decode($cycle['legal_status'], true);
$nodes = json_decode($cycle['node_names'], true);

echo "Analysis:\n";
foreach ($ps as $tax => $status) {
    echo "Tax ID [$tax]: Payment = $status\n";
}

// Check for missing participants?
// We need to know who the participants are. 
// Usually node_names doesn't have tax IDs. details or nodes column does.
// Let's check nodes if available. Unfortunately I selected node_names.
// But details has 'from'/'to' which are tax IDs.

$details = json_decode($cycle['details'], true);
$participants = [];
foreach($details as $d) {
    if (!in_array($d['from'], $participants)) $participants[] = $d['from'];
}

echo "\nParticipants vs Status:\n";
foreach ($participants as $p) {
    $pStat = $ps[$p] ?? 'MISSING';
    $lStat = $ls[$p] ?? 'MISSING';
    echo "User [$p]: Payment=[$pStat], Legal=[$lStat]\n";
}

?>
