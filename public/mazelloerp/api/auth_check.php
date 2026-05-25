<?php
// MAZELLO AUTHENTICATION CHECK
// Bu dosya, API'lere yetkisiz erişimi engeller.
// Session başlatılmamışsa başlatır ve 'user_id' kontrolü yapar.

if (session_status() == PHP_SESSION_NONE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => isset($_SERVER['HTTPS'])
    ]);
    session_start();
}

// Oturum yoksa
if (!isset($_SESSION['user_id'])) {
    // JSON yanıtı döndür ve durdur
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(401); // Unauthorized
    echo json_encode([
        'status' => 'error',
        'message' => 'Yetkisiz erişim! Lütfen giriş yapınız.',
        'code' => 401
    ]);
    exit; // Kodun geri kalanını çalıştırma!
}
