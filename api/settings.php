<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

// Veritabanı tablosunu oluştur (YOKSA)
$sql = "CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$conn->exec($sql);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT setting_key, setting_value FROM settings");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert generic key/value to a simple associative array
    $settings = array();
    foreach ($results as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    
    // Default values if empty
    if (empty($settings)) {
        $settings = [
            "site_title" => "Likyasoft - Dijitalde Sanat",
            "contact_email" => "info@likyasoft.com.tr",
            "contact_phone" => "+90 500 000 00 00",
            "instagram_url" => "https://instagram.com/likyasoft",
            "linkedin_url" => "https://linkedin.com/company/likyasoft",
            "address" => "Antalya, Türkiye"
        ];
        // Insert defaults
        foreach($settings as $k => $v) {
            $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (:key, :val)");
            $stmt->bindParam(':key', $k);
            $stmt->bindParam(':val', $v);
            $stmt->execute();
        }
    }
    
    echo json_encode($settings);
} 
elseif ($method === 'POST' || $method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!empty($data) && is_array($data)) {
        foreach($data as $key => $value) {
            $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE setting_value = :value_update");
            $stmt->bindParam(':key', $key);
            $stmt->bindParam(':value', $value);
            $stmt->bindParam(':value_update', $value);
            $stmt->execute();
        }
        echo json_encode(["status" => "success", "message" => "Ayarlar güncellendi."]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Geçersiz veri."]);
    }
}
$conn = null;
?>
