// HomePage Aggregator Component
// Path: views/frontend/anasayfa/HomePage.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.LandingPage = ({ setView, toggleLoginModal, toggleRegisterModal }) => {
    const Navbar = window.Anasayfa.Navbar;
    const HeroSection = window.Anasayfa.HeroSection;
    const Vizyon = window.Anasayfa.Vizyon;
    const Footer = window.Anasayfa.Footer;
    const Intro = window.Anasayfa.Intro;
    const InfoModal = window.Anasayfa.InfoModal;
    const TrustedBy = window.Anasayfa.TrustedBy;
    const Stats = window.Anasayfa.Stats;
    // RegisterModal moved to App.js
    const Dictionary = window.Anasayfa.Dictionary;

    const [modal, setModal] = React.useState(null); // 'nasil_calisir', 'vizyon', ...
    const [dynamicContent, setDynamicContent] = React.useState(null);

    // Fetch Dynamic Content
    React.useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch('../data/api/site_content.php');
                const data = await res.json();
                if (data.success) {
                    setDynamicContent(data.data);
                }
            } catch (err) {
                console.error("Content Fetch Error:", err);
            }
        };
        fetchContent();
    }, []);

    // Default to TR, removing language selection logic
    const t = Dictionary.tr;
    // Overlay dynamic content if available
    const m = { ...t.modals };

    if (dynamicContent?.legal) {
        const dl = dynamicContent.legal;
        m.footer_modal_legal_title = dl.title || m.footer_modal_legal_title;
        m.footer_modal_legal = `
            <div class="space-y-6 text-gray-700">
                <section>
                    <h4 class="font-bold text-lg text-brand-700 mb-2">1. Likya Pay Nedir? (Hukuki Çerçeve)</h4>
                    <p>${dl.section1 || ''}</p>
                </section>
                <section>
                    <h4 class="font-bold text-lg text-brand-700 mb-2">2. Temel Hukuki Dayanaklar</h4>
                    <p>${dl.section2 || ''}</p>
                </section>
                <section>
                    <h4 class="font-bold text-lg text-brand-700 mb-2">3. Çok Taraflı Uzlaşma (Likya Pay Modeli)</h4>
                    <p>${dl.section3 || ''}</p>
                </section>
                <section>
                    <h4 class="font-bold text-lg text-brand-700 mb-2">4. Regülasyon Açısından Durum</h4>
                    <p>${dl.section4 || ''}</p>
                </section>
                <section>
                    <h4 class="font-bold text-lg text-brand-700 mb-2">5. Hizmet Bedeli ve Hukuki Niteliği</h4>
                    <p>${dl.section5 || ''}</p>
                </section>
                <section>
                    <h4 class="font-bold text-lg text-brand-700 mb-2">6. Belgeler ve Sözleşmeler</h4>
                    <p>${dl.section6 || ''}</p>
                </section>
                <section class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 class="font-bold text-slate-800 mb-1">7. Hukuki Güvence Özeti</h4>
                    <p class="text-sm italic text-slate-600">${dl.section7 || ''}</p>
                </section>
            </div>
        `;
    }

    const contents = {
        nasil_calisir: {
            title: m.how_title,
            content: (
                <div className="space-y-8">
                    {/* Visual Flow Steps */}
                    <div className="hidden md:flex justify-between items-start relative px-4 mt-8">
                        {/* Connecting Line */}
                        <div className="absolute top-10 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent -z-10"></div>

                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2 animate-slide-up delay-100 group">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl mb-4 border-4 border-blue-50 shadow-xl group-hover:scale-110 transition-transform duration-300 text-brand-600">
                                <i className="fas fa-user-plus"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-base">Ücretsiz Kayıt</h4>
                            <p className="text-sm text-gray-500 max-w-[150px]">KOBİ'ler sisteme tamamen ücretsiz üye olur.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2 animate-slide-up delay-200 group">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl mb-4 border-4 border-blue-50 shadow-xl group-hover:scale-110 transition-transform duration-300 text-blue-600">
                                <i className="fas fa-file-invoice"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-base">Veri Yükleme</h4>
                            <p className="text-sm text-gray-500 max-w-[150px]">Fatura ve borç bilgileri güvenle yüklenir.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2 animate-slide-up delay-300 group">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl mb-4 border-4 border-blue-50 shadow-xl group-hover:scale-110 transition-transform duration-300 text-purple-600">
                                <i className="fas fa-project-diagram"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-base">Sirius Eşleşmesi</h4>
                            <p className="text-sm text-gray-500 max-w-[150px]">Yapay zeka en uygun döngüleri tespit eder.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2 animate-slide-up delay-100 group">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl mb-4 border-4 border-blue-50 shadow-xl group-hover:scale-110 transition-transform duration-300 text-green-600">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-base">Onay & Tamamlama</h4>
                            <p className="text-sm text-gray-500 max-w-[150px]">Tüm tarafların onayıyla borçlar silinir.</p>
                        </div>
                    </div>

                    {/* Detailed Text List (Mobile Friendly) */}
                    <div className="space-y-4 pt-6 md:hidden">
                        {[
                            { color: 'bg-brand-600', icon: '1', title: 'Ücretsiz Kayıt', desc: 'KOBİ\'ler ve ticari kuruluşlar sisteme kayıt olur. Üyelik daima ücretsizdir.' },
                            { color: 'bg-blue-600', icon: '2', title: 'Veri Yükleme', desc: 'Borçlu ve alacaklı şirketler, evraklarıyla sisteme yükleme yapar.' },
                            { color: 'bg-purple-600', icon: '3', title: 'Sirius Eşleşmesi', desc: 'Yapay zeka, kilitlenmiş borç zincirlerini otomatik tespit eder.' },
                            { color: 'bg-green-600', icon: '4', title: 'Onay ve Tamamlama', desc: 'Onayınızla birlikte mahsuplaşma gerçekleşir ve borçlar silinir.' }
                        ].map((item, index) => (
                            <div key={index} className="glass-card p-4 rounded-xl flex gap-4 items-start animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className={`min-w-[32px] h-8 rounded-full ${item.color} text-white flex items-center justify-center font-bold text-sm shadow-lg`}>{item.icon}</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Profit Model Box */}
                    <div className="glass-card rounded-xl p-8 shadow-2xl mt-8 border-l-4 border-yellow-400 bg-gradient-to-r from-slate-900 to-slate-800 text-white animate-slide-up delay-300">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-white/10 rounded-full shadow-inner">
                                <i className="fas fa-coins text-3xl text-yellow-400"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-3 text-yellow-400">Adil Kazanç Modeli</h4>
                                <p className="text-base text-gray-300 leading-relaxed">
                                    Sistem, yalnızca mahsuplaşma işlemi <strong className="text-white">başarıyla tamamlandığında</strong> hizmet bedeli alır. Üyelik aidatı veya gizli ücret yoktur.
                                    <br /><span className="text-sm opacity-70 mt-2 block">Hizmet Bedeli: İşlem tutarının %3 + KDV'si.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        vizyon: {
            title: m.footer_modal_vision_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_vision }}></div>
        },
        misyon: {
            title: m.footer_modal_vision_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_vision }}></div>
        },
        hakkimizda: {
            title: m.footer_modal_about_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_about }}></div>
        },
        iletisim: {
            title: m.footer_modal_contact_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_contact }}></div>
        },
        framework: {
            title: m.footer_modal_legal_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_legal }}></div>
        },
        terms: {
            title: m.footer_modal_terms_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_terms }}></div>
        },
        privacy: {
            title: m.footer_modal_privacy_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_privacy }}></div>
        },
        kvkk: {
            title: m.footer_modal_kvkk_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_kvkk }}></div>
        }
    };

    return (
        <>
            <div className="animate-fade-in relative">
                <Navbar
                    setView={setView}
                    toggleLoginModal={toggleLoginModal}
                    openModal={setModal}
                    t={t.nav}
                />
                <Intro />
                <HeroSection openModal={setModal} toggleRegisterModal={toggleRegisterModal} t={t.hero} />

                <TrustedBy />

                <window.Anasayfa.VideoSection />

                <Stats />

                <Vizyon t={t.vizyon} />
                <Footer t={t.footer} openModal={setModal} />
            </div>

            {modal && contents[modal] && (
                <InfoModal
                    title={contents[modal].title}
                    content={contents[modal].content}
                    onClose={() => setModal(null)}
                />
            )}
        </>
    );
};
