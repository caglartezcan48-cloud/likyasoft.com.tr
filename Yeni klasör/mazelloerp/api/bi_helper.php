<?php
/**
 * MAZELLO BI HELPER
 * Handles Cache Recalculation for high-performance analytics.
 */

function refreshBIDailyStats($db, $date = null)
{
    if (!$date)
        $date = date('Y-m-d');

    try {
        // Calculate stats for the given day
        $sql = "
            SELECT 
                COUNT(*) as total_count,
                SUM(genel_toplam) as total_amount
            FROM teklifler 
            WHERE durum = 'satis' AND DATE(created_at) = ?
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute([$date]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $count = (int) ($row['total_count'] ?? 0);
        $amount = (float) ($row['total_amount'] ?? 0);

        // Update BI cache table
        $sqlInsert = "
            INSERT INTO bi_daily_stats (stat_date, total_sales_amount, total_sales_count)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                total_sales_amount = VALUES(total_sales_amount),
                total_sales_count = VALUES(total_sales_count)
        ";
        $db->prepare($sqlInsert)->execute([$date, $amount, $count]);

        return true;
    } catch (Exception $e) {
        error_log("BI Cache Update Error: " . $e->getMessage());
        return false;
    }
}
?>