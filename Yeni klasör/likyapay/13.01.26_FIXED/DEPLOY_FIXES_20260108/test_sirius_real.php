<?php
// test_sirius_real.php
// Uses REAL registered companies to create a test cycle.

include_once 'core/database.php';
include_once 'data/api/sirius_engine.php';

header('Content-Type: text/html; charset=utf-8');
echo "<body style='font-family: sans-serif; padding: 20px;'>";
echo "<h1>🪐 Gerçek Firmalarla Sirius Testi</h1>";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // 1. Get 3 Real Users (Companies)
    // Exclude admin, require valid tax_id
    $sql = "SELECT id, name, tax_id FROM users 
            WHERE role != 'admin' 
            AND tax_id IS NOT NULL 
            AND tax_id != '' 
            LIMIT 3";
    
    $stmt = $db->query($sql);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($users) < 3) {
        die("<h3 style='color:red'>❌ Yeterli Kullanıcı Yok!</h3><p>Sistemde en az 3 adet Vergi Numarası olan firma kayıtlı olmalıdır. Şu an kayıtlı: " . count($users) . "</p>");
    }

    echo "<h3>Seçilen Firmalar:</h3><ul>";
    foreach ($users as $u) {
        echo "<li>{$u['name']} (Vergi No: {$u['tax_id']})</li>";
    }
    echo "</ul>";

    $u1 = $users[0];
    $u2 = $users[1];
    $u3 = $users[2];

    // 2. Create Transactions (Loop: U1 -> U2 -> U3 -> U1)
    $amount = 10000; // 10.000 TL Test Loop
    
    $txs = [
        ['src' => $u1, 'dst' => $u2, 'desc' => "Sirius Test: {$u1['name']} -> {$u2['name']}"],
        ['src' => $u2, 'dst' => $u3, 'desc' => "Sirius Test: {$u2['name']} -> {$u3['name']}"],
        ['src' => $u3, 'dst' => $u1, 'desc' => "Sirius Test: {$u3['name']} -> {$u1['name']}"],
    ];

    echo "<h3>İşlemler Oluşturuluyor...</h3>";
    
    $addedCount = 0;
    foreach ($txs as $tx) {
        // Check duplicate to prevent mess
        $check = $db->prepare("SELECT id FROM transactions WHERE user_id = ? AND related_user_id = ? AND amount = ? AND status = 'Onaylandı'");
        $check->execute([$tx['src']['id'], $tx['dst']['id'], $amount]);
        
        if ($check->rowCount() == 0) {
            $ins = $db->prepare("INSERT INTO transactions (user_id, related_user_id, type, amount, description, date, due_date, status, created_at) 
                                 VALUES (?, ?, 'debt', ?, ?, CURDATE(), CURDATE(), 'Onaylandı', NOW())");
            $ins->execute([$tx['src']['id'], $tx['dst']['id'], $amount, $tx['desc']]);
            echo "✅ Eklendi: " . $tx['desc'] . "<br>";
            $addedCount++;
        } else {
            echo "ℹ️ Zaten var: " . $tx['desc'] . "<br>";
        }
    }

    if ($addedCount == 0) {
         echo "<p><em>Yeni işlem eklenmedi, mevcut veriler kullanılıyor.</em></p>";
    }

    echo "<hr><h3>🚀 Sirius Motoru Çalıştırılıyor...</h3>";

    // 3. Run Engine
    $engine = new SiriusEngine();
    $result = $engine->run();

    if ($result['success']) {
        echo "<div style='background:#e6fffa; padding:15px; border:1px solid green; border-radius:10px;'>";
        echo "<h2 style='color:green; margin:0;'>🎉 BAŞARILI: DÖNGÜ BULUNDU!</h2>";
        echo "<p>Sistem <strong>" . count($result['cycles']) . "</strong> adet döngü tespit etti.</p>";
        
        foreach ($result['cycles'] as $cycle) {
            echo "<strong>Döngü ID:</strong> " . substr($cycle['cycle_hash'], 0, 8) . "...<br>";
             echo "<strong>Hacim:</strong> " . number_format($cycle['volume'], 2) . " TL<br>";
             echo "<strong>Katılımcılar:</strong> " . implode(" -> ", $cycle['nodes']) . "<br>";
        }
        echo "</div>";
        echo "<p>Şimdi <strong>Admin Paneli > Sirius İşlemleri</strong> veya ilgili kullanıcıların panellerinden süreci yönetebilirsiniz.</p>";
    } else {
        echo "<div style='background:#fff5f5; padding:15px; border:1px solid red; border-radius:10px;'>";
        echo "<h3 style='color:red; margin:0;'>⚠️ Döngü Bulunamadı</h3>";
        echo "<p>Sebep: " . $result['message'] . "</p>";
        echo "<small>Not: Eğer firmalar daha önce başka bir döngüde kullanıldıysa 'bloklu' olabilirler. Bu durumda transactions tablosunu temizlemeniz gerekebilir.</small>";
        echo "</div>";
    }

} catch (Exception $e) {
    echo "<h1>HATA</h1>" . $e->getMessage();
}
echo "</body>";
?>
