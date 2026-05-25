import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = ({ settings }) => {
    const revealVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <main style={{ paddingTop: '100px' }}>
            <Helmet>
                <title>İletişim | {settings?.site_title || 'Likyasoft'}</title>
                <meta name="description" content="Likyasoft ile iletişime geçin. Projeniz için premium yapay zeka ve yazılım çözümleri teklifi alın." />
            </Helmet>

            <section className="section-padding">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span className="sector-tag">İletişim</span>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginTop: '1rem' }}>
                            Geleceği Birlikte <span style={{ color: 'var(--primary)' }}>İnşa Edelim</span>
                        </h1>
                        <p style={{ maxWidth: '600px', margin: '1.5rem auto 0', color: 'var(--text-body)' }}>Projeniz için yapay zeka destekli profesyonel çözümler arıyorsanız, kahve eşliğinde detayları konuşmaktan memnuniyet duyarız.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }} className="md-grid-1">
                        
                        <motion.div initial="hidden" animate="visible" variants={revealVariants} style={{ background: 'var(--bg-alt)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>İletişim Bilgilerimiz</h2>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>Merkez Ofis</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{settings?.address || 'Antalya, Türkiye'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>Telefon</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{settings?.contact_phone || '+90 (850) 123 45 67'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>E-Posta</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{settings?.contact_email || 'hello@likyasoft.com'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>Çalışma Saatleri</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pazartesi - Cuma: 09:00 - 18:00</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial="hidden" animate="visible" variants={revealVariants} style={{ transition: { delay: 0.2 } }}>
                            <div className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Bize Yazın</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Yapay Zeka asistanımız size anında yardımcı olacaktır, ancak doğrudan bize ulaşmak isterseniz aşağıdaki formu doldurabilirsiniz.</p>
                                
                                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={async (e) => { 
                                    e.preventDefault();
                                    const formData = {
                                        name: e.target[0].value,
                                        email: e.target[1].value,
                                        message: `[İletişim Formu] Konu: ${e.target[2].value} \n\nMesaj: ${e.target[3].value}`
                                    };
                                    
                                    const btn = e.target.querySelector('button');
                                    const originalText = btn.innerText;
                                    btn.innerText = 'Gönderiliyor...';
                                    btn.disabled = true;

                                    try {
                                        const res = await fetch('/api/ai_lead.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(formData)
                                        });
                                        const data = await res.json();
                                        if (data.status === 'success') {
                                            alert('Mesajınız başarıyla iletildi! En kısa sürede size dönüş yapacağız.');
                                            e.target.reset();
                                        } else {
                                            alert('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                                        }
                                    } catch (err) {
                                        alert('Sunucuyla bağlantı kurulamadı.');
                                    } finally {
                                        btn.innerText = originalText;
                                        btn.disabled = false;
                                    }
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="md-grid-1">
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Ad Soyad</label>
                                            <input type="text" placeholder="Adınız Soyadınız" required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', fontFamily: 'inherit' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>E-Posta</label>
                                            <input type="email" placeholder="E-Posta Adresiniz" required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', fontFamily: 'inherit' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Konu</label>
                                        <input type="text" placeholder="Hangi konuda yardımcı olabiliriz?" required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Mesajınız</label>
                                        <textarea rows="5" placeholder="Projenizin detaylarından veya ihtiyaçlarınızdan bahsedin..." required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
                                    </div>
                                    <button type="submit" className="btn-fancy" aria-label="Mesajı Gönder" style={{ border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '1rem' }}>Mesajı Gönder</button>
                                </form>
                            </div>
                        </motion.div>
                    </div>

                    {/* Google Maps Section */}
                    <section style={{ marginTop: '5rem', height: '450px', width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '40px', border: '1px solid var(--border)' }}>
                        <iframe 
                            title="Likyasoft Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102120.35414868212!2d30.6384236!3d36.8999818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c39aaeddad6661%3A0x861c6a4d2045731b!2sAntalya!5e0!3m2!1str!2str!4v1714555000000!5m2!1str!2str" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }} 
                            allowFullScreen="" 
                            loading="lazy"
                        ></iframe>
                        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', background: 'white', padding: '1rem 2rem', borderRadius: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} color="var(--primary)" /> Bizi Ziyaret Edin
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
};

export default Contact;
