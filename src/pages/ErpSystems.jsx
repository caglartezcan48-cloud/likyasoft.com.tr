import React from 'react';
import { motion } from 'framer-motion';
import { Database, BarChart3, Users, Settings, Briefcase, TrendingUp, ShieldCheck, Cpu } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const ErpSystems = ({ settings }) => {
    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const features = [
        { icon: <Database />, title: 'Merkezi Veri Yönetimi', desc: 'Tüm departman verilerini tek bir merkezde toplayarak veri karmaşasına son veriyoruz.' },
        { icon: <BarChart3 />, title: 'Gelişmiş Raporlama', desc: 'İşletmenizin performansını gerçek zamanlı grafikler ve raporlarla takip edin.' },
        { icon: <Users />, title: 'İK & Personel Yönetimi', desc: 'Çalışan verimliliğini, izinlerini ve bordro süreçlerini tek noktadan yönetin.' },
        { icon: <Briefcase />, title: 'Proje Takip Sistemi', desc: 'Projelerinizin termin sürelerini ve maliyetlerini anlık olarak izleyin.' },
        { icon: <TrendingUp />, title: 'Satış & Pazarlama', desc: 'Müşteri ilişkilerinizi ve satış kanallarınızı dijital ortamda optimize edin.' },
        { icon: <Settings />, title: 'Özelleştirilebilir Yapı', desc: 'Sektörünüze ve iş yapış şeklinize özel modüller geliştiriyoruz.' }
    ];

    return (
        <main>
            <Helmet>
                <title>ERP Sistemleri & İş Otomasyonu | Likyasoft</title>
                <meta name="description" content="İşletmenizi dijitalleştiren, verimliliği artıran özel ERP çözümleri. Likyasoft ile süreçlerinizi tek merkezden yönetin." />
            </Helmet>

            <section className="hero-wrapper" style={{ minHeight: '60vh', background: 'var(--bg-alt)' }}>
                <div className="container">
                    <motion.div initial="hidden" animate="visible" variants={revealVariants} style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
                        <span className="sector-tag">Hizmetlerimiz</span>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', fontWeight: 800 }}>ERP & <span style={{ color: 'var(--primary)' }}>İş Otomasyonu</span></h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-body)' }}>
                            Karmaşık iş süreçlerinizi basitleştiren, verimliliğinizi artıran ve hatayı minimize eden yeni nesil ERP sistemleri geliştiriyoruz. İşletmenizin dijital beynini inşa ediyoruz.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="bento-grid">
                        {features.map((item, i) => (
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
                        <div style={{ borderRadius: '32px', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=403&h=268&q=75&fm=webp&fit=crop" alt="ERP Sistemleri Görseli" loading="lazy" width="403" height="268" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariants}>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Dijital Dönüşümde Yanınızdayız</h2>
                            <p style={{ color: 'var(--text-body)', marginBottom: '2rem' }}>
                                ERP projelerimiz sadece yazılım kurulumu değildir. Süreç analizi, veri göçü ve personel eğitimi ile bütünleşik bir dönüşüm hizmeti sunuyoruz.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                    <ShieldCheck color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                    <h4 style={{ fontSize: '1rem' }}>Tam Güvenlik</h4>
                                </div>
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                    <Cpu color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                    <h4 style={{ fontSize: '1rem' }}>Hızlı Entegrasyon</h4>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ErpSystems;
