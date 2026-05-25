<?php
// Logout API
// Path: data/api/logout.php

include_once '../../core/cors.php';

session_set_cookie_params(0, '/');
session_start();
handleCors();

// Unset all session values
$_SESSION = array();

// If it's desired to kill the session, also delete the session cookie.
// Note: This will destroy the session, and not just the session data!
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        '/', $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Finally, destroy the session.
session_destroy();

echo json_encode(array("success" => true));
?>
