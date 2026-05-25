import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, MessageCircle, Sparkles } from 'lucide-react';

const AiAssistant = ({ settings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Merhaba! Ben Likyasoft Dijital Asistanı. Size nasıl yardımcı olabilirim?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Basit bir AI simülasyonu veya API çağrısı
            // Gerçek projede burada bir AI API'sine istek atılır.
            // Şimdilik lead toplama ve basit cevap verme mantığı kuruyoruz.
            
            if (input.toLowerCase().includes('teklif') || input.toLowerCase().includes('iletişim') || input.toLowerCase().includes('fiyat')) {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Size özel bir teklif hazırlayabilmemiz için iletişim bilgilerinizi alabilir miyim? Veya doğrudan İletişim sayfamıza geçebilirsiniz.' }]);
            } else {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: 'Anladım. Sizi bu konuda detaylı bilgilendirmesi için uzman ekibimize yönlendiriyorum. İsterseniz iletişim bilgilerinizi bırakın, biz sizi arayalım.' }]);
                }, 1000);
            }

            // Lead'i veritabanına kaydet (Eğer mesaj kritikse)
            if (input.length > 10) {
                await fetch('/api/ai_lead.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'Asistan Kullanıcısı', message: input })
                });
            }
        } catch (error) {
            console.error('AI hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
            
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="glass"
                        style={{ 
                            width: '380px', height: '550px', borderRadius: '32px', display: 'flex', flexDirection: 'column',
                            overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(30px)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.5rem', background: 'var(--text-heading)', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot color="white" size={24} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>Likya AI</h2>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Dijital Asistan</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} aria-label="Kapat" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                    <div style={{ 
                                        padding: '0.8rem 1.2rem', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: msg.role === 'user' ? 'var(--primary)' : '#f0f2f5',
                                        color: msg.role === 'user' ? 'white' : 'var(--text-heading)',
                                        fontSize: '0.9rem', fontWeight: 500
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Yazıyor...</div>}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '1.2rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '0.8rem' }}>
                            <input 
                                type="text" 
                                placeholder="Nasıl yardımcı olabilirim?" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                style={{ flex: 1, border: 'none', background: '#f0f2f5', padding: '0.8rem 1.2rem', borderRadius: '12px', outline: 'none', fontSize: '0.9rem' }}
                            />
                            <button 
                                onClick={handleSend}
                                aria-label="Mesaj Gönder"
                                style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--text-heading)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Buttons Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="WhatsApp ile iletişime geçin"
                    onClick={() => {
                        const phone = (settings?.contact_phone || '905000000000').replace(/\D/g, '');
                        const formattedPhone = phone.startsWith('0') ? '9' + phone : (phone.startsWith('90') ? phone : '90' + phone);
                        const text = encodeURIComponent("Merhaba, likyasoft.com.tr'den yazıyorum. Web sitesi teklifi almak istiyorum.");
                        window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
                    }}
                    style={{ 
                        width: '60px', height: '60px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 15px 35px rgba(37, 211, 102, 0.4)', pointerEvents: 'auto'
                    }}
                    title="WhatsApp ile İletişime Geçin"
                >
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.55 4.197 1.594 6.02L0 24l6.135-1.61a11.77 11.77 0 005.911 1.586h.005c6.637 0 12.05-5.414 12.05-12.05a11.782 11.782 0 00-3.688-8.527z"/>
                    </svg>
                </motion.button>

                <div style={{ position: 'relative' }}>
                    <div className="ai-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', pointerEvents: 'none', zIndex: -1 }}></div>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Yapay Zeka Asistanını Aç/Kapat"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ 
                            width: '70px', height: '70px', borderRadius: '24px', border: 'none', cursor: 'pointer',
                            background: 'var(--text-heading)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', pointerEvents: 'auto'
                        }}
                    >
                        {isOpen ? <X size={32} /> : <Bot size={34} />}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default AiAssistant;
