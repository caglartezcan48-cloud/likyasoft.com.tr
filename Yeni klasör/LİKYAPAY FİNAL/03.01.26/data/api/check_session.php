<?php
// Check Session API
// Path: data/api/check_session.php

include_once '../../core/cors.php';

// Start Session
session_start();

error_reporting(0);
ini_set('display_errors', 0);

handleCors();

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode(array(
        "success" => true,
        "user" => array(
            "id" => $_SESSION['user_id'],
            "name" => $_SESSION['user_name'],
            "role" => $_SESSION['user_role'],
            "account_type" => $_SESSION['user_type'] ?? 'company',
            "permissions" => $_SESSION['user_permissions'] ?? null
        )
    ));
} else {
    echo json_encode(array(
        "success" => false,
        "message" => "Oturum bulunamadı."
    ));
}
?>
