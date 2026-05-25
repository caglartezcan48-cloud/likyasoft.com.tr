<?php
// Script to RESET Sirius Cycles only (Root Version)
// Path: reset_cycles_root.php

header('Content-Type: text/html; charset=utf-8');

// Adjust path for root execution
$dbPath = 'core/database.php';
if (!file_exists($dbPath)) {
    // Try fallback
    $dbPath = 'likyapay/core/database.php';
}

if (file_exists($dbPath)) {
    include_once $dbPath;
} else {
    die("Veritabanı dosyası bulunamadı: $dbPath");
}

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "<h1>Sirius Döngü Sıfırlama Aracı (Root)</h1>";

    // 1. Clear Cycles
    $db->query("TRUNCATE TABLE sirius_cycles");
    echo "<p>✅ 'sirius_cycles' tablosu temizlendi. Eski döngüler silindi.</p>";

    // 2. Clear Requests
    $db->query("TRUNCATE TABLE sirius_requests");
    echo "<p>✅ 'sirius_requests' tablosu temizlendi. Bekleyen talepler silindi.</p>";

    echo "<hr>";
    echo "<p><strong>Sonuç:</strong> Sistem sıfırlandı. Veritabanındaki borçlar duruyor, sadece döngüleri sildik. Artık Admin panelinden motoru tekrar çalıştırabilirsiniz.</p>";

} catch (Exception $e) {
    echo "<h1 style='color:red;'>HATA</h1>";
    echo $e->getMessage();
}
?>
