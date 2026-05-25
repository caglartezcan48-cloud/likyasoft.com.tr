<?php
// Admin Dashboard API
// Path: data/api/admin_dashboard.php

header('Content-Type: application/json');
include_once '../../core/database.php';

session_start();

// Security: Check if admin or accountant
if (!isset($_SESSION['user_role']) || !in_array($_SESSION['user_role'], ['admin', 'accountant', 'employee'])) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Yetkisiz erişim."]);
    exit;
}

try {
    $db = (new Database())->getConnection();

    // 1. Pending User Approvals (status = 'pending' or 'pre_approved' or 'Ön Kayıt')
    // Adjust status based on actual usage. Usually 'Ön Kayıt' or 'pending'.
    $stmtUser = $db->query("SELECT COUNT(*) FROM users WHERE status IN ('pending', 'Ön Kayıt', 'Onay Bekliyor')");
    $pendingUsers = $stmtUser->fetchColumn();

    // 2. Pending Invoices (transactions status = 'pending'?? Or is there an invoices table?)
    // Looking at previous chats, transactions table is used.
    // Or maybe 'project_invoices'?
    // Let's assume 'transactions' where type='invoice'??
    // Actually, based on Sidebar 'pending_invoices', let's check basic transaction pending count.
    // Or if detailed invoice usage exits.
    // Let's check 'transactions' table for status='pending'.
    $stmtInv = $db->query("SELECT COUNT(*) FROM transactions WHERE status = 'pending'");
    $pendingInvoices = $stmtInv->fetchColumn();

    echo json_encode([
        "success" => true,
        "counts" => [
            "pending_users" => (int) $pendingUsers,
            "pending_invoices" => (int) $pendingInvoices
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>