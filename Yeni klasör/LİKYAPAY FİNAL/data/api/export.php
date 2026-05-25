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
    
    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;
    // Category maps to Transaction 'type' (e.g., debt, credit, payment) or 'status'
    $category = $_GET['category'] ?? null; 

    if ($role === 'admin' && isset($_GET['all'])) {
        $sql = "SELECT t.*, u1.name as debter_name, u2.name as creditor_name 
                  FROM transactions t
                  LEFT JOIN users u1 ON t.user_id = u1.id
                  LEFT JOIN users u2 ON t.related_user_id = u2.id
                  WHERE 1=1";
        
        $params = [];

        if ($start_date) {
            $sql .= " AND t.date >= :start";
            $params[':start'] = $start_date;
        }
        if ($end_date) {
            $sql .= " AND t.date <= :end";
            $params[':end'] = $end_date . ' 23:59:59';
        }
        if ($category && $category !== 'all') {
            switch ($category) {
                case '120': // Alicilar (Receivables)
                    $sql .= " AND t.type = 'credit'";
                    break;
                case '320': // Saticilar (Payables)
                    $sql .= " AND t.type = 'debt'";
                    break;
                case '329': // Sirius Matches
                    $sql .= " AND (t.description LIKE '%Sirius%' OR t.status IN ('Sirius (Tamamlandı)', 'completed'))";
                    break;
                case '600': // Sales (Revenue)
                    $sql .= " AND t.type = 'credit' AND t.status = 'approved'";
                    break;
                case '153': // Inventory/Purchases (Incoming Invoices)
                    $sql .= " AND t.type = 'debt' AND t.status = 'approved'";
                    break;
                case '102': // Bank (Payments) - Assuming 'payment' type or keyword
                    $sql .= " AND (t.type = 'payment' OR t.description LIKE '%Banka%' OR t.description LIKE '%Havale%' OR t.description LIKE '%EFT%')";
                    break;
                case '100': // Cash
                     $sql .= " AND (t.description LIKE '%Nakit%' OR t.description LIKE '%Kasa%')";
                    break;
                case '770': // Expenses
                     $sql .= " AND (t.type = 'debt' AND (t.description LIKE '%Gider%' OR t.description LIKE '%Fatura%' OR t.description LIKE '%Elektrik%' OR t.description LIKE '%Kira%'))";
                    break;
            }
        }

        $sql .= " ORDER BY debter_name ASC, t.date DESC";
        $stmt = $db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
    } else {
        // User Logic
        // ... (Keep existing simple user logic or upgrade similar to admin if needed)
        $query = "SELECT * FROM transactions WHERE user_id = :uid ORDER BY date DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':uid', $user_id);
    }
    
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // --- MERGE SYSTEM TRANSACTIONS (For Full Coverage) ---
    // Fetch system-side invoices that might not be mirrored or just for audit
    if ($role === 'admin' && isset($_GET['all'])) {
        $sysSql = "SELECT * FROM system_transactions WHERE 1=1";
        $sysParams = [];
        
        if ($start_date) { $sysSql .= " AND date >= :start"; $sysParams[':start'] = $start_date; }
        if ($end_date) { $sysSql .= " AND date <= :end"; $sysParams[':end'] = $end_date . ' 23:59:59'; }
        
        $sysStmt = $db->prepare($sysSql);
        foreach ($sysParams as $k => $v) { $sysStmt->bindValue($k, $v); }
        $sysStmt->execute();
        $sysData = $sysStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($sysData as $sysRow) {
            // Map System Transaction to Transaction Format
            $mapped = [
                'id' => 'SYS-' . $sysRow['id'], // Prefix to distinguish
                'debter_name' => ($sysRow['type'] === 'income') ? $sysRow['entity_name'] : 'LİKYAPAY (Kasa)',
                'creditor_name' => ($sysRow['type'] === 'income') ? 'LİKYAPAY (Kasa)' : $sysRow['entity_name'],
                'type' => ($sysRow['type'] === 'income') ? 'debt' : 'credit', // Income for system = Debt for user
                'amount' => $sysRow['amount'],
                'description' => '[SİSTEM FATURASI] ' . $sysRow['category'] . ' - ' . $sysRow['description'],
                'status' => $sysRow['status'],
                'date' => $sysRow['date'],
                'created_at' => $sysRow['created_at'] ?? $sysRow['date']
            ];
            $data[] = $mapped;
        }

        // Sort combined array by date DESC
        usort($data, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
    }
    // -----------------------------------------------------
    
    // Generate HTML-Excel for formatting support
    // Filename .xls allows Excel to open it (with a warning, but renders styles)
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment; filename=likyapay_muhasebe_dokumu_' . date('Y-m-d') . '.xls');
    
    // Excel-compatible HTML Template
    echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    echo '<head>';
    echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
    echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>LikyaPay Rapor</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
    echo '<style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #4f46e5; color: white; border: 1px solid #000; padding: 5px; text-align: center; }
        td { border: 1px solid #ccc; padding: 5px; vertical-align: middle; }
        .group-header { background-color: #e0e7ff; font-weight: bold; font-size: 12pt; border: 1px solid #000; color: #1e1b4b; }
        .amount { text-align: right; font-family: "Courier New", monospace; }
        .status-badge { font-weight: bold; }
    </style>';
    echo '</head><body>';
    
    echo '<table>';
    
    if ($role === 'admin' && isset($_GET['all'])) {
        // Headers
        echo '<thead><tr>
            <th>Fiş No</th>
            <th>Muhasebe Kodu</th>
            <th>İşlem Kategorisi</th>
            <th>Borçlu Firma</th>
            <th>Alacaklı Firma</th>
            <th>İşlem Tipi</th>
            <th>Tutar (TL)</th>
            <th>Açıklama</th>
            <th>Durum</th>
            <th>Tarih</th>
        </tr></thead>';
        echo '<tbody>';

        $currentGroup = null;
        
        foreach ($data as $row) {
            // Group by Debtor Name (Main Entity usually)
            // Or grouping by "User" makes sense if we want to see a statement per company
            $groupBy = $row['debter_name']; 
            
            if ($groupBy !== $currentGroup) {
                $currentGroup = $groupBy;
                // Group Header Row
                echo '<tr>';
                echo '<td colspan="10" class="group-header">' . htmlspecialchars($currentGroup) . ' - Hesap Hareketleri</td>';
                echo '</tr>';
            }

            // Determine Accounting Code (Heuristic)
            $acc_code = '---';
            $acc_cat  = 'Diğer';
            $desc_lower = mb_strtolower($row['description']);

            if (strpos($row['description'], 'Sirius') !== false || $row['status'] == 'Sirius (Tamamlandı)') {
                $acc_code = '329.01'; $acc_cat = 'Sirius Mahsuplaşma';
            } elseif (strpos($desc_lower, 'banka') !== false || strpos($desc_lower, 'havale') !== false || strpos($desc_lower, 'eft') !== false || $row['type'] === 'payment') {
                $acc_code = '102.01'; $acc_cat = 'Banka İşlemleri';
            } elseif (strpos($desc_lower, 'nakit') !== false || strpos($desc_lower, 'kasa') !== false) {
                 $acc_code = '100.01'; $acc_cat = 'Kasa (Nakit)';
            } elseif ($row['type'] === 'credit') {
                if ($row['status'] === 'approved') {
                    $acc_code = '600.01'; $acc_cat = 'Yurt İçi Satışlar (Gelir)';
                } else {
                    $acc_code = '120.01'; $acc_cat = 'Alıcılar (Bekleyen Tahsilat)';
                }
            } elseif ($row['type'] === 'debt') {
                 if (strpos($desc_lower, 'gider') !== false || strpos($desc_lower, 'kira') !== false) {
                    $acc_code = '770.01'; $acc_cat = 'Genel Yönetim Giderleri';
                 } elseif ($row['status'] === 'approved') {
                    $acc_code = '153.01'; $acc_cat = 'Ticari Mallar (Alış)';
                 } else {
                    $acc_code = '320.01'; $acc_cat = 'Satıcılar (Bekleyen Ödeme)';
                 }
            }

            echo '<tr>';
            echo '<td>' . htmlspecialchars($row['id']) . '</td>';
            echo '<td>' . $acc_code . '</td>';
            echo '<td>' . $acc_cat . '</td>';
            echo '<td>' . htmlspecialchars($row['debter_name']) . '</td>';
            echo '<td>' . htmlspecialchars($row['creditor_name']) . '</td>';
            echo '<td>' . ($row['type'] === 'debt' ? 'Borç Dekontu' : 'Alacak Dekontu') . '</td>';
            echo '<td class="amount">' . number_format($row['amount'], 2, ',', '.') . '</td>';
            echo '<td>' . htmlspecialchars($row['description']) . '</td>';
            echo '<td>' . htmlspecialchars($row['status']) . '</td>';
            echo '<td>' . date('d.m.Y H:i', strtotime($row['date'])) . '</td>';
            echo '</tr>';
        }
        echo '</tbody>';
    } else {
        // Simple User Export (Keep as HTML Table too for consistency/simplicity)
        echo '<thead><tr><th>ID</th><th>Tip</th><th>Tutar</th><th>Açıklama</th><th>Durum</th><th>Tarih</th></tr></thead><tbody>';
        foreach ($data as $row) {
             echo '<tr>';
             echo '<td>' . $row['id'] . '</td>';
             echo '<td>' . $row['type'] . '</td>';
             echo '<td>' . number_format($row['amount'], 2) . '</td>';
             echo '<td>' . $row['description'] . '</td>';
             echo '<td>' . $row['status'] . '</td>';
             echo '<td>' . $row['date'] . '</td>';
             echo '</tr>';
        }
        echo '</tbody>';
    }
    
    echo '</table>';
    echo '</body></html>';

}
?>
