<?php
// build_bundle.php - Merges all JS files into one

$baseDir = __DIR__ . '/likyasoft/public/likyapay/views/';
$outputFile = __DIR__ . '/likyasoft/public/likyapay/views/frontend/bundle.js';

$files = [
    'frontend/sirius/algoritma.js',
    'frontend/anasayfa/ErrorBoundary.js',
    'frontend/anasayfa/Intro.js',
    'frontend/anasayfa/Dictionary.js',
    'frontend/anasayfa/InfoModal.js',
    'frontend/anasayfa/Navbar.js',
    'frontend/anasayfa/CycleAnimation.js',
    'frontend/anasayfa/LoginModal.js',
    'frontend/anasayfa/RegisterModal.js',
    'frontend/anasayfa/HeroSection.js',
    'frontend/anasayfa/Vizyon.js',
    'frontend/anasayfa/Footer.js',
    'frontend/anasayfa/HomePage.js',
    'frontend/admin/layout/Sidebar.js',
    'frontend/admin/layout/Topbar.js',
    'frontend/admin/layout/AdminLayout.js',
    'frontend/admin/pages/DashboardHome.js',
    'frontend/admin/pages/Approvals.js',
    'frontend/admin/pages/Users.js',
    'frontend/admin/pages/Accounting.js',
    'frontend/admin/pages/AdminUsers.js',
    'frontend/admin/pages/Reports.js',
    'frontend/admin/pages/GeneralSettings.js',
    'frontend/admin/pages/ContentManager.js',
    'frontend/admin/pages/SystemLogs.js',
    'frontend/admin/pages/Sirius.js',
    'frontend/admin/dashboard.js',
    'frontend/kullanicilar/Sidebar.js',
    'frontend/kullanicilar/DashboardHome.js',
    'frontend/kullanicilar/Invoices.js',
    'frontend/kullanicilar/Profile.js',
    'frontend/kullanicilar/Sirius.js',
    'frontend/kullanicilar/panel.js',
    'frontend/muhasebe/panel.js',
    'frontend/app.js'
];

$bundleContent = "";

foreach ($files as $file) {
    echo "Processing: $file\n";
    $path = $baseDir . $file;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        // Add a newline and a comment to separate files
        $bundleContent .= "\n// --- FILE: $file ---\n";
        $bundleContent .= $content . "\n";
    } else {
        echo "⚠️ MISSING: $file\n";
    }
}

file_put_contents($outputFile, $bundleContent);
echo "✅ Bundle created at: $outputFile\n";
echo "Size: " . round(strlen($bundleContent) / 1024, 2) . " KB\n";
?>
