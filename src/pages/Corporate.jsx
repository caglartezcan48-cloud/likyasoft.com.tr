import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Cpu, Globe, Users, Trophy, Target } from 'lucide-react';

const Corporate = ({ settings }) => {
    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <main style={{ paddingTop: '100px' }}>
            <Helmet>
                <title>Kurumsal | {settings?.site_title || 'Likyasoft'}</title>
                <meta name="description" content="Likyasoft'un kurumsal değerleri, kalite politikası ve iş standartları." />
            </Helmet>

            <section className="section-padding" style={{ background: 'var(--bg-alt)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 5rem' }}>
                        <span className="sector-tag">Kurumsal Değerlerimiz</span>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginTop: '1rem', marginBottom: '1.5rem' }}>
                            Güçlü Değerler, <br/><span style={{ color: 'var(--primary)' }}>Akıllı Gelecek</span>
                        </h1>
                        <p style={{ color: 'var(--text-body)' }}>Likyasoft olarak, iş ortaklarımıza şeffaflık, hız ve sürdürülebilir teknoloji vaat ediyoruz. Standartların ötesinde, global kalitede iş üretiyoruz.</p>
                    </div>

                    <div className="corporate-grid">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={revealVariants} className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                            <ShieldCheck size={40} color="var(--primary)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                            <h2 style={{ fontSize: '1.5rem' }}>Güven & Şeffaflık</h2>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--text-body)' }}>Süreçlerimizin her adımında verinizi koruyor ve tam şeffaflıkla düzenli raporluyoruz. Gizlilik bizim için en yüksek önceliktir.</p>
                        </motion.div>
                        
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={revealVariants} className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                            <Cpu size={40} color="var(--primary)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                            <h2 style={{ fontSize: '1.5rem' }}>İnovasyon Odaklılık</h2>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--text-body)' }}>En güncel AI modellerini ve modern yazılım dillerini kullanarak yarının teknolojisini iş ortaklarımıza bugünden sunuyoruz.</p>
                        </motion.div>
                        
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={revealVariants} className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                            <Globe size={40} color="var(--primary)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                            <h2 style={{ fontSize: '1.5rem' }}>Küresel Standartlar</h2>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--text-body)' }}>Tüm projelerimizi global UX/UI prensiplerine, web erişilebilirlik yönergelerine ve uluslararası performans metriklerine göre inşa ediyoruz.</p>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={revealVariants} className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                            <Users size={40} color="var(--primary)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                            <h2 style={{ fontSize: '1.5rem' }}>Kusursuz İletişim</h2>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--text-body)' }}>Geliştirme sürecinin her aşamasında sizinle omuz omuza çalışıyor, ihtiyaçlarınızı doğru anlayarak en etkili çözümleri üretiyoruz.</p>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={revealVariants} className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                            <Target size={40} color="var(--primary)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                            <h2 style={{ fontSize: '1.5rem' }}>Sonuç Odaklı Strateji</h2>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--text-body)' }}>Dijital yatırımlarınızın size somut getiri (ROI) sağlaması için sadece tasarım değil, büyüme stratejisi kurguluyoruz.</p>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once:true }} variants={revealVariants} className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                            <Trophy size={40} color="var(--primary)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                            <h2 style={{ fontSize: '1.5rem' }}>Premium Kalite</h2>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--text-body)' }}>Detaylara verdiğimiz önemle, standartların çok ötesinde "premium" hissettiren bitmiş ürünler teslim ediyoruz.</p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Corporate;
