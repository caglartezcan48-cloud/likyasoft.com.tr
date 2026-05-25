<?php
require_once __DIR__ . '/../../core/database.php';
$db = (new Database())->getConnection();

// Delete test transactions
$stmt = $db->prepare("DELETE FROM transactions WHERE description IN ('Sirius Test', 'Sirius Final Test')");
$stmt->execute();
echo "Deleted " . $stmt->rowCount() . " test transactions.\n";
