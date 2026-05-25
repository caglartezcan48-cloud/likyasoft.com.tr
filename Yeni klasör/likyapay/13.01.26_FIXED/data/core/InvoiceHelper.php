<?php
// data/core/InvoiceHelper.php

class InvoiceHelper {

    public static function generateHTML($invoiceData, $user, $isDraft = false) {
        $invoiceNo = $invoiceData['invoice_no'];
        $dateFormatted = $invoiceData['date_formatted'];
        
        // Amounts
        $baseAmount = (float)$invoiceData['base_amount'];
        $vatRate = (int)$invoiceData['vat_rate'];
        $vatAmount = (float)$invoiceData['vat_amount'];
        $totalAmount = (float)$invoiceData['total_amount'];
        
        $description = $invoiceData['description'];
        $subDescription = $invoiceData['sub_description'] ?? '';
        
        $totalText = self::convertNumberToTextTR($totalAmount);

        ob_start();
        ?>
        <!DOCTYPE html>
        <html lang='tr'>
        <head>
            <meta charset='UTF-8'>
            <title>Fatura <?php echo $invoiceNo; ?></title>
            <style>
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
            </style>
        </head>
        <body>
            <div class='page'>
                <?php if ($isDraft): ?>
                    <div style="position:absolute; top:45%; left:25%; transform:rotate(-45deg); font-size:100pt; color:rgba(200,0,0,0.1); font-weight:bold; z-index:0;">TASLAK</div>
                <?php endif; ?>
                
                <div style='display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; position:relative; z-index:1;'>
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
                             <tr><td style='color:#64748b'>Fatura No:</td><td align='right' style='font-weight:bold; color:#0f172a'><?php echo $invoiceNo; ?></td></tr>
                             <tr><td style='color:#64748b'>Düzenleme Tarihi:</td><td align='right' style='font-weight:bold; color:#0f172a'><?php echo $dateFormatted; ?></td></tr>
                         </table>
                     </div>
                </div>
        
                 <div class='receiver-box' style='position:relative; z-index:1;'>
                     <div style='font-size:7pt; font-weight:bold; color:#94a3b8; margin-bottom:5px; letter-spacing:1px;'>SAYIN</div>
                     <div style='font-size:11pt; font-weight:bold; color:#0f172a; margin-bottom:5px;'><?php echo $user['name']; ?></div>
                     <div style='font-size:9pt; color:#475569; margin-bottom:5px;'><?php echo $user['address']; ?></div>
                     <div style='font-size:9pt; color:#475569;'>Vergi No: <?php echo $user['tax_id']; ?> &nbsp;|&nbsp; Vergi Dairesi: <?php echo $user['tax_office']; ?></div>
                 </div>
        
                 <table class='items-table' style='position:relative; z-index:1;'>
                     <thead>
                        <tr>
                            <th width='60%'>Hizmet / Açıklama</th>
                            <th width='20%' align='right'>Vergi Oranı</th>
                            <th width='20%' align='right'>Tutar</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                            <td>
                                <strong><?php echo $description; ?></strong><br>
                                <span style='color:#64748b; font-size:8pt'><?php echo $subDescription; ?></span>
                            </td>
                            <td align='right'>%<?php echo $vatRate; ?></td>
                            <td align='right' style='font-weight:bold;'><?php echo number_format($baseAmount, 2, ',', '.'); ?> ₺</td>
                        </tr>
                     </tbody>
                 </table>
        
                 <div style='overflow:hidden; margin-bottom:30px; position:relative; z-index:1;'>
                     <table class='totals-table'>
                         <tr><td style='color:#64748b'>Matrah:</td><td align='right'><?php echo number_format($baseAmount, 2, ',', '.'); ?> ₺</td></tr>
                         <tr><td style='color:#64748b'>KDV (%<?php echo $vatRate; ?>):</td><td align='right'><?php echo number_format($vatAmount, 2, ',', '.'); ?> ₺</td></tr>
                         <tr><td colspan='2' style='border-bottom:1px solid #e2e8f0; height:10px;'></td></tr>
                         <tr style='font-weight:bold; font-size:12pt; color:#0f172a;'><td style='padding-top:10px;'>ÖDENECEK TUTAR:</td><td align='right' style='padding-top:10px;'><?php echo number_format($totalAmount, 2, ',', '.'); ?> ₺</td></tr>
                     </table>
                 </div>
        
                 <div style='background:#f1f5f9; padding:15px; border-radius:6px; font-size:9pt; font-weight:500; color:#334155; position:relative; z-index:1;'>
                     <span style='color:#94a3b8; font-weight:normal; margin-right:10px;'>YALNIZ:</span> <?php echo $totalText; ?>
                 </div>

                 <div class='footer'>
                    <p>Bu belge, 213 sayılı Vergi Usul Kanunu hükümlerine uygun olarak düzenlenmiştir.</p>
                    <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' style='width:1px;height:1px;' /> <!-- Dummy Pixel -->
                    LikyaPay Teknoloji A.Ş. | www.likyapay.com | Mersis: 0609123456700001
                 </div>
            </div>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }

    private static function convertNumberToTextTR($amount) {
        $ones = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
        $tens = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
        if ($amount == 0) return "SIFIR";
        $whole = floor($amount);
        $fraction = round(($amount - $whole) * 100);
        $text = "";
        $tempWhole = $whole;
        if ($tempWhole >= 1000000) { $m = floor($tempWhole / 1000000); $text .= ($m == 1 ? "BİR" : self::convertGroup($m, $ones, $tens)) . " MİLYON "; $tempWhole %= 1000000; }
        if ($tempWhole >= 1000) { $t = floor($tempWhole / 1000); $text .= ($t == 1 ? "" : self::convertGroup($t, $ones, $tens)) . " BİN "; $tempWhole %= 1000; }
        if ($tempWhole > 0) { $text .= self::convertGroup($tempWhole, $ones, $tens); }
        $text .= " TÜRK LİRASI";
        if ($fraction > 0) { $text .= ", " . self::convertGroup($fraction, $ones, $tens) . " KURUŞ"; }
        return trim($text);
    }
    
    private static function convertGroup($n, $ones, $tens) {
         $str = ""; $h = floor($n / 100); $t = floor(($n % 100) / 10); $u = $n % 10;
         if ($h > 0) $str .= ($h == 1 ? "" : $ones[$h]) . " YÜZ ";
         if ($t > 0) $str .= $tens[$t] . " ";
         if ($u > 0) { if (!($n > 2000 && $n < 3000)) $str .= $ones[$u] . " "; }
         return $str;
    }
}
?>
