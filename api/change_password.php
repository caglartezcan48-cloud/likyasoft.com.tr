<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->new_password)) {
    $new_password = $data->new_password;
    // Güvenlik için Hash (Kriptolama)
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

    // İlk ve ana kullanıcı 'admin' kabul edilir. (Eğer admin profil adınız farklıysa değiştirebiliriz)
    $query = "UPDATE site_users SET password = :password WHERE username = 'admin'";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':password', $hashed_password);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("status" => "success", "message" => "Şifre başarıyla güncellendi."));
    } else {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => "Şifre güncellenemedi."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Yeni şifre boş olamaz."));
}
?>
