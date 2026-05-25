// Main App Entry Point
// Path: views/frontend/app.js

const { useState, useEffect } = React;

const App = () => {
    const [view, setView] = useState('home'); // home, admin, user
    // Allow external script (app.php) to auto-open login
    const [isLoginOpen, setIsLoginOpen] = useState(window.AUTO_OPEN_LOGIN || false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [lang, setLang] = useState('tr'); // 'tr' or 'en'
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Check Session on Mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Use absolute path to ensure robustness
                const response = await fetch('../data/api/check_session.php');
                const data = await response.json();
                if (data.success) {
                    console.log("✅ Session Check SUCCESS:", data.user);
                    console.log("DEBUG ROLE:", data.user.role); // Debug
                    // Sync to localStorage for Sidebar access
                    localStorage.setItem('user', JSON.stringify(data.user));

                    setCurrentUser(data.user);
                    if (data.user.role === 'admin' || data.user.role === 'accountant') {
                        setView('admin');
                    } else {
                        setView('user');
                    }
                } else {
                    console.log("❌ Session Check FAILED: No active session.");
                }
            } catch (err) {
                console.error("Session check error:", err);
            } finally {
                setIsLoadingSession(false);
                // Debug fallback
                if (window.location.hash === '#user') setView('user');
                if (window.location.hash === '#admin') setView('admin');
            }
        };
        checkSession();
    }, []);

    // Navigation Handler
    const handleLogin = (role, userData) => {
        console.log("Logged in user:", userData);
        // Reload to load role-specific scripts (Lazy Loading implementation)
        window.location.reload();
    };

    const handleLogout = async () => {
        console.log("Logout initiated...");
        try { await fetch('../data/api/logout.php'); } catch (e) { }
        window.location.replace('../index.php');
    };

    // Component Aliases (Safeguarded)
    const Navbar = window.Anasayfa.Navbar;
    const LandingPage = window.Anasayfa.LandingPage;
    const LoginModal = window.Anasayfa.LoginModal;
    const RegisterModal = window.Anasayfa.RegisterModal;
    const ChatBot = window.Components && window.Components.ChatBot ? window.Components.ChatBot : () => null;

    const AdminDashboard = (window.Admin && window.Admin.Dashboard) ? window.Admin.Dashboard : () => <div>Admin Modülü Yüklenmedi</div>;
    const UserPanel = (window.Kullanicilar && window.Kullanicilar.Panel) ? window.Kullanicilar.Panel : () => <div>Kullanıcı Modülü Yüklenmedi</div>;

    if (isLoadingSession) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><i className="fas fa-circle-notch fa-spin text-3xl text-brand-600"></i></div>;
    }

    return (
        <div className="min-h-screen">
            {/* Public Views */}
            {view === 'home' && (
                <React.Fragment>
                    <LandingPage
                        setView={setView}
                        toggleLoginModal={() => setIsLoginOpen(true)}
                        toggleRegisterModal={() => setIsRegisterOpen(true)}
                        lang={lang}
                        setLang={setLang}
                    />
                    <LoginModal
                        isOpen={isLoginOpen}
                        onClose={() => setIsLoginOpen(false)}
                        onLogin={handleLogin}
                        onRegisterClick={() => {
                            setIsLoginOpen(false);
                            setIsRegisterOpen(true);
                        }}
                    />
                    <RegisterModal
                        isOpen={isRegisterOpen}
                        onClose={() => setIsRegisterOpen(false)}
                        onLogin={handleLogin}
                    />
                </React.Fragment>
            )}

            {/* Private Views */}
            {view === 'admin' && <AdminDashboard onLogout={handleLogout} />}
            {view === 'user' && <UserPanel onLogout={handleLogout} user={currentUser} />}

            {/* AI Assistant */}
            <ChatBot />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
const ErrorBoundary = window.ErrorBoundary;

root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
