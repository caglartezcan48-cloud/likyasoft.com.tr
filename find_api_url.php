<?php
$directory = __DIR__ . '/public/mazelloerp/assets/';

echo "<h2>Mazello ERP - fetchData Analizi</h2>";
echo "<ul>";

if (is_dir($directory)) {
    $files = scandir($directory);
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'js') {
            $content = file_get_contents($directory . $file);
            
            // "fetchData:" veya "fetchData=" veya benzerini bulup etrafını al
            if (preg_match_all('/.{0,200}fetchData.{0,400}/i', $content, $matches)) {
                foreach ($matches[0] as $match) {
                    $safe_match = htmlspecialchars($match);
                    echo "<li><strong>Dosya:</strong> $file <br> <code style='word-break: break-all;'>$safe_match</code> </li>";
                }
            }
        }
    }
}
echo "</ul>";
?>
