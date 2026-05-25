import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Lock, Scale } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Terms = ({ settings }) => {
    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <main>
            <Helmet>
                <title>Hizmet Şartları & Kullanım Koşulları | Likyasoft</title>
                <meta name="description" content="Likyasoft hizmet kullanım şartları ve yasal sorumluluklar hakkında detaylı bilgi edinin." />
            </Helmet>

            <section className="hero-wrapper" style={{ minHeight: '40vh', background: 'var(--bg-alt)' }}>
                <div className="container">
                    <motion.div initial="hidden" animate="visible" variants={revealVariants} style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        <span className="sector-tag">Yasal Bilgilendirme</span>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 800 }}>Hizmet <span style={{ color: 'var(--primary)' }}>Şartları</span></h1>
                        <p style={{ color: 'var(--text-body)' }}>Sizlere daha iyi hizmet verebilmek adına belirlediğimiz kullanım koşulları ve sorumluluklarımız.</p>
                    </motion.div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div style={{ maxWidth: '900px', margin: '0 auto' }} className="legal-section">
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <FileText color="var(--primary)" /> 1. Hizmet Tanımı
                            </h3>
                            <p>Likyasoft, müşterilerine web tasarım, özel yazılım geliştirme, ERP sistemleri kurulumu ve yapay zeka entegrasyonu alanlarında profesyonel hizmetler sunar. Her proje, taraflar arasında imzalanan sözleşme detaylarına göre yürütülür.</p>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <ShieldCheck color="var(--primary)" /> 2. Gizlilik ve Güvenlik
                            </h3>
                            <p>Müşterilerimize ait tüm veriler, kaynak kodlar ve ticari sırlar "Gizlilik Sözleşmesi" kapsamında korunur. Üçüncü taraflarla paylaşılmaz. Sistemlerimizde en güncel güvenlik protokolleri uygulanır.</p>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <Lock color="var(--primary)" /> 3. Fikri Mülkiyet Hakları
                            </h3>
                            <p>Geliştirilen projelerin mülkiyet hakları, ödemeler tamamlandıktan sonra müşteriye devredilir. Ancak kullanılan Likyasoft kütüphaneleri ve temel çekirdek yapıların telif hakları Likyasoft'a aittir.</p>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <Scale color="var(--primary)" /> 4. Sorumluluk Sınırları
                            </h3>
                            <p>Likyasoft, sunucu kaynaklı kesintiler veya üçüncü taraf servislerin hatalarından doğrudan sorumlu tutulamaz. Ancak sorunların çözümü için teknik destek süreçlerini ivedilikle başlatmayı taahhüt eder.</p>
                        </div>

                        <div style={{ padding: '2rem', background: 'var(--bg-alt)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                            Bu şartlar en son 01.05.2026 tarihinde güncellenmiştir. Likyasoft, kullanım şartlarında değişiklik yapma hakkını saklı tutar.
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Terms;
