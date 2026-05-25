<?php
// check_files.php
echo "<h1>Dosya Kontrol Aracı</h1>";

$dir = 'uploads/documents/';
$fullPath = __DIR__ . '/' . $dir;

echo "Kontrol edilen klasör: " . $fullPath . "<br>";

if (is_dir($dir)) {
    echo "<strong style='color:green'>✅ Klasör Mevcut</strong><br>";
    $files = scandir($dir);
    echo "<ul>";
    foreach ($files as $file) {
        if ($file != "." && $file != "..") {
            echo "<li><a href='$dir$file' target='_blank'>$file</a> (Boyut: " . filesize($dir . $file) . " byte)</li>";
        }
    }
    echo "</ul>";
} else {
    echo "<strong style='color:red'>❌ Klasör Bulunamadı (uploads/documents mevcut değil)</strong><br>";
    echo "Lütfen 'uploads' klasörünü ana dizine attığınızdan emin olun.";
}
?>
