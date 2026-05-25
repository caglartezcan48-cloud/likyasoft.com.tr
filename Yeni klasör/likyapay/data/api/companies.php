<?php
include_once '../../core/database.php';
include_once '../../core/cors.php';

session_start();

handleCors();
header("Content-Type: application/json; charset=UTF-8");

function response($success, $data = [], $message = '')
{
    echo json_encode(['success' => $success, 'data' => $data, 'message' => $message]);
    exit;
}

// Auto-Schema Update (Self-Healing)
function ensureSchema($db)
{
    // 1. Create 'user_companies' table if missing
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS user_companies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            parent_user_id INT NOT NULL,
            company_user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_relation (parent_user_id, company_user_id)
        )");
    } catch (Exception $e) { /* Ignore */
    }

    // 2. Add missing columns to 'users' table
    $columns = ['tax_office', 'address', 'district', 'city', 'trade_registry_no', 'mersis_no', 'iban'];
    foreach ($columns as $col) {
        try {
            // Try to select the column to see if it exists
            $db->query("SELECT $col FROM users LIMIT 1");
        } catch (Exception $e) {
            // If error (missing column), add it
            try {
                $type = ($col === 'address') ? 'TEXT' : 'VARCHAR(100)';
                $db->exec("ALTER TABLE users ADD COLUMN $col $type DEFAULT NULL");
            } catch (Exception $ex) { /* Ignore */
            }
        }
    }
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db)
        throw new Exception("Database connection failed.");

    // Security
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        response(false, [], "Unauthorized");
    }

    $currentUserId = $_SESSION['user_id'];
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // List ONLY companies in "My Companies" list for this user
        // We join user_companies with users table to get details
        $sql = "SELECT u.*, uc.created_at as added_at 
                FROM user_companies uc
                JOIN users u ON uc.company_user_id = u.id
                WHERE uc.parent_user_id = :uid
                ORDER BY u.name ASC";

        $stmt = $db->prepare($sql);
        $stmt->bindParam(":uid", $currentUserId);
        $stmt->execute();

        $companies = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Map status for frontend
        $mapped = [];
        foreach ($companies as $row) {
            $status = 'pending';
            if ($row['status'] === 'Aktif')
                $status = 'verified';
            elseif ($row['status'] === 'Pasif')
                $status = 'banned';

            $mapped[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'tax_id' => $row['tax_id'],
                'account_type' => strtolower($row['user_type'] ?? 'company'),
                'status' => $status,
                'tax_office' => $row['tax_office'] ?? '',
                'city' => $row['city'] ?? '',
                'district' => $row['district'] ?? '',
                'address' => $row['address'] ?? '',
                'trade_registry_no' => $row['trade_registry_no'] ?? '',
                'mersis_no' => $row['mersis_no'] ?? '',
                'iban' => $row['iban'] ?? '',
                'db_status' => $row['status'] // for debug
            ];
        }

        response(true, $mapped);

    } elseif ($method === 'POST') {
        ensureSchema($db); // Fix missing columns automatically
        // Add a new Company
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->tax_id) || empty($data->name)) {
            throw new Exception("Lütfen Vergi No ve Şirket Adı giriniz.");
        }

        $taxId = trim($data->tax_id);
        $name = trim($data->name);
        $email = trim($data->email ?? ''); // Optional for search, required for new

        // 1. Check if this company already exists in the SYSTEM (users table)
        $checkStmt = $db->prepare("SELECT id, status FROM users WHERE tax_id = :tax");
        $checkStmt->execute([':tax' => $taxId]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        $targetCompanyId = null;

        if ($existing) {
            $targetCompanyId = $existing['id'];
        } else {
            // 2. If not exists, create it as 'Ön Kayıt' (Pre-register)
            // Generate a placeholder email if not provided, or check if email is unique
            if (empty($email)) {
                $email = 'pre_' . $taxId . '@likyapay.com';
            } else {
                // Check email uniqueness just in case
                $eCheck = $db->prepare("SELECT id FROM users WHERE email = :email");
                $eCheck->execute([':email' => $email]);
                if ($eCheck->fetch()) {
                    // Email taken, fallback or error? Let's fallback to generated to avoid blocking
                    $email = 'pre_' . $taxId . '_' . uniqid() . '@likyapay.com';
                }
            }

            $password = password_hash(uniqid(), PASSWORD_DEFAULT);
            $newStatus = 'Ön Kayıt';

            // Extended fields
            $tax_office = $data->tax_office ?? null;
            $address = $data->address ?? null;
            $city = $data->city ?? null;
            $district = $data->district ?? null;
            $trade_registry_no = $data->trade_registry_no ?? null;
            $mersis_no = $data->mersis_no ?? null;
            $iban = $data->iban ?? null;

            $insertSql = "INSERT INTO users (name, email, password, tax_id, role, status, user_type, tax_office, address, city, district, trade_registry_no, mersis_no, iban, created_at) 
                          VALUES (:name, :email, :pass, :tax, 'user', :status, 'company', :tax_office, :address, :city, :district, :trade, :mersis, :iban, NOW())";

            $insStmt = $db->prepare($insertSql);
            $insStmt->execute([
                ':name' => $name,
                ':email' => $email,
                ':pass' => $password,
                ':tax' => $taxId,
                ':status' => $newStatus,
                ':tax_office' => $tax_office,
                ':address' => $address,
                ':city' => $city,
                ':district' => $district,
                ':trade' => $trade_registry_no,
                ':mersis' => $mersis_no,
                ':iban' => $iban
            ]);

            $targetCompanyId = $db->lastInsertId();
        }

        // 3. Link to My Companies request
        // Check if already linked
        $linkCheck = $db->prepare("SELECT id FROM user_companies WHERE parent_user_id = :pid AND company_user_id = :cid");
        $linkCheck->execute([':pid' => $currentUserId, ':cid' => $targetCompanyId]);

        if ($linkCheck->fetch()) {
            throw new Exception("Bu şirket zaten listenizde ekli.");
        }

        // Prevent adding self
        if ($targetCompanyId == $currentUserId) {
            throw new Exception("Kendinizi şirketinize ekleyemezsiniz.");
        }

        $linkStmt = $db->prepare("INSERT INTO user_companies (parent_user_id, company_user_id) VALUES (:pid, :cid)");
        $linkStmt->execute([':pid' => $currentUserId, ':cid' => $targetCompanyId]);

        response(true, [], "Şirket listenize eklendi. " . (!$existing ? "(Ön Kayıt Oluşturuldu, Onay Bekliyor)" : ""));

    } elseif ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
        // Remove from My Companies
        $data = json_decode(file_get_contents("php://input"));
        $companyId = $data->id ?? null;

        if (!$companyId)
            throw new Exception("Silinecek şirket ID'si gerekli.");

        $delStmt = $db->prepare("DELETE FROM user_companies WHERE parent_user_id = :pid AND company_user_id = :cid");
        $delStmt->execute([':pid' => $currentUserId, ':cid' => $companyId]);

        response(true, [], "Şirket listenizden çıkarıldı.");
    }

} catch (Exception $e) {
    http_response_code(400);
    response(false, [], $e->getMessage());
}
?>