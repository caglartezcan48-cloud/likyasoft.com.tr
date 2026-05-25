<?php
/**
 * LikyaPay Logo Optimizer (Browser Output Version)
 * Dosya yazma izni olmayan sunucular için logoyu doğrudan ekrana basar.
 */

$source = 'frontend/gorsel/logo.png';
if (!file_exists($source)) {
    $source = __DIR__ . '/frontend/gorsel/logo.png';
}

if (!file_exists($source)) {
    die("Hata: Kaynak logo bulunamadı! Lütfen scriptin views klasöründe olduğundan emin olun.");
}

// Resim işlemleri
$info = getimagesize($source);
$image = imagecreatefrompng($source);
$width = 400;
$height = 400;
$optimized = imagecreatetruecolor($width, $height);

imagealphablending($optimized, false);
imagesavealpha($optimized, true);
imagecopyresampled($optimized, $image, 0, 0, 0, 0, $width, $height, $info[0], $info[1]);

// Tarayıcıya PNG olarak gönder
header('Content-Type: image/png');
header('Content-Disposition: inline; filename="logo_optimized.png"');
imagepng($optimized, null, 9); // null: Dosyaya yazma, doğrudan ekrana bas

imagedestroy($image);
imagedestroy($optimized);
?>
