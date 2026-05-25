<?php
// Seed Sirius Cycle Data
// Creates a closed loop of debt: A -> B -> C -> A

$root = dirname(dirname(__DIR__));
include_once $root . '/core/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h3>🌱 Sirius Test Verisi Oluşturucu</h3>";

// 1. Clean verify existing users or create them
$users = [
    ['tax_id' => '1111111111', 'email' => 'sirius_a@test.com', 'name' => 'Sirius A A.Ş.'],
    ['tax_id' => '2222222222', 'email' => 'sirius_b@test.com', 'name' => 'Sirius B Ltd.'],
    ['tax_id' => '3333333333', 'email' => 'sirius_c@test.com', 'name' => 'Sirius C Holding'],
];

$user_ids = [];

foreach ($users as $u) {
    // Check if exists
    $stmt = $db->prepare("SELECT id FROM users WHERE tax_id = ?");
    $stmt->execute([$u['tax_id']]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $user_ids[$u['tax_id']] = $row['id'];
        echo "Kullanıcı Mevcut: {$u['name']} (ID: {$row['id']})<br>";
    } else {
        // Create
        $stmt = $db->prepare("INSERT INTO users (tax_id, email, company_name, password, role, status) VALUES (?, ?, ?, '123456', 'user', 'active')");
        $stmt->execute([$u['tax_id'], $u['email'], $u['name']]);
        $user_ids[$u['tax_id']] = $db->lastInsertId();
        echo "Kullanıcı Oluşturuldu: {$u['name']} (ID: " . $user_ids[$u['tax_id']] . ")<br>";
    }
}

// 2. Create Transactions (The Loop)
// A owes B 1000
// B owes C 1000
// C owes A 1000

$transactions = [
    ['from' => $user_ids['1111111111'], 'to' => $user_ids['2222222222'], 'amount' => 1000, 'desc' => 'Mal Alımı A->B'],
    ['from' => $user_ids['2222222222'], 'to' => $user_ids['3333333333'], 'amount' => 1000, 'desc' => 'Hizmet B->C'],
    ['from' => $user_ids['3333333333'], 'to' => $user_ids['1111111111'], 'amount' => 1000, 'desc' => 'Danışmanlık C->A'],
];

echo "<br>İşlemler Ekleniyor...<br>";

// Clear old transactions for these users to be clean
$ids_str = implode(',', array_values($user_ids));
$db->exec("DELETE FROM transactions WHERE from_user_id IN ($ids_str) OR to_user_id IN ($ids_str)");
echo "Eski veriler temizlendi.<br>";

foreach ($transactions as $t) {
    $stmt = $db->prepare("INSERT INTO transactions (from_user_id, to_user_id, amount, description, status, transaction_date) VALUES (?, ?, ?, ?, 'pending', NOW())");
    $stmt->execute([$t['from'], $t['to'], $t['amount'], $t['desc']]);
    echo "İşlem: {$t['desc']} : {$t['amount']} TL<br>";
}

echo "<br><b>✅ Mükemmel bir Sirius Döngüsü hazırlandı!</b>";
?>
