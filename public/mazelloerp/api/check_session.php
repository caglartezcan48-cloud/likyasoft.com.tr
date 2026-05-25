<?php
// MAZELLO AUTH CHECK
require_once 'db.php';
header("Content-Type: application/json; charset=UTF-8");

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => "logged_in",
        "user" => [
            "id" => $_SESSION['user_id'],
            "rol" => $_SESSION['user_role'],
            "ad" => $_SESSION['full_name']
        ]
    ]);
} else {
    echo json_encode([
        "status" => "guest",
        "message" => "Oturum bulunamadı."
    ]);
}
?>