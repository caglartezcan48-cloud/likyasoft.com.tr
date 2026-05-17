<?php
// MAZELLO LOGOUT
require_once 'db.php';
header("Content-Type: application/json; charset=UTF-8");

session_destroy();

echo json_encode([
    "status" => "success",
    "message" => "Çıkış yapıldı."
]);
?>