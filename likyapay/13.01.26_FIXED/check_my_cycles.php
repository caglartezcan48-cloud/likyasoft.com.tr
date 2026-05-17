<?php
// check_my_cycles.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
include 'core/database.php';
$database = new Database();
$db = $database->getConnection();

$user_id = $_SESSION['user_id'] ?? 49; // Default to 49 (Simya) if not set, for testing

echo "User ID: $user_id<br>";

// 1. Get User Tax ID
$stmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
$stmt->execute([':uid' => $user_id]);
$uInfo = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$uInfo || empty($uInfo['tax_id'])) {
    die("Tax ID Empty or User Not Found");
}

$myTaxId = (string)$uInfo['tax_id'];
echo "My Tax ID: '$myTaxId'<br>";

// 2. Fetch Completed Cycles
$sql = "SELECT * FROM sirius_cycles WHERE status IN ('completed', 'COMPLETED', 'complete', 'COMPLETE')";
echo "SQL: $sql<br>";
$stmt = $db->query($sql);
$cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Found " . count($cycles) . " completed cycles.<br>";

foreach ($cycles as $c) {
    echo "Cycle #{$c['id']} Nodes: " . $c['nodes'] . "<br>";
    $nodes = json_decode($c['nodes'], true);
    if (!is_array($nodes)) {
        echo "Nodes is not array.<br>";
        continue;
    }
    
    $found = false;
    foreach ($nodes as $node) {
        $nodeStr = trim((string)$node);
        $myTaxStr = trim($myTaxId);
        echo " - Comparing '$nodeStr' vs '$myTaxStr' -> ";
        if ($nodeStr === $myTaxStr) {
            echo "MATCH!<br>";
            $found = true;
            break;
        } else {
            echo "no<br>";
        }
    }
    
    if ($found) {
        echo "CYCLE FOUND FOR USER<br>";
    }
}
?>
