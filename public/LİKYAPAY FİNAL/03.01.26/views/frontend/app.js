// Main App Entry Point
// Path: views/frontend/app.js

const { useState, useEffect } = React;

const App = () => {
    const [view, setView] = useState('home'); // home, admin, user
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [lang, setLang] = useState('tr'); // 'tr' or 'en'
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Check Session on Mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Use absolute path to ensure robustness
                const response = await fetch('/likyapay/data/api/check_session.php');
                const data = await response.json();
                if (data.success) {
                    console.log("✅ Session Check SUCCESS:", data.user);
                    setCurrentUser(data.user);
                    if (data.user.role === 'admin') {
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
        setCurrentUser(userData);
        setIsLoginOpen(false);
        if (role === 'admin') setView('admin');
        else setView('user');
    };

    const handleLogout = async () => {
        console.log("Logout initiated...");
        // Call logout API to destroy session
        try {
            await fetch('/likyapay/data/api/logout.php');
        } catch (e) {
            console.error("Logout API failed:", e);
        }

        // Redirect to index.php explicit to force re-entry logic
        console.log("Redirecting to homepage...");
        window.location.replace('/likyapay/index.php');
    };

    // Component Aliases (from Global Scope assigned in separate files)
    const Navbar = window.Anasayfa.Navbar;
    const LandingPage = window.Anasayfa.LandingPage;
    const LoginModal = window.Anasayfa.LoginModal;
    const RegisterModal = window.Anasayfa.RegisterModal;

    const AdminDashboard = window.Admin.Dashboard;
    const UserPanel = window.Kullanicilar.Panel;

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
