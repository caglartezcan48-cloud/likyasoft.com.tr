<?php
class InvoiceHelper {
    public static function generateHTML($data, $user) {
        date_default_timezone_set('Europe/Istanbul'); // FIX: Timezone
        // Unpack Data
        $id = isset($data['invoice_no']) ? $data['invoice_no'] : 'DRAFT';
        $date = $data['date_formatted'];
        $time = date('H:i:s');
        
        $baseAmount = $data['base_amount'];
        $vatRate = $data['vat_rate'];
        $vatAmount = $data['vat_amount'];
        $totalAmount = $data['total_amount'];
        
        $serviceName = $data['description'];
        $desc = $data['sub_description'] ?? '';

        // Receiver Info
        $rcvName = $user['name'];
        $rcvTax = $user['tax_id'];
        $rcvAddr = $user['address'] ?? 'Adres girilmemiş';
        $formattedTax = (strlen($rcvTax) === 11) ? "TCKN: $rcvTax" : "VKN: $rcvTax";

        // Sender Info
        $senderName = "LİKYAPAY TEKNOLOJİ A.Ş.";
        $senderAddr = "Maslak Mah. Büyükdere Cad. No: 123, Sarıyer / İSTANBUL";
        $senderTax = "6091234567";
        $senderVD = "Maslak";
        $senderMersis = "0609123456700001";
        $senderWeb = "www.likyapay.com";
        $senderMail = "muhasebe@likyapay.com";

        // Number to Text Helper
        if (!function_exists('convertNumberToTextTR')) {
            function convertNumberToTextTR($amount) {
                $ones = ["", "BİR", "İKİ", "ÜÇ", "DÖRT", "BEŞ", "ALTI", "YEDİ", "SEKİZ", "DOKUZ"];
                $tens = ["", "ON", "YİRMİ", "OTUZ", "KIRK", "ELLİ", "ALTMIŞ", "YETMİŞ", "SEKSEN", "DOKSAN"];
                
                if ($amount == 0) return "SIFIR";
                $whole = floor($amount);
                $fraction = round(($amount - $whole) * 100);
                
                $text = "";
                $tempWhole = $whole;
                
                if ($tempWhole >= 1000000) {
                    $m = floor($tempWhole / 1000000);
                    $text .= ($m == 1 ? "BİR" : convertGroup($m, $ones, $tens)) . " MİLYON ";
                    $tempWhole %= 1000000;
                }
                if ($tempWhole >= 1000) {
                    $t = floor($tempWhole / 1000);
                    $text .= ($t == 1 ? "" : convertGroup($t, $ones, $tens)) . " BİN ";
                    $tempWhole %= 1000;
                }
                if ($tempWhole > 0) $text .= convertGroup($tempWhole, $ones, $tens);
                $text .= " TÜRK LİRASI";
                if ($fraction > 0) $text .= ", " . convertGroup($fraction, $ones, $tens) . " KURUŞ";
                return trim($text);
            }
            function convertGroup($n, $ones, $tens) {
                 $str = "";
                 $h = floor($n / 100);
                 $t = floor(($n % 100) / 10);
                 $u = $n % 10;
                 if ($h > 0) $str .= ($h == 1 ? "" : $ones[$h]) . " YÜZ ";
                 if ($t > 0) $str .= $tens[$t] . " ";
                 if ($u > 0) {
                     if (!($n > 2000 && $n < 3000)) $str .= $ones[$u] . " ";
                 }
                 return $str;
            }
        }

        $totalText = convertNumberToTextTR($totalAmount);
        
        $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', 
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $html = "<!DOCTYPE html><html lang='tr'><head><meta charset='UTF-8'><title>Fatura $id</title>";
        $html .= "<style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                body { font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background: #525659; }
                .page { background: white; width: 210mm; min-height: 297mm; margin: 20px auto; padding: 40px; box-sizing: border-box; position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; }
                .logo-area { width: 60%; }
                .logo { font-size: 28pt; font-weight: 800; color: #0f172a; letter-spacing: -1px; margin-bottom: 10px; }
                .logo span { color: #6366f1; }
                .sender-info { font-size: 9pt; color: #475569; line-height: 1.4; }
                .invoice-meta { width: 35%; text-align: right; }
                .invoice-title { font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 15px; }
                .meta-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
                .meta-table td { padding: 3px 0; }
                .meta-label { font-weight: 600; color: #64748b; text-align: left; }
                .meta-val { font-weight: 600; color: #0f172a; text-align: right; }
                .receiver-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 40px; }
                .receiver-label { font-size: 8pt; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 5px; text-transform: uppercase; }
                .receiver-name { font-size: 12pt; font-weight: 700; color: #0f172a; margin-bottom: 5px; }
                .receiver-addr { font-size: 9pt; color: #475569; width: 80%; line-height: 1.4; margin-bottom: 10px; }
                .receiver-tax { font-size: 9pt; font-weight: 500; color: #475569; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 9pt; }
                .items-table th { text-align: left; padding: 12px 10px; background: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 8pt; border-bottom: 2px solid #e2e8f0; }
                .items-table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; vertical-align: top; }
                .items-table .col-right { text-align: right; }
                .items-table .col-center { text-align: center; }
                .totals-area { display: flex; justify-content: flex-end; margin-bottom: 40px; }
                .totals-table { width: 300px; border-collapse: collapse; font-size: 10pt; }
                .totals-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
                .totals-label { text-align: left; color: #64748b; }
                .totals-val { text-align: right; font-weight: 600; color: #0f172a; }
                .grand-total { font-size: 14pt; color: #0f172a; font-weight: 800; border-top: 2px solid #0f172a !important; border-bottom: none !important; padding-top: 15px !important; }
                .footer { position: absolute; bottom: 40px; left: 40px; right: 40px; font-size: 8pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                .text-amount { font-weight: 600; color: #0f172a; margin-bottom: 20px; font-style: italic; text-align: left; background: #f8fafc; padding: 10px; border-radius: 4px; }
                @media print {
                    body { background: white; }
                    .page { margin: 0; box-shadow: none; border: none; width: auto; height: auto; }
                    .no-print { display: none !important; }
                }
            </style></head><body>";
        
        $html .= "<div class='no-print' style='position:fixed; top:20px; right:20px; z-index:999; display:flex; gap:10px;'>
                    <button onclick='window.print()' style='background:#0f172a; color:white; border:none; padding:12px 24px; font-weight:bold; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2);'><i class='fas fa-print'></i> YAZDIR / PDF</button>
                    <button onclick='window.close()' style='background:#ef4444; color:white; border:none; padding:12px 24px; font-weight:bold; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2);'>KAPAT</button>
                  </div>";
        
        $html .= "<div class='page'>";
        
        // Header (Logo & Sender)
        $html .= "<div class='header-top'>";
        $html .= "<div class='logo-area'>
                    <div class='logo'>Likya<span>Pay</span></div>
                    <div class='sender-info'>
                        <strong>$senderName</strong><br>
                        $senderAddr<br>
                        $senderVD V.D. | VKN: $senderTax<br>
                        Mersis: $senderMersis<br>
                        $senderWeb | $senderMail
                    </div>
                  </div>";
        
        // Meta
        $html .= "<div class='invoice-meta'>
                    <div class='invoice-title'>E-ARŞİV FATURA</div>
                    <table class='meta-table'>
                        <tr><td class='meta-label'>Senaryo:</td><td class='meta-val'>TEMEL FATURA</td></tr>
                        <tr><td class='meta-label'>Fatura Tipi:</td><td class='meta-val'>SATIS</td></tr>
                        <tr><td class='meta-label'>Fatura Tarihi:</td><td class='meta-val'>$date</td></tr>
                        <tr><td class='meta-label'>Düzenleme Zamanı:</td><td class='meta-val'>$time</td></tr>
                        <tr><td class='meta-label'>Fatura No:</td><td class='meta-val'>$id</td></tr>
                        <tr><td class='meta-label'>ETTN:</td><td class='meta-val' style='font-size:7pt; font-family:monospace;'>$uuid</td></tr>
                    </table>
                  </div></div>";

        // Receiver
        $html .= "<div class='receiver-box'>
                    <div class='receiver-label'>SAYIN</div>
                    <div class='receiver-name'>$rcvName</div>
                    <div class='receiver-addr'>$rcvAddr</div>
                    <div class='receiver-tax'>$formattedTax</div>
                  </div>";

        // Table
        $html .= "<table class='items-table'>
                    <thead>
                        <tr>
                            <th style='width:5%'>Sıra</th>
                            <th style='width:45%'>Mal / Hizmet</th>
                            <th class='col-center' style='width:10%'>Miktar</th>
                            <th class='col-right' style='width:15%'>Birim Fiyat</th>
                            <th class='col-center' style='width:10%'>KDV</th>
                            <th class='col-right' style='width:15%'>Mal Hizmet Tutarı</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>
                                <strong>$serviceName</strong>
                                <div style='font-size:8pt; color:#64748b; margin-top:4px;'>$desc</div>
                            </td>
                            <td class='col-center'>1 Adet</td>
                            <td class='col-right'>" . number_format($baseAmount, 2, ',', '.') . "</td>
                            <td class='col-center'>%$vatRate</td>
                            <td class='col-right'>" . number_format($baseAmount, 2, ',', '.') . "</td>
                        </tr>
                    </tbody>
                  </table>";

        // Totals
        $html .= "<div class='totals-area'>
                    <table class='totals-table'>
                        <tr><td class='totals-label'>Mal Hizmet Toplam Tutarı</td><td class='totals-val'>" . number_format($baseAmount, 2, ',', '.') . "</td></tr>
                        <tr><td class='totals-label'>Hesaplanan KDV (%$vatRate)</td><td class='totals-val'>" . number_format($vatAmount, 2, ',', '.') . "</td></tr>
                        <tr><td class='totals-label grand-total'>ÖDENECEK TUTAR</td><td class='totals-val grand-total'>" . number_format($totalAmount, 2, ',', '.') . " TL</td></tr>
                    </table>
                  </div>";
        
        $html .= "<div class='text-amount'>Yalnız $totalText dir.</div>";

        // Footer
        $html .= "<div class='footer'>
                    bu belge 5070 sayılı elektronik imza kanunu kapsamında güvenli elektronik imza ile imzalanmıştır.<br>
                    Mersis: $senderMersis - Ticaret Sicil No: 123456
                  </div>";

        $html .= "</div></body></html>";
        return $html;
    }
}
?>
