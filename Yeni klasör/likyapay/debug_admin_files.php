<?php
header('Content-Type: text/html; charset=utf-8');

function checkFile($path, $searchString) {
    if (!file_exists($path)) {
        return "<div style='color:red;'>❌ <b>DOSYA BULUNAMADI:</b> $path</div>";
    }
    
    $content = file_get_contents($path);
    if (strpos($content, $searchString) !== false) {
        return "<div style='color:green;'>✅ <b>DOSYA GÜNCEL:</b> $path (İçerik doğrulandı)</div>";
    } else {
        return "<div style='color:orange;'>⚠️ <b>DOSYA ESKİ VERSİYON:</b> $path (Güncel kod bulunamadı)</div>";
    }
}

echo "<h2>LikyaPay Admin Dosya Kontrolü</h2>";
echo "<hr>";

echo checkFile('views/frontend/admin/pages/SiriusArchive.js', 'Modül Yüklenemedi'); // Check via fallback?? No wait, SiriusArchive.js content
echo checkFile('views/frontend/admin/pages/SiriusArchive.js', 'Döngü Belgeleri'); // Unique string in new version
echo "<br>";
echo checkFile('views/frontend/admin_app.js', 'sirius_archive'); // Check routing
echo "<br>";
echo checkFile('views/frontend/admin/layout/Sidebar.js', 'sirius_archive'); // Check sidebar link

echo "<hr>";
echo "<h3>Ne Yapmalı?</h3>";
echo "<ul>";
echo "<li>Eğer ❌ veya ⚠️ görüyorsanız, o dosyayı sunucuya tekrar yükleyin.</li>";
echo "<li>Eğer hepsi ✅ ise, sorun tarayıcınızdadır. CTRL+SHIFT+R yapın veya Gizli Sekmede açın.</li>";
echo "</ul>";
?>
