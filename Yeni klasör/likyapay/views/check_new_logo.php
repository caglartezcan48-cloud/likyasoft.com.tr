<?php
/**
 * Yeni Logo Doğrulama Scripti
 */
$paths = [
    'frontend/gorsel/logo_optimized.png',
    'logo_optimized.png',
    '../frontend/gorsel/logo_optimized.png',
    'views/frontend/gorsel/logo_optimized.png'
];

echo "<h2>LikyaPay Yeni Logo Kontrolü</h2>";
foreach ($paths as $path) {
    if (file_exists($path)) {
        echo "<p style='color:green;'>✅ BULDUM: $path <br><img src='$path' style='height:80px; border:1px solid #ccc; background:#eee;'></p>";
        echo "<p>Bu yolu home.php'de kullanmalıyız.</p>";
    } else {
        echo "<p style='color:red;'>❌ BURADA YOK: $path</p>";
    }
}

echo "<hr>Eğer hiçbirinde yeşil yanmıyorsa, lütfen <b>logo_optimized.png</b> dosyasını <b>public/likyapay/views/frontend/gorsel/</b> klasörüne yüklediğinizden emin olun.";
?>
