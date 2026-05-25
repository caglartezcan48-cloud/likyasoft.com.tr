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
        $related_user_id_input = $inputData->related_user_id ?? $_POST['related_user_id'] ?? null; // Expect ID now

        if (empty($amount)) {
             throw new Exception("Lütfen tutar giriniz.");
        }
        
        // Handle File Upload
        $docPath = null;
        
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../../uploads/documents/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileTmpPath = $_FILES['file']['tmp_name'];
            $fileName = $_FILES['file']['name'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));

            $allowedfileExtensions = array('jpg', 'jpeg', 'png', 'pdf');
            if (!in_array($fileExtension, $allowedfileExtensions)) {
                throw new Exception("Geçersiz dosya formatı.");
            }
            
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadDir . $newFileName;
            
            if(move_uploaded_file($fileTmpPath, $dest_path)) {
                $docPath = $newFileName;
            }
        }

        // STRICT CHECK: The related party MUST be in "My Companies"
        if (empty($related_user_id_input)) {
            // If ID not provided, try to find by name from My Companies (Legacy support or fallback)
            // But we prefer ID.
            if (empty($party)) throw new Exception("Şirket seçiniz.");
            
            // Find in My Companies
            $findStmt = $db->prepare("SELECT uc.company_user_id, u.name 
                                     FROM user_companies uc 
                                     JOIN users u ON uc.company_user_id = u.id 
                                     WHERE uc.parent_user_id = :pid AND u.name = :name");
            $findStmt->execute([':pid' => $user_id, ':name' => $party]);
            $linkedCompany = $findStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$linkedCompany) {
                throw new Exception("Seçilen şirket ('$party') listenizde bulunamadı. Lütfen önce 'Çalıştığım Şirketler' menüsünden ekleyiniz.");
            }
            $related_user_id = $linkedCompany['company_user_id'];
            // Update party name to match exactly what's in DB
            $party = $linkedCompany['name'];
            
        } else {
            // Verify ID is in My Companies
            $checkStmt = $db->prepare("SELECT id FROM user_companies WHERE parent_user_id = :pid AND company_user_id = :cid");
            $checkStmt->execute([':pid' => $user_id, ':cid' => $related_user_id_input]);
            
            if (!$checkStmt->fetch()) {
                 throw new Exception("Seçilen şirket listenizde ekli değil. Lütfen 'Çalıştığım Şirketler' menüsünden ekleyiniz.");
            }
            $related_user_id = $related_user_id_input;
            
            // Fetch name for redundancy/history
            $nStmt = $db->prepare("SELECT name FROM users WHERE id = ?");
            $nStmt->execute([$related_user_id]);
            $party = $nStmt->fetchColumn();
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
        
        $stmt->bindParam(":related_user_id", $related_user_id);
        $stmt->bindParam(":desc", $description);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":doc", $docPath);

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "İşlem başarıyla eklendi.",
                "doc" => $docPath
            ]);
        } else {
            throw new Exception("İşlem eklenirken hata oluştu.");
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

        // --- LIKYA PAY SYSTEM INVOICE CHECK (NEW) ---
        // Prevent users from editing System Invoices (Service Fees)
        $systemParties = ['Likya Pay', 'LikyaPay', 'Sistem', 'Hizmet Bedeli'];
        if (in_array($tx['party_name'], $systemParties) || strpos($tx['description'], 'Hizmet Bedeli') !== false) {
             throw new Exception("Likya Pay tarafından otomatik oluşturulan Hizmet Bedeli faturaları düzenlenemez.");
        }
        // -------------------------

        // -------------------------
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

    } elseif ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
        // Delete Transaction
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->id)) {
             throw new Exception("ID required.");
        }

        // Check if user is involved (Creator OR Related)
        $check = $db->prepare("SELECT user_id, related_user_id, status FROM transactions WHERE id = :id");
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


        // -------------------------

        // --- LIKYA PAY SYSTEM INVOICE CHECK (NEW) ---
        $systemParties = ['Likya Pay', 'LikyaPay', 'Sistem', 'Hizmet Bedeli'];
        if (in_array($tx['party_name'], $systemParties) || strpos($tx['description'], 'Hizmet Bedeli') !== false) {
             throw new Exception("Likya Pay tarafından otomatik oluşturulan Hizmet Bedeli faturaları silinemez.");
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
