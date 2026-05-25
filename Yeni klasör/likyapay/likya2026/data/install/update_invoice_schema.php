<?php
include_once __DIR__ . '/../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Add columns if they don't exist
    $cols = $db->query("SHOW COLUMNS FROM transactions")->fetchAll(PDO::FETCH_COLUMN);
    
    $updates = [];
    if (!in_array('details', $cols)) {
        $db->exec("ALTER TABLE transactions ADD COLUMN details TEXT NULL DEFAULT NULL COMMENT 'JSON Line Items'");
        $updates[] = "Added 'details'";
    }
    if (!in_array('invoice_no', $cols)) {
        $db->exec("ALTER TABLE transactions ADD COLUMN invoice_no VARCHAR(50) NULL DEFAULT NULL AFTER id");
        $updates[] = "Added 'invoice_no'";
    }
    
    echo "Schema Updated: " . (empty($updates) ? "No changes needed" : implode(", ", $updates));
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
