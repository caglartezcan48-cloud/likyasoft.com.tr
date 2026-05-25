<?php
require_once __DIR__ . '/../../core/database.php';

try {
    $db = (new Database())->getConnection();
    echo "Updating sirius_cycles schema...\n";

    // Add payment_status column if not exists
    try {
        $db->query("SELECT payment_status FROM sirius_cycles LIMIT 1");
        echo "Column 'payment_status' already exists.\n";
    } catch (PDOException $e) {
        $db->query("ALTER TABLE sirius_cycles ADD COLUMN payment_status TEXT DEFAULT NULL COMMENT 'JSON: {tax_id: status, ...}'");
        echo "Added 'payment_status' column.\n";
    }

    // Add legal_status column if not exists
    try {
        $db->query("SELECT legal_status FROM sirius_cycles LIMIT 1");
        echo "Column 'legal_status' already exists.\n";
    } catch (PDOException $e) {
        $db->query("ALTER TABLE sirius_cycles ADD COLUMN legal_status TEXT DEFAULT NULL COMMENT 'JSON: {tax_id: status, ...}'");
        echo "Added 'legal_status' column.\n";
    }

    // Update status column enum/length to allow new statuses if strictly defined, usually VARCHAR is safe
    // We will use statuses: 'detected', 'payment_stage', 'legal_stage', 'completed', 'approved' (legacy)
    // Just ensuring it's enough length.
    $db->query("ALTER TABLE sirius_cycles MODIFY COLUMN status VARCHAR(50) DEFAULT 'detected'");
    echo "Updated 'status' column definition.\n";

    echo "Schema update completed.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
