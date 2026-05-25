<?php
// create_sirius_test_data.php
// Creates 3 users and a closed debt loop (A -> B -> C -> A) using REAL transactions table

include_once '../core/database.php';

echo "<h1>Sirius REAL Data Generator</h1>";

$database = new Database();
$db = $database->getConnection();

// 1. Create Users (Same as before)
$users = [
    ['name' => 'Sirius A A.Ş.', 'email' => 'siriusA@test.com', 'tax_id' => '9000000001', 'role' => 'user'],
    ['name' => 'Sirius B Ltd.', 'email' => 'siriusB@test.com', 'tax_id' => '9000000002', 'role' => 'user'],
    ['name' => 'Sirius C Holding', 'email' => 'siriusC@test.com', 'tax_id' => '9000000003', 'role' => 'user']
];

$userIds = [];

foreach ($users as $u) {
    // Check if exists
    $stmt = $db->prepare("SELECT id FROM users WHERE tax_id = :tax");
    $stmt->bindParam(":tax", $u['tax_id']);
    $stmt->execute();
    
    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $userIds[$u['tax_id']] = $row['id'];
    } else {
        // Create
        $sql = "INSERT INTO users (name, email, password, tax_id, role, status, created_at) 
                VALUES (:name, :email, :pass, :tax, :role, 'active', NOW())";
        $stmt = $db->prepare($sql);
        $pass = password_hash('123456', PASSWORD_DEFAULT);
        
        $stmt->bindParam(":name", $u['name']);
        $stmt->bindParam(":email", $u['email']);
        $stmt->bindParam(":pass", $pass);
        $stmt->bindParam(":tax", $u['tax_id']);
        $stmt->bindParam(":role", $u['role']);
        $stmt->execute();
        $userIds[$u['tax_id']] = $db->lastInsertId();
    }
}

// 2. Clear Old Data
echo "Temizlik yapılıyor...<br>";
// Delete transactions involving these users
foreach ($userIds as $uid) {
    $db->exec("DELETE FROM transactions WHERE user_id = $uid OR related_user_id = $uid");
}
$db->exec("DELETE FROM sirius_cycles"); // Clear cycles too

// 3. Create Transactions (A owes B, B owes C, C owes A)
// Logic: User A adds a 'debt' transaction saying "I owe B".
// Transactions table: user_id=A_id, related_user_id=B_id, type='debt', status='approved'

$transactions = [
    ['from_tax' => '9000000001', 'to_tax' => '9000000002', 'to_name' => 'Sirius B Ltd.', 'amount' => 5000],
    ['from_tax' => '9000000002', 'to_tax' => '9000000003', 'to_name' => 'Sirius C Holding', 'amount' => 5000],
    ['from_tax' => '9000000003', 'to_tax' => '9000000001', 'to_name' => 'Sirius A A.Ş.', 'amount' => 5000],
];

echo "<hr>Yeni 'Gerçek' Borç İşlemleri Ekleniyor:<br>";

foreach ($transactions as $t) {
    $user_id = $userIds[$t['from_tax']];
    $related_user_id = $userIds[$t['to_tax']];
    
    $sql = "INSERT INTO transactions (user_id, related_user_id, type, party_name, amount, description, status, created_at)
            VALUES (:uid, :ruid, 'debt', :party, :amount, 'Sirius Gerçek Test', 'approved', NOW())";
            
    $stmt = $db->prepare($sql);
    $stmt->bindParam(":uid", $user_id);
    $stmt->bindParam(":ruid", $related_user_id);
    $stmt->bindParam(":party", $t['to_name']);
    $stmt->bindParam(":amount", $t['amount']);
    
    if ($stmt->execute()) {
        echo "Borç Eklendi: " . $t['from_tax'] . " (Borçlu) -> " . $t['to_tax'] . " (Alacaklı) [" . $t['amount'] . " TL]<br>";
    } else {
        echo "HATA: İşlem eklenemedi.<br>";
    }
}

echo "<hr><h3>✅ Veriler Transactions Tablosuna İşlendi!</h3>";
?>
