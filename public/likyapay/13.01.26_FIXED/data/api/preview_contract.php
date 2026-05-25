<?php
// data/api/preview_contract.php
// STANDALONE PREVIEW TOOL FOR SIRIUS FLOW V3
// No Database Connection Required - Uses Mock Data

header('Content-Type: text/html; charset=utf-8');

// --- MOCK DATA ---
$cycle_code = "DEMO-V3-FLOW";
$volume = 150000.00;
//$volFmt = number_format($volume, 2, ',', '.');
$date = date("d.m.Y");

// Chain: A -> B -> C -> D (Anchor)
$users = [
    'A' => ['name' => 'ATLAS İNŞAAT A.Ş.', 'tax_id' => '1111111111', 'tax_office' => 'Beşiktaş', 'address' => 'İstanbul', 'mersis_no' => '1234567890111111'],
    'B' => ['name' => 'BATI LOJİSTİK LTD. ŞTİ.', 'tax_id' => '2222222222', 'tax_office' => 'Kadıköy', 'address' => 'İstanbul', 'mersis_no' => '2222222222222222'],
    'C' => ['name' => 'CEMRE TEKSTİL A.Ş.', 'tax_id' => '3333333333', 'tax_office' => 'Çankaya', 'address' => 'Ankara', 'mersis_no' => '3333333333333333'],
    'D' => ['name' => 'MEGA YAPI HOLDİNG (ANCHOR)', 'tax_id' => '9999999999', 'tax_office' => 'Büyük Mükellefler', 'address' => 'İstanbul', 'mersis_no' => '9999999999999999'],
];

$nodes = ['1111111111', '2222222222', '3333333333', '9999999999']; // Tax IDs for A, B, C, D
$count = count($nodes);

// Get Role from GET param (0=A, 1=B, 2=C, 3=D)
$nodeIndex = isset($_GET['role_index']) ? intval($_GET['role_index']) : 0;
$roles = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3];

// --- NAVIGATION BAR ---
echo "<div style='background:#333; color:#fff; padding:10px; font-family:sans-serif; text-align:center;'>
    <strong>ÖNİZLEME MODU:</strong> 
    <a href='?role_index=0' style='color:#fff; margin:0 10px; " . ($nodeIndex==0 ? "font-weight:bold; text-decoration:underline" : "") . "'>Firma A (Devreden)</a> | 
    <a href='?role_index=1' style='color:#fff; margin:0 10px; " . ($nodeIndex==1 ? "font-weight:bold; text-decoration:underline" : "") . "'>Firma B (Ara)</a> | 
    <a href='?role_index=2' style='color:#fff; margin:0 10px; " . ($nodeIndex==2 ? "font-weight:bold; text-decoration:underline" : "") . "'>Firma C (Son Devreden)</a> | 
    <a href='?role_index=3' style='color:#fff; margin:0 10px; " . ($nodeIndex==3 ? "font-weight:bold; text-decoration:underline" : "") . "'>Firma D (Kök/Anchor)</a>
</div>";

// --- LOGIC FROM sirius.php ---

$anchorIndex = $count - 1; // D
$firstIndex  = 0;          // A
$isAnchor = ($nodeIndex === $anchorIndex);

// Identify Important Parties
$anchorTax = $nodes[$anchorIndex];
$anchorUser = $users['D']; 
$anchorName = $anchorUser['name'];

$firstTax = $nodes[$firstIndex];
$firstUser = $users['A']; 
$firstName = $firstUser['name'];

$myTaxId = $nodes[$nodeIndex];
// Find my key (A, B, C, D)
$myKey = array_search($myTaxId, array_column($users, 'tax_id')); // Hacky for mock
foreach($users as $k => $v) { if($v['tax_id'] == $myTaxId) $me = $v; }

$myName = $me['name'];
$myAddress = $me['address'];
$myTax = $me['tax_id'] . ' / ' . $me['tax_office'];
$myMersis = $me['mersis_no'];
$volFmt = number_format($volume, 2, ',', '.');
$code = $cycle_code;

// Navigation Logic
if (!$isAnchor) {
    // I am A, B, or C. I assign to NEXT.
    $nextIndex = ($nodeIndex + 1) % $count;
    $nextTax = $nodes[$nextIndex];
    foreach($users as $k=>$v) { if($v['tax_id']==$nextTax) $nextUser=$v; }
    
    $nextName = $nextUser['name'];
    $nextTaxInfo = $nextUser['tax_id'] . ' / ' . $nextUser['tax_office'];
    
    // My "Borçlu" is ALWAYS D (Anchor).
    // Target for contract text (Muhatap)
    $targetName = $anchorName;
    $targetTaxInfo = $anchorUser['tax_id'] . ' / ' . $anchorUser['tax_office'];
    $targetAddress = $anchorUser['address'];
} else {
    // I am D. "Prev" is C.
    $prevIndex = ($nodeIndex - 1 + $count) % $count;
    $prevTax = $nodes[$prevIndex];
    foreach($users as $k=>$v) { if($v['tax_id']==$prevTax) $prevUser=$v; }
    
    $prevName = $prevUser['name'];
    $prevTaxInfo = $prevUser['tax_id'] . ' / ' . $prevUser['tax_office'];
}

// Chain Names
$allNames = [];
foreach($nodes as $nt) {
    foreach($users as $k=>$v) { if($v['tax_id']==$nt) $allNames[$nt] = $v['name']; }
}

// --- HTML GENERATION (V4 LAYOUT) ---
echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Sözleşme Önizleme</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    body { font-family: 'Crimson Text', 'Times New Roman', serif; line-height: 1.5; color: #000; padding: 40px; max-width: 800px; margin: auto; }
    
    .amount-banner {
        background-color: #f1f5f9; border: 2px solid #cbd5e1;
        text-align: center; font-size: 24px; font-weight: bold;
        padding: 15px; margin-bottom: 30px; border-radius: 8px;
        color: #0f172a;
    }
    
    h2 { text-align: center; text-decoration: underline; margin-bottom: 30px; font-size: 18px; }
    h3 { text-decoration: underline; font-size: 14px; margin-top: 25px; }
    p { text-align: justify; margin-bottom: 12px; font-size: 13px; }
    
    .box { border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: #f9f9f9; page-break-inside: avoid; position: relative; }
    .party-title { font-weight: bold; border-bottom: 1px solid #ddd; margin-bottom: 5px; padding-bottom: 5px; font-size: 11px; text-transform:uppercase; color:#555; }
    
    /* 3-Column Signature Layout */
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; gap: 10px; }
    .sig { width: 32%; text-align: center; font-size: 11px; }
    .sig-line { border-top: 1px solid #000; margin-top: 40px; }
    .sig-title { font-weight: bold; margin-bottom: 5px; text-decoration:underline; }

    .page-break { page-break-before: always; border-top: 2px dashed #ccc; margin-top: 50px; padding-top: 50px; }
</style></head><body>";

// TOP AMOUNT BANNER
echo "<div class='amount-banner'>TEMLİK TUTARI: $volFmt TL</div>";

if (!$isAnchor) {
    // --- TEMLIK ---
    echo "<h2>ALACAĞIN DEVRİ (TEMLİK) SÖZLEŞMESİ</h2>";
    echo "<p><strong>Tarih:</strong> $date</p>";
    echo "<p>İşbu sözleşme, aşağıda belirtilen taraflar arasında akdedilmiştir:</p>";
    
    // Detailed Boxes
    echo "<div class='box'><div class='party-title'>DEVREDEN (SİZ)</div>
    <strong>$myName</strong><br>VN: $myTax<br>Adres: $myAddress<br>Mersis: $myMersis</div>";
    
    echo "<div class='box'><div class='party-title'>DEVRALAN (ALACAKLI)</div>
    <strong>$nextName</strong><br>VN: $nextTaxInfo<br>Adres: {$nextUser['address']}<br>Mersis: {$nextUser['mersis_no']}</div>";
    
    echo "<div class='box'><div class='party-title'>MUHATAP (ASIL BORÇLU)</div>
    <strong>$anchorName</strong><br>VN: $targetTaxInfo<br>Adres: {$anchorUser['address']}<br>Mersis: {$anchorUser['mersis_no']}</div>";
    
    echo "<h3>1. SÖZLEŞMENİN KONUSU</h3>";
    echo "<p><strong>$myName</strong>'nin (Bundan böyle 'DEVREDEN' olarak anılacaktır), MUHATAP <strong>$anchorName</strong> nezdinde doğmuş ve doğacak olan, Sirius Döngü Sistemi (Ref: #$code) kapsamında tespit edilen <strong>$volFmt TL</strong> tutarındaki alacağının, <strong>$nextName</strong> (Bundan böyle 'DEVRALAN' olarak anılacaktır) firmasına gayrikabili rücu olarak devredilmesidir.</p>";
    
    // CHAIN HISTORY FOR C -> D
    if ($nextIndex === $anchorIndex) {
         echo "<div style='border:2px solid #3366cc; padding:10px; background:#eef2ff; font-weight:bold; font-size:12px;'>";
         echo "ZİNCİR BEYANI (KÖKEN): İşbu alacak, başlangıçta $firstName firmasından doğmuş olup, sırasıyla ";
         $chainStr = "";
         for($i=1; $i<=$nodeIndex; $i++) {
             $chainStr .= $allNames[$nodes[$i]] . " -> ";
         }
         echo $chainStr . " firmalarına devredilerek tarafıma ulaşmıştır.";
         echo "</div>";
    }
    
    echo "<h3>2. BEYAN VE KABUL</h3>";
    echo "<p><strong>$myName</strong>, söz konusu alacağı işbu sözleşme ile <strong>$nextName</strong> firmasına tüm fer'ileri ile birlikte devrettiğini, alacağın kendisine ait olduğunu ve üzerinde başkaca bir takyidat bulunmadığını beyan eder.</p>";
    
    // 3-COLUMN SIGNATURE
    echo "<div class='signatures'>
        <div class='sig'><div class='sig-title'>DEVREDEN</div>$myName<div class='sig-line'></div></div>
        <div class='sig'><div class='sig-title'>MUHATAP (BORÇLU)</div>$anchorName<div class='sig-line'></div></div>
        <div class='sig'><div class='sig-title'>DEVRALAN</div>$nextName<div class='sig-line'></div></div>
    </div>";

    // --- DEBT CLOSURE FORM ---
    echo "<div class='page-break'></div>";
    echo "<div class='amount-banner' style='font-size:16px; padding:10px;'>İŞLEM TUTARI: $volFmt TL</div>";
    echo "<h2>BORÇ TASFİYE VE İBRA BELGESİ</h2>";
    echo "<p style='text-align:center; font-style:italic; margin-bottom:20px;'>(Sistem tarafından otomatik oluşturulan Ek Form)</p>";
    
    echo "<div class='protocol-no' style='text-align:center; font-weight:bold; font-size:14px; margin-bottom:20px;'>PROTOKOL NO: $code</div>";
    
    echo "<div class='box'><div class='party-title'>BORÇLU (ÖDEYEN)</div>
    <strong>$myName</strong><br>VN: $myTax<br>Adres: $myAddress<br>Mersis: $myMersis</div>";
    
    echo "<div class='box'><div class='party-title'>ALACAKLI (TAHSİL EDEN)</div>
    <strong>$nextName</strong><br>VN: $nextTaxInfo<br>Adres: {$nextUser['address']}<br>Mersis: {$nextUser['mersis_no']}</div>";
    
    echo "<p>Yukarıda detayları verilen Alacağın Devri işlemine istinaden;</p>";
    echo "<p>Şirketimiz <strong>$myName</strong>, <strong>$nextName</strong> firmasına olan <strong>$volFmt TL</strong> tutarındaki borcunu, işbu temlik işlemi ile ödemiş sayılmaktadır.</p>";
    
    echo "<div class='box' style='text-align:center; font-weight:bold; border-color:#22c55e; background:#f0fdf4;'>
    İŞLEM SONUCU: $myName firmasının $nextName firmasına olan borcu KAPATILMIŞTIR.
    </div>";
    
    echo "<div class='signatures'>
        <div class='sig'><div class='sig-title'>BORÇLU</div>$myName<div class='sig-line'></div></div>
        <div class='sig' style='visibility:hidden;'></div>
        <div class='sig'><div class='sig-title'>ALACAKLI</div>$nextName<div class='sig-line'></div></div>
    </div>";

} else {
    // --- MAHSUPLASME ---
    echo "<h2>MAHSUPLAŞMA VE İBRA PROTOKOLÜ</h2>";
    echo "<div class='amount-banner'>MAHSUP TUTARI: $volFmt TL</div>";
    
    echo "<div class='box'><div class='party-title'>1. TARAF (MAHSUP EDEN - SİZ)</div>
    <strong>$myName</strong><br>(Asıl Borçlu)</div>";
    
    echo "<div class='box'><div class='party-title'>2. TARAF (İLK ALACAKLI - A)</div>
    <strong>$firstName</strong><br>(Mahsup Edilen Borcun Alacaklısı)</div>";
     
    echo "<div class='box'><div class='party-title'>3. TARAF (SON DEVREDEN - C)</div>
    <strong>$prevName</strong><br>(Temlik Eden)</div>";

    echo "<h3>PROTOKOL KONUSU</h3>";
    echo "<div class='box' style='background:#fefce8; border:1px solid #facc15'>";
    echo "<p>Şirketimiz <strong>$myName</strong>, <strong>$firstName</strong> firmasına olan <strong>$volFmt TL</strong> tutarındaki mevcut borcuna karşılık;</p>";
    echo "<p><strong>$prevName</strong> firmasından tarafımıza temlik edilen ve aslı yine Şirketimize ($myName) ait olan alacağı mahsup etmeyi kabul ve beyan eder.</p>";
    echo "</div>";
    
    // Chain String
    $pathStr = "";
    foreach($nodes as $n){ $pathStr .= $allNames[$n] . " > "; }
    $pathStr = rtrim($pathStr, " > ");
    
    echo "<p style='font-size:11px; color:#555;'><strong>DÖNGÜ GEÇMİŞİ:</strong> Bu alacak $pathStr zincirini izleyerek kaynağına geri dönmüştür.</p>";
    
    echo "<h3>SONUÇ</h3>";
    echo "<p>İşbu işlem neticesinde, <strong>$myName</strong> firmasının <strong>$firstName</strong> firmasına olan borcu ve aynı zamanda <strong>$prevName</strong> firmasından olan alacağı, Türk Borçlar Kanunu'nun alacaklı ve borçlu sıfatlarının birleşmesi hükümleri gereğince sona ermiştir.</p>";
    
     echo "<div class='signatures'>
        <div class='sig'><div class='sig-title'>MAHSUP EDEN</div>$myName<div class='sig-line'></div></div>
        <div class='sig'><div class='sig-title'>MUHATAP (BORÇLU)</div>$firstName<div class='sig-line'></div></div>
        <div class='sig'><div class='sig-title'>SİSTEM ONAYI</div>Sirius #$code<div class='sig-line'></div></div>
    </div>";
}
echo "</body></html>";
?>
