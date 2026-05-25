<?php
function replaceInDir($dir) {
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    
    $searchReplacePairs = [
        // Düzeltme 1: /views/ rotaları
        '"/views/' => '"/likyasoft/public/likyapay/views/',
        "'/views/" => "'/likyasoft/public/likyapay/views/",
        
        // Düzeltme 2: /likyapay/ rotaları
        "'/likyapay/" => "'/likyasoft/public/likyapay/",
        '"/likyapay/' => '"/likyasoft/public/likyapay/',
        
        // Düzeltme 3: /destek_api.php (Kökte aranan tekil apiler)
        "'/destek_api.php" => "'/likyasoft/public/likyapay/destek_api.php",
        '"/destek_api.php' => '"/likyasoft/public/likyapay/destek_api.php'
    ];

    $count = 0;
    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $ext = strtolower($file->getExtension());
            if (in_array($ext, ['php', 'html', 'js', 'jsx'])) {
                $content = file_get_contents($file->getPathname());
                $original = $content;
                
                foreach ($searchReplacePairs as $search => $replace) {
                    $content = str_replace($search, $replace, $content);
                }
                
                if ($content !== $original) {
                    file_put_contents($file->getPathname(), $content);
                    $count++;
                }
            }
        }
    }
    return $count;
}

$dir = __DIR__ . '/public/likyapay';
if(is_dir($dir)){
    $changed = replaceInDir($dir);
    echo "<h2>İşlem Tamam!</h2>";
    echo "<p>LikyaPay projesi altındaki toplam <b>$changed adet</b> dosyada yol onarımı başarıyla yapıldı.</p>";
    echo "<p>Artık sayfanızı yenileyerek hataların kaybolduğunu görebilirsiniz.</p>";
} else {
    echo "<p style='color:red;'>Hata: likyapay klasörü bulunamadı.</p>";
}
?>
