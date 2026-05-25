<?php
// DB CONNECTION
include 'db.php';
header('Content-Type: text/plain; charset=utf-8');

$name = isset($_GET['name']) ? $_GET['name'] : 'Derya';
echo "DEBUGGING FOR CUSTOMER NAME LIKE: $name\n";
echo "===========================================\n";

// 1. FIND CUSTOMER ID
$stmt = $db->prepare("SELECT * FROM cariler WHERE ad_soyad LIKE ?");
$stmt->execute(["%$name%"]);
$customer = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$customer) {
    echo "CUSTOMER NOT FOUND!\n";
    exit;
}

echo "FOUND CUSTOMER: " . $customer['ad_soyad'] . " (ID: " . $customer['id'] . ")\n";
echo "TYPE: " . $customer['cari_tipi'] . "\n";
echo "-------------------------------------------\n";

$cid = $customer['id'];

// 2. CHECK TEKLIFLER TABLE (RAW)
echo "\nChecking 'teklifler' table for musteri_id = $cid:\n";
$stmt2 = $db->prepare("SELECT id, teklif_no, durum, toplam_tutar, created_at, satis_tarihi FROM teklifler WHERE musteri_id = ?");
$stmt2->execute([$cid]);
$rows = $stmt2->fetchAll(PDO::FETCH_ASSOC);

if (count($rows) == 0)
    echo "NO RECORDS IN 'teklifler'.\n";

foreach ($rows as $r) {
    echo "ID: " . $r['id'] . " | No: " . $r['teklif_no'] . " | STATUS: [" . $r['durum'] . "] | TOTAL: " . $r['toplam_tutar'] . "\n";

    // Check Status Valid
    $status = strtolower($r['durum']);
    if ($status === 'teklif' || $status === 'iptal') {
        echo " -> SKIPPED (Status is offer/cancelled)\n";
    } else {
        echo " -> SHOULD APPEAR IN LEDGER (Valid status)\n";
    }
}

// 3. CHECK API LOGIC RESULT
echo "\n-------------------------------------------\n";
echo "Simulating API Logic (save_data.php):\n";

$ledger = [];
foreach ($rows as $r) {
    $status = isset($r['durum']) ? strtolower($r['durum']) : '';
    if ($status === 'teklif' || $status === 'iptal')
        continue;

    $amt = floatval($r['toplam_tutar']);
    echo "+ Adding Debt: $amt TL (Ref: " . $r['teklif_no'] . ")\n";
    $ledger[] = $amt;
}

echo "Total Debt Logic Sum: " . array_sum($ledger) . "\n";
?>