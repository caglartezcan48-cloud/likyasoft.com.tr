<?php
header('Content-Type: application/json; charset=utf-8');
include_once __DIR__ . '/../../core/database.php';
session_start();

// Security: Check if Admin or Accountant
$is_admin = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
$user_perms = $_SESSION['user_permissions'] ?? [];
$is_accountant = (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'accountant') ||
    (isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'employee' && !empty($user_perms['can_accounting']));

if (!$is_admin && !$is_accountant) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Admin or Accountant access required.']);
    exit;
}

try {
    $db = (new Database())->getConnection();

    // Select only existing columns
    $sql = "SELECT 
                id, 
                name as title, 
                email, 
                status as db_status, 
                role
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