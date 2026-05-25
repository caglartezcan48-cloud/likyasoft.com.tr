import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const About = ({ settings }) => {
    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <main style={{ paddingTop: '100px' }}>
            <Helmet>
                <title>Hakkımızda | {settings?.site_title || 'Likyasoft'}</title>
                <meta name="description" content="Likyasoft'un vizyonu, misyonu ve yapay zeka destekli dijital mimari felsefesi." />
            </Helmet>

            <section className="section-padding">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span className="sector-tag">Hakkımızda</span>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginTop: '1rem' }}>
                            Teknoloji ve Estetiğin <br/><span style={{ color: 'var(--primary)' }}>Dijital Mimarisi</span>
                        </h1>
                    </div>

                    <motion.div initial="hidden" animate="visible" variants={revealVariants} className="about-card">
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Vizyonumuz</h2>
                            <p style={{ marginBottom: '2rem', color: 'var(--text-body)' }}>
                                Likyasoft, yapay zekayı sadece bir araç değil, tüm dijital ekosistemlerin kalbi olarak konumlandıran yeni nesil bir teknoloji ajansıdır. Amacımız, işletmelerin dijital dönüşümünü sadece teknik bir süreç olarak değil, prestijli bir vizyon yolculuğu olarak kurgulamaktır.
                            </p>
                            <p style={{ marginBottom: '2rem', color: 'var(--text-body)' }}>
                                Her markanın benzersiz olduğuna inanıyoruz. Bu yüzden standart şablonlar yerine, kurumun DNA'sına uygun, yüksek performanslı ve estetik açıdan kusursuz projeler üretiyoruz.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>%100 AI Odaklı</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Süreçlerimizi yapay zeka otomasyonu ile optimize ediyoruz.</p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>Butik Yaklaşım</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Her proje için kişiselleştirilmiş premium stratejiler geliştiriyoruz.</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '100%', minHeight: '400px' }}>
                            <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=403&h=268&q=75&fm=webp&fit=crop" alt="About AI" loading="lazy" width="403" height="268" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
};

export default About;
