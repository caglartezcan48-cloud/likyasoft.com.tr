<?php
// Test Script for Update User API
// Simulates a curl request to update_user.php

$url = 'http://localhost/likyapay/data/api/update_user.php';

// Data to update (Simulating Frontend Form)
// ID 14 was created in previous steps
$data = array(
    'id' => 14,
    'companyName' => 'Test Güncellendi A.Ş.',
    'status' => 'verified', // Changing from pending to verified
    'phone' => '(555) 999 88 77'
);

// We need to simulate Admin Session for this to work
// Since we can't easily fake session in curl without cookies, 
// let's temporarily modify update_user.php to bypass session check OR 
// use a direct PHP include method to test logic.

// Method 2: Direct Include & Mock Session
$_SESSION['user_role'] = 'admin';
$_SERVER['REQUEST_METHOD'] = 'POST';

// Mock Input
// We can't overwrite php://input easily.
// So let's use Curl properly, but we need to login first?
// Or we can just disable security in update_user.php for a second?
// Better: Update the file content momentarily? No, risky.

// Let's use the local file execution trick by setting variables manually? No.

// Proper way:
// 1. Login as Admin via cURL to get cookie
// 2. Use cookie to call update_user.php

// Step 1: Login
$loginUrl = 'http://localhost/likyapay/data/api/login.php';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $loginUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@likyapay.com', 'password' => '123456']));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookie.txt');
$response = curl_exec($ch);
curl_close($ch);

echo "Login Response: " . $response . "\n\n";

// Step 2: Update
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookie.txt'); // Use the cookie
$response = curl_exec($ch);
curl_close($ch);

echo "Update Response: " . $response . "\n";

?>
