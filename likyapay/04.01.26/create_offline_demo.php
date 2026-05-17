<?php
// create_offline_demo.php
// FIXED VERSION: Uses str_replace to avoid PHP interpreting $ inside the JS bundle.

// 1. Get Data
$jsonData = file_get_contents('data.json');
$bundleJs = file_get_contents('views/frontend/bundle.js');

// 2. HTML Template (Using Nowdoc for safety, but we need to inject data, so we'll use placeholder)
$htmlTemplate = <<<'HTML'
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Likya Pay - Offline Demo</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            500: '#0ea5e9',
                            600: '#0284c7',
                            700: '#0369a1',
                            800: '#075985',
                            900: '#0c4a6e',
                        }
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.5s ease-in',
                        'slide-up': 'slideUp 0.5s ease-out',
                        'pulse-slow': 'pulse 3s infinite',
                    },
                    keyframes: {
                        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } }
                    }
                }
            }
        }
    </script>

    <!-- React & Babel -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
        .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
        /* Recharts Fix */
        tspan { font-family: sans-serif; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 font-sans antialiased selection:bg-brand-100 selection:text-brand-900">

    <div id="root"></div>

    <!-- MOCK DATA & API ADAPTER -->
    <script>
        // 1. Embed Real Data
        window.MOCK_DATA = [[JSON_PLACEHOLDER]];

        // 2. Session Simulation
        window.MOCK_SESSION = { user: null };

        // 3. Mock Fetch
        window.originalFetch = window.fetch;
        window.fetch = async (url, options) => {
            console.log("Mock Fetch Request:", url, options);
            
            // Helper to parse body
            const body = options && options.body ? JSON.parse(options.body) : {};
            // Handle URL params
            let action = null;
            if (url.includes('?')) {
                const params = new URLSearchParams(url.split('?')[1]);
                action = params.get('action');
            }
            if (!action && body.action) action = body.action;

            // --- LOGIN ---
            if (url.includes('login.php')) {
                const { email, password } = body;
                // Find user
                const user = window.MOCK_DATA.users.find(u => u.email === email);
                if (user) {
                    // Password check ignored for demo, or basic check (123456)
                    window.MOCK_SESSION.user = user;
                    return {
                        ok: true,
                        text: async () => JSON.stringify({ success: true, user: user })
                    };
                } else {
                    return {
                        ok: true,
                        text: async () => JSON.stringify({ success: false, message: "Kullanıcı bulunamadı (Offline Demo)" })
                    };
                }
            }

            // --- CHECK SESSION ---
            if (url.includes('check_session.php')) {
                if (window.MOCK_SESSION.user) {
                    return {
                        ok: true,
                         // Mimic session response structure
                        json: async () => ({ success: true, user_id: window.MOCK_SESSION.user.id, role: window.MOCK_SESSION.user.role, user: window.MOCK_SESSION.user }) 
                    };
                } else {
                    return { ok: true, json: async () => ({ success: false }) };
                }
            }

            // --- LOGOUT ---
            if (url.includes('logout.php')) {
                window.MOCK_SESSION.user = null;
                return { ok: true, json: async () => ({ success: true }) };
            }

            // --- SIRIUS API ---
            if (url.includes('sirius.php')) {
                // List All Cycles (Admin)
                if (action === 'list_all_cycles') {
                    // Enrich cycles with mocked data logic if needed, or return raw
                    return { ok: true, json: async () => ({ success: true, data: window.MOCK_DATA.cycles }) };
                }
                
                // Check My Cycle (User)
                if (action === 'check_my_cycle') {
                    const myTaxId = window.MOCK_SESSION.user?.tax_id;
                    const cycle = window.MOCK_DATA.cycles.find(c => {
                         const nodes = JSON.parse(c.nodes || '[]');
                         return nodes.includes(myTaxId);
                    });

                    if (cycle) {
                         // Simplify for demo
                         return { ok: true, json: async () => ({ success: true, in_cycle: true, cycle: cycle, nodes: JSON.parse(cycle.nodes) }) };
                    }
                    return { ok: true, json: async () => ({ success: true, in_cycle: false }) };
                }

                 // Run Engine (Admin)
                if (action === 'run_engine') {
                    return { ok: true, json: async () => ({ success: true, message: "Motor tetiklendi (Simülasyon)" }) };
                }

                if (action === 'list_requests') {
                    const uid = window.MOCK_SESSION.user?.id;
                    const reqs = window.MOCK_DATA.requests.filter(r => r.requester_id == uid);
                    return { ok: true, json: async () => ({ success: true, data: reqs }) };
                }
            }

             // --- GENERAL API (Transactions, etc) ---
             // Default fallback: return success/empty
             return {
                 ok: true,
                 json: async () => ({ success: true, data: [], message: "Offline Mod: Veri yok" }),
                 text: async () => JSON.stringify({ success: true })
             };
        };
    </script>
    
    <!-- APP BUNDLE -->
    <script type="text/babel">
        /* BUNDLE_JS_PLACEHOLDER */

        // Initialize App
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<window.App />);
    </script>

</body>
</html>
HTML;

// 3. Inject Data
$finalHtml = str_replace('[[JSON_PLACEHOLDER]]', $jsonData, $htmlTemplate);
$finalHtml = str_replace('/* BUNDLE_JS_PLACEHOLDER */', $bundleJs, $finalHtml);

file_put_contents('likyapay_offline.html', $finalHtml);
echo "Offline demo created: likyapay_offline.html (" . strlen($finalHtml) . " bytes)";
?>
