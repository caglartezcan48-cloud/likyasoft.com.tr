<?php
// Check DB Stats (Read Only)
include_once '../../core/database.php';
try {
    $db = (new Database())->getConnection();
    $u = $db->query("SELECT count(*) FROM users")->fetchColumn();
    $t = $db->query("SELECT count(*) FROM transactions")->fetchColumn();
    $admin = $db->query("SELECT id, name, email FROM users WHERE role='admin' OR id=1")->fetch(PDO::FETCH_ASSOC);
    
    echo "Users Count: $u\n";
    echo "Transactions Count: $t\n";
    if($admin) echo "Admin Account: " . $admin['name'] . " (" . $admin['email'] . ")\n";
    else echo "WARNING: No Admin Account Found!\n";

} catch (Exception $e) { echo $e->getMessage(); }
?>
