<?php
// Transactions API
// Path: data/api/transactions.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

// Start Session to identify user
session_start();

error_reporting(E_ALL);
ini_set('display_errors', 0);

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
    if (!isset($_SESSION['user_id'])) {
         http_response_code(401);
         throw new Exception("Unauthorized access. Please login.");
    }
    $user_id = $_SESSION['user_id'];

    if ($method === 'GET') {
        // Fetch User's Transactions - Alias party_name to party for frontend compatibility
        // Fetch User's Transactions (Both created by user AND involving user)
        // If I am related_user_id, then the 'type' should be reversed for me (Debt -> Credit)
        // But for simplicity, let's just fetch them first.
        
        $query = "SELECT t.*, 
                  CASE 
                    WHEN t.user_id = :user_id THEN t.party_name 
                    ELSE (SELECT name FROM users WHERE id = t.user_id) 
                  END as party,
                  CASE 
                    WHEN t.user_id = :user_id THEN t.type 
                    WHEN t.type = 'debt' THEN 'credit' 
                    ELSE 'debt' 
                  END as effective_type
                  FROM transactions t 
                  WHERE t.user_id = :user_id OR t.related_user_id = :user_id 
                  ORDER BY t.created_at DESC";
                  
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Map effective_type back to 'type' for frontend compatibility
        foreach ($transactions as &$row) {
            $row['type'] = $row['effective_type'];
        }
        
        echo json_encode([
            "success" => true,
            "data" => $transactions
        ]);

    } elseif ($method === 'POST') {
        // Add New Transaction with File Upload Support
        
        // Since we are using FormData, we access data via $_POST and $_FILES
        // Check if it's a JSON request or FormData
        $inputData = json_decode(file_get_contents("php://input"));
        
        // If JSON decode failed, it might be FormData, so use $_POST
        $party = $inputData->party ?? $_POST['party'] ?? null;
        $type = $inputData->type ?? $_POST['type'] ?? null;
        $amount = $inputData->amount ?? $_POST['amount'] ?? null;
        $date = $inputData->date ?? $_POST['date'] ?? null;
        $description = $inputData->description ?? $_POST['description'] ?? null;
        
        // Extended company data
        $partyTax = $inputData->tax_id ?? $_POST['tax_id'] ?? null;
        $newEmail = $inputData->new_email ?? $_POST['new_email'] ?? null;
        $newTax = $inputData->new_tax_id ?? $_POST['new_tax_id'] ?? null;

        if (empty($displayType) && empty($party) || empty($amount)) {
             // Basic validation
             if (empty($party) || empty($amount)) throw new Exception("Incomplete data (Party/Amount).");
        }

        // Handle File Upload
        $docPath = null;
        
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../../uploads/documents/';
            if (!file_exists($uploadDir)) {
                if (!mkdir($uploadDir, 0777, true)) {
                    throw new Exception("Sunucuda klasör oluşturulamadı (İzin hatası).");
                }
            }
            
            $fileTmpPath = $_FILES['file']['tmp_name'];
            $fileName = $_FILES['file']['name'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));

            $allowedfileExtensions = array('jpg', 'jpeg', 'png', 'pdf');
            if (!in_array($fileExtension, $allowedfileExtensions)) {
                throw new Exception("Geçersiz dosya formatı. Sadece JPG, PNG ve PDF yüklenebilir.");
            }
            
            // Sanitize file name
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadDir . $newFileName;
            
            if(move_uploaded_file($fileTmpPath, $dest_path)) {
                $docPath = $newFileName;
            } else {
                throw new Exception("Dosya yüklenirken sunucu hatası oluştu.");
            }
        }

        $query = "INSERT INTO transactions (user_id, related_user_id, type, party_name, amount, date, due_date, description, status, doc_path, created_at) 
                  VALUES (:user_id, :related_user_id, :type, :party, :amount, :date, :date, :desc, :status, :doc, NOW())";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":type", $type);
        $stmt->bindParam(":party", $party);
        $stmt->bindParam(":amount", $amount);
        $stmt->bindParam(":date", $date);
        
        $status = 'pending';
        
        // Check if party exists logic (Copied from previous)
        if ($partyTax) {
             $findUser = $db->prepare("SELECT id FROM users WHERE tax_id = ?");
             $findUser->execute([$partyTax]);
             $existingUser = $findUser->fetch(PDO::FETCH_ASSOC);
        } else {
             $findUser = $db->prepare("SELECT id FROM users WHERE name = ?");
             $findUser->execute([$party]);
             $existingUser = $findUser->fetch(PDO::FETCH_ASSOC);
        }
        
        $related_user_id = null;
        
        if ($existingUser) {
            $related_user_id = $existingUser['id'];
        } else {
            // Create Pre-approved User
            $finalEmail = !empty($newEmail) ? $newEmail : 'pre_'.uniqid().'@likyapay.com';
            $finalTax = !empty($newTax) ? $newTax : $partyTax;
            
            $dummyPass = password_hash(uniqid(), PASSWORD_DEFAULT);
            $userStatus = 'Ön Kayıt';
            
             $checkEmail = $db->prepare("SELECT id FROM users WHERE email = ?");
             $checkEmail->execute([$finalEmail]);
             if ($checkEmail->rowCount() > 0) {
                 $finalEmail = 'pre_'.uniqid().'@likyapay.com';
             }

            $createUser = $db->prepare("INSERT INTO users (name, email, password, tax_id, role, status, created_at) VALUES (?, ?, ?, ?, 'user', ?, NOW())");
            $createUser->execute([$party, $finalEmail, $dummyPass, $finalTax, $userStatus]);
            $related_user_id = $db->lastInsertId();
        }

        $stmt->bindParam(":related_user_id", $related_user_id);
        $stmt->bindParam(":desc", $description);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":doc", $docPath);

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Transaction added with file.",
                "doc" => $docPath
            ]);
        } else {
            throw new Exception("Failed to insert transaction.");
        }
    } elseif ($method === 'PUT') {
        // Update Transaction
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->id) || empty($data->amount)) {
            throw new Exception("ID and Amount are required.");
        }

        // Only allow update if this user created it
        // Fetch related_user_id too for Sirius Check
        $check = $db->prepare("SELECT user_id, related_user_id FROM transactions WHERE id = :id");
        $check->execute([':id' => $data->id]);
        $tx = $check->fetch(PDO::FETCH_ASSOC);

        if (!$tx || $tx['user_id'] != $user_id) {
            http_response_code(403);
            throw new Exception("You can only edit your own transactions.");
        }

        // --- COMPLETED/APPROVED CHECK (CRITICAL SECURITY FIX) ---
        // Block manual editing if already approved or part of a closed cycle
        $lockedStatuses = ['Sirius (Tamamlandı)', 'completed', 'approved', 'Onaylandı', 'Sirius (Locked)'];
        if (in_array($tx['status'], $lockedStatuses)) {
             throw new Exception("Bu kayıt onaylanmış veya tamamlanmış işlem statüsünde olduğu için DÜZENLENEMEZ.");
        }

        // --- ACTIVE SIRIUS LOCK CHECK ---
        $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = ?");
        $uStmt->execute([$tx['user_id']]);
        $userTax = $uStmt->fetchColumn();

        $rStmt = $db->prepare("SELECT tax_id FROM users WHERE id = ?");
        $rStmt->execute([$tx['related_user_id']]);
        $relatedTax = $rStmt->fetchColumn();

        if ($userTax && $relatedTax) {
             $cycleStmt = $db->query("SELECT nodes, id FROM sirius_cycles WHERE status NOT IN ('completed', 'cancelled')");
             while ($row = $cycleStmt->fetch(PDO::FETCH_ASSOC)) {
                 $nodes = json_decode($row['nodes'], true);
                 if (is_array($nodes) && in_array($userTax, $nodes) && in_array($relatedTax, $nodes)) {
                     throw new Exception("Bu borç/alacak kaydı aktif bir Sirius Döngüsü (#{$row['id']}) içinde işlem gördüğü için işlem yapılamaz.");
                 }
             }
        }
        // -------------------------

        // When updating amount/party, status resets to 'pending' for re-approval
        $query = "UPDATE transactions SET amount = :amount, status = 'pending' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":amount", $data->amount);
        $stmt->bindParam(":id", $data->id);

        if ($stmt->execute()) {
             echo json_encode(["success" => true, "message" => "Updated successfully. Status reset to pending."]);
        } else {
             throw new Exception("Update failed.");
        }

    } elseif ($method === 'DELETE') {
        // Delete Transaction
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->id)) {
             throw new Exception("ID required.");
        }

        // Check if user is involved (Creator OR Related)
        $check = $db->prepare("SELECT user_id, related_user_id FROM transactions WHERE id = :id");
        $check->execute([':id' => $data->id]);
        $tx = $check->fetch(PDO::FETCH_ASSOC);

        if (!$tx || ($tx['user_id'] != $user_id && $tx['related_user_id'] != $user_id)) {
            http_response_code(403);
            throw new Exception("You can only delete transactions you are involved in.");
        }

        // --- COMPLETED/APPROVED CHECK (CRITICAL SECURITY FIX) ---
        $lockedStatuses = ['Sirius (Tamamlandı)', 'completed', 'approved', 'Onaylandı', 'Sirius (Locked)'];
        if (in_array($tx['status'], $lockedStatuses)) {
             throw new Exception("Bu kayıt onaylanmış veya tamamlanmış işlem statüsünde olduğu için SİLİNEMEZ.");
        }

        // --- ACTIVE SIRIUS LOCK CHECK ---
        $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = ?");
        $uStmt->execute([$tx['user_id']]);
        $userTax = $uStmt->fetchColumn();

        $rStmt = $db->prepare("SELECT tax_id FROM users WHERE id = ?");
        $rStmt->execute([$tx['related_user_id']]);
        $relatedTax = $rStmt->fetchColumn();

        if ($userTax && $relatedTax) {
             $cycleStmt = $db->query("SELECT nodes, id FROM sirius_cycles WHERE status NOT IN ('completed', 'cancelled')");
             while ($row = $cycleStmt->fetch(PDO::FETCH_ASSOC)) {
                 $nodes = json_decode($row['nodes'], true);
                 if (is_array($nodes) && in_array($userTax, $nodes) && in_array($relatedTax, $nodes)) {
                     throw new Exception("Bu borç/alacak kaydı aktif bir Sirius Döngüsü (#{$row['id']}) içinde işlem gördüğü için işlem yapılamaz.");
                 }
             }
        }
        // -------------------------

        $query = "DELETE FROM transactions WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);

        if ($stmt->execute()) {
             echo json_encode(["success" => true, "message" => "Deleted successfully."]);
        } else {
             throw new Exception("Delete failed.");
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
