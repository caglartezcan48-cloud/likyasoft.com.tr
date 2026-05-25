<?php
// data/api/download_template.php
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=uye_yukleme_sablonu.csv');

// Create a file pointer connected to the output stream
$output = fopen('php://output', 'w');

// BOM for Excel to recognize UTF-8
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Headers
fputcsv($output, array('Firma Adı', 'Vergi No', 'Vergi Dairesi', 'Adres', 'Telefon', 'Sektör', 'KEP Adresi', 'Mersis No', 'Yetkili Kişi', 'E-Posta', 'Kullanıcı Adı', 'Şifre'), ';');

// Example Row
fputcsv($output, array('Örnek Teknoloji Ltd. Şti.', '1234567890', 'Boğaziçi V.D.', 'Merkez Mah. No:1 İstanbul', '05321112233', 'Teknoloji', 'ornek@hs01.kep.tr', '012345678900001', 'Ahmet Yılmaz', 'iletisim@ornek.com', 'ornekfirma', 'Sifre123!'), ';');


fclose($output);
?>
