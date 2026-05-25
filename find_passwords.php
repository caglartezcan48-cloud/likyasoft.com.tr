<?php
$directory = __DIR__ . '/public/mazelloerp/assets/';
$target_roles = ['boss', 'ceo', 'muhasebe', 'depo'];

echo "<h2>Mazello ERP Şifre Tarayıcı (Genişletilmiş Arama)</h2>";
echo "<p>Derlenmiş kodlar içerisinde kelime etrafındaki 100 karakter aranıyor...</p>";
echo "<ul>";

if (is_dir($directory)) {
    $files = scandir($directory);
    $found_anything = false;
    
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'js') {
            $content = file_get_contents($directory . $file);
            
            foreach ($target_roles as $role) {
                // Kelimeyi bul ve etrafındaki 100 karakteri al
                $pattern = '/.{0,100}' . preg_quote($role, '/') . '.{0,100}/i';
                
                if (preg_match_all($pattern, $content, $matches)) {
                    foreach ($matches[0] as $match) {
                        $found_anything = true;
                        // Çıktıyı daha okunabilir yapmak için HTML taglarını encode et ve rolü vurgula
                        $safe_match = htmlspecialchars($match);
                        $highlighted_match = str_ireplace($role, "<strong style='color:red; font-size:18px;'>$role</strong>", $safe_match);
                        
                        echo "<li style='margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9;'>";
                        echo "<strong>Dosya:</strong> $file <br>";
                        echo "<strong>Bağlam:</strong> <code style='word-break: break-all;'>$highlighted_match</code>";
                        echo "</li>";
                    }
                }
            }
        }
    }
    
    if (!$found_anything) {
        echo "<li><strong>Sonuç:</strong> Hiçbir dosyada '$target_roles[0]', '$target_roles[1]' vb. kelimeler bulunamadı. Veriler büyük ihtimalle bir veritabanından veya harici bir API'den (sunucudan) çekiliyor.</li>";
    }
} else {
    echo "<li>Mazello ERP assets klasörü bulunamadı!</li>";
}

echo "</ul>";
?>
