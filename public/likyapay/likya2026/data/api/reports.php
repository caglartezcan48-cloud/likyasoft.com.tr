<?php
// Reports API
// Path: data/api/reports.php

include_once '../../core/database.php';
include_once '../../core/cors.php';

handleCors();
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Yetkisiz Erişim"]);
    exit;
}

try {
    $db = (new Database())->getConnection();
    
    // 1. Basic Counts
    $stats = [];
    
    // Total Users
    $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
    $stats['total_users'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Total Volume (All Approved Transactions)
    $stmt = $db->query("SELECT SUM(amount) as total FROM transactions WHERE status = 'approved' OR status = 'completed'");
    $stats['total_volume'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // Active Sirius Cycles
    $stmt = $db->query("SELECT COUNT(*) as count FROM sirius_cycles WHERE status != 'completed'");
    $stats['active_cycles'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Completed Sirius Cycles
    $stmt = $db->query("SELECT COUNT(*) as count FROM sirius_cycles WHERE status = 'completed'");
    $stats['completed_cycles'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // 2. Monthly Transaction Volume (Last 6 Months)
    $monthly = [];
    $stmt = $db->query("
        SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as total 
        FROM transactions 
        WHERE status IN ('approved', 'completed') 
        GROUP BY month 
        ORDER BY month DESC 
        LIMIT 6
    ");
    $monthlyData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stats['monthly_trend'] = array_reverse($monthlyData);

    // 3. System Revenue (From system_transactions)
    $stmt = $db->query("SELECT SUM(amount) as total FROM system_transactions WHERE type = 'income'");
    $stats['system_revenue'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    echo json_encode(["success" => true, "data" => $stats]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
