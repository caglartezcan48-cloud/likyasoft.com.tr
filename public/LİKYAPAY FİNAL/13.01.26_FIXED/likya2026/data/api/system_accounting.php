<?php
// System Accounting API
// Path: data/api/system_accounting.php

include_once '../../core/cors.php';
include_once '../../core/database.php';
include_once '../../core/logger.php';

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
        // Special Action: Print Invoice
        if (isset($_GET['action']) && $_GET['action'] === 'print_invoice') {
            $id = $_GET['id'] ?? null;
            if (!$id) die("ID gerekli.");

            $stmt = $db->prepare("SELECT * FROM system_transactions WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $tx = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$tx) die("İşlem bulunamadı.");

            $date = date('d.m.Y', strtotime($tx['date']));
            $title = ($tx['type'] === 'income') ? 'TAHSİLAT MAKBUZU' : 'TEDİYE MAKBUZU';

            echo "<!DOCTYPE html><html><head><title>Makbuz #$id</title>";
            echo "<style>
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
                .invoice-box { border: 2px solid #0f172a; padding: 30px; position: relative; max-width: 800px; margin: auto; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
                .logo { font-size: 24pt; font-weight: 900; color: #0c4a6e; }
                .logo span { color: #6366f1; }
                h1 { text-align: center; font-size: 20pt; margin: 30px 0; }
                .details-table { width: 100%; margin: 30px 0; border-collapse: collapse; }
                .details-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
                .amount-box { text-align: right; margin-top: 30px; font-size: 18pt; font-weight: bold; }
                .signature-area { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
                .sign { width: 45%; border-top: 1px solid #0f172a; padding-top: 10px; }
                @media print { .no-print { display: none; } }
            </style></head><body>";

            echo "<div class='no-print' style='text-align: center; margin-bottom: 20px;'><button onclick='window.print()' style='padding: 10px 20px; font-weight: bold;'>Yazdır</button></div>";
            
            echo "<div class='invoice-box'>";
            echo "<div class='header'><div class='logo'>Likya<span>Pay</span></div><div style='text-align:right'><strong>TARİH:</strong> $date<br><strong>NO:</strong> #$id</div></div>";
            echo "<h1>$title</h1>";
            
            echo "<table class='details-table'>";
            echo "<tr><td width='30%'><strong>ŞİRKET / ŞAHIS:</strong></td><td>" . ($tx['entity_name'] ?: '---') . "</td></tr>";
            echo "<tr><td><strong>KATEGORİ:</strong></td><td>{$tx['category']}</td></tr>";
            echo "<tr><td><strong>AÇIKLAMA:</strong></td><td>" . ($tx['description'] ?: 'E-Muhasebe Kaydı') . "</td></tr>";
            echo "</table>";

            echo "<div class='amount-box'>TOPLAM: " . number_format($tx['amount'], 2, ',', '.') . " TL</div>";

            echo "<div class='signature-area'>";
            echo "<div class='sign'>TESLİM EDEN</div>";
            echo "<div class='sign'>TESLİM ALAN / ONAY</div>";
            echo "</div>";
            
            echo "<div style='margin-top: 40px; font-size: 8pt; color: #94a3b8; text-align: center;'>Bu makbuz LikyaPay dijital muhasebe sistemi tarafından oluşturulmuştur.</div>";
            echo "</div>";

            echo "</body></html>";
            exit;
        }

        // Fetch All
        $query = "SELECT * FROM system_transactions ORDER BY date DESC, id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $transactions
        ]);

    } elseif ($method === 'POST' && !isset($_GET['action'])) {
        // Add New
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->amount) || empty($data->type) || empty($data->category)) {
            throw new Exception("Eksik veri: Tutar, Tip ve Kategori zorunludur.");
        }

        if (!is_numeric($data->amount) || (float)$data->amount <= 0) {
            throw new Exception("Geçersiz tutar: Tutar sayısal ve sıfırdan büyük olmalıdır.");
        }

        if (!in_array($data->type, ['income', 'expense'])) {
            throw new Exception("Geçersiz işlem tipi.");
        }

        $query = "INSERT INTO system_transactions (type, category, entity_name, description, amount, date, details) VALUES (:type, :category, :entity, :desc, :amount, :date, :details)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":type", $data->type);
        $stmt->bindParam(":category", $data->category);
        $stmt->bindParam(":entity", $data->entity_name);
        $stmt->bindParam(":desc", $data->description);
        $stmt->bindParam(":amount", $data->amount);
        $stmt->bindParam(":date", $data->date);
        
        // Handle optional details (JSON)
        $details = isset($data->details) ? $data->details : null;
        $stmt->bindParam(":details", $details);

        if ($stmt->execute()) {
            $lastId = $db->lastInsertId();
            Logger::log('ACCOUNTING_ADD', "Yeni işlem eklendi (ID: $lastId): {$data->category} - {$data->amount} TL");

            // Check if linked to a user -> Add to their account statement ONLY IF Supplier or Employee
            if (!empty($data->entity_id)) {
                // ... (existing mirroring logic)
                $chkStmt = $db->prepare("SELECT user_type, role FROM users WHERE id = :uid");
                $chkStmt->execute([':uid' => $data->entity_id]);
                $user = $chkStmt->fetch(PDO::FETCH_ASSOC);

                if ($user && in_array($user['user_type'], ['supplier', 'employee', 'personel'])) {
                    $userTxType = ($data->type === 'income') ? 'debt' : 'credit';
                    
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
                    Logger::log('ACCOUNTING_MIRROR', "İşlem kullanıcı hesabına yansıtıldı (UID: {$data->entity_id})");
                }
            }

            echo json_encode(["success" => true, "message" => "İşlem kaydedildi ve cariye işlendi."]);
        } else {
            Logger::log('ACCOUNTING_ERROR', "İşlem kaydı başarısız.");
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
            Logger::log('ACCOUNTING_DELETE', "İşlem silindi (ID: {$data->id})");
            echo json_encode(["success" => true, "message" => "Silindi."]);
        } else {
            throw new Exception("Silme başarısız.");
        }
    } elseif ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'approve_invoice') {
        // ACTION: APPROVE INVOICE (Draft -> Approved + Charge User)
        $data = json_decode(file_get_contents("php://input"));
        $id = $data->id ?? null;

        if (!$id) throw new Exception("ID Gerekli.");

        // Fetch Transaction
        $stmt = $db->prepare("SELECT * FROM system_transactions WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $tx = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tx) throw new Exception("Fatura bulunamadı.");
        if ($tx['status'] !== 'draft') throw new Exception("Bu fatura zaten onaylanmış veya iptal edilmiş.");

        // Find User by Entity Name (This relies on name matching, which is fragile but used for now based on sirius.php design)
        // Ideally we should store entity_id in system_transactions.
        // Let's try to match by name or context.
        // SIRIUS LOGIC: entity_name = User Name.
        
        $uStmt = $db->prepare("SELECT id FROM users WHERE name = :name LIMIT 1");
        $uStmt->execute([':name' => $tx['entity_name']]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            // Fallback or Error? If we can't find the user, we can't charge them.
            // Maybe just approve it as income?
            // Throwing error for safety.
            throw new Exception("İlgili firma (Kullanıcı: {$tx['entity_name']}) veritabanında bulunamadı.");
        }

        $db->beginTransaction();
        try {
            // 1. Update Status
            $upd = $db->prepare("UPDATE system_transactions SET status = 'approved' WHERE id = :id");
            $upd->execute([':id' => $id]);

            // 2. Charge User
            $userTxQuery = "INSERT INTO transactions (user_id, type, amount, description, status, date, created_at) 
                            VALUES (:uid, 'debt', :amount, :desc, 'approved', CURDATE(), NOW())";
            $userTxStmt = $db->prepare($userTxQuery);
            $userTxStmt->execute([
                ':uid' => $user['id'],
                ':amount' => $tx['amount'],
                ':desc' => $tx['description'] // Reuse description
            ]);

            Logger::log('INVOICE_APPROVE', "Fatura onaylandı ve cariye işlendi (ID: $id, User: {$user['id']})");

            $db->commit();
            echo json_encode(["success" => true, "message" => "Fatura onaylandı ve cariye işlendi."]);
        } catch (Exception $e) {
            $db->rollBack();
            throw new Exception("İşlem hatası: " . $e->getMessage());
        }
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
