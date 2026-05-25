<?php
include 'core/database.php';
$db = (new Database())->getConnection();

// Scenario Participants
$userA = 2; // Celiksan
$userB = 3; // Mega Yapi
$userC = 4; // Atlas Lojistik

// Amount
$amount = 150000.00;

// Transactions to Insert (A->B, B->C, C->A)
$transactions = [
    ['debtor' => $userA, 'creditor' => $userB, 'desc' => 'Demir Çelik Alımı (Scenario)', 'party' => 'Mega Yapı'],
    ['debtor' => $userB, 'creditor' => $userC, 'desc' => 'Lojistik Hizmet Bedeli (Scenario)', 'party' => 'Atlas Lojistik'],
    ['debtor' => $userC, 'creditor' => $userA, 'desc' => 'Enerji Proje Danışmanlığı (Scenario)', 'party' => 'Çeliksan A.Ş']
];

try {
    $db->beginTransaction();

    foreach ($transactions as $tx) {
        $stmt = $db->prepare("INSERT INTO transactions (user_id, type, amount, status, party, description, related_user_id, date) VALUES (?, 'debt', ?, 'approved', ?, ?, ?, CURDATE())");
        $stmt->execute([$tx['debtor'], $amount, $tx['party'], $tx['desc'], $tx['creditor']]);
        
        // Mirror transaction for Creditor (Optional but good for data consistency if app logic expects it)
        // Actually, Sirius engine looks for 'debt' records primarily. 
        // But for User B to see his 'Receivable', he needs a 'credit' record.
        // Let's rely on Sirius Engine logic which might use link. 
        // However, usually one record per transaction with 'type=debt' for debtor is primary. 
        // Let's add the credit record too to be safe and consistent with app logic.
        
        // Find Party Name for Mirror
        $stmtName = $db->prepare("SELECT name FROM users WHERE id = ?");
        $stmtName->execute([$tx['debtor']]);
        $debtorName = $stmtName->fetchColumn();

        $stmtCredit = $db->prepare("INSERT INTO transactions (user_id, type, amount, status, party, description, related_user_id, date) VALUES (?, 'credit', ?, 'approved', ?, ?, ?, CURDATE())");
        $stmtCredit->execute([$tx['creditor'], $amount, $debtorName, $tx['desc'], $tx['debtor']]);
    }

    $db->commit();
    echo "Scenario Setup Complete! created 3-way cycle for 150,000 TL.";

} catch (Exception $e) {
    $db->rollBack();
    echo "Error: " . $e->getMessage();
}
?>
