<?php
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
include 'core/database.php';
$db = (new Database())->getConnection();

// Check 'completed' status variants
$sql = "SELECT id, status, nodes, total_volume, updated_at FROM sirius_cycles WHERE status IN ('completed', 'COMPLETED', 'complete', 'COMPLETE')";
$stmt = $db->query($sql);
$cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<h1>Tamamlanan Döngüler (" . count($cycles) . ")</h1>";
echo "<pre>" . print_r($cycles, true) . "</pre>";
?>
