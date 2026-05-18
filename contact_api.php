<?php
// contact_api.php
// Path: contact_api.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Read raw body
$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => 'Geçersiz veri gönderildi.'
    ]);
    exit;
}

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$subject = trim($data['subject'] ?? '');
$message = trim($data['message'] ?? '');

// Simple validations
if (empty($name) || empty($email) || empty($phone) || empty($subject) || empty($message)) {
    echo json_encode([
        'success' => false,
        'message' => 'Lütfen tüm alanları eksiksiz doldurun.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Lütfen geçerli bir e-posta adresi girin.'
    ]);
    exit;
}

// Build log entry
$logEntry = [
    'id' => uniqid(),
    'timestamp' => date('Y-m-d H:i:s'),
    'name' => htmlspecialchars($name),
    'email' => htmlspecialchars($email),
    'phone' => htmlspecialchars($phone),
    'subject' => htmlspecialchars($subject),
    'message' => htmlspecialchars($message),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

// Target file
$logFile = __DIR__ . '/uploads/client_inquiries.json';

// Ensure directory exists
if (!is_dir(__DIR__ . '/uploads')) {
    mkdir(__DIR__ . '/uploads', 0755, true);
}

// Read existing inquiries
$existingData = [];
if (file_exists($logFile)) {
    $existingRaw = file_get_contents($logFile);
    $existingDecoded = json_decode($existingRaw, true);
    if (is_array($existingDecoded)) {
        $existingData = $existingDecoded;
    }
}

// Append new entry
$existingData[] = $logEntry;

// Save back
if (file_put_contents($logFile, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode([
        'success' => true,
        'message' => 'Talebiniz başarıyla kaydedildi. En kısa sürede iletişime geçeceğiz.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Dosya kayıt hatası oluştu.'
    ]);
}
?>
