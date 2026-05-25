<?php
// Fix Sirius Schema
// Path: data/install/fix_sirius_schema.php

include_once __DIR__ . '/../../core/database.php';

try {
    $db = (new Database())->getConnection();
    echo "Sirius Şeması Düzeltiliyor...\n";

    // 1. Add 'nodes' column if not exists
    try {
        $db->exec("ALTER TABLE sirius_cycles ADD COLUMN nodes LONGTEXT AFTER cycle_code");
        echo "- 'nodes' kolonu eklendi.\n";
    } catch (PDOException $e) {
        echo "- 'nodes' zaten var veya hata: " . $e->getMessage() . "\n";
    }

    // 2. Add 'cycle_hash' column if not exists
    try {
        $db->exec("ALTER TABLE sirius_cycles ADD COLUMN cycle_hash VARCHAR(64) AFTER id");
        echo "- 'cycle_hash' kolonu eklendi.\n";
    } catch (PDOException $e) {
        echo "- 'cycle_hash' zaten var veya hata: " . $e->getMessage() . "\n";
    }

    // 3. Make 'node_names' NULLABLE (since code doesn't fill it initially)
    try {
        $db->exec("ALTER TABLE sirius_cycles MODIFY node_names LONGTEXT NULL");
        echo "- 'node_names' NULL yapılabilir oldu.\n";
    } catch (PDOException $e) {
        echo "- 'node_names' hatası: " . $e->getMessage() . "\n";
    }
    
    // 4. Add 'updated_at' if not exists
    try {
        $db->exec("ALTER TABLE sirius_cycles ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL AFTER created_at");
         echo "- 'updated_at' kolonu eklendi.\n";
    } catch (PDOException $e) {
         echo "- 'updated_at' zaten var veya hata: " . $e->getMessage() . "\n";
    }

    echo "Şema Düzeltme Tamamlandı.\n";

} catch (Exception $e) {
    die("Genel Hata: " . $e->getMessage());
}
?>
