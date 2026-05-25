<?php
include 'core/database.php';
$db = (new Database())->getConnection();

// Criteria to delete the specific scenario data
$amount = 150000.00;
$userA = 2; 
$userB = 3; 
$userC = 4; // Atlas

try {
    // Delete the transactions initiated by our script
    $stmt = $db->prepare("DELETE FROM transactions WHERE amount = ? AND user_id IN (?, ?, ?) AND description LIKE '%Scenario%'");
    $stmt->execute([$amount, $userA, $userB, $userC]);
    
    // Also delete the credit mirrors (where related_user_id is the criteria or amount/desc matches)
    $stmtMirror = $db->prepare("DELETE FROM transactions WHERE amount = ? AND description LIKE '%Scenario%'");
    $stmtMirror->execute([$amount]);

    echo "Rollback Successful. All scenario data deleted.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
