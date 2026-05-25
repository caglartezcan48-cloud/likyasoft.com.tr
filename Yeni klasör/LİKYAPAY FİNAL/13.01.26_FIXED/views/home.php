<?php session_start(); ?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LikyaPay | KOBİ'ler İçin Borç Mahsuplaşma ve Nakit Akışı Çözümü</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="LikyaPay, KOBİ'ler ve şirketler için nakitsiz borç ödeme ve alacak tahsilat platformudur. Sirius Döngü Algoritması ile borçlarınızı nakit kullanmadan kapatın.">
    <meta name="keywords" content="borç mahsuplaşma, kobi finans, nakit akışı, takas sistemi, sirius döngüsü, alacak tahsilatı, ticari borç, bartering">
    <meta name="robots" content="index, follow">
    <meta name="author" content="LikyaPay Teknoloji A.Ş.">

    <!-- Open Graph (Social Media) -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://likyapaydemo.gt.tc/">
    <meta property="og:title" content="LikyaPay - Nakitsiz Borç Ödeme Devrimi">
    <meta property="og:description" content="KOBİ'ler borçlarını birbirine devrederek kapatsın. Nakit sıkışıklığına son verin.">
    <meta property="og:image" content="https://likyapaydemo.gt.tc/views/frontend/gorsel/logo.png">

    <!-- Scripts & Styles -->
    
    <!-- Performance Optimizations (Preconnect) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/views/frontend/gorsel/logo.png">
    <link rel="manifest" href="/manifest.json">

    <!-- SEO & Social Media Meta Tags -->
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://likyapay.com/">
    <meta property="og:title" content="Likya Pay | Yeni Nesil Finansal Optimizasyon">
    <meta property="og:description" content="Likya Pay ile ticari borç ve alacaklarınızı nakit akışına ihtiyaç duymadan mahsuplaşarak yönetin. KOBİ'ler için güvenli finansal çözüm.">
    <meta property="og:image" content="https://likyapay.com/frontend/gorsel/logo_social.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://likyapay.com/">
    <meta property="twitter:title" content="Likya Pay | Yeni Nesil Finansal Optimizasyon">
    <meta property="twitter:description" content="Likya Pay ile ticari borç ve alacaklarınızı nakit akışına ihtiyaç duymadan mahsuplaşarak yönetin.">
    <meta property="twitter:image" content="https://likyapay.com/frontend/gorsel/logo_social.png">

    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": "Likya Pay",
      "description": "KOBİ'ler arası borç/alacak mahsuplaşma ve finansal optimizasyon platformu.",
      "url": "https://likyapay.com",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TRY"
      }
    }
    </script>
    
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Try registering at root first, fallback handled by browser if 404
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW Registered'))
                    .catch(err => console.log('SW Error: ', err));
            });
        }
    </script>
    
    <!-- React & ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Babel Standalone -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Tailwind CSS (CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        brand: {
                            50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9',
                            600: '#0284c7', 700: '#0369a1', 900: '#0c4a6e',
                        },
                        secondary: { 500: '#6366f1' }
                    }
                }
            }
        }
    </script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Prop-Types (Required for Recharts) -->
    <script src="https://unpkg.com/prop-types/prop-types.min.js"></script>
    <!-- Recharts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.10.3/Recharts.min.js"></script>
    
    <!-- Local Styles -->
    <link rel="stylesheet" href="/views/frontend/css/style.css">
</head>
<body>

    <div id="root">
        <!-- Pre-loader: Visible until React loads -->
        <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f8fafc; font-family: sans-serif;">
            <div style="width: 50px; height: 50px; border: 4px solid #e0f2fe; border-top: 4px solid #0284c7; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <h2 style="margin-top: 20px; color: #0f172a; font-size: 1.25rem; font-weight: 600;">Likya Pay</h2>
            <p style="color: #64748b; margin-top: 8px; font-size: 0.875rem;">Sistem yükleniyor...</p>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
    </div>

    <!-- SEO Content for Robots (NoScript) -->
    <noscript>
        <div style="padding: 20px; line-height: 1.6; color: #333;">
            <h1>Likya Pay: Borç Mahsuplaşma ve Nakit Akışı Yönetimi</h1>
            <p>Likya Pay, KOBİ'ler ve ticari işletmeler için geliştirilmiş, nakit paraya ihtiyaç duymadan borç ödeme sistemidir.</p>
            <h2>Neden Likya Pay?</h2>
            <ul>
                <li><strong>Sirius Döngüsü:</strong> Yapay zeka destekli algoritmamız ile piyasadaki kilitlenmiş borç zincirlerini tespit edin ve nakitsiz ödeyin.</li>
                <li><strong>Güvenli Takas:</strong> Borcunuzu alacağınızla kapatın (Barter/Mahsuplaşma).</li>
                <li><strong>KOBİ Dostu:</strong> Nakit sıkışıklığına son verin, ticaretinizi hızlandırın.</li>
            </ul>
            <p>Siz de tedarikçinize olan borcunuzu, müşterinizden olan alacağınızla ödeyin. Finansal özgürlüğün yeni yolu.</p>
            <a href="https://likyapaydemo.gt.tc/views/frontend/yasal/sozlesme.php">Kullanıcı Sözleşmesi</a>
        </div>
    </noscript>

    <!-- Global Error Handler (Must be first) -->
    <script>
        window.onerror = function(message, source, lineno, colno, error) {
            console.error("Global Error Caught:", { message, source, lineno, colno, error });
            // Optional: You could update the UI here if React hasn't mounted yet
             const root = document.getElementById('root');
             if (root && root.innerHTML === "") {
                 root.innerHTML = '<div style="padding: 20px; color: red; font-family: sans-serif;"><h2>Kritik Yükleme Hatası</h2><p>Sayfa bileşenleri yüklenemedi. Detay: ' + message + '</p></div>';
             }
        };
    </script>


    <!-- MODULE IMPORTS -->
    <!-- 1. Utils & Logic -->
    <!-- 1. Utils & Logic -->
    <script type="text/babel" src="/views/frontend/sirius/algoritma.js?v=2002"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/ErrorBoundary.js?v=2002"></script>
    
    <!-- 2. Components -->
    <!-- Anasayfa Modules -->
    <script type="text/babel" src="/views/frontend/anasayfa/Intro.js?v=2005"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/Dictionary.js?v=2002"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/InfoModal.js?v=2002"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/Navbar.js?v=2005"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/CycleAnimation.js?v=2004"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/LoginModal.js?v=2005"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/RegisterModal.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/HeroSection.js?v=20260109_VIDEO"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/VideoSection.js?v=20260110_YOUTUBE"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/Vizyon.js?v=2002"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/Footer.js?v=2002"></script>
    <script type="text/babel" src="/views/frontend/anasayfa/HomePage.js?v=20260109_VIDEO"></script>

    <!-- Other Modules -->
    <?php
    $role = $_SESSION['user_role'] ?? 'guest';
    ?>

    <!-- Admin Modular Scripts (Only for Admin) -->
    <?php if ($role === 'admin'): ?>
    <script type="text/babel" src="/views/frontend/admin/layout/Sidebar.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="/views/frontend/admin/layout/Topbar.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="/views/frontend/admin/layout/AdminLayout.js?v=20260102_FINAL"></script>
    
    <script type="text/babel" src="/views/frontend/admin/pages/DashboardHome.js?v=20260106_DASHFIX_V5"></script>
    <script type="text/babel" src="/views/frontend/admin/pages/Approvals.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="/views/frontend/admin/pages/Users.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="/views/frontend/admin/pages/Accounting.js?v=20260106_INV_STATS_V2"></script>
    <script type="text/babel" src="/views/frontend/admin/pages/AdminUsers.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="/views/frontend/admin/pages/Reports.js?v=20260102_FINAL"></script>
    
    <script type="text/babel" src="/views/frontend/admin/pages/GeneralSettings.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="/views/frontend/admin/pages/ContentManager.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="/views/frontend/admin/pages/SystemLogs.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="/views/frontend/admin/pages/PendingInvoices.js?v=20260105_INV"></script>
    <script type="text/babel" src="/views/frontend/admin/pages/Sirius.js?v=20260103_FINAL"></script>
    
    <script type="text/babel" src="/views/frontend/admin/dashboard.js?v=20260102_FINAL"></script>
    <?php endif; ?>
    
    <!-- User Panel Modules (Only for User) -->
    <?php if ($role === 'user'): ?>
    <script type="text/babel" src="/views/frontend/kullanicilar/Sidebar.js?v=2001"></script>
    <script type="text/babel" src="/views/frontend/kullanicilar/SalaryDashboard.js?v=20260109_BLUE"></script>
    <script type="text/babel" src="/views/frontend/kullanicilar/DashboardHome.js?v=20260109_ROUTING"></script>
    <script type="text/babel" src="/views/frontend/kullanicilar/Invoices.js?v=2005"></script>
    <script type="text/babel" src="/views/frontend/kullanicilar/Profile.js?v=2001"></script>
    <script type="text/babel" src="/views/frontend/kullanicilar/Archive.js?v=20260106_ARCHIVE_FINAL_V2"></script>
    <script type="text/babel" src="/views/frontend/kullanicilar/Sirius.js?v=20260106_POPUP_FINAL"></script>
    <script type="text/babel" src="/views/frontend/kullanicilar/panel.js?v=20260106_CLEANUP"></script>
    <script type="text/babel" src="/views/frontend/muhasebe/panel.js?v=2002"></script>
    <?php endif; ?>

    <!-- 3. Main App -->
    <script type="text/babel" src="/views/frontend/app.js?v=20260102_FINAL"></script>
</body>
</html>
