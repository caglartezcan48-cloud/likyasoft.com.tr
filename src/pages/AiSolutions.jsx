import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Bot, Sparkles, MessageSquare, Microscope, Workflow, Cpu, Database } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const AiSolutions = ({ settings }) => {
    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const aiServices = [
        { icon: <Bot />, title: 'Akıllı Chatbotlar', desc: '7/24 müşteri desteği sağlayan, öğrenen ve çözüm üreten AI asistanlar.' },
        { icon: <Microscope />, title: 'Veri Analizi (ML)', desc: 'Geçmiş verilerinizden anlamlı çıkarımlar yaparak geleceği öngören modeller.' },
        { icon: <Workflow />, title: 'Süreç Otomasyonu', desc: 'Rutin ve tekrarlayan işleri yapay zekaya devrederek zaman kazanın.' },
        { icon: <MessageSquare />, title: 'NLP (Dil İşleme)', desc: 'Metinleri anlayan, özetleyen ve analiz eden doğal dil işleme çözümleri.' },
        { icon: <Sparkles />, title: 'Yaratıcı Yapay Zeka', desc: 'Görsel ve metin üretim süreçlerinizi hızlandıran üretken AI araçları.' },
        { icon: <BrainCircuit />, title: 'AI Strateji Danışmanlığı', desc: 'İşletmenizin hangi süreçlerine yapay zeka entegre edilebileceğini belirliyoruz.' }
    ];

    return (
        <main>
            <Helmet>
                <title>Yapay Zeka Çözümleri | Likyasoft</title>
                <meta name="description" content="Geleceğin teknolojisini bugün işletmenize getirin. Akıllı chatbotlar, veri analizi ve AI otomasyon çözümleri Likyasoft'ta." />
            </Helmet>

            <section className="hero-wrapper" style={{ minHeight: '60vh', background: 'var(--text-heading)', color: 'white' }}>
                <div className="container">
                    <motion.div initial="hidden" animate="visible" variants={revealVariants} style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
                        <span className="sector-tag" style={{ color: 'var(--primary)' }}>Yarının Teknolojisi</span>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', fontWeight: 800, color: 'white' }}>Yapay Zeka <span style={{ color: 'var(--primary)' }}>Çözümleri</span></h1>
                        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>
                            Yapay zekayı bir kavram olmaktan çıkarıp işletmenizin verimliliğini artıran somut bir iş gücüne dönüştürüyoruz. Akıllı, öğrenen ve gelişen sistemler.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="bento-grid">
                        {aiServices.map((item, i) => (
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

            <section className="section-padding" style={{ background: 'var(--bg-alt)', borderRadius: '40px', margin: '0 20px' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariants}>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Zekayı İşinize Entegre Edin</h2>
                            <p style={{ color: 'var(--text-body)', marginBottom: '2rem' }}>
                                Karmaşık verilerin içindeki fırsatları görüyor, operasyonel yüklerinizi hafifletiyor ve müşterilerinize eşsiz bir deneyim sunmanız için AI modellerini eğitiyoruz.
                            </p>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>99%</h3>
                                    <p style={{ fontSize: '0.8rem' }}>Doğruluk Oranı</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>24/7</h3>
                                    <p style={{ fontSize: '0.8rem' }}>Aktif Destek</p>
                                </div>
                            </div>
                        </motion.div>
                        <div style={{ borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                            <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=403&h=268&q=75&fm=webp&fit=crop" alt="Yapay Zeka Teknolojisi" loading="lazy" width="403" height="268" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AiSolutions;
