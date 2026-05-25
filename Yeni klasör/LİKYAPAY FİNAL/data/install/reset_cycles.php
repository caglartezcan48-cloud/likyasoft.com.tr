<?php
// Script to RESET Sirius Cycles only (Keeps Users and Transactions)
// Path: data/install/reset_cycles.php

header('Content-Type: text/html; charset=utf-8');
include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "<h1>Sirius Döngü Sıfırlama Aracı</h1>";

    // 1. Clear Cycles
    $db->query("TRUNCATE TABLE sirius_cycles");
    echo "<p>✅ 'sirius_cycles' tablosu temizlendi. Eski döngüler silindi.</p>";

    // 2. Clear Requests (Optional, keeping for fresh start)
    $db->query("TRUNCATE TABLE sirius_requests");
    echo "<p>✅ 'sirius_requests' tablosu temizlendi. Bekleyen talepler silindi.</p>";

    echo "<hr>";
    echo "<p><strong>Sonuç:</strong> Sistem sıfırlandı. Motoru tekrar çalıştırırsanız, mevcut borçlara göre döngüleri sıfırdan bulacaktır.</p>";

} catch (Exception $e) {
    echo "<h1 style='color:red;'>HATA</h1>";
    echo $e->getMessage();
}
?>
