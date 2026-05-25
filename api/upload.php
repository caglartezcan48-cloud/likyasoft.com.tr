<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Sunucudaki ana uploads klasörünü hedefliyoruz
$target_dir = "../uploads/";

if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if (isset($_FILES["image"])) {
    $file_extension = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
    $new_filename = uniqid() . '.' . $file_extension;
    $target_file = $target_dir . $new_filename;
    
    // Resim kontrolü
    $check = @getimagesize($_FILES["image"]["tmp_name"]);
    if($check !== false) {
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            echo json_encode(array(
                "status" => "success",
                "url" => "/uploads/" . $new_filename
            ));
        } else {
            $error = error_get_last();
            http_response_code(500);
            echo json_encode(array(
                "status" => "error", 
                "message" => "Dosya sunucuya yazılamadı (İzin hatası olabilir).",
                "debug" => $error['message'] ?? 'Bilinmeyen hata'
            ));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("status" => "error", "message" => "Geçersiz resim dosyası."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Gelen dosya yok."));
}
?>
