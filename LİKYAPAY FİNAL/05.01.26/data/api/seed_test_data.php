<?php
// Seed Test Transactions for Sirius Cycle
require_once __DIR__ . '/../../core/database.php';
$db = (new Database())->getConnection();

// Users: 17 (Sirius A), 18 (Sirius B), 19 (Sirius C)
$txs = [
    [17, 18, 'debt', 'Sirius B Ltd.', 100000],
    [18, 19, 'debt', 'Sirius C Holding', 100000],
    [19, 17, 'debt', 'Sirius A A.Ş.', 100000]
];

echo "Seeding transactions...\n";

foreach ($txs as $t) {
    try {
        $stmt = $db->prepare("INSERT INTO transactions (user_id, related_user_id, type, party_name, amount, due_date, description, status, created_at) VALUES (?, ?, ?, ?, ?, NOW(), 'Sirius Final Test', 'approved', NOW())");
        $stmt->execute($t);
        echo "Inserted: " . implode(', ', $t) . "\n";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
echo "Done.\n";
