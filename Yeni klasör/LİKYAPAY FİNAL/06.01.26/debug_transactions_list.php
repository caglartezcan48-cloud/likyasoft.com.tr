<?php
include_once 'core/database.php';
$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, type, amount, status, created_at FROM transactions";
$stmt = $db->prepare($query);
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total Count: " . count($data) . "\n";
echo str_pad("ID", 5) . str_pad("TYPE", 10) . str_pad("AMOUNT", 15) . str_pad("STATUS", 15) . "\n";
echo str_repeat("-", 45) . "\n";

$sumDebt = 0;
$sumCredit = 0;

foreach ($data as $row) {
    echo str_pad($row['id'], 5) . 
         str_pad($row['type'], 10) . 
         str_pad($row['amount'], 15) . 
         str_pad($row['status'], 15) . "\n";

    if ($row['type'] == 'debt' && $row['status'] != 'rejected' && $row['status'] != 'cancelled') {
        $sumDebt += $row['amount'];
    }
    if ($row['type'] == 'credit' && $row['status'] != 'rejected' && $row['status'] != 'cancelled') {
        $sumCredit += $row['amount'];
    }
}

echo "\nCalculated Total Debt (excluding rejected/cancelled): " . number_format($sumDebt, 2) . "\n";
echo "Calculated Total Credit (excluding rejected/cancelled): " . number_format($sumCredit, 2) . "\n";
?>
