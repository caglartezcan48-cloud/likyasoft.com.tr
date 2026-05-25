<?php
// Messages API
// Path: data/api/messages.php

require_once '../../core/config.php';
require_once '../../core/database.php';
include_once '../../core/cors.php';

// Set Timezone
date_default_timezone_set('Europe/Istanbul');

session_start();

error_reporting(E_ALL);
ini_set('display_errors', 0); // Hide errors in production, show via JSON if needed

handleCors();

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $method = $_SERVER['REQUEST_METHOD'];

    // Security Check: Ensure user is logged in
    if (!isset($_SESSION['user_id']) && !isset($_SESSION['admin_id'])) { 
        // Assuming admin_id is set for admins. If not, we check role.
        // Let's standardise: User ID is always populated if logged in?
        // Or check role from DB based on ID.
        // For now, let's assume 'user_id' is set for users.
        // If it's admin panel, they might have 'admin_logged_in' session.
        if (!isset($_SESSION['user_id']) && empty($_SESSION['admin_logged_in'])) {
             http_response_code(401);
             throw new Exception("Unauthorized access.");
        }
    }

    // Determine current user
    if (isset($_SESSION['user_role']) && strtolower($_SESSION['user_role']) === 'admin') {
        $currentInfo['id'] = 0; // Admin ID
        $currentInfo['role'] = 'admin';
    } else {
        $currentInfo['id'] = $_SESSION['user_id'];
        $currentInfo['role'] = 'user';
    }

    if ($method === 'GET') {
        // Fetch Messages
        // If Admin: Fetch all messages grouped by user or plain list? 
        //   - Inbox: Messages sent TO Admin (receiver_id = 0)
        //   - Sent: Messages sent BY Admin (sender_id = 0)
        // If User:
        //   - Inbox: Messages sent TO User (receiver_id = user_id)
        //   - Sent: Messages sent BY User (sender_id = user_id)

        // For simplicity, let's fetch a conversation thread or just list all where user is involved.
        
        $userId = $currentInfo['id'];
        
        $query = "SELECT m.*, 
                  CASE WHEN m.sender_id = 0 THEN 'Yönetici' ELSE (SELECT name FROM users WHERE id = m.sender_id) END as sender_name,
                  CASE WHEN m.receiver_id = 0 THEN 'Yönetici' ELSE (SELECT name FROM users WHERE id = m.receiver_id) END as receiver_name
                  FROM messages m 
                  WHERE m.sender_id = :uid OR m.receiver_id = :uid 
                  ORDER BY m.created_at DESC";
                  
        $stmt = $db->prepare($query);
        $stmt->bindParam(":uid", $userId);
        $stmt->execute();
        
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "data" => $messages,
            "role" => $currentInfo['role']
        ]);

    } elseif ($method === 'POST') {
        // File Upload Handling
        $attachmentPath = null;
        
        // Check if file was uploaded via multipart/form-data
        // Note: When using fetch with FormData, $_POST and $_FILES are populated.
        // If sending JSON, we don't get $_FILES. 
        // We will switch Frontend to use FormData for file uploads.
        
        // Handle normal fields from $_POST if available (FormData), else JSON
        if (!empty($_FILES['attachment']['name'])) {
            $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
            $filename = $_FILES['attachment']['name'];
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            $size = $_FILES['attachment']['size'];
            
            if (!in_array($ext, $allowed)) {
                throw new Exception("Sadece JPG, PNG ve PDF dosyaları yüklenebilir.");
            }
            
            if ($size > 5 * 1024 * 1024) { // 5MB
                throw new Exception("Dosya boyutu 5MB'dan büyük olamaz.");
            }
            
            // Scalable Storage: uploads/messages/YYYY/MM/
            $year = date('Y');
            $month = date('m');
            $uploadDir = '../../uploads/messages/' . $year . '/' . $month . '/';
            
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $newName = uniqid() . '.' . $ext;
            $destination = $uploadDir . $newName;
            
            if (move_uploaded_file($_FILES['attachment']['tmp_name'], $destination)) {
                // Save relative path for Frontend usage
                $attachmentPath = 'uploads/messages/' . $year . '/' . $month . '/' . $newName;
            } else {
                throw new Exception("Dosya yüklenirken hata oluştu.");
            }
        }

        // Get text data
        if (!empty($_POST['subject'])) {
            // FormData request
            $subject = $_POST['subject'];
            $message = $_POST['message'];
            $receiver_id_input = $_POST['receiver_id'] ?? 0;
        } else {
            // JSON request (fallback for text-only if not using FormData everywhere)
            // But we will switch frontend to always use FormData or handle both.
            // If file is not present, $data might be empty if we didn't read php://input yet.
            // Note: php://input is empty for multipart/form-data.
            // So we need to detect content type.
            $data = json_decode(file_get_contents("php://input"));
            if ($data) {
                $subject = $data->subject;
                $message = $data->message;
                $receiver_id_input = $data->receiver_id ?? 0;
            }
        }
        
        if (empty($subject) || empty($message)) {
            throw new Exception("Konu ve Mesaj boş olamaz.");
        }

        $sender_id = $currentInfo['id'];
        
        if ($currentInfo['role'] === 'user') {
            $receiver_id = 0;
        } else {
            if (empty($receiver_id_input)) {
                throw new Exception("Alıcı seçilmedi.");
            }
            $receiver_id = $receiver_id_input;
        }

            $date = date('Y-m-d H:i:s');
            
            $sql = "INSERT INTO messages (sender_id, receiver_id, subject, message, attachment_path, created_at, is_read) VALUES (:sender_id, :receiver_id, :subject, :message, :attachment_path, :created_at, 0)";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':sender_id', $sender_id);
            $stmt->bindParam(':receiver_id', $receiver_id);
            $stmt->bindParam(':subject', $subject); // Using subject field even for replies
            $stmt->bindParam(':message', $message);
            $stmt->bindParam(':attachment_path', $attachmentPath);
            $stmt->bindParam(':created_at', $date);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true]);
            } else {
                throw new Exception("Mesaj gönderilemedi.");
            }

    } elseif ($method === 'PUT') {
        // Mark as Read
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->id)) throw new Exception("ID gerekli.");

        // Checking ownership: Only receiver can mark as read
        $stmt = $db->prepare("UPDATE messages SET is_read = 1 WHERE id = :id AND receiver_id = :uid");
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":uid", $currentInfo['id']);
        
        if ($stmt->execute()) {
             echo json_encode(["success" => true]);
        } else {
             throw new Exception("İşlem başarısız.");
        }
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>
