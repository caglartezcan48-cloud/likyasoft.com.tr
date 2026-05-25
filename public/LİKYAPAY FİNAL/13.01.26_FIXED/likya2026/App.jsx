import React, { useState, useEffect } from 'react';
import { HomePage } from './views/frontend/anasayfa/HomePage';

const App = () => {
    const [view, setView] = useState('home'); // home, admin, user
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoadingSession, setIsLoadingSession] = useState(true);

    // Component Aliases for Legacy Modules
    // These are still loaded via <script> tags in home.php until refactored
    const AdminDashboard = window.Admin?.Dashboard || (() => <div className="p-10 text-center">Admin Panel Yükleniyor... (Legacy)</div>);
    const UserPanel = window.Kullanicilar?.Panel || (() => <div className="p-10 text-center">Kullanıcı Paneli Yükleniyor... (Legacy)</div>);

    // Check Session on Mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('../data/api/check_session.php');
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

    const handleLoginSuccess = (role, userData) => {
        console.log("Login Success:", role, userData);
        setCurrentUser(userData);
        if (role === 'admin') setView('admin');
        else setView('user');
    };

    const handleLogout = async () => {
        console.log("Logout initiated...");
        try {
            await fetch('../data/api/logout.php');
        } catch (e) {
            console.error("Logout API failed:", e);
        }
        console.log("Redirecting to homepage...");
        window.location.replace('../index.php');
    };

    if (isLoadingSession) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><i className="fas fa-circle-notch fa-spin text-3xl text-brand-600"></i></div>;
    }

    return (
        <div className="min-h-screen">
            {view === 'home' && (
                <HomePage setView={setView} handleLoginSuccess={handleLoginSuccess} />
            )}

            {view === 'admin' && <AdminDashboard onLogout={handleLogout} />}
            {view === 'user' && <UserPanel onLogout={handleLogout} user={currentUser} />}
        </div>
    );
};

export default App;
