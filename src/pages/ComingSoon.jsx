import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Settings, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ settings }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
            <Helmet>
                <title>{settings?.site_title ? `${settings.site_title} | Bakım Çalışması` : 'Likyasoft | Bakım Çalışması'}</title>
            </Helmet>
            
            <div className="glass" style={{ maxWidth: '600px', padding: '4rem 2rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--border)' }}>
                <div style={{ background: 'var(--bg-alt)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary)', animation: 'spin 10s linear infinite' }}>
                    <Settings size={48} />
                </div>
                
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.2 }}>
                    Altyapı Çalışmaları <br />Devam Ediyor
                </h1>
                
                <p style={{ color: 'var(--text-body)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '400px' }}>
                    İncelemek istediğiniz proje ana sunucularımıza henüz taşınmadı veya bakım çalışmaları yürütülüyor. En kısa sürede aktif edilecektir.
                </p>
                
                <a href="/#projects" className="btn-fancy ripple" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
                    <ArrowLeft size={18} /> Projelere Geri Dön
                </a>
            </div>
            
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ComingSoon;
