<?php
include '../../core/database.php';
$db = (new Database())->getConnection();

$stmt = $db->query("SELECT id, status, nodes, total_volume, created_at FROM sirius_cycles ORDER BY id DESC LIMIT 20");
$cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<h1>Son 20 Sirius Döngüsü</h1>";
echo "<table border='1'><tr><th>ID</th><th>Status</th><th>Nodes</th><th>Volume</th><th>Created At</th></tr>";
foreach ($cycles as $c) {
    echo "<tr>";
    echo "<td>{$c['id']}</td>";
    echo "<td>{$c['status']}</td>";
    echo "<td>{$c['nodes']}</td>";
    echo "<td>{$c['total_volume']}</td>";
    echo "<td>{$c['created_at']}</td>";
    echo "</tr>";
}
echo "</table>";
?>
