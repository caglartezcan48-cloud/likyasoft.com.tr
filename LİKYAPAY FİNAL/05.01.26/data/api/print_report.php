<?php
// Printable General Report
// Path: data/api/print_report.php

include_once '../../core/database.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    die("Yetkisiz Erişim");
}

$db = (new Database())->getConnection();
$date = date('d.m.Y H:i');

// Quick Stats Fetch
$totalUsers = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
$totalTx = $db->query("SELECT COUNT(*) FROM transactions")->fetchColumn();
$totalVol = $db->query("SELECT SUM(amount) FROM transactions WHERE status IN ('approved','completed')")->fetchColumn();
$siriusCycles = $db->query("SELECT COUNT(*) FROM sirius_cycles")->fetchColumn();
$siriusVol = $db->query("SELECT SUM(total_volume) FROM sirius_cycles")->fetchColumn(); // Fix: column name is total_volume

?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>LikyaPay Genel Sistem Raporu</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 1000px; margin: 0 auto; }
        .header { border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: end; }
        .logo { font-size: 24pt; font-weight: 900; color: #1e293b; }
        .logo span { color: #6366f1; }
        .meta { text-align: right; color: #64748b; font-size: 10pt; }
        
        h2 { border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; color: #0f172a; margin-top: 40px; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .kpi { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .kpi h4 { margin: 0 0 10px 0; color: #64748b; font-size: 10pt; text-transform: uppercase; }
        .kpi .val { font-size: 18pt; font-weight: bold; color: #0f172a; }

        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10pt; }
        th { text-align: left; background: #f1f5f9; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #475569; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }

        .footer { margin-top: 60px; font-size: 9pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        @media print { .no-print { display: none; } body { padding: 0; } }
    </style>
</head>
<body>
    <div class="no-print" style="text-align: center; margin-bottom: 30px; padding: 15px; background: #e0e7ff; color: #3730a3; border-radius: 8px; font-weight: bold;">
        <button onclick="window.print()" style="background: #3730a3; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
            🖨️ Yazdır / PDF Olarak Kaydet
        </button>
    </div>

    <div class="header">
        <div class="logo">Likya<span>Pay</span></div>
        <div class="meta">
            Rapor Tarihi: <?php echo $date; ?><br>
            Oluşturan: Yönetici
        </div>
    </div>

    <div class="kpi-grid">
        <div class="kpi">
            <h4>Toplam Kayıtlı Firma</h4>
            <div class="val"><?php echo number_format($totalUsers); ?></div>
        </div>
        <div class="kpi">
            <h4>Toplam İşlem Hacmi</h4>
            <div class="val">₺<?php echo number_format($totalVol ?? 0, 2); ?></div>
        </div>
        <div class="kpi">
            <h4>Toplam İşlem Adedi</h4>
            <div class="val"><?php echo number_format($totalTx); ?></div>
        </div>
    </div>

    <h2>Sirius Döngü Özeti</h2>
    <div class="kpi-grid">
        <div class="kpi">
            <h4>Döngü Sayısı</h4>
            <div class="val"><?php echo number_format($siriusCycles); ?></div>
        </div>
        <div class="kpi">
            <h4>Mahsuplaşılan Tutar</h4>
            <div class="val" style="color: #16a34a">₺<?php echo number_format($siriusVol ?? 0, 2); ?></div>
        </div>
    </div>

    <h2>Son 10 İşlem (Özet)</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Tarih</th>
                <th>Borçlu</th>
                <th>Alacaklı</th>
                <th>Tutar</th>
                <th>Durum</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $sql = "SELECT t.id, t.created_at, t.amount, t.status, u1.name as dname, u2.name as cname 
                    FROM transactions t 
                    JOIN users u1 ON t.user_id = u1.id 
                    JOIN users u2 ON t.related_user_id = u2.id 
                    ORDER BY t.created_at DESC LIMIT 10";
            foreach($db->query($sql) as $row) {
                echo "<tr>";
                echo "<td>#{$row['id']}</td>";
                echo "<td>" . date('d.m.Y H:i', strtotime($row['created_at'])) . "</td>";
                echo "<td>{$row['dname']}</td>";
                echo "<td>{$row['cname']}</td>";
                echo "<td>₺" . number_format($row['amount'], 2) . "</td>";
                echo "<td>{$row['status']}</td>";
                echo "</tr>";
            }
            ?>
        </tbody>
    </table>

    <div class="footer">
        Bu rapor LikyaPay Yönetim Paneli üzerinden oluşturulmuştur.
    </div>
</body>
</html>
