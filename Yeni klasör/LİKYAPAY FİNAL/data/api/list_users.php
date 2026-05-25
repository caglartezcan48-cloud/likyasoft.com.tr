<?php
header('Content-Type: application/json; charset=utf-8');
include_once __DIR__ . '/../../core/database.php';
session_start();

// Security: Check if Admin
if (!isset($_SESSION['user_role']) || strtolower($_SESSION['user_role']) !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $db = (new Database())->getConnection();
    
    // Select all users with mapped columns
    $sql = "SELECT 
                id, 
                name as title, 
                username, 
                email, 
                phone, 
                user_type as account_type, 
                status as db_status, 
                tax_id as taxNo, 
                sector, 
                role,
                kep_address as kepAddress 
            FROM users 
            ORDER BY id DESC";
            
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Map status values for frontend
    $statusMap = [
        'Aktif' => 'verified',
        'Ön Kayıt' => 'pending',
        'Pasif' => 'banned',
        'İzinli' => 'pending' // Treat as pending or other
    ];

    foreach ($users as &$user) {
        // Map DB status to Frontend status
        // Default to 'banned' (gray/passive) if unknown
        $user['status'] = isset($statusMap[$user['db_status']]) ? $statusMap[$user['db_status']] : 'banned';
        
        // Ensure account_type is lower case
        $user['account_type'] = strtolower($user['account_type'] ?? 'company');
        
        // Ensure permissions is empty object if null (though not selecting it here to save bandwidth unless needed)
        // Frontend uses permissions for Employees mainly.
    }

    echo json_encode(['success' => true, 'users' => $users]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
