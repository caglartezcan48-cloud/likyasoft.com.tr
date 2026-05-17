<?php
// Create Sirius Test Data (Sector Synergy Verification)
// Path: data/create_sirius_test_data.php

include_once '../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "<h1>Sirius Test Verisi Oluşturuluyor...</h1>";

    // 1. Clean up old test data (optional, but good for clean state)
    // $db->exec("DELETE FROM users WHERE email LIKE '%@test.com'");
    // $db->exec("DELETE FROM transactions WHERE description LIKE '%[TEST]%'");

    // 2. Define Sectors and Companies
    $sectors = [
        'insaat' => ['Yapı Market A.Ş.', 'Çimento Beton Ltd.', 'Demir Çelik Sanayi'],
        'gida'  => ['Organik Tarım A.Ş.', 'Toptan Gıda Ltd.', 'Süpermarket Zinciri A.Ş.'],
        'lojistik' => ['Hızlı Kargo Ltd.', 'Depolama Çözümleri A.Ş.', 'Nakliye Koop.']
    ];

    $createdUsers = [];

    foreach ($sectors as $sectorCode => $companies) {
        foreach ($companies as $index => $compName) {
            $taxId = rand(1000000000, 9999999999);
            $email = strtolower(str_replace([' ', '.', 'ş', 'ç', 'ı', 'ğ', 'ü', 'ö'], ['-', '', 's', 'c', 'i', 'g', 'u', 'o'], $compName)) . "@test.com";
            
            // Check existence
            $check = $db->prepare("SELECT id FROM users WHERE email = ?");
            $check->execute([$email]);
            $exists = $check->fetch(PDO::FETCH_ASSOC);

            if ($exists) {
                $uid = $exists['id'];
                echo "Mevcut: $compName ($sectorCode)<br>";
                 // Update sector just in case
                $upd = $db->prepare("UPDATE users SET sector = ? WHERE id = ?");
                $upd->execute([$sectorCode, $uid]);
            } else {
                // Register
                $sql = "INSERT INTO users (name, email, password, tax_id, sector, status, role, user_type, created_at) 
                        VALUES (:name, :email, :pass, :tax, :sector, 'Aktif', 'user', 'kurumsal', NOW())";
                $stmt = $db->prepare($sql);
                $stmt->execute([
                    ':name' => $compName,
                    ':email' => $email,
                    ':pass' => password_hash('123456', PASSWORD_DEFAULT),
                    ':tax' => $taxId,
                    ':sector' => $sectorCode
                ]);
                $uid = $db->lastInsertId();
                echo "<b>Eklendi:</b> $compName ($sectorCode) - ID: $uid<br>";
            }
            $createdUsers[$sectorCode][$index] = $uid;
        }
    }

    // 3. Create Cycles (Transactions)
    // Insaat Cycle: A -> B -> C -> A (Strong Synergy)
    $insaat = $createdUsers['insaat'];
    createTransaction($db, $insaat[0], $insaat[1], 150000, "Hazır Beton Alımı [TEST]");
    createTransaction($db, $insaat[1], $insaat[2], 150000, "Çelik Konstrüksiyon [TEST]");
    createTransaction($db, $insaat[2], $insaat[0], 150000, "Taahhüt Ödemesi [TEST]");

    // Mixed Cycle: Gida1 -> Lojistik1 -> Insaat2 -> Gida1 (Weak Synergy)
    $gida = $createdUsers['gida'];
    $lojistik = $createdUsers['lojistik'];
    
    createTransaction($db, $gida[0], $lojistik[0], 50000, "Lojistik Hizmeti [TEST]");
    createTransaction($db, $lojistik[0], $insaat[1], 50000, "Depo İnşaatı [TEST]"); // Cross sector
    createTransaction($db, $insaat[1], $gida[0], 50000, "Yemek Hizmeti [TEST]"); // Cross sector

    echo "<hr><h3>İşlem Tamamlandı!</h3>";
    echo "<p>Artık Sirius Motorunu çalıştırıp 'Sektör Uyumu' puanlarını karşılaştırabilirsiniz.</p>";
    echo "<a href='api/sirius.php?action=run_engine' target='_blank'>Motoru Çalıştır (JSON)</a>";

} catch (Exception $e) {
    die("Hata: " . $e->getMessage());
}

function createTransaction($db, $fromId, $toId, $amount, $desc) {
    // Check if exists
    $check = $db->prepare("SELECT id FROM transactions WHERE user_id = ? AND related_user_id = ? AND amount = ? AND description = ?");
    $check->execute([$fromId, $toId, $amount, $desc]);
    if ($check->rowCount() > 0) return;

    // Debt Record (From owes To)
    $sql = "INSERT INTO transactions (user_id, related_user_id, type, amount, description, status, created_at) 
            VALUES (?, ?, 'debt', ?, ?, 'approved', NOW())";
    $db->prepare($sql)->execute([$fromId, $toId, $amount, $desc]);

    // Credit Record (To is owed by From)
    $sql2 = "INSERT INTO transactions (user_id, related_user_id, type, amount, description, status, created_at) 
            VALUES (?, ?, 'credit', ?, ?, 'approved', NOW())";
    $db->prepare($sql2)->execute([$toId, $fromId, $amount, $desc]);
    
    echo "Fatura Kesildi: User $fromId -> User $toId ($amount TL)<br>";
}
?>
