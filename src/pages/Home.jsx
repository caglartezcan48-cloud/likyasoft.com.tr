import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, ChevronDown, ArrowRight, Bot, Zap, Globe, Cpu, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import NeuralBackground from '../components/shared/NeuralBackground';

const Home = ({ settings }) => {
    const [projects, setProjects] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFaq, setActiveFaq] = useState(null);
    const [selectedSector, setSelectedSector] = useState('default');

    const sectorThemes = {
        default: { color: '#1EACC7', label: 'Teknoloji & AI', subtitle: 'Yapay zeka odaklı yazılım çözümlerimizle işletmenizi yarına hazırlıyoruz.' },
        finance: { color: '#FFD700', label: 'Finans & Fintech', subtitle: 'Veri analitiği ve yapay zeka ile finansal operasyonlarınızı optimize edin.' },
        health: { color: '#00FFA3', label: 'Sağlık & Medikal', subtitle: 'Dijital sağlık çözümleriyle hasta deneyimini ve operasyonel hızı artırın.' },
        retail: { color: '#FF00E5', label: 'E-Ticaret & Perakende', subtitle: 'Akıllı algoritmalarla satışlarınızı artırın ve müşteri davranışlarını analiz edin.' }
    };

    useEffect(() => {
        fetch('/api/projects.php').then(res => res.json()).then(data => setProjects(data)).catch(err => console.error(err));
        fetch('/api/blogs.php').then(res => res.json()).then(data => setBlogs(data.slice(0, 3))).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', sectorThemes[selectedSector].color);
    }, [selectedSector]);

    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const faqs = [
        { q: "Hangi teknolojileri kullanıyorsunuz?", a: "React, Next.js, Node.js ve en güncel yapay zeka modellerini kullanarak yüksek performanslı çözümler üretiyoruz." },
        { q: "Bir projenin tamamlanma süresi nedir?", a: "Projenin kapsamına bağlı olarak web siteleri 2-4 hafta, kapsamlı sistemler 2-4 ay arasında tamamlanmaktadır." },
        { q: "Teknik destek veriyor musunuz?", a: "Evet, tüm projelerimiz 1 yıl boyunca ücretsiz teknik destek ve bakım garantisi kapsamındadır." }
    ];

    const partners = [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=30&q=80&fm=webp&fit=crop", // Placeholder for Partners
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&h=30&q=80&fm=webp&fit=crop"
    ];

    return (
        <main>
            <Helmet>
                <title>Likya Soft | Fethiye Web Tasarım ve Yazılım Çözümleri</title>
                <meta name="description" content="Fethiye'den tüm Türkiye'ye 7 günde teslim web sitesi. Yapay zeka destekli, SEO uyumlu, mobil öncelikli tasarım. Ücretsiz teklif al." />
            </Helmet>

            <NeuralBackground />
            
            {/* Hero Section */}
            <section className="hero-wrapper" id="home" style={{ overflow: 'visible', position: 'relative' }}>
                <div className="container hero-grid">
                    <motion.div initial="hidden" animate="visible" variants={revealVariants}>
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={selectedSector}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1.2rem', borderRadius: '100px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem', border: '1px solid var(--primary)', backdropFilter: 'blur(10px)' }}
                            >
                                <Bot size={16} /> {sectorThemes[selectedSector].label} Deneyimi Aktif
                            </motion.div>
                        </AnimatePresence>

                        {/* Perf: LCP Hero Heading */}
                        <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5.5rem)', lineHeight: 0.95, marginBottom: '2rem', fontWeight: 800, letterSpacing: '-2px' }}>
                            Likya Soft: <span style={{ color: 'var(--primary)', transition: '0.5s' }}>Fethiye'den 7 Günde</span> Web Sitesi
                        </h1>
                        
                        <AnimatePresence mode="wait">
                            <motion.p 
                                key={selectedSector}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', color: 'var(--text-body)' }}
                            >
                                Yapay zeka destekli, SEO hazır, ömür boyu destek. Esnaf sözüyle çalışıyoruz.
                            </motion.p>
                        </AnimatePresence>

                        {/* Sector Morphing Controller */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', opacity: 0.6, textTransform: 'uppercase' }}>Sektörünüzü Seçin, AI Sizi Karşılasın:</h2>
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                {Object.keys(sectorThemes).map(key => (
                                    <button 
                                        key={key}
                                        onClick={() => setSelectedSector(key)}
                                        aria-label={`${sectorThemes[key].label} moduna geç`}
                                        style={{ 
                                            padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid',
                                            borderColor: selectedSector === key ? 'var(--primary)' : 'var(--border)',
                                            background: selectedSector === key ? 'var(--primary)' : 'transparent',
                                            color: selectedSector === key ? 'white' : 'var(--text-heading)',
                                            cursor: 'pointer', fontWeight: 700, transition: '0.3s', fontSize: '0.85rem'
                                        }}
                                    >
                                        {sectorThemes[key].label.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="hero-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <Link to="/iletisim" className="btn-fancy" style={{ padding: '1.1rem 2.8rem' }} aria-label="Ücretsiz teklif alma formuna git">Ücretsiz Teklif Al</Link>
                            <a href="https://wa.me/905000000000" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'var(--text-heading)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }} aria-label="WhatsApp ile iletişime geç">WhatsApp Destek <ArrowRight size={18} /></a>
                        </div>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="hero-assets md-flex" style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '120%', height: '120%', background: `radial-gradient(circle, ${sectorThemes[selectedSector].color}15 0%, transparent 70%)`, transition: '0.5s', zIndex: -1 }}></div>
                        <div style={{ position: 'relative', width: '100%', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&q=70&fm=webp" 
                                srcSet="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&q=70&fm=webp 1200w, https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&q=65&fm=webp 800w"
                                sizes="(min-width: 1280px) 1200px, 100vw"
                                loading="eager"
                                fetchpriority="high"
                                decoding="sync"
                                alt="Likya Soft Yapay Zeka Destekli Yazılım" 
                                width="1200"
                                height="600"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Partners */}
            <section style={{ padding: '40px 0', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
                <div className="container">
                    <div style={{ display: 'flex', gap: '5rem', alignItems: 'center', opacity: 0.4, animation: 'marquee 25s linear infinite', whiteSpace: 'nowrap' }}>
                        {[...partners, ...partners].map((logo, i) => (
                            <img key={i} src={logo} alt={`Partner Logo ${i + 1}`} loading="lazy" width="120" height="30" style={{ height: '30px', filter: 'grayscale(1)' }} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects */}
            <section className="section-padding" id="projects">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                            <span className="sector-tag">Gelecek İnşa Ediliyor</span>
                            <h2 style={{ fontSize: '3rem' }}>Dijital <span style={{ color: 'var(--primary)' }}>Eserlerimiz</span></h2>
                        </div>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                            <input type="text" placeholder="Sektör veya teknoloji ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Projelerde ara" style={{ width: '100%', padding: '1.1rem 1.5rem 1.1rem 3.2rem', borderRadius: '18px', border: '1px solid var(--border)', background: 'white', outline: 'none' }} />
                        </div>
                    </div>
                    
                    <div className="exhibition-grid">
                        {/* Demo Kartlar */}
                        <div className="project-ex">
                            <div className="project-frame-img">
                                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=403&h=268&q=75&fm=webp&fit=crop" alt="Otel Sitesi Demo" loading="lazy" width="403" height="268" />
                            </div>
                            <div className="project-info-box">
                                <span className="sector-tag">Turizm</span>
                                <h3 className="project-title-mini">Otel Sitesi Demo</h3>
                            </div>
                        </div>
                        <div className="project-ex">
                            <div className="project-frame-img">
                                <img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=403&h=268&q=75&fm=webp&fit=crop" alt="E-Ticaret Demo" loading="lazy" width="403" height="268" />
                            </div>
                            <div className="project-info-box">
                                <span className="sector-tag">E-Ticaret</span>
                                <h3 className="project-title-mini">E-Ticaret Demo</h3>
                            </div>
                        </div>
                        <div className="project-ex" style={{ background: 'var(--text-heading)', color: 'white' }}>
                            <div className="project-info-box" style={{ textAlign: 'center', height: '100%' }}>
                                <Zap size={32} style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
                                <h3 className="project-title-mini" style={{ color: 'white', fontSize: '1.2rem !important' }}>Sıradaki Proje Sizin</h3>
                                <Link to="/iletisim" style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: 800 }}>Şimdi Başlayalım</Link>
                            </div>
                        </div>

                        {projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map((p, index) => (
                            <motion.a href={p.project_url || '#'} target="_blank" rel="noopener noreferrer" key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariants} className="project-ex" aria-label={`${p.title} projesini incele`}>
                                <div className="project-frame-img">
                                    <img src={p.image_url ? `${p.image_url}?w=403&h=268&q=75&fm=webp&fit=crop` : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=403&h=268&q=75&fm=webp&fit=crop'} alt={p.title} loading="lazy" width="403" height="268" />
                                </div>
                                <div className="project-info-box">
                                    <span className="sector-tag">{p.category}</span>
                                    <h3 className="project-title-mini">{p.title}</h3>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <div className="container">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={revealVariants} className="stats-section">
                    <div className="stats-grid">
                        <div className="stat-item"><h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, color: 'white', textShadow: '0 0 20px rgba(30,172,199,0.3)' }}>8</h2><p style={{ color: 'rgba(255,255,255,0.8)' }}>Aktif Modül</p></div>
                        <div className="stat-item"><h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, color: 'white', textShadow: '0 0 20px rgba(30,172,199,0.3)' }}>100%</h2><p style={{ color: 'rgba(255,255,255,0.8)' }}>Müşteri Memnuniyeti</p></div>
                        <div className="stat-item"><h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, color: 'white', textShadow: '0 0 20px rgba(30,172,199,0.3)' }}>50+</h2><p style={{ color: 'rgba(255,255,255,0.8)' }}>Tamamlanan Proje</p></div>
                        <div className="stat-item"><h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, color: 'white', textShadow: '0 0 20px rgba(30,172,199,0.3)' }}>24/7</h2><p style={{ color: 'rgba(255,255,255,0.8)' }}>Destek Altyapısı</p></div>
                    </div>
                </motion.div>
            </div>

            {/* Blogs Section */}
            <section className="section-padding">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span className="sector-tag">Blog</span>
                        <h2 style={{ fontSize: '2.5rem' }}>Teknolojiye <span style={{ color: 'var(--primary)' }}>Yön Verenler</span></h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {blogs.map((blog, i) => (
                            <Link to={`/blog/${blog.slug}`} key={i} style={{ textDecoration: 'none' }} aria-label={`${blog.title} yazısını oku`}>
                                <motion.div whileHover={{ y: -10, scale: 1.02 }} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', height: '100%', transition: '0.3s ease' }}>
                                    <img src={blog.image_url ? `${blog.image_url}?w=403&h=268&q=75&fm=webp&fit=crop` : 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=403&h=268&q=75&fm=webp&fit=crop'} alt={blog.title} loading="lazy" width="403" height="268" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                                    <div style={{ padding: '2rem' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>{blog.category}</span>
                                        <h3 style={{ fontSize: '1.3rem', margin: '1rem 0', color: 'var(--text-heading)' }}>{blog.title}</h3>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-heading)', fontWeight: 700, fontSize: '0.9rem' }}>Devamını Oku <ArrowRight size={16} /></span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="section-padding" style={{ background: 'var(--bg-alt)' }}>
                <div className="container" style={{ maxWidth: '850px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span className="sector-tag">S.S.S</span>
                        <h2 style={{ fontSize: '2.5rem' }}>Merak <span style={{ color: 'var(--primary)' }}>Edilenler</span></h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {faqs.map((faq, i) => (
                            <div key={i} style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} aria-label={`${faq.q} sorusunu aç/kapat`} aria-expanded={activeFaq === i} style={{ width: '100%', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>{faq.q}</span>
                                    <ChevronDown style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                </button>
                                <AnimatePresence>
                                    {activeFaq === i && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                            <div style={{ padding: '0 2rem 2rem', color: 'var(--text-body)', lineHeight: 1.8 }}>{faq.a}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WhatsApp Fixed Button */}
            <a 
                href="https://wa.me/905000000000?text=Merhaba, likyasoft.com.tr'den yazıyorum. Web sitesi teklifi almak istiyorum." 
                target="_blank" 
                rel="noopener noreferrer"
                className="whatsapp-fixed"
                aria-label="WhatsApp Destek Hattı"
            >
                <MessageSquare size={24} />
            </a>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .whatsapp-fixed {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 60px;
                    height: 60px;
                    background: #25d366;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);
                    z-index: 999;
                    transition: 0.3s;
                }
                .whatsapp-fixed:hover {
                    transform: scale(1.1);
                }
            ` }} />
        </main>
    );
};

export default Home;
