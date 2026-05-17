<?php
// create_update_zip.php
// Helps create a small zip package with only the updated files for easy upload to InfinityFree.

$zip = new ZipArchive();
$filename = "likyapay_update_package.zip";

if ($zip->open($filename, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    exit("Hata: Zip dosyası oluşturulamadı.");
}

// Updated files to include
$filesToInclude = [
    'api_visitor.php',
    'visitor_count.txt',
    'views/frontend/anasayfa/VisitorCounter.js',
    'views/frontend/anasayfa/HomePage.js',
    'views/home.php'
];

foreach ($filesToInclude as $file) {
    if (file_exists($file)) {
        $zip->addFile($file, $file);
        echo "Eklendi: $file\n";
    } else {
        echo "Uyarı: $file bulunamadı.\n";
    }
}

$zip->close();

echo "\n------------------------------------------------\n";
echo "BAŞARILI: $filename oluşturuldu.\n";
echo "Şimdi bu dosyayı InfinityFree htdocs klasörüne yükleyip 'Extract' edebilirsiniz.\n";
?>