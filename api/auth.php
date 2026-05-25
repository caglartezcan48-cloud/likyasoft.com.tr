<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

$raw_input = file_get_contents("php://input");
$data = json_decode($raw_input);

if (!empty($data->username) && !empty($data->password)) {
    $username = $data->username;
    $password = $data->password;

    $query = "SELECT id, username, password FROM site_users WHERE username = :username LIMIT 0,1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($password, $row['password'])) {
            http_response_code(200);
            echo json_encode(array(
                "status" => "success",
                "message" => "Giriş başarılı.",
                "user" => array(
                    "id" => $row['id'],
                    "username" => $row['username']
                )
            ));
        } else {
            http_response_code(401);
            echo json_encode(array("status" => "error", "message" => "Hatalı şifre."));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("status" => "error", "message" => "Kullanıcı bulunamadı."));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "status" => "error", 
        "message" => "Oturum açma bilgileri eksik (veya boş).", 
        "debug_raw" => $raw_input, 
        "debug_data" => $data, 
        "json_error" => json_last_error_msg()
    ));
}
?>
