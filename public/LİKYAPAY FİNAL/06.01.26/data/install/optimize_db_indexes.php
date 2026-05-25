<?php
// PATH: data/install/optimize_db_indexes.php
include_once '../../core/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $indexes = [
        "system_transactions" => ["status", "date", "entity_name"],
        "transactions" => ["user_id", "type", "date", "status"],
        "users" => ["email", "tax_id", "role"],
        "sirius_cycles" => ["status", "cycle_code"]
    ];

    foreach ($indexes as $table => $cols) {
        foreach ($cols as $col) {
            // Check if index exists
            $indexName = "idx_{$table}_{$col}";
            $check = $conn->query("SHOW INDEX FROM $table WHERE Key_name = '$indexName'");
            if ($check->rowCount() == 0) {
                try {
                    $conn->exec("ALTER TABLE $table ADD INDEX $indexName ($col)");
                    echo "Added index $indexName to $table\n";
                } catch(Exception $e) {
                    echo "Failed to add index $indexName: " . $e->getMessage() . "\n";
                }
            } else {
                echo "Index $indexName already exists.\n";
            }
        }
    }
    echo "Optimization Complete.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
