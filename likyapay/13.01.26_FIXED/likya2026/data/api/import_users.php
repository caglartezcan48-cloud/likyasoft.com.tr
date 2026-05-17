<?php
// Path: data/api/import_users.php
include_once '../../core/database.php';
include_once '../../core/cors.php';

header('Content-Type: application/json');

try {
    if (!isset($_FILES['file'])) {
        throw new Exception("Dosya yüklenmedi.");
    }

    $file = $_FILES['file']['tmp_name'];
    $handle = fopen($file, "r");
    
    if ($handle === FALSE) {
        throw new Exception("Dosya açılamadı.");
    }

    $database = new Database();
    $db = $database->getConnection();

    $successCount = 0;
    $errors = [];
    $row = 0;

    // Read file content first to detect delimiter
    $content = file_get_contents($file);
    $lines = explode("\n", $content);
    
    // Log the first line for debugging
    file_put_contents('import_debug.log', "First Line Sample: " . trim($lines[0]) . "\n", FILE_APPEND);
    
    // Improved Delimiter Detection
    $semicolonCount = substr_count($lines[0], ';');
    $commaCount = substr_count($lines[0], ',');
    $delimiter = ($semicolonCount > $commaCount) ? ';' : ',';

    file_put_contents('import_debug.log', "Detected Delimiter: [$delimiter]\n", FILE_APPEND);

    foreach ($lines as $index => $line) {
        $row++;
        if ($row == 1) continue; // Skip Header
        
        $line = trim($line);
        if (empty($line)) continue;

        // Convert Encoding if needed (Simple check for common Turkish ANSI issues)
        if (!mb_detect_encoding($line, 'UTF-8', true)) {
            $line = mb_convert_encoding($line, 'UTF-8', 'ISO-8859-9'); 
        }

        // Try standard parsing
        $data = str_getcsv($line, $delimiter);

        // Fallback: If quotes messed up parsing, try simple explode
        if (count($data) < 2) {
             // Remove wrapping quotes if present: "A;B;C" -> A;B;C
             $cleanLine = trim($line, '"'); 
             $data = explode($delimiter, $cleanLine);
        }

        // Log row count
        file_put_contents('import_debug.log', "Row $row Column Count: " . count($data) . "\n", FILE_APPEND);

        // Basic Validation
        if (count($data) < 3) {
            $errors[] = "Satır $row: Eksik veri. Beklenen en az 3 sütun, bulunan " . count($data);
            continue; 
        }

        // Clean invisible characters/BOM in first column
        $name = trim(preg_replace('/[\x00-\x1F\x7F\xEF\xBB\xBF]/', '', $data[0]));
        $tax_id = trim($data[1]);
        $email = trim($data[2]);
        $phone = $data[3] ?? '';
        $sector = $data[4] ?? 'Genel';
        $username = $data[5] ?? explode('@', $email)[0];
        $passwordRaw = $data[6] ?? '123456'; 

        // Check duplicate
        $check = $db->prepare("SELECT id FROM users WHERE email = ? OR tax_id = ?");
        $check->execute([$email, $tax_id]);
        if ($check->rowCount() > 0) {
            $errors[] = "Satır $row: $email veya $tax_id zaten kayıtlı.";
            file_put_contents('import_debug.log', "Row $row: Duplicate $email\n", FILE_APPEND);
            continue;
        }

        $password = password_hash($passwordRaw, PASSWORD_BCRYPT);
        $role = 'user';
        $status = 'Aktif';
        $user_type = 'company';

        // Log the attempt
        file_put_contents('import_debug.log', "Row $row: Attempting Insert $name\n", FILE_APPEND);

        $sql = "INSERT INTO users (name, tax_id, email, phone, sector, username, password, role, status, user_type, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $db->prepare($sql);
        if ($stmt->execute([$name, $tax_id, $email, $phone, $sector, $username, $password, $role, $status, $user_type])) {
            $successCount++;
             file_put_contents('import_debug.log', "Row $row: Success ID " . $db->lastInsertId() . "\n", FILE_APPEND);
        } else {
            $errorInfo = $stmt->errorInfo();
            $errors[] = "Satır $row: Veritabanı hatası. " . $errorInfo[2];
            file_put_contents('import_debug.log', "Row $row: DB Error " . $errorInfo[2] . "\n", FILE_APPEND);
        }
    }
    fclose($handle);
    file_put_contents('import_debug.log', "Process End. Success: $successCount\n", FILE_APPEND);

    echo json_encode([
        "success" => true, 
        "message" => "$successCount kullanıcı başarıyla yüklendi.", 
        "errors" => $errors
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
