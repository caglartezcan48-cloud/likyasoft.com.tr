<?php
// test_invoice_archive.php
include_once '../../core/database.php';

// Mock Data
$cycle = [
    'id' => 9999,
    'cycle_code' => 'TEST-CYCLE-01',
    'total_volume' => 100000.00
];

// Get a real user
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT * FROM users WHERE tax_id IS NOT NULL LIMIT 1");
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    die("No user found for test.");
}

echo "Testing for User: " . $user['name'] . " (Tax: " . $user['tax_id'] . ")\n";

// --- PASTE FUNCTION HERE ---
function generateSiriusInvoiceHTML($db, $cycle, $user) {
    if (!$user || empty($user['tax_id'])) {
        throw new Exception("Kullanıcı verisi eksik.");
    }
    
    $cycle_id = $cycle['id'];
    $myTaxId = $user['tax_id'];
    
    // ARCHIVELOGIC
    $archiveDir = "../../uploads/archives/sirius/";
    if (!is_dir($archiveDir)) mkdir($archiveDir, 0777, true);
    $archiveFile = $archiveDir . "invoice_{$cycle_id}_{$myTaxId}.html";

    // 1. Calculate Amounts
    $volume = (float)$cycle['total_volume'];
    
    // Fee Calculation: 3% of Volume + VAT
    // Total Invoice Amount = (Volume * 0.03) * 1.20
    $baseAmount = $volume * 0.03; 
    $vatRate = 20;
    $vatAmount = $baseAmount * 0.20;
    $totalAmount = $baseAmount + $vatAmount;
    
    // Formatting
    $dateFormatted = date('d.m.Y');
    $invoiceNo = "SIRIUS-" . date('Y') . "-" . str_pad($cycle['id'], 5, '0', STR_PAD_LEFT);
    
    // Helper for Number Text
    if (!function_exists('convertNumberToTextTR')) {
        function convertNumberToTextTR($amount) {
            $ones = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
            $tens = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
            if ($amount == 0) return "SIFIR";
            $whole = floor($amount);
            $fraction = round(($amount - $whole) * 100);
            $text = "";
            $tempWhole = $whole;
            if ($tempWhole >= 1000000) { $m = floor($tempWhole / 1000000); $text .= ($m == 1 ? "BİR" : convertGroup($m, $ones, $tens)) . " MİLYON "; $tempWhole %= 1000000; }
            if ($tempWhole >= 1000) { $t = floor($tempWhole / 1000); $text .= ($t == 1 ? "" : convertGroup($t, $ones, $tens)) . " BİN "; $tempWhole %= 1000; }
            if ($tempWhole > 0) { $text .= convertGroup($tempWhole, $ones, $tens); }
            $text .= " TÜRK LİRASI";
            if ($fraction > 0) { $text .= ", " . convertGroup($fraction, $ones, $tens) . " KURUŞ"; }
            return trim($text);
        }
    }
    if (!function_exists('convertGroup')) {
        function convertGroup($n, $ones, $tens) {
             $str = ""; $h = floor($n / 100); $t = floor(($n % 100) / 10); $u = $n % 10;
             if ($h > 0) $str .= ($h == 1 ? "" : $ones[$h]) . " YÜZ ";
             if ($t > 0) $str .= $tens[$t] . " ";
             if ($u > 0) { if (!($n > 2000 && $n < 3000)) $str .= $ones[$u] . " "; }
             return $str;
        }
    }

    $totalText = convertNumberToTextTR($totalAmount);

    ob_start();
    echo "<!DOCTYPE html><html lang='tr'><head><meta charset='UTF-8'><title>Fatura $invoiceNo</title>";
    echo "<style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        body { font-family: 'Roboto', 'Arial', sans-serif; margin: 0; padding: 0; background: #525659; }
        .page { background: white; width: 210mm; min-height: 297mm; margin: 20px auto; padding: 40px; box-sizing: border-box; position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.3); }
        .logo { font-size: 24pt; font-weight: 800; color: #0f172a; } .logo span { color: #6366f1; }
        .meta-table { width: 100%; border-collapse: collapse; font-size: 9pt; } .meta-table td { padding: 3px 0; }
        .receiver-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 9pt; }
        .items-table th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0; } 
        .items-table td { padding: 15px 10px; border-bottom: 1px solid #eee; }
        .totals-table { width: 300px; float: right; font-size: 10pt; }
        .footer { position: absolute; bottom: 40px; left: 40px; right: 40px; text-align: center; color: #999; font-size: 8pt; border-top: 1px solid #eee; padding-top: 20px; }
        @media print { body { background: white; } .page { margin: 0; box-shadow: none; border: none; } }
    </style></head><body>";
    
    echo "<div class='page'>";
    echo "<div style='display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px;'>
             <div>
                <div class='logo'>Likya<span>Pay</span></div>
                <div style='font-size:8pt; color:#64748b; margin-top:5px;'>
                    LİKYAPAY TEKNOLOJİ VE FİNANSAL HİZMETLER A.Ş.<br>
                    Mersis No: 0609123456700001<br>
                    Maslak Mah. Büyükdere Cad. No: 123<br>Sarıyer / İSTANBUL
                </div>
             </div>
             <div style='text-align:right'>
                 <h2 style='margin:0 0 5px 0; color:#0f172a;'>E-ARŞİV FATURA</h2>
                 <div style='font-size:8pt; color:#94a3b8; margin-bottom:15px;'>ASLI GİBİDİR</div>
                 <table class='meta-table' align='right' style='width:220px'>
                     <tr><td style='color:#64748b'>Fatura No:</td><td align='right' style='font-weight:bold; color:#0f172a'>$invoiceNo</td></tr>
                     <tr><td style='color:#64748b'>Düzenleme Tarihi:</td><td align='right' style='font-weight:bold; color:#0f172a'>$dateFormatted</td></tr>
                 </table>
             </div>
           </div>";
    
     echo "<div class='receiver-box'>
             <div style='font-size:7pt; font-weight:bold; color:#94a3b8; margin-bottom:5px; letter-spacing:1px;'>SAYIN</div>
             <div style='font-size:11pt; font-weight:bold; color:#0f172a; margin-bottom:5px;'>{$user['name']}</div>
             <div style='font-size:9pt; color:#475569; margin-bottom:5px;'>{$user['address']}</div>
             <div style='font-size:9pt; color:#475569;'>Vergi No: {$user['tax_id']} &nbsp;|&nbsp; Vergi Dairesi: {$user['tax_office']}</div>
           </div>";
    
     echo "<table class='items-table'>
             <thead>
                <tr>
                    <th width='50%'>Mal / Hizmet Cinsi</th>
                    <th width='15%' align='center'>Miktar</th>
                    <th width='15%' align='right'>Vergi</th>
                    <th width='20%' align='right'>Tutar</th>
                </tr>
             </thead>
             <tbody>
                <tr>
                    <td>
                        <strong>Sirius Platform Komisyon Bedeli</strong><br>
                        <span style='color:#64748b; font-size:8pt'>Döngü kodu: " . ($cycle['cycle_code'] ?? $cycle['id']) . "</span>
                    </td>
                    <td align='center'>1 Adet</td>
                    <td align='right'>%20</td>
                    <td align='right' style='font-weight:bold;'>" . number_format($baseAmount, 2, ',', '.') . " ₺</td>
                </tr>
             </tbody>
           </table>";
    
     echo "<div style='overflow:hidden; margin-bottom:30px;'>
             <table class='totals-table'>
                 <tr><td style='color:#64748b'>Mal Hizmet Toplamı:</td><td align='right'>" . number_format($baseAmount, 2, ',', '.') . " ₺</td></tr>
                 <tr><td style='color:#64748b'>Hesaplanan KDV (%20):</td><td align='right'>" . number_format($vatAmount, 2, ',', '.') . " ₺</td></tr>
                 <tr><td colspan='2' style='border-bottom:1px solid #e2e8f0; height:10px;'></td></tr>
                 <tr style='font-weight:bold; font-size:12pt; color:#0f172a;'><td style='padding-top:10px;'>ÖDENECEK TUTAR:</td><td align='right' style='padding-top:10px;'>" . number_format($totalAmount, 2, ',', '.') . " ₺</td></tr>
             </table>
           </div>";
    
     echo "<div style='background:#f1f5f9; padding:15px; border-radius:6px; font-size:9pt; font-weight:500; color:#334155;'>
             <span style='color:#94a3b8; font-weight:normal; margin-right:10px;'>YALNIZ:</span> $totalText
           </div>";

     echo "<div class='footer'>
            <p>Bu belge, 213 sayılı Vergi Usul Kanunu hükümlerine uygun olarak düzenlenmiştir.</p>
            <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' style='width:1px;height:1px;' /> <!-- Dummy Pixel -->
            LikyaPay Teknoloji A.Ş. | www.likyapay.com | Mersis: 0609123456700001
           </div>";
     
     echo "</div></body></html>";

    $html = ob_get_clean();
    
    file_put_contents($archiveFile, $html);

    return $html;
}

try {
    $res = generateSiriusInvoiceHTML($db, $cycle, $user);
    if ($res && strpos($res, '<html') !== false) {
        echo "SUCCESS: Invoice HTML generated.\n";
        echo "Path: uploads/archives/sirius/invoice_" . $cycle['id'] . "_" . $user['tax_id'] . ".html\n";
    } else {
        echo "FAIL: No output.\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
