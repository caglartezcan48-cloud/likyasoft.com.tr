<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Likya Pay | Yönetim Paneli</title>
    
    <!-- React & ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Recharts -->
    <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
    <!-- Babel Standalone -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Performance Optimizations (Preconnect) -->
    <link rel="preconnect" href="https://unpkg.com">
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        brand: {
                            50: '#f0f9ff', 800: '#075985', 900: '#0c4a6e',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; }
        @media print {
            body { background: white; }
            header, aside, button { display: none !important; }
            main { margin: 0 !important; padding: 0 !important; }
            .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
            .bg-slate-50, .bg-gray-50 { background: white !important; }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <!-- Admin Panel Components -->
    <script type="text/babel" src="frontend/admin/layout/Sidebar.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/layout/Topbar.js?v=2005"></script>
    <script type="text/babel" src="frontend/ErrorBoundary.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/layout/AdminLayout.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/DashboardHome.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/Users.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/Accounting.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/Reports.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/Approvals.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/PendingInvoices.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/Sirius.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/SiriusArchive.js?v=2005"></script>
    
    <!-- Site Settings Pages -->
    <script type="text/babel" src="frontend/admin/pages/GeneralSettings.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/ContentManager.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/AdminUsers.js?v=2005"></script>
    <script type="text/babel" src="frontend/admin/pages/SystemLogs.js?v=2005"></script>

    <!-- Main Admin App -->
    <script type="text/babel" src="frontend/admin_app.js?v=2005"></script>
</body>
</html>
