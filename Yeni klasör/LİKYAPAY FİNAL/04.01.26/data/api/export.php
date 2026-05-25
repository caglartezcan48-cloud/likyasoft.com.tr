<?php
// Export Helper
// Path: data/api/export.php

include_once '../../core/database.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    die("Yetkisiz.");
}

$type = $_GET['type'] ?? 'transactions';
$database = new Database();
$db = $database->getConnection();

if ($type === 'transactions') {
    $user_id = $_SESSION['user_id'];
    $role = $_SESSION['user_role'];
    
    if ($role === 'admin' && isset($_GET['all'])) {
        $query = "SELECT t.*, u1.name as debter_name, u2.name as creditor_name 
                  FROM transactions t
                  LEFT JOIN users u1 ON t.user_id = u1.id
                  LEFT JOIN users u2 ON t.related_user_id = u2.id
                  ORDER BY t.date DESC";
    } else {
        $query = "SELECT * FROM transactions WHERE user_id = :uid ORDER BY date DESC";
    }
    
    $stmt = $db->prepare($query);
    if ($role !== 'admin' || !isset($_GET['all'])) {
        $stmt->bindParam(':uid', $user_id);
    }
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=likyapay_hesap_ozeti_' . date('Y-m-d') . '.csv');
    
    $output = fopen('php://output', 'w');
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM for Excel
    
    if ($role === 'admin' && isset($_GET['all'])) {
        fputcsv($output, ['ID', 'Borçlu', 'Alacaklı', 'Tip', 'Tutar', 'Açıklama', 'Durum', 'Tarih']);
        foreach ($data as $row) {
            fputcsv($output, [$row['id'], $row['debter_name'], $row['creditor_name'], $row['type'], $row['amount'], $row['description'], $row['status'], $row['date']]);
        }
    } else {
        fputcsv($output, ['ID', 'Tip', 'Tutar', 'Açıklama', 'Durum', 'Tarih']);
        foreach ($data as $row) {
            fputcsv($output, [$row['id'], $row['type'], $row['amount'], $row['description'], $row['status'], $row['date']]);
        }
    }
    fclose($output);
}
?>
