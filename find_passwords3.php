<?php
$directory = __DIR__ . '/public/mazelloerp/assets/';
$search_terms = ['login', 'sifre', 'şifre', 'password', '1234'];

echo "<h2>Mazello ERP - Şifre / Login Mekanizması Analizi</h2>";
echo "<ul>";

if (is_dir($directory)) {
    $files = scandir($directory);
    $found = false;
    
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'js') {
            $content = file_get_contents($directory . $file);
            
            foreach ($search_terms as $term) {
                // Kelimeyi bul ve etrafındaki 300 karakteri (bağlamı) al ki if() kontrollerini görelim
                $pattern = '/.{0,150}' . preg_quote($term, '/') . '.{0,150}/i';
                
                if (preg_match_all($pattern, $content, $matches)) {
                    // Sadece en anlamlı olanları göstermek için, çok fazla sonuç çıkarsa filtreleyelim
                    // Sadece içinde == veya === veya = veya fetch veya axios geçenleri gösterelim
                    foreach ($matches[0] as $match) {
                        if (preg_match('/(===|==|=|fetch|axios|api|dashboard_islem)/i', $match)) {
                            $found = true;
                            $safe_match = htmlspecialchars($match);
                            $highlighted = str_ireplace($term, "<strong style='color:red; font-size:16px;'>$term</strong>", $safe_match);
                            
                            echo "<li style='margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9;'>";
                            echo "<strong>Dosya:</strong> $file <br>";
                            echo "<strong>Bağlam:</strong> <code style='word-break: break-all;'>$highlighted</code>";
                            echo "</li>";
                        }
                    }
                }
            }
        }
    }
    
    if (!$found) {
        echo "<li>Hiçbir dosyada şifre doğrulama (==) koduna veya API çağrısına rastlanmadı.</li>";
    }
} else {
    echo "<li>Mazello ERP assets klasörü bulunamadı!</li>";
}

echo "</ul>";
?>
