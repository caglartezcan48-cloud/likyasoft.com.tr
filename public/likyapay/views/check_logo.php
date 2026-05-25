<?php
$paths = [
    'frontend/gorsel/logo.png',
    'views/frontend/gorsel/logo.png',
    '/public/likyapay/views/frontend/gorsel/logo.png',
    '../views/frontend/gorsel/logo.png'
];

echo "<h2>LikyaPay Logo Kontrol Paneli</h2>";
foreach ($paths as $path) {
    $full_path = realpath($path) ?: $path;
    if (file_exists($path)) {
        echo "<p style='color:green;'>✅ BULUNDU: $path <br><img src='$path' style='height:50px;'></p>";
    } else {
        echo "<p style='color:red;'>❌ YOK: $path</p>";
    }
}

echo "<hr>Mevcut Dizin: " . getcwd();
?>
