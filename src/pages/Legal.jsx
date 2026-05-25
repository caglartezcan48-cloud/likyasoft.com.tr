import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Lock, RefreshCw, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Legal = ({ settings }) => {
    const [activeTab, setActiveTab] = useState('terms');

    const tabs = [
        { id: 'terms', title: 'Hizmet Sözleşmesi', icon: <FileText size={18} /> },
        { id: 'sales', title: 'Mesafeli Satış', icon: <Shield size={18} /> },
        { id: 'refund', title: 'İptal ve İade', icon: <RefreshCw size={18} /> },
        { id: 'privacy', title: 'Gizlilik ve KVKK', icon: <Lock size={18} /> }
    ];

    const revealVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <main style={{ paddingTop: '120px', minHeight: '100vh' }}>
            <Helmet>
                <title>Yasal Bilgilendirme ve Sözleşmeler | Likyasoft</title>
                <meta name="description" content="Likyasoft hizmet sözleşmesi, mesafeli satış sözleşmesi ve KVKK aydınlatma metni." />
            </Helmet>

            <section className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span className="sector-tag">Hukuki Süreçler</span>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginTop: '1rem' }}>Yasal <span style={{ color: 'var(--primary)' }}>Sözleşmeler</span></h1>
                    <p style={{ color: 'var(--text-body)', maxWidth: '600px', margin: '1rem auto' }}>
                        Tüm süreçlerimizi şeffaf ve yasal çerçeveler içerisinde yürütüyoruz. İlgili belgeleri aşağıda inceleyebilirsiniz.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }} className="md-grid-1">
                    {/* Sidebar Tabs */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1.2rem',
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border)',
                                    background: activeTab === tab.id ? 'rgba(30,172,199,0.05)' : 'white',
                                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-heading)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {tab.icon}
                                    {tab.title}
                                </div>
                                <ChevronRight size={16} style={{ opacity: activeTab === tab.id ? 1 : 0.3 }} />
                            </button>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <div className="glass" style={{ padding: '3rem', borderRadius: '32px', minHeight: '600px' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={revealVariants}
                                style={{ lineHeight: '1.8', color: 'var(--text-body)' }}
                            >
                                {activeTab === 'terms' && (
                                    <>
                                        <h2 style={{ marginBottom: '2rem', color: 'var(--text-heading)' }}>Hizmet ve Kullanım Sözleşmesi</h2>
                                        <p><strong>1. TARAFLAR</strong></p>
                                        <p>İşbu sözleşme, Likyasoft (bundan sonra "Hizmet Sağlayıcı") ile bu hizmetten faydalanan kişi/kurum (bundan sonra "Müşteri") arasında akdedilmiştir.</p>
                                        <p><strong>2. HİZMETİN KONUSU</strong></p>
                                        <p>Hizmet sağlayıcı tarafından Müşteri'ye sunulacak olan web tasarım, yazılım geliştirme, yapay zeka entegrasyonu ve dijital danışmanlık hizmetlerinin sınırlarını ve şartlarını belirler.</p>
                                        <p><strong>3. TESLİMAT VE ONAY</strong></p>
                                        <p>Projeler, belirlenen termin süreleri içerisinde teslim edilir. Müşteri, teslim edilen işi 7 iş günü içerisinde incelemek ve varsa revize taleplerini iletmekle yükümlüdür.</p>
                                        <p><strong>4. ÜCRETLENDİRME</strong></p>
                                        <p>Hizmet bedelleri, teklif formunda belirtilen şekilde tahsil edilir. Ödemesi tamamlanmayan projelerin mülkiyet hakları devredilemez.</p>
                                    </>
                                )}

                                {activeTab === 'sales' && (
                                    <>
                                        <h2 style={{ marginBottom: '2rem', color: 'var(--text-heading)' }}>Mesafeli Satış Sözleşmesi</h2>
                                        <p><strong>MADDE 1 - KONU</strong></p>
                                        <p>İşbu sözleşmenin konusu, SATICI'nın ALICI'ya sattığı, nitelikleri ve satış fiyatı belirtilen hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
                                        <p><strong>MADDE 2 - HİZMET BİLGİLERİ</strong></p>
                                        <p>Likyasoft üzerinden alınan dijital hizmetler, yazılım paketleri ve danışmanlık servislerini kapsar.</p>
                                        <p><strong>MADDE 3 - CAYMA HAKKI</strong></p>
                                        <p>Dijital olarak anında ifa edilen hizmetlerde ve müşterinin isteği doğrultusunda özel olarak hazırlanan yazılımlarda cayma hakkı kullanılamaz.</p>
                                    </>
                                )}

                                {activeTab === 'refund' && (
                                    <>
                                        <h2 style={{ marginBottom: '2rem', color: 'var(--text-heading)' }}>İptal ve İade Politikası</h2>
                                        <p>Likyasoft olarak sunduğumuz hizmetlerin çoğu "Özel Üretim" veya "Dijital İçerik" kapsamına girmektedir.</p>
                                        <p><strong>1. SİPARİŞ İPTALİ:</strong> Proje başlangıç onayı verilmeden ve kaynak ayrımı yapılmadan önce yapılan iptal taleplerinde ödenen tutarın %100'ü iade edilir.</p>
                                        <p><strong>2. PROJE AŞAMASINDA İPTAL:</strong> Tasarım ve kodlama aşamasına geçilmiş projelerde, o ana kadar sarf edilen mesai bedeli düşülerek kalan tutar iade edilir.</p>
                                        <p><strong>3. İADE EDİLEMEYECEK DURUMLAR:</strong> Satın alınan domain (alan adı), sunucu (hosting) ve lisans ücretleri gibi üçüncü taraflara ödenen bedeller iade edilemez.</p>
                                    </>
                                )}

                                {activeTab === 'privacy' && (
                                    <>
                                        <h2 style={{ marginBottom: '2rem', color: 'var(--text-heading)' }}>Gizlilik ve KVKK Politikası</h2>
                                        <p>Likyasoft, kullanıcılarının gizliliğine ve kişisel verilerinin korunmasına büyük önem verir. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında:</p>
                                        <p><strong>VERİ SORUMLUSU:</strong> Likyasoft Dijital Mimari</p>
                                        <p><strong>VERİ İŞLEME AMACI:</strong> Hizmetlerimizin sunulması, faturalandırma süreçleri ve müşteri desteği sağlamak amacıyla ad, soyad, e-posta ve telefon bilgileriniz işlenmektedir.</p>
                                        <p><strong>ÇEREZLER:</strong> Sitemizde kullanıcı deneyimini artırmak ve analiz yapmak amacıyla çerezler kullanılmaktadır. Sitemizi kullanarak çerez politikamızı kabul etmiş sayılırsınız.</p>
                                        <p><strong>HAKLARINIZ:</strong> Verilerinizin silinmesini, güncellenmesini veya işlenip işlenmediğini öğrenme hakkına sahipsiniz.</p>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Legal;
