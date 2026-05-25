<?php
// Fix user statuses in DB
include_once 'core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) die("Conn fail");

    // Map old/wrong statuses to Turkish ENUM values
    // ENUM('Aktif', 'Pasif', 'Ön Kayıt', 'İzinli')
    
    echo "Updating user statuses...\n";
    
    // verified -> Aktif
    $db->prepare("UPDATE users SET status = 'Aktif' WHERE status = 'verified' OR status = 'active'")->execute();
    
    // pending -> Ön Kayıt
    $db->prepare("UPDATE users SET status = 'Ön Kayıt' WHERE status = 'pending'")->execute();
    
    // banned -> Pasif
    $db->prepare("UPDATE users SET status = 'Pasif' WHERE status = 'banned' OR status = 'inactive'")->execute();

    echo "Status synchronization complete.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
