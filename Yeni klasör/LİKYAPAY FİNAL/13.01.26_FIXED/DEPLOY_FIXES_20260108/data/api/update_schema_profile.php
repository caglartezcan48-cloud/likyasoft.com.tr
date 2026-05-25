<?php
// update_schema_profile.php
// Adds missing columns to users table for profile settings

include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "<h1>Veritabanı Güncelleniyor...</h1>";
    
    // Columns to add
    $columns = [
        "ADD COLUMN authorized_person VARCHAR(255) NULL AFTER name",
        "ADD COLUMN invoice_address TEXT NULL AFTER email",
        "ADD COLUMN address TEXT NULL AFTER invoice_address",
        "ADD COLUMN tax_office VARCHAR(100) NULL AFTER tax_id",
        "ADD COLUMN mersis_no VARCHAR(50) NULL AFTER tax_office",
        "ADD COLUMN trade_registry_no VARCHAR(50) NULL AFTER mersis_no",
        "ADD COLUMN phone VARCHAR(20) NULL AFTER email"
    ];
    
    foreach ($columns as $col) {
        try {
            // Check if column exists first to avoid error? 
            // MySQL 5.7+ doesn't support IF NOT EXISTS in ADD COLUMN easily without procedure.
            // Simple way: Attempt add, catch "Duplicate column" error and ignore.
            
            $sql = "ALTER TABLE users " . $col;
            $db->exec($sql);
            echo "<div style='color:green'>✅ " . explode(' ', $col)[2] . " eklendi.</div>";
        } catch (PDOException $e) {
            // Error 1060: Duplicate column name
            if (strpos($e->getMessage(), '1060') !== false || strpos($e->getMessage(), 'Duplicate') !== false) {
                 echo "<div style='color:orange'>ℹ️ " . explode(' ', $col)[2] . " zaten var.</div>";
            } else {
                 echo "<div style='color:red'>❌ Hata (" . explode(' ', $col)[2] . "): " . $e->getMessage() . "</div>";
            }
        }
    }
    
    echo "<br><strong>Tüm işlemler tamamlandı. check_files.php'yi silebilirsiniz.</strong>";

} catch (Exception $e) {
    echo "Genel Hata: " . $e->getMessage();
}
?>
