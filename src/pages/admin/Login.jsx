import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('isLoggedIn', 'true');
                navigate('/admin');
            } else {
                alert(data.message || 'Giriş Başarısız!');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Sunucuya bağlanılamadı. Lütfen API yolunu kontrol edin.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg)' }}>
            <Helmet>
                <title>Likyasoft | Yönetici Girişi</title>
            </Helmet>
            
            <div className="mesh-bg">
                <div className="mesh-circle" style={{ width: '40vw', height: '40vw', background: 'rgba(30,172,199,0.1)', top: '-10%', left: '-10%' }}></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{ width: '100%', maxWidth: '450px', padding: '3rem', borderRadius: '32px', boxShadow: 'var(--shadow-lux)', position: 'relative', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Likyasoft</h1>
                    <p style={{ color: 'var(--text-body)' }}>Yönetim Paneli Girişi</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.5rem', display: 'block' }}>Kullanıcı Adı</label>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} size={18} />
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-heading)', outline: 'none', transition: 'var(--transition)' }}
                                placeholder="admin"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.5rem', display: 'block' }}>Şifre</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} size={18} />
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '1rem 3rem 1rem 3rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-heading)', outline: 'none', transition: 'var(--transition)' }}
                                placeholder="••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-body)', display: 'flex' }}
                                title="Şifreyi Göster/Gizle"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '-0.5rem' }}>
                        <input 
                            type="checkbox" 
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                        />
                        <label htmlFor="remember" style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-body)' }}>Beni Hatırla</label>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-fancy ripple"
                        style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: 'none', marginTop: '1rem', cursor: 'pointer' }}
                    >
                        Giriş Yap <ArrowRight size={20} />
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-body)', cursor: 'pointer', textDecoration: 'underline' }}>Siteye Dön</button>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
