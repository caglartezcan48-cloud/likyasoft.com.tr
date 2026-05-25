<?php
include_once '../../core/database.php';
include_once '../../core/cors.php';

handleCors();
header("Content-Type: application/json; charset=UTF-8");

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        throw new Exception("Veritabanı bağlantısı kurulamadı.");
    }

    // Direct Query
    // List ALL users (except potentially the main super admin if needed, currently ID=1 usually)
    // Removed "WHERE role != 'admin'" so Employees (who might be admins) are visible.
    $query = "SELECT * FROM users WHERE id != 1 ORDER BY id DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $records = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Status Mapping (DB Turkish -> Frontend English)
        $dbStatus = $row['status'] ?? 'Ön Kayıt';
        $frontendStatus = 'pending';
        
        if ($dbStatus === 'Aktif') {
            $frontendStatus = 'verified';
        } elseif ($dbStatus === 'Ön Kayıt') {
            // Ayrıştırma Mantığı:
            // Telefon yoksa veya email 'pre_' ile başlıyorsa -> Sistem tarafından oluşturulmuş (Ön Onaylı)
            // Aksi halde -> Kullanıcı formu doldurmuş (Başvuru)
            if (empty($row['phone']) || strpos($row['email'], 'pre_') === 0) {
                $frontendStatus = 'pre_approved';
            } else {
                $frontendStatus = 'pending';
            }
        } elseif ($dbStatus === 'Pasif') {
            $frontendStatus = 'banned';
        } else {
            $frontendStatus = $dbStatus; // Fallback
        }

        $item = array(
            "id" => $row['id'],
            "name" => $row['name'] ?? 'İsimsiz',
            "email" => $row['email'] ?? '',
            "tax_id" => $row['tax_id'] ?? '',
            "role" => $row['role'] ?? 'user',
            "account_type" => $row['user_type'] ?? 'company', // Frontend expects account_type
            "permissions" => $row['permissions'] ?? null,
            "status" => $frontendStatus,
            "original_status" => $dbStatus // Debug için
        );
        array_push($records, $item);
    }
    
    // Output JSON
    echo json_encode(["records" => $records], JSON_UNESCAPED_UNICODE);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Connection Error: " . $e->getMessage()]);
}
?>
