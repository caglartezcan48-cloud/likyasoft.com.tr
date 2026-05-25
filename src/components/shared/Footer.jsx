import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';

const Footer = ({ settings }) => {
    return (
        <footer id="contact" style={{ padding: '100px 0 50px', background: 'var(--bg-alt)', borderTop: '1px solid var(--border)' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                    <div style={{ gridColumn: '1 / span 2' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', marginBottom: '1.5rem' }} aria-label="Ana Sayfa">
                            <img src="/logo.webp" alt="Likyasoft Logosu" width="42" height="42" style={{ height: '42px', width: 'auto' }} />
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>Likyasoft</span>
                        </Link>
                        <p style={{ maxWidth: '300px', color: 'var(--text-body)', marginBottom: '1.5rem' }}>
                            Yapay zeka ve teknoloji odağında, işletmelerin dijital dönüşüm yolculuğuna rehberlik ediyoruz.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-body)' }}>
                            <span><strong>Tel:</strong> {settings?.contact_phone || '+90 500 000 00 00'}</span>
                            <span><strong>E-posta:</strong> {settings?.contact_email || 'info@likyasoft.com.tr'}</span>
                        </div>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Hizmetler</h2>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-body)' }}>
                            <li><Link to="/hizmetler/web-tasarim" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="Web Tasarım Hizmeti">Web Tasarım</Link></li>
                            <li><Link to="/hizmetler/erp-sistemleri" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="ERP Sistemleri Hizmeti">ERP Sistemleri</Link></li>
                            <li><Link to="/hizmetler/yapay-zeka" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="Yapay Zeka Çözümleri">Yapay Zeka Çözümleri</Link></li>
                            <li><Link to="/sozlesmeler" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="Yasal Sözleşmeler">Yasal Sözleşmeler</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Kurumsal</h2>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-body)' }}>
                            <li><Link to="/hakkimizda" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="Hakkımızda">Hakkımızda</Link></li>
                            <li><Link to="/kurumsal" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="Kurumsal Kimlik">Kurumsal Kimlik</Link></li>
                            <li><Link to="/iletisim" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="İletişim">İletişim</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Sosyal Medya</h2>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {settings?.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-heading)', textDecoration: 'none' }} aria-label="Instagram sayfamızı ziyaret edin">
                                    <Instagram size={18} />
                                </a>
                            )}
                            {settings?.linkedin_url && (
                                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-heading)', textDecoration: 'none' }} aria-label="LinkedIn sayfamızı ziyaret edin">
                                    <Linkedin size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-body)', flexWrap: 'wrap', gap: '1rem' }}>
                    <p>© {new Date().getFullYear()} Likyasoft. Tüm Hakları Saklıdır.</p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link to="/sozlesmeler" style={{ color: 'inherit', textDecoration: 'none' }} aria-label="KVKK Metni">KVKK</Link>
                        <Link to="/sozlesmeler" style={{ color: 'inherit', textDecoration: 'none' }} aria-label="Gizlilik Sözleşmesi">Gizlilik</Link>
                    </div>
                    <p>Yapay Zeka ile Tasarlanmıştır.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
