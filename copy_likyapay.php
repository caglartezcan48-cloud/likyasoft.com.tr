<?php
// Klasör kopyalama fonksiyonu
function copy_dir($src, $dst) {
    if (!is_dir($dst)) {
        mkdir($dst, 0777, true);
    }
    $dir = opendir($src);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            if ( is_dir($src . '/' . $file) ) {
                copy_dir($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

// 1. "LİKYAPAY FİNAL" klasörünü "likyasoft/public/likyapay" dizinine kopyala
$source = __DIR__ . '/../LİKYAPAY FİNAL';
$destination = __DIR__ . '/public/likyapay';

echo "<h2>LikyaPay Taşıma ve Kurulum İşlemi</h2>";
echo "<p>Kopyalama işlemi başladı, lütfen bekleyin (dosya boyutuna göre birkaç saniye sürebilir)...</p>";

if (is_dir($source)) {
    copy_dir($source, $destination);
    echo "<p style='color:green;'><b>✔ Dosyalar başarıyla /public/likyapay dizinine kopyalandı!</b></p>";
} else {
    echo "<p style='color:red;'><b>Hata:</b> $source dizini bulunamadı.</p>";
}
?>
