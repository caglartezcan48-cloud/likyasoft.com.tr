<?php
// System Configuration
// Path: core/config.php

define('MAIL_METHOD', 'log'); // Options: log, mail, smtp
define('SMTP_HOST', 'smtp.example.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'user@example.com');
define('SMTP_PASS', 'password');
define('SMTP_FROM', 'noreply@likyapay.com');
define('SMTP_FROM_NAME', 'LikyaPay');

// PRODUCTION DATABSE CREDENTIALS (InfinityFree)
define('DB_HOST', 'sql211.infinityfree.com');
define('DB_NAME', 'if0_40849338_likyapay');
define('DB_USER', 'if0_40849338');
define('DB_PASS', '17031983ist');

define('SYSTEM_DEBUG', false); // Turn off debug for production
