<?php
// VERİTABANI AYARLARI (InfinityFree - CANLI SUNUCU)
// Bu dosyayı sunucuya atarken adını 'config.php' yapın.

define('MAIL_METHOD', 'log'); 
define('SMTP_HOST', 'smtp.yoursite.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'user@yoursite.com');
define('SMTP_PASS', 'password');
define('SMTP_FROM', 'noreply@likyapaydemo.gt.tc'); // Güncel domain
define('SMTP_FROM_NAME', 'LikyaPay');

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL); 

define('DB_HOST', 'sql211.infinityfree.com'); 
define('DB_NAME', 'if0_40849338_likyapay');   
define('DB_USER', 'if0_40849338');            
define('DB_PASS', '17031983ist');           

define('SYSTEM_DEBUG', false);
?>
