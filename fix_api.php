<?php
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

copy_dir(__DIR__ . '/dist/mazelloerp/api', __DIR__ . '/public/mazelloerp/api');
copy_dir(__DIR__ . '/dist/mazelloerp/config', __DIR__ . '/public/mazelloerp/config');

echo "<h2>Harika! Tüm API ve Ayar Klasörleri Kopyalandı!</h2>";
echo "<p>Artık Mazello ERP'ye eksiksiz olarak giriş yapabilirsiniz.</p>";
?>
