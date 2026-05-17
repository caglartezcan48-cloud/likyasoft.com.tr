<?php session_start(); ?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Likya Pay | Uygulama Paneli</title>
    <meta name="robots" content="noindex, nofollow"> <!-- Don't index the app panel -->
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/views/frontend/gorsel/logo.png">
    <link rel="manifest" href="/manifest.json">

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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.10.3/Recharts.min.js"></script>
    
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
    </style>
</head>
<body>

    <div id="root">
        <!-- Pre-loader -->
        <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f8fafc; font-family: sans-serif;">
            <div style="width: 50px; height: 50px; border: 4px solid #e0f2fe; border-top: 4px solid #0284c7; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <h2 style="margin-top: 20px; color: #0f172a; font-size: 1.25rem; font-weight: 600;">Likya Pay</h2>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
    </div>

    <!-- Error Handler -->
    <script>
        window.onerror = function(message, source, lineno, colno, error) {
            console.error("Global Error Caught:", { message, source, lineno, colno, error });
        };
    </script>

    <!-- MODULE IMPORTS -->
    <script type="text/babel" src="frontend/sirius/algoritma.js?v=2002"></script>
    <script type="text/babel" src="frontend/anasayfa/ErrorBoundary.js?v=2002"></script>
    
    <!-- Components -->
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

    <!-- PHP Role Logic -->
    <?php
    $role = $_SESSION['user_role'] ?? 'guest';
    ?>

    <!-- Admin Scripts -->
    <?php if ($role === 'admin'): ?>
    <script type="text/babel" src="frontend/admin/layout/Sidebar.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/layout/Topbar.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/layout/AdminLayout.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/DashboardHome.js?v=20260106_DASHFIX_V5"></script>
    <script type="text/babel" src="frontend/admin/pages/Approvals.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/Users.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/Accounting.js?v=20260106_INV_STATS_V2"></script>
    <script type="text/babel" src="frontend/admin/pages/AdminUsers.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/Reports.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/GeneralSettings.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/ContentManager.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/SystemLogs.js?v=20260102_FINAL"></script>
    <script type="text/babel" src="frontend/admin/pages/PendingInvoices.js?v=20260105_INV"></script>
    <script type="text/babel" src="frontend/admin/pages/Sirius.js?v=20260103_FINAL"></script>
    <script type="text/babel" src="frontend/admin/dashboard.js?v=20260102_FINAL"></script>
    <?php endif; ?>
    
    <!-- User Scripts -->
    <?php if ($role === 'user'): ?>
    <script type="text/babel" src="frontend/kullanicilar/Sidebar.js?v=2001"></script>
    <script type="text/babel" src="frontend/kullanicilar/DashboardHome.js?v=2001"></script>
    <script type="text/babel" src="frontend/kullanicilar/Invoices.js?v=2005"></script>
    <script type="text/babel" src="frontend/kullanicilar/Profile.js?v=2001"></script>
    <script type="text/babel" src="frontend/kullanicilar/Archive.js?v=20260106_ARCHIVE_FINAL_V2"></script>
    <script type="text/babel" src="frontend/kullanicilar/Sirius.js?v=20260106_POPUP_FINAL"></script>
    <script type="text/babel" src="frontend/kullanicilar/panel.js?v=20260106_CLEANUP"></script>
    <script type="text/babel" src="frontend/muhasebe/panel.js?v=2002"></script>
    <?php endif; ?>

    <!-- FLAG: Auto-Open Login Modal -->
    <script>
        window.AUTO_OPEN_LOGIN = true;
    </script>
    
    <!-- Main App -->
    <script type="text/babel" src="frontend/app.js?v=20260102_FINAL"></script>
</body>
</html>
