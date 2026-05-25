<?php
// Toplu Şirket Yükleme API
// Path: data/api/import_companies.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

session_start();
handleCors();
header("Content-Type: application/json; charset=UTF-8");

function response($success, $message = '', $added = 0, $skipped = 0) {
    echo json_encode(['success' => $success, 'message' => $message, 'added' => $added, 'skipped' => $skipped]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        response(false, "Oturum açmanız gerekiyor.");
    }

    $currentUserId = $_SESSION['user_id'];
    $data = json_decode(file_get_contents("php://input"), true);

    if (!is_array($data)) {
        throw new Exception("Geçersiz veri formatı.");
    }

    $addedCount = 0;
    $skippedCount = 0;

    // Auto-Create user_companies table if missing
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS user_companies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            parent_user_id INT NOT NULL,
            company_user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_relation (parent_user_id, company_user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Exception $e) { /* Ignore */ }

    // Auto-Fix missing columns for full profile

    $newCols = [
        'authorized_person' => 'VARCHAR(100)',
        'phone' => 'VARCHAR(20)',
        'sector' => 'VARCHAR(100)',
        'invoice_address' => 'TEXT',
        'kep_address' => 'VARCHAR(255)'
    ];
    foreach($newCols as $c => $t) {
        try { $db->query("SELECT $c FROM users LIMIT 1"); } 
        catch (Exception $e) { $db->exec("ALTER TABLE users ADD COLUMN $c $t NULL"); }
    }

    foreach ($data as $item) {
        $taxId = trim($item['Vergi No'] ?? $item['tax_id'] ?? '');
        $name = trim($item['Şirket Adı'] ?? $item['name'] ?? '');

        if (empty($taxId) || empty($name)) {
            $skippedCount++;
            continue;
        }

        // 1. Şirket sistemde var mı?
        $checkStmt = $db->prepare("SELECT id FROM users WHERE tax_id = :tax");
        $checkStmt->execute([':tax' => $taxId]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        $targetCompanyId = null;

        if ($existing) {
            $targetCompanyId = $existing['id'];
        } else {
            // 2. Yoksa oluştur (Ön Kayıt)
            $email = trim($item['E-Posta'] ?? $item['email'] ?? '');
            if (empty($email)) $email = 'pre_' . $taxId . '@likyapay.com';
            
            $password = password_hash(uniqid(), PASSWORD_DEFAULT);
            
            $insertSql = "INSERT INTO users (name, email, password, tax_id, role, status, user_type, authorized_person, phone, sector, tax_office, city, district, address, invoice_address, kep_address, mersis_no, trade_registry_no, iban, created_at) 
                          VALUES (:name, :email, :pass, :tax, 'user', 'Ön Kayıt', 'company', :auth, :phone, :sector, :tax_office, :city, :district, :address, :inv_addr, :kep, :mersis, :trade, :iban, NOW())";
            
            $insStmt = $db->prepare($insertSql);
            $insStmt->execute([
                ':name' => $name,
                ':email' => $email,
                ':pass' => $password,
                ':tax' => $taxId,
                ':auth' => $item['Yetkili Kişi'] ?? $item['authorized_person'] ?? null,
                ':phone' => $item['Telefon'] ?? $item['phone'] ?? null,
                ':sector' => $item['Sektör'] ?? $item['sector'] ?? null,
                ':tax_office' => $item['Vergi Dairesi'] ?? $item['tax_office'] ?? null,
                ':city' => $item['Şehir'] ?? $item['city'] ?? null,
                ':district' => $item['İlçe'] ?? $item['district'] ?? null,
                ':address' => $item['Adres'] ?? $item['address'] ?? null,
                ':inv_addr' => $item['Fatura Adresi'] ?? $item['invoice_address'] ?? null,
                ':kep' => $item['KEP Adresi'] ?? $item['kep_address'] ?? null,
                ':mersis' => $item['Mersis No'] ?? $item['mersis_no'] ?? null,
                ':trade' => $item['Ticaret Sicil No'] ?? $item['trade_registry_no'] ?? null,
                ':iban' => $item['IBAN'] ?? $item['iban'] ?? null
            ]);
            $targetCompanyId = $db->lastInsertId();
        }


        // 3. Kullanıcı listesine ekle (Eğer zaten ekli değilse ve kendisi değilse)
        if ($targetCompanyId && $targetCompanyId != $currentUserId) {
            $linkCheck = $db->prepare("SELECT id FROM user_companies WHERE parent_user_id = :pid AND company_user_id = :cid");
            $linkCheck->execute([':pid' => $currentUserId, ':cid' => $targetCompanyId]);

            if (!$linkCheck->fetch()) {
                $linkStmt = $db->prepare("INSERT INTO user_companies (parent_user_id, company_user_id) VALUES (:pid, :cid)");
                $linkStmt->execute([':pid' => $currentUserId, ':cid' => $targetCompanyId]);
                $addedCount++;
            } else {
                $skippedCount++;
            }
        } else {
            $skippedCount++;
        }
    }

    response(true, "Aktarım tamamlandı.", $addedCount, $skippedCount);

} catch (Exception $e) {
    http_response_code(400);
    response(false, $e->getMessage());
}
?>
