<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

// Veritabanı tablosunu oluştur (YOKSA)
$sql = "CREATE TABLE IF NOT EXISTS `leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new', 'contacted') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$conn->exec($sql);

try {
    $conn->exec("ALTER TABLE `leads` ADD COLUMN `status` ENUM('new', 'contacted') DEFAULT 'new' AFTER `message`");
} catch (PDOException $e) {
    // Column might already exist
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Leadleri Getir (Admin için)
    $stmt = $conn->prepare("SELECT * FROM leads ORDER BY created_at DESC");
    $stmt->execute();
    $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($leads);
} 
elseif ($method === 'POST') {
    // Yeni Lead Ekle (AI Asistan için)
    $data = json_decode(file_get_contents("php://input"));
    if (!empty($data->message)) {
        $name = isset($data->name) ? $data->name : 'Misafir';
        $email = isset($data->email) ? $data->email : '-';
        $message = $data->message;
        
        $stmt = $conn->prepare("INSERT INTO leads (name, email, message) VALUES (:name, :email, :message)");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':message', $message);
        
        if ($stmt->execute()) {
            // E-posta Bildirim Sistemi
            try {
                // Ayarlardan admin mailini al
                $sStmt = $conn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'contact_email'");
                $sStmt->execute();
                $adminEmail = $sStmt->fetchColumn();
                
                if ($adminEmail) {
                    $to = $adminEmail;
                    $subject = "=?UTF-8?B?" . base64_encode("🚀 Yeni Müşteri Talebi: $name") . "?=";
                    
                    $emailContent = "
                    <html>
                    <head>
                        <title>Yeni Müşteri Talebi</title>
                    </head>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <div style='max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;'>
                            <div style='background: #0f172a; color: #fff; padding: 20px; text-align: center;'>
                                <h2 style='margin: 0;'>Yeni Müşteri Talebi (AI)</h2>
                            </div>
                            <div style='padding: 20px;'>
                                <p>Merhaba,</p>
                                <p>Web sitenizdeki Yapay Zeka asistanı üzerinden yeni bir talep geldi. Detaylar aşağıdadır:</p>
                                <hr style='border: 0; border-top: 1px solid #eee;'>
                                <p><strong>👤 İsim:</strong> $name</p>
                                <p><strong>📧 E-posta:</strong> $email</p>
                                <p><strong>💬 Mesaj:</strong></p>
                                <div style='background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #1eacc7;'>
                                    " . nl2br(htmlspecialchars($message)) . "
                                </div>
                                <hr style='border: 0; border-top: 1px solid #eee;'>
                                <p style='font-size: 0.8rem; color: #666;'>Bu mesaj otomatik olarak Likyasoft Dijital Mimari sistemi tarafından gönderilmiştir.</p>
                            </div>
                            <div style='background: #f4f4f4; padding: 15px; text-align: center; font-size: 0.75rem; color: #999;'>
                                &copy; " . date('Y') . " Likyasoft - Yönetim Paneli Bildirim Sistemi
                            </div>
                        </div>
                    </body>
                    </html>
                    ";

                    $headers = "MIME-Version: 1.0" . "\r\n";
                    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                    $headers .= "From: Likyasoft Bildirim <noreply@likyasoft.com.tr>" . "\r\n";

                    mail($to, $subject, $emailContent, $headers);
                }
            } catch (Exception $e) {
                // Mail gönderilemese bile kayıt başarılı sayılır
            }
            echo json_encode(["status" => "success", "message" => "Lead eklendi ve bildirim gönderildi."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Kayıt hatası."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Mesaj boş olamaz."]);
    }
} 
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if (!empty($data->id) && !empty($data->status)) {
        $stmt = $conn->prepare("UPDATE leads SET status = :status WHERE id = :id");
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':id', $data->id);
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Durum güncellendi."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Güncelleme hatası."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Geçersiz veriler."]);
    }
}
elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    if ($id) {
        $stmt = $conn->prepare("DELETE FROM leads WHERE id = :id");
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Mesaj silindi."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Silme hatası."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Geçersiz mesaj kimliği."]);
    }
}
$conn = null;
?>
