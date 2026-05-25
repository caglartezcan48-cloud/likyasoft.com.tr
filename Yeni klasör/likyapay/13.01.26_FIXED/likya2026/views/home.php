<?php session_start(); ?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Likya Pay | Yeni Nesil Finansal Optimizasyon</title>
    <meta name="description" content="Likya Pay ile ticari borç ve alacaklarınızı nakit akışına ihtiyaç duymadan mahsuplaşarak yönetin. KOBİ'ler için güvenli finansal çözüm.">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="frontend/gorsel/logo.png">
    <link rel="manifest" href="/likyasoft/public/likyapay/manifest.json">

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
                navigator.serviceWorker.register('/likyasoft/public/likyapay/sw.js')
                    .then(reg => console.log('SW Registered'))
                    .catch(err => console.log('SW Error: ', err));
            });
        }
    </script>
    
    <!-- React & ReactDOM -->
    <!-- React & ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Babel Standalone -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Prop-Types (Required for Recharts) -->
    <script src="https://unpkg.com/prop-types/prop-types.min.js"></script>
    <!-- Recharts -->
    <script src="https://cdn.jsdelivr.net/npm/recharts/umd/Recharts.min.js"></script>
    
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
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .glass-panel {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
        }
        .hero-pattern {
            background-color: #0c4a6e;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f172a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Sirius Stars Animation */
        .sirius-star {
            position: absolute;
            background: white;
            border-radius: 50%;
            opacity: 0;
            animation: twinkle var(--duration) ease-in-out infinite;
            animation-delay: var(--delay);
            box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.6);
        }
        @keyframes twinkle {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 0.8; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(0.5); }
        }
    </style>
</head>
<body>
    <div id="root"></div>

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
    <script type="text/babel" src="frontend/sirius/algoritma.js?v=2002"></script>
    <script type="text/babel" src="frontend/anasayfa/ErrorBoundary.js?v=2002"></script>
    
    <!-- 2. Components -->
    <!-- Anasayfa Modules -->
    <script type="text/babel" src="frontend/anasayfa/Intro.js?v=2005"></script>
    <script type="text/babel" src="frontend/anasayfa/Dictionary.js?v=2002"></script>
    <script type="text/babel" src="frontend/anasayfa/InfoModal.js?v=2002"></script>
    <script type="text/babel" src="frontend/anasayfa/Navbar.js?v=2005"></script>
    <script type="text/babel" src="frontend/anasayfa/CycleAnimation.js?v=2004"></script>
    <script type="text/babel" src="frontend/anasayfa/LoginModal.js?v=2005"></script>
    <script type="text/babel" src="frontend/anasayfa/RegisterModal.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/anasayfa/HeroSection.js?v=2005"></script>
    <script type="text/babel" src="frontend/anasayfa/Vizyon.js?v=2002"></script>
    <script type="text/babel" src="frontend/anasayfa/Footer.js?v=2002"></script>
    <script type="text/babel" src="frontend/anasayfa/HomePage.js?v=2005"></script>

    <!-- Other Modules -->
    <?php
    $role = $_SESSION['user_role'] ?? 'guest';
    ?>

    <!-- Admin Modular Scripts (Only for Admin) -->
    <?php if ($role === 'admin'): ?>
    <script type="text/babel" src="frontend/admin/layout/Sidebar.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/layout/Topbar.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/layout/AdminLayout.js?v=20260102_FINAL"></script>
    
    <script type="text/babel" src="frontend/admin/pages/DashboardHome.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/Approvals.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/Users.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/Accounting.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/AdminUsers.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/Reports.js?v=20260102_FINAL"></script>
    
    <script type="text/babel" src="frontend/admin/pages/GeneralSettings.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/ContentManager.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/SystemLogs.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/PendingInvoices.js?v=20260105_INV"></script>
    <script type="text/babel" src="frontend/admin/pages/Sirius.js?v=20260103_FINAL"></script>
    
    <script type="text/babel" src="frontend/admin/dashboard.js?v=20260102_FINAL"></script>
    <?php endif; ?>
    
    <!-- User Panel Modules (Only for User) -->
    <?php if ($role === 'user'): ?>
    <script type="text/babel" src="frontend/kullanicilar/Sidebar.js?v=2001"></script>
    <script type="text/babel" src="frontend/kullanicilar/DashboardHome.js?v=2001"></script>
    <script type="text/babel" src="frontend/kullanicilar/Invoices.js?v=2005"></script>
    <script type="text/babel" src="frontend/kullanicilar/Profile.js?v=2001"></script>
    <script type="text/babel" src="frontend/kullanicilar/Archive.js?v=20260105_ARC"></script>
    <script type="text/babel" src="frontend/kullanicilar/Sirius.js?v=20260103_SIRIUS"></script>
    <script type="text/babel" src="frontend/kullanicilar/panel.js?v=20260103_SIRIUS"></script>
    <script type="text/babel" src="frontend/muhasebe/panel.js?v=2002"></script>
    <?php endif; ?>

    <!-- 3. Main App -->
    <script type="text/babel" src="frontend/app.js?v=20260102_FINAL"></script>
</body>
</html>
