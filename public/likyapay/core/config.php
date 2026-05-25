<?php
// System Configuration for InfinityFree Server
// Path: core/config.php

// E-posta Ayarları
define('MAIL_METHOD', 'log'); 
define('SMTP_HOST', 'smtp.yoursite.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'user@yoursite.com');
define('SMTP_PASS', 'password');
define('SMTP_FROM', 'noreply@likyapaydemo.gt.tc'); // Live domain
define('SMTP_FROM_NAME', 'LikyaPay');

// AI Configuration
define('GEMINI_API_KEY', 'AIzaSyDl0h7LQ3eF08kcsV-tZBDelme3h7jXglU'); // Default Key - Change for production if needed

// Ortam Kontrolü (Daha güvenilir kontrol)
$is_localhost = false;
$whitelist = array('127.0.0.1', "::1", "localhost");

if (in_array($_SERVER['REMOTE_ADDR'], $whitelist) || strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false) {
    $is_localhost = true;
}

if ($is_localhost) {
    // LOCALHOST (XAMPP)
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'likyapay');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('SYSTEM_DEBUG', true);
} else {
    // CANLI SUNUCU (INFINITYFREE)
    ini_set('display_errors', 0); // Hataları gizle
    ini_set('display_startup_errors', 0);
    error_reporting(0);
    
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'likyasof_likya_db');
    define('DB_USER', 'likyasof_likya_user');
    define('DB_PASS', 'cagnurlikyasoft2013');
    define('SYSTEM_DEBUG', false);
}
?>
