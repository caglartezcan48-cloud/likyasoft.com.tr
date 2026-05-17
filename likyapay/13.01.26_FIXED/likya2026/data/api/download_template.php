<?php
// data/api/download_template.php
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=uye_yukleme_sablonu.csv');

// Create a file pointer connected to the output stream
$output = fopen('php://output', 'w');

// BOM for Excel to recognize UTF-8
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Headers
fputcsv($output, array('Firma Adı', 'Vergi No', 'E-Posta', 'Telefon', 'Sektör', 'Kullanıcı Adı', 'Şifre'), ';');

// Example Row
fputcsv($output, array('Örnek Firma A.Ş.', '1234567890', 'ornek@sirket.com', '05321234567', 'Sanayi', 'ornekuser', '123456'), ';');

fclose($output);
?>
