import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const Navbar = ({ settings }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Menü açıldığında scroll'u engelle (Mobil için iyi bir deneyim)
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const navStyle = {
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        padding: isScrolled ? '0.8rem 0' : '1.2rem 0',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isScrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
    };

    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav style={navStyle} className="main-navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }} className="nav-logo-group" aria-label="Ana Sayfa">
                    <img src="/logo.png" alt="Likyasoft Logosu" width="46" height="46" style={{ height: isScrolled ? '38px' : '46px', width: 'auto', transition: 'all 0.3s' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: isScrolled ? '1.2rem' : '1.3rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.5px', lineHeight: 1 }}>Likyasoft</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '2px', marginTop: '4px' }}>DİJİTAL MİMARİ</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div style={{ display: 'flex', gap: '2.5rem' }} className="md-flex nav-desktop-links">
                    <Link to="/" className="nav-link-item" aria-label="Ana Sayfa">Ana Sayfa</Link>
                    <Link to="/projelerimiz" className="nav-link-item" aria-label="Projelerimiz">Projelerimiz</Link>
                    <Link to="/blog" className="nav-link-item" aria-label="Blog Yazıları">Blog</Link>
                    <Link to="/kurumsal" className="nav-link-item" aria-label="Kurumsal Bilgiler">Kurumsal</Link>
                    <Link to="/iletisim" className="nav-link-item" aria-label="İletişim">İletişim</Link>
                </div>
                
                <div className="md-flex items-center gap-4">
                    <Link to="/admin/" title="Yönetim Paneli" className="admin-icon-btn" aria-label="Yönetim Paneli Girişi">
                        <ShieldCheck size={20} />
                    </Link>
                    <Link to="/iletisim" className="btn-fancy ripple" aria-label="Teklif Alın">Teklif Alın <ArrowRight size={16} /></Link>
                </div>

                {/* Mobile Toggle */}
                <button 
                    className="md-hidden mobile-toggle" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Menüyü Aç/Kapat"
                >
                    <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-content">
                    <Link to="/" onClick={closeMenu} className="mobile-nav-link">Ana Sayfa</Link>
                    <Link to="/projelerimiz" onClick={closeMenu} className="mobile-nav-link">Projelerimiz</Link>
                    <Link to="/blog" onClick={closeMenu} className="mobile-nav-link">Blog</Link>
                    <Link to="/kurumsal" onClick={closeMenu} className="mobile-nav-link">Kurumsal</Link>
                    <Link to="/iletisim" onClick={closeMenu} className="mobile-nav-link">İletişim</Link>
                    
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <Link to="/iletisim" className="btn-fancy ripple" onClick={closeMenu} style={{ width: '100%' }}>
                            Teklif Alın <ArrowRight size={16} />
                        </Link>
                        <Link to="/admin/" onClick={closeMenu} className="mobile-admin-link">
                            <ShieldCheck size={18} /> Yönetim Girişi
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
