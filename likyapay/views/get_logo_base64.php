<?php
/**
 * Logo to Base64 Converter
 */
$source = 'frontend/gorsel/logo.png';
if (!file_exists($source)) {
    $source = __DIR__ . '/frontend/gorsel/logo.png';
}

if (!file_exists($source)) {
    die("Hata: Orijinal logo bulunamadı. Lütfen scripti views klasöründe çalıştırın.");
}

// Resim işleme (Boyutu küçültelim ki kod çok uzamasın)
$info = getimagesize($source);
$image = imagecreatefrompng($source);
$width = 200; // 200px yeterli ve hafiftir
$height = 200;
$optimized = imagecreatetruecolor($width, $height);
imagealphablending($optimized, false);
imagesavealpha($optimized, true);
imagecopyresampled($optimized, $image, 0, 0, 0, 0, $width, $height, $info[0], $info[1]);

// Base64 formatına çevir
ob_start();
imagepng($optimized, null, 9);
$image_data = ob_get_contents();
ob_end_clean();

$base64 = base64_encode($image_data);
echo "<h3>Aşağıdaki kodu kopyalayıp bana gönderin:</h3>";
echo "<textarea style='width:100%; height:200px; word-break:break-all;'>data:image/png;base64,$base64</textarea>";
echo "<br><br><b>Önizleme:</b><br><img src='data:image/png;base64,$base64' style='background:#ccc;'>";

imagedestroy($image);
imagedestroy($optimized);
?>
