<?php
// test_sirius_setup.php
// Creates a closed loop of test data and runs Sirius Engine

include_once 'core/database.php';
include_once 'data/api/sirius_engine.php';

echo "<h1>irket Sirius Test Kurulumu</h1>";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // 1. Create 3 Test Users (if not exist)
    $users = [
        ['name' => 'Sirius Test A', 'email' => 'testA@sirius.com', 'tax_id' => '999001', 'password' => '123456'],
        ['name' => 'Sirius Test B', 'email' => 'testB@sirius.com', 'tax_id' => '999002', 'password' => '123456'],
        ['name' => 'Sirius Test C', 'email' => 'testC@sirius.com', 'tax_id' => '999003', 'password' => '123456']
    ];

    $userMap = []; // Tax ID => User ID

    foreach ($users as $u) {
        // Check exist
        $stmt = $db->prepare("SELECT id FROM users WHERE tax_id = ?");
        $stmt->execute([$u['tax_id']]);
        $exist = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($exist) {
            $id = $exist['id'];
            echo "Kullanıcı mevcut: {$u['name']} (ID: $id)<br>";
        } else {
            // Create
            $sql = "INSERT INTO users (name, email, password, role, tax_id, status, user_type, created_at) 
                    VALUES (:name, :email, :pass, 'user', :tax, 'Aktif', 'company', NOW())";
            $ins = $db->prepare($sql);
            $hash = password_hash($u['password'], PASSWORD_DEFAULT);
            $ins->execute([
                ':name' => $u['name'], 
                ':email' => $u['email'], 
                ':pass' => $hash, 
                ':tax' => $u['tax_id']
            ]);
            $id = $db->lastInsertId();
            echo "✅ Kullanıcı oluşturuldu: {$u['name']} (ID: $id)<br>";
        }
        $userMap[$u['tax_id']] = $id;
    }

    $idA = $userMap['999001'];
    $idB = $userMap['999002'];
    $idC = $userMap['999003'];

    // 2. Create Transactions (A -> B -> C -> A) Loop implies:
    // A owes B
    // B owes C
    // C owes A
    // All amount: 50.000 TL
    
    $txs = [
        ['src' => $idA, 'dst' => $idB, 'amount' => 50000, 'desc' => 'Test Borç A->B'],
        ['src' => $idB, 'dst' => $idC, 'amount' => 50000, 'desc' => 'Test Borç B->C'],
        ['src' => $idC, 'dst' => $idA, 'amount' => 50000, 'desc' => 'Test Borç C->A'],
    ];

    foreach ($txs as $tx) {
        // Check duplicate to avoid spamming if run multiple times
        $check = $db->prepare("SELECT id FROM transactions WHERE user_id = ? AND related_user_id = ? AND amount = ? AND status = 'Onaylandı'");
        $check->execute([$tx['src'], $tx['dst'], $tx['amount']]);
        if ($check->rowCount() > 0) {
            echo "İşlem zaten var: {$tx['desc']}<br>";
            continue;
        }

        // Insert DEBT record
        $sql = "INSERT INTO transactions (user_id, related_user_id, type, amount, description, date, due_date, status, created_at) 
                VALUES (?, ?, 'debt', ?, ?, CURDATE(), CURDATE(), 'Onaylandı', NOW())";
        $stmt = $db->prepare($sql);
        $stmt->execute([$tx['src'], $tx['dst'], $tx['amount'], $tx['desc']]);
        echo "✅ İşlem oluşturuldu: {$tx['desc']}<br>";
        
        // Mirror CREDIT record? 
        // Typically system creates mirrored records but engine reads DEBT type from anyone.
        // But let's create mirrored for consistency if needed. 
        // Assuming Engine logic:
        // "WHERE t.status IN ('approved', 'Onaylandı') AND t.amount > 0"
        // It joins users on UserID and RelatedID.
        // It handles both debt and credit types in `buildGraph`.
        // So a single DEBT record per pair is sufficient to establish the link A->B.
    }

    echo "<hr><h3>Veriler Hazır. Sirius Motoru Çalıştırılıyor...</h3>";

    // 3. Run Engine
    $engine = new SiriusEngine();
    $result = $engine->run();

    echo "<pre>" . json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
    
    if ($result['success']) {
        echo "<h2 style='color:green'>🎉 DÖNGÜ BULUNDU!</h2>";
        echo "Admin panelinden veya kullanıcı panellerinden (Test hesapları ile) kontrol edebilirsiniz.";
    } else {
        echo "<h2 style='color:orange'>⚠️ Döngü Bulunamadı (Veya zaten bulunmuş/bloklanmış).</h2>";
        echo "Not: Daha önce bulunan döngülerdeki firmalar 'bloklu' olur ve tekrar döngüye girmez.";
    }

} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
