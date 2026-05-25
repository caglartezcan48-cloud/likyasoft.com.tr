<?php
// check_transactions.php
include_once '../core/database.php';
$db = (new Database())->getConnection();

$stmt = $db->query("SELECT COUNT(*) as count FROM transactions WHERE type='debt' AND status='approved'");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Approved Debts: " . $row['count'] . "\n";
?>
