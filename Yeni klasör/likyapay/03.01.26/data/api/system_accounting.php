<?php
// System Accounting API
// Path: data/api/system_accounting.php

include_once '../../core/cors.php';
include_once '../../core/database.php';

handleCors();
session_start();

// Security: Admin OR Employee with Accounting Permission
$is_admin = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
$user_perms = $_SESSION['user_permissions'] ?? [];
$can_view_accounting = ($is_admin) || (isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'employee' && !empty($user_perms['can_accounting']));

if (!$can_view_accounting) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Yetkisiz işlem: Muhasebe erişim izni gerekli."]);
    exit;
}

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // Fetch All
        $query = "SELECT * FROM system_transactions ORDER BY date DESC, id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $transactions
        ]);

    } elseif ($method === 'POST') {
        // Add New
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->amount) || empty($data->type) || empty($data->category)) {
            throw new Exception("Eksik veri: Tutar, Tip ve Kategori zorunludur.");
        }

        $query = "INSERT INTO system_transactions (type, category, entity_name, description, amount, date) VALUES (:type, :category, :entity, :desc, :amount, :date)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":type", $data->type);
        $stmt->bindParam(":category", $data->category);
        $stmt->bindParam(":entity", $data->entity_name);
        $stmt->bindParam(":desc", $data->description);
        $stmt->bindParam(":amount", $data->amount);
        $stmt->bindParam(":date", $data->date);

        if ($stmt->execute()) {
            // Check if linked to a user -> Add to their account statement
            if (!empty($data->entity_id)) {
                $userTxType = ($data->type === 'income') ? 'debt' : 'credit'; // Income for system = Debt for user (User paid us)
                
                $userQuery = "INSERT INTO transactions (user_id, type, amount, description, status, date, created_at) 
                              VALUES (:uid, :type, :amount, :desc, 'approved', :date, NOW())";
                $userStmt = $db->prepare($userQuery);
                $userStmt->bindParam(":uid", $data->entity_id);
                $userStmt->bindParam(":type", $userTxType);
                $userStmt->bindParam(":amount", $data->amount);
                
                $descCombined = "Sistem İşlemi: " . $data->category . " (" . ($data->description ?? '') . ")";
                $userStmt->bindParam(":desc", $descCombined);
                $userStmt->bindParam(":date", $data->date);
                
                $userStmt->execute();
            }

            echo json_encode(["success" => true, "message" => "İşlem kaydedildi ve cariye işlendi."]);
        } else {
            throw new Exception("Kayıt başarısız.");
        }
    } elseif ($method === 'DELETE') {
        // Delete
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->id)) throw new Exception("ID gerekli.");

        $query = "DELETE FROM system_transactions WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Silindi."]);
        } else {
            throw new Exception("Silme başarısız.");
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
