<?php
// LikyaPay PHP Bundler - Hata Çözücü ve Hızlandırıcı
// Bu script tüm JS dosyalarını tek bir pakette toplar.

$baseDir = __DIR__ . '/public/likyapay/views/frontend/anasayfa/';
$outputFile = __DIR__ . '/public/likyapay/views/frontend/likyapay_bundle.js';

$files = [
    $baseDir . 'Dictionary.js',
    $baseDir . 'Navbar.js',
    $baseDir . 'HeroSection.js',
    $baseDir . 'Stats.js',
    $baseDir . 'Vizyon.js',
    $baseDir . 'Footer.js',
    $baseDir . 'Intro.js',
    $baseDir . 'InfoModal.js',
    $baseDir . 'TrustedBy.js',
    $baseDir . 'LoginModal.js',
    $baseDir . 'RegisterModal.js',
    $baseDir . 'HomePage.js',
    __DIR__ . '/public/likyapay/views/frontend/app.js'
];

$bundleContent = "// LikyaPay Auto-Generated Bundle\n";
$bundleContent .= "window.Anasayfa = window.Anasayfa || {};\n";

foreach ($files as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        // import/export temizliği (Babel Standalone için)
        $content = preg_replace('/import.*;/m', '', $content);
        $content = preg_replace('/export default.*;/m', '', $content);
        $bundleContent .= "\n/* --- File: " . basename($file) . " --- */\n";
        $bundleContent .= $content . "\n";
    } else {
        $bundleContent .= "\n/* Error: File Not Found - " . basename($file) . " */\n";
    }
}

if (file_put_contents($outputFile, $bundleContent)) {
    echo "<h1>✅ Başarılı!</h1>";
    echo "<p>LikyaPay Bundle oluşturuldu: <b>likyapay_bundle.js</b></p>";
    echo "<p>Artık sayfanız çok daha hızlı açılacak.</p>";
} else {
    echo "<h1>❌ Hata!</h1>";
    echo "<p>Dosya yazılamadı. Lütfen klasör izinlerini kontrol edin.</p>";
}
?>
