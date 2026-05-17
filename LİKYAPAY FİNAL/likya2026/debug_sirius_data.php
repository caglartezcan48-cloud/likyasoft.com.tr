<?php
// debug_sirius_data.php
include_once __DIR__ . '/core/database.php';
$db = (new Database())->getConnection();

echo "<h1>Sirius Data Debugger</h1>";

// 1. Check Totals
$stmt = $db->query("SELECT type, status, COUNT(*) as count FROM transactions GROUP BY type, status");
echo "<h3>Transaction Summary:</h3>";
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";

// 2. Check Sample Debts
echo "<h3>Sample Approved Debts:</h3>";
$sql = "SELECT t.id, t.type, t.amount, u1.name as from_user, u1.tax_id as from_tax, u2.name as to_user, u2.tax_id as to_tax 
        FROM transactions t
        LEFT JOIN users u1 ON t.user_id = u1.id
        LEFT JOIN users u2 ON t.related_user_id = u2.id
        WHERE t.status = 'approved' LIMIT 5";
$stmt = $db->query($sql);
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";

// 3. Check Users without Tax ID
$stmt = $db->query("SELECT id, name, tax_id FROM users WHERE tax_id IS NULL OR tax_id = ''");
echo "<h3>Users Missing Tax ID (Ignored by Engine):</h3>";
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";
?>
