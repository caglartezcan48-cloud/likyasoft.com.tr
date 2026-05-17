<?php
// Approve/Reject Transaction API
// Path: data/api/approve_transaction.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

session_start();
handleCors();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->id) || empty($data->status)) {
            throw new Exception("Missing ID or Status.");
        }

        if (!in_array($data->status, ['approved', 'rejected'])) {
            throw new Exception("Invalid status.");
        }

        $database = new Database();
        $db = $database->getConnection();

        // Security Check: 
        // User can only approve/reject transactions where they are the 'related_user_id' (The recipient)
        // OR if they are the creator (maybe cancelling? - but let's stick to approval flow)
        
        $query = "SELECT id, user_id, related_user_id FROM transactions WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $data->id]);
        $tx = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tx) {
            throw new Exception("Transaction not found.");
        }

        // Logic:
        // Only the `related_user_id` (the counterparty) can APPROVE a transaction created by someone else.
        if ($tx['related_user_id'] != $user_id) {
            http_response_code(403);
            throw new Exception("You are not authorized to approve/reject this transaction.");
        }

        // Update Status
        // If rejected, we might want to store a reason, but column needs to exist.
        // For now status update is enough.
        
        $update = "UPDATE transactions SET status = :status WHERE id = :id";
        $upStmt = $db->prepare($update);
        $statusMap = [
            'approved' => 'Onaylandı',
            'rejected' => 'Reddedildi'
        ];

        $finalStatus = $statusMap[$data->status];

        if ($upStmt->execute([':status' => $finalStatus, ':id' => $data->id])) {
            echo json_encode(["success" => true, "message" => "Transaction updated to " . $finalStatus]);
        } else {
            throw new Exception("Database update failed.");
        }

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
?>
