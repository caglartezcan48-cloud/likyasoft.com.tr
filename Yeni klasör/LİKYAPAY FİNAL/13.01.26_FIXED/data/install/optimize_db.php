<?php
// Finalized Database Optimization Script
include_once '../../core/database.php';
$database = new Database();
$db = $database->getConnection();

$queries = [
    "CREATE INDEX IF NOT EXISTS idx_users_tax_id ON users(tax_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)",
    "CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_transactions_related_user_id ON transactions(related_user_id)",
    "CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)",
    "CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)",
    "CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_sys_tx_type ON system_transactions(type)",
    "CREATE INDEX IF NOT EXISTS idx_sys_tx_category ON system_transactions(category)",
    "CREATE INDEX IF NOT EXISTS idx_sys_tx_date ON system_transactions(date)",
    "CREATE INDEX IF NOT EXISTS idx_sirius_status ON sirius_cycles(status)"
];

header('Content-Type: text/plain');
echo "Starting Optimization (v2)...\n";
foreach ($queries as $q) {
    try {
        $db->exec($q);
        echo "Executed: $q\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "Already exists: $q\n";
        } else {
            echo "Error executing $q: " . $e->getMessage() . "\n";
        }
    }
}
echo "\nOptimization Complete.";
?>
