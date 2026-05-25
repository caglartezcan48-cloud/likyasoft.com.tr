<?php
/**
 * Kayıp Logo Bulucu
 */
function findFile($dir, $filename) {
    $it = new RecursiveDirectoryIterator($dir);
    foreach(new RecursiveIteratorIterator($it) as $file) {
        if (stripos($file->getFilename(), $filename) !== false) {
            echo "<p style='color:green;'>🔍 BULDUM! <br>Yol: " . $file->getPathname() . "</p>";
            echo "<img src='/" . str_replace('\\', '/', $file->getPathname()) . "' style='height:80px; background:#ccc;'>";
        }
    }
}

echo "<h2>LikyaPay Logo Arama Motoru</h2>";
echo "<p>Sunucu taranıyor, lütfen bekleyin...</p>";

// LikyaPay ana dizininden aramaya başla
$start_dir = realpath(__DIR__ . '/../../'); 
findFile($start_dir, 'logo_optimized');

echo "<hr>Arama tamamlandı. Eğer yukarıda hiçbir şey yoksa, dosya sunucuya yüklenmemiş demektir.";
?>
