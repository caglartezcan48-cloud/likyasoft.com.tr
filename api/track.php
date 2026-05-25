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

// Veritabanı tablosunu oluştur (YOKSA)
$sql = "CREATE TABLE IF NOT EXISTS `analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `visitor_hash` varchar(150) NOT NULL,
  `visit_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily_visitor` (`visitor_hash`, `visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$conn->exec($sql);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Ziyaretçiyi kaydet (Tracker)
    $ip = $_SERVER['REMOTE_ADDR'];
    $agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    $hash = md5($ip . $agent); // Tekil kullanıcı tahmini imzası
    $today = date('Y-m-d');
    
    // Aynı gün içindeki aynı imzayı engellemek için IGNORE (INSERT IGNORE in MySQLi but in PDO we can catch or use logic)
    // UNIQUE KEY ensures it won't duplicate. We can just run INSERT IGNORE.
    try {
        $stmt = $conn->prepare("INSERT IGNORE INTO analytics (visitor_hash, visit_date) VALUES (:hash, :today)");
        $stmt->bindParam(':hash', $hash);
        $stmt->bindParam(':today', $today);
        $stmt->execute();
        echo json_encode(["status" => "success"]);
    } catch(PDOException $e) {
        echo json_encode(["status" => "error"]);
    }
} 
elseif ($method === 'GET') {
    // İstatistikleri Getir (Admin Paneli için)
    $today = date('Y-m-d');
    
    // Bugünün tekil ziyaretçisi
    $stmt1 = $conn->prepare("SELECT COUNT(*) as today_visits FROM analytics WHERE visit_date = :today");
    $stmt1->bindParam(':today', $today);
    $stmt1->execute();
    $todayCount = $stmt1->fetch(PDO::FETCH_ASSOC)['today_visits'];
    
    // Toplam tekil ziyaretçi
    $stmt2 = $conn->prepare("SELECT COUNT(*) as total_visits FROM analytics");
    $stmt2->execute();
    $totalCount = $stmt2->fetch(PDO::FETCH_ASSOC)['total_visits'];
    
    echo json_encode([
        "today_visits" => $todayCount,
        "total_visits" => $totalCount
    ]);
}
$conn = null;
?>
