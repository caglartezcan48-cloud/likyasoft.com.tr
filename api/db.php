<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if (php_sapi_name() !== 'cli' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$is_localhost = false;
if (php_sapi_name() === 'cli') {
    $is_localhost = true;
} else {
    $whitelist = array('127.0.0.1', "::1", "localhost");
    if (in_array($_SERVER['REMOTE_ADDR'] ?? '', $whitelist) || strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false) {
        $is_localhost = true;
    }
}

if ($is_localhost) {
    $host = "localhost";
    $db_name = "likyasoft_db";
    $username = "root";
    $password = "";
} else {
    // CANLI SUNUCU
    $host = "localhost"; // Genelde cPanel sunucularında localhost kalır
    $db_name = "likyasof_likya_db";
    $username = "likyasof_likya_user";
    $password = "cagnurlikyasoft2013";
}

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $exception) {
    if ($is_localhost) {
        error_log("Bağlantı hatası: " . $exception->getMessage());
    }
}
?>
