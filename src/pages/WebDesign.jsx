import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Palette, Zap, Shield, Search, Globe, Smartphone, Code2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const WebDesign = ({ settings }) => {
    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const services = [
        { icon: <Layout />, title: 'Kullanıcı Deneyimi (UX)', desc: 'Ziyaretçilerinizin sitenizde kolayca gezinmesini ve istedikleri bilgiye hızla ulaşmasını sağlıyoruz.' },
        { icon: <Palette />, title: 'Modern Arayüz (UI)', desc: 'Markanızın prestijini yansıtan, modern ve estetik tasarımlar oluşturuyoruz.' },
        { icon: <Smartphone />, title: 'Mobil Uyumluluk', desc: 'Tüm cihazlarda (telefon, tablet, masaüstü) mükemmel çalışan duyarlı tasarımlar.' },
        { icon: <Search />, title: 'SEO Optimizasyonu', desc: 'Arama motorlarında üst sıralarda yer almanız için gerekli teknik altyapıyı kuruyoruz.' },
        { icon: <Zap />, title: 'Yüksek Hız', desc: 'Sayfa yükleme hızlarını optimize ederek kullanıcı kaybını önlüyoruz.' },
        { icon: <Code2 />, title: 'Temiz Kod Yapısı', desc: 'Gelecekteki güncellemeler için esnek ve performanslı bir kod altyapısı sunuyoruz.' }
    ];

    return (
        <main>
            <Helmet>
                <title>Web Tasarım & Dijital Mimari | Likyasoft</title>
                <meta name="description" content="İşletmeniz için modern, hızlı ve SEO uyumlu web siteleri tasarlıyoruz. Likyasoft ile dijital dünyada fark yaratın." />
            </Helmet>

            <section className="hero-wrapper" style={{ minHeight: '60vh', background: 'var(--bg-alt)' }}>
                <div className="container">
                    <motion.div initial="hidden" animate="visible" variants={revealVariants} style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
                        <span className="sector-tag">Hizmetlerimiz</span>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', fontWeight: 800 }}>Web Tasarım & <span style={{ color: 'var(--primary)' }}>Dijital Mimari</span></h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-body)' }}>
                            Sadece bir web sitesi değil, işletmeniz için 7/24 çalışan dijital bir şube inşa ediyoruz. Estetik ve fonksiyonelliği yapay zeka dokunuşlarıyla birleştiriyoruz.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="bento-grid">
                        {services.map((item, i) => (
                            <motion.div 
                                key={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={revealVariants}
                                className="bento-item"
                                style={{ background: 'white' }}
                            >
                                <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
                                    {React.cloneElement(item.icon, { size: 32 })}
                                </div>
                                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{item.title}</h3>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-body)' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-padding" style={{ background: 'var(--text-heading)', color: 'white', borderRadius: '40px', margin: '0 20px' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariants}>
                            <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Neden Likyasoft?</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
                                Klasik ajanslardan farklı olarak biz, web sitenizi bir pazarlama aracı olarak görüyoruz. Kullanıcı davranışlarını analiz ederek dönüşüm oranlarını artıran stratejiler geliştiriyoruz.
                            </p>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Shield color="var(--primary)" /> %100 Güvenli Altyapı
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Globe color="var(--primary)" /> Global Tasarım Standartları
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Zap color="var(--primary)" /> Rakipsiz Sayfa Hızı
                                </li>
                            </ul>
                        </motion.div>
                        <div style={{ borderRadius: '32px', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=403&h=268&q=75&fm=webp&fit=crop" alt="Web Tasarım Örneği" loading="lazy" width="403" height="268" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default WebDesign;
