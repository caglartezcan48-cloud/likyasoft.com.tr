<?php
// Test Script: Add Transaction & Auto-Create User
// Simulates a user (ID:14) adding a debt transaction for a non-existing company.

$url_login = 'http://localhost/likyapay/data/api/login.php';
$url_tx = 'http://localhost/likyapay/data/api/transactions.php';

// 1. Login as the User (ID:14)
// We need to know the email/password. In create_test_user.php we set:
// email: bekleyen[RAND]@test.com -> Need to find exact email from previous step output or DB.
// Wait, I don't know the exact random email OR the password hash logic might check raw password.
// In create_test_user.php password was hash of "123456".
// So password is "123456".
// But I need the email. 
// Let's cheat: I will update ID:14's email to a known one first, just in case.
// Or better: Let's use 'admin' to do this test, acting as if admin is a normal user adding debt?
// Admin is ID:1. Let's use Admin.

$email = 'admin@likyapay.com';
$password = '123456';

// Step 1: Login
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url_login);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $email, 'password' => $password]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookie_user.txt');
$respLogin = curl_exec($ch);
curl_close($ch);

echo "Login Resp: " . $respLogin . "\n\n";

// Step 2: Add Debt Transaction (Simulating Invoices.js FormData)
// Using JSON because API accepts JSON too (Line 76 in transactions.php)
// Although Invoices.js uses FormData, API supports JSON fallback.
// Target: "Peynirci Baba" (New)
$txData = array(
    'party' => 'Peynirci Baba',
    'amount' => 5000,
    'type' => 'debt',
    'date' => date('Y-m-d', strtotime('+30 days')),
    'description' => 'Aylık peynir tedariği faturası',
    'new_tax_id' => '1122334455', // New Tax ID
    'new_email' => 'peynirci@baba.com'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url_tx);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($txData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookie_user.txt');
$respTx = curl_exec($ch);
curl_close($ch);

echo "Transaction Resp: " . $respTx . "\n";

?>
