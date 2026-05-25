import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Code2, BrainCircuit, Layout, Globe, Database } from 'lucide-react';

const Services = ({ settings }) => {
    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <main style={{ paddingTop: '100px' }}>
            <Helmet>
                <title>Hizmetlerimiz | {settings?.site_title || 'Likyasoft'}</title>
                <meta name="description" content="Likyasoft'un sunduğu yapay zeka destekli web tasarım, yazılım ve ERP çözümleri." />
            </Helmet>

            <section className="section-padding">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <span className="sector-tag">Hizmetlerimiz</span>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginTop: '1rem', marginBottom: '1.5rem' }}>
                            Yapay Zeka Destekli <br/><span style={{ color: 'var(--primary)' }}>Dijital Çözümler</span>
                        </h1>
                        <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-body)' }}>
                            Karmaşık iş problemlerini, yapay zeka ve modern yazılım mimarisiyle basit, şık ve ölçeklenebilir ürünlere dönüştürüyoruz.
                        </p>
                    </div>

                    <div className="bento-grid">
                        <motion.div initial="hidden" animate="visible" variants={revealVariants} className="bento-item bento-1">
                            <Code2 size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Özel Yazılım Geliştirme</h3>
                                <p style={{ color: 'var(--text-body)' }}>İşletmenizin ihtiyaçlarına tam olarak uyan, yüksek ölçekli ve güvenli altyapılarla kodlanmış özel yazılım çözümleri üretiyoruz. Eski sistemlerinizi modern mimariye taşıyoruz.</p>
                            </div>
                        </motion.div>
                        
                        <motion.div initial="hidden" animate="visible" variants={revealVariants} className="bento-item bento-2">
                            <BrainCircuit size={40} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Yapay Zeka Çözümleri</h3>
                                <p style={{ color: 'var(--text-body)' }}>İşinizi otomatiğe bağlayın. Müşteri hizmetleri için AI asistanlar, akıllı veri analitiği ve tahmine dayalı sistemlerle rakiplerinizin önüne geçin.</p>
                            </div>
                        </motion.div>

                        <motion.div initial="hidden" animate="visible" variants={revealVariants} className="bento-item bento-3">
                            <Layout size={40} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Premium Web Tasarım</h3>
                                <p style={{ color: 'var(--text-body)' }}>Sadece bir web sitesi değil, markanızın dijital dünyadaki prestijli yüzünü inşa ediyoruz. %100 performans, mobil uyumluluk ve kusursuz estetik.</p>
                            </div>
                        </motion.div>

                        <motion.div initial="hidden" animate="visible" variants={revealVariants} className="bento-item bento-4">
                            <Globe size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>SEO & Performans</h3>
                                <p style={{ color: 'var(--text-body)' }}>Arama motorlarında üst sıralarda yer almanızı sağlayacak stratejik kodlama ve içerik mimarisi.</p>
                            </div>
                        </motion.div>

                        <motion.div initial="hidden" animate="visible" variants={revealVariants} className="bento-item bento-5">
                            <Database size={40} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ERP & İş Yönetim</h3>
                                <p style={{ color: 'var(--text-body)' }}>Stok takibinden finans yönetimine, tüm iş süreçlerinizi tek merkezden, yapay zeka desteğiyle yönetin.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Services;
