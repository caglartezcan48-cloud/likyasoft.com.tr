<?php
// index.php
// Path: index.php
session_start();

// 1. ADVANCED TRAFFIC TRACKER LOGIC
$counterFile = __DIR__ . '/visitor_count.txt';
$currentCount = 5429;

if (file_exists($counterFile)) {
    $currentCount = (int)trim(file_get_contents($counterFile));
} else {
    file_put_contents($counterFile, $currentCount);
}

// Check cookie to prevent artificial spam increments
if (!isset($_COOKIE['likyasoft_traffic_tracked'])) {
    $currentCount++;
    file_put_contents($counterFile, $currentCount);
    // Set 1-hour cookie
    setcookie('likyasoft_traffic_tracked', '1', time() + 3600, '/');
}

// 2. HELPER FUNCTION TO COMPUTE ASSET VERSION (Anti-Caching)
function getAssetVer($path) {
    $fullPath = __DIR__ . '/' . $path;
    if (file_exists($fullPath)) {
        return filemtime($fullPath);
    }
    return '1.0.0';
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Likya Soft | Dijital Mimari & İleri Teknoloji Yazılım Çözümleri</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="Likya Soft ile işinizi geleceğe taşıyın. Yapay zeka tabanlı SaaS çözümleri, kurumsal ERP mimarisi, SEO uyumlu elit web tasarımları ve mobil uygulama geliştirme hizmetleri.">
    <meta name="keywords" content="likyasoft, likya soft, fethiye yazılım, fethiye web tasarım, fethiye yapay zeka, erp sistemleri, mazello erp, likyapay, özel yazılım geliştirme">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://likyasoft.com.tr/">
    
    <!-- Open Graph Tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Likya Soft | Dijital Mimari & İleri Teknoloji">
    <meta property="og:description" content="Yapay zeka, ERP otomasyonu ve ultra-hızlı web tasarımları barındıran tescilli yazılımlarımızla işletmenizin dijital mimarisini inşa ediyoruz.">
    <meta property="og:url" content="https://likyasoft.com.tr/">
    <meta property="og:image" content="logo.png">
    
    <!-- Fonts & Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS (loaded safely via CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Space Grotesk', 'sans-serif'],
                    },
                    colors: {
                        slate: {
                            950: '#030712',
                        },
                        brand: {
                            900: '#070b19',
                        },
                        cyber: {
                            blue: '#06b6d4'
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- Global CSS stylesheet -->
    <link rel="stylesheet" href="assets/css/agency.css?v=<?= getAssetVer('assets/css/agency.css') ?>">
    
    <!-- Inject visitor count into JS global context -->
    <script>
        window.VISITOR_COUNT = <?= $currentCount ?>;
    </script>
    
    <!-- React & Babel CDNs -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans">
    
    <!-- Main Mount Root -->
    <div id="root"></div>

    <!-- Load Babel components with exact modification times to bypass CDN cache -->
    <script type="text/babel" src="assets/js/Dictionary.js?v=<?= getAssetVer('assets/js/Dictionary.js') ?>"></script>
    <script type="text/babel" src="assets/js/Navbar.js?v=<?= getAssetVer('assets/js/Navbar.js') ?>"></script>
    <script type="text/babel" src="assets/js/Hero.js?v=<?= getAssetVer('assets/js/Hero.js') ?>"></script>
    <script type="text/babel" src="assets/js/Services.js?v=<?= getAssetVer('assets/js/Services.js') ?>"></script>
    <script type="text/babel" src="assets/js/Products.js?v=<?= getAssetVer('assets/js/Products.js') ?>"></script>
    <script type="text/babel" src="assets/js/Portfolio.js?v=<?= getAssetVer('assets/js/Portfolio.js') ?>"></script>
    <script type="text/babel" src="assets/js/About.js?v=<?= getAssetVer('assets/js/About.js') ?>"></script>
    <script type="text/babel" src="assets/js/Contact.js?v=<?= getAssetVer('assets/js/Contact.js') ?>"></script>
    <script type="text/babel" src="assets/js/Footer.js?v=<?= getAssetVer('assets/js/Footer.js') ?>"></script>
    <script type="text/babel" src="assets/js/App.js?v=<?= getAssetVer('assets/js/App.js') ?>"></script>

    <!-- Mount React SPA into DOM -->
    <script type="text/babel">
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(<window.Agency.App />);
    </script>
</body>
</html>
