<?php
// Cleanup Script: Keep Only Admin and Bakkal
include_once '../../core/database.php';

try {
    $db = (new Database())->getConnection();

    echo "Cleaning up users, keeping Admin (ID 1) and Bakkal (ID 10)...\n";

    // Delete users who are NOT ID 1 and NOT ID 10
    // Also matching by email to be extra safe if IDs shifted (though unlikely with previous dump)
    $query = "DELETE FROM users 
              WHERE id != 1 
              AND id != 10 
              AND email != 'admin@likyapay.com' 
              AND email != 'bakkal@bakkal'";
              
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $count = $stmt->rowCount();
    echo "Deleted $count users.\n";

    // Verify remaining
    $stmt = $db->query("SELECT id, name, email FROM users");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "Remaining: [{$row['id']}] {$row['name']} ({$row['email']})\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
