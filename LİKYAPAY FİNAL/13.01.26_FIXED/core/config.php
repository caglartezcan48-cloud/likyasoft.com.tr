<?php
// System Configuration for InfinityFree Server
// Path: core/config.php (Canlı Sunucu İçin)

// E-posta Ayarları (Gerekirse doldurun, boş kalabilir)
define('MAIL_METHOD', 'log'); 
define('SMTP_HOST', 'smtp.yoursite.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'user@yoursite.com');
define('SMTP_PASS', 'password');
define('SMTP_FROM', 'noreply@likyapaydemo.gt.tc');
define('SMTP_FROM_NAME', 'LikyaPay');

// Hata Gösterimi (Canlıda kapalı olmalı)
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL); 

// VERİTABANI AYARLARI (InfinityFree)
define('DB_HOST', 'sql211.infinityfree.com'); 
define('DB_NAME', 'if0_40849338_likyapay');   // Tahmini Veritabanı Adı prefix_likyapay
define('DB_USER', 'if0_40849338');            
define('DB_PASS', '17031983ist');           

define('SYSTEM_DEBUG', false);
?>
