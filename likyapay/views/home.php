<?php 
session_start(); 
$db_path = __DIR__ . '/../core/database.php';
if (file_exists($db_path)) {
    include_once $db_path;
    if (isset($_SESSION['user_id']) && class_exists('Database')) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            if ($db) {
                $stmt = $db->prepare("SELECT role FROM users WHERE id = :id");
                $stmt->execute([':id' => $_SESSION['user_id']]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($user) { $_SESSION['user_role'] = $user['role']; }
            }
        } catch (Exception $e) {}
    }
}
$raw_role = $_SESSION['user_role'] ?? 'guest';
$role = trim(strtolower($raw_role));
if ($role === 'yönetici' || $role === 'admin') $role = 'admin';
if ($role === 'kullanıcı' || $role === 'user' || $role === 'müşteri' || $role === 'kullanici') $role = 'user';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LikyaPay | Finansal Yönetim</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        // TAILWIND RENK KONFIGURASYONU (Admin Paneli İçin)
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            400: '#38bdf8',
                            500: '#0ea5e9',
                            600: '#0284c7',
                            700: '#0369a1',
                            800: '#112240',
                            900: '#0a192f',
                        }
                    }
                }
            }
        }
    </script>

    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Grafik Kütüphaneleri -->
    <script src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/recharts/lib/Recharts.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>


    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    
    <style>
        .hero-pattern {
            background-color: #0a192f;
            background-image: radial-gradient(at 0% 0%, rgba(2, 132, 199, 0.2) 0, transparent 50%);
        }
        .sirius-star {
            position: absolute; background: white; border-radius: 50%; opacity: 0.3;
            animation: twinkle var(--duration) infinite ease-in-out;
        }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        /* Custom scrollbar for sidebar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a192f; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
    </style>

    <script>
        window.LOGO_PATH = "/public/likyapay/views/frontend/gorsel/logo_optimized.png";
    </script>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel" src="/public/likyapay/views/frontend/utils/Validators.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/sirius/algoritma.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/ErrorBoundary.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/components/NotificationToast.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/Intro.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/Dictionary.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/InfoModal.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/Navbar.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/CycleAnimation.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/LoginModal.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/RegisterModal.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/HeroSection.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/VideoSection.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/Vizyon.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/Footer.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/TrustedBy.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/Stats.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/VisitorCounter.js?v=12"></script>
    <script type="text/babel" src="/public/likyapay/views/frontend/anasayfa/HomePage.js?v=12"></script>

    <?php if ($role === 'admin' || $role === 'accountant'): ?>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/layout/Sidebar.js?v=13"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/layout/Topbar.js?v=13"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/layout/AdminLayout.js?v=13"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/pages/DashboardHome.js?v=13"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/pages/Approvals.js?v=13"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/pages/Users.js?v=13"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/pages/Accounting.js?v=13"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/pages/AdminUsers.js?v=13"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/pages/Sirius.js?v=13"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/admin/dashboard.js?v=13"></script>
    <?php endif; ?>


    <?php if ($role === 'user'): ?>
        <script type="text/babel" src="/public/likyapay/views/frontend/kullanicilar/Sidebar.js?v=14"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/kullanicilar/DashboardHome.js?v=14"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/kullanicilar/Invoices.js?v=14"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/kullanicilar/Profile.js?v=14"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/kullanicilar/MyCompanies.js?v=14"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/kullanicilar/Archive.js?v=14"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/kullanicilar/Messages.js?v=14"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/kullanicilar/Sirius.js?v=14"></script>
        <script type="text/babel" src="/public/likyapay/views/frontend/kullanicilar/panel.js?v=14"></script>
    <?php endif; ?>


    <script type="text/babel" src="/public/likyapay/views/frontend/app.js?v=12"></script>
</body>
</html>