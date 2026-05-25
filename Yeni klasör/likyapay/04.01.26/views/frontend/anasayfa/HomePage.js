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
    // RegisterModal moved to App.js
    const Dictionary = window.Anasayfa.Dictionary;

    const [modal, setModal] = React.useState(null); // 'nasil_calisir', 'vizyon', ...

    // Default to TR, removing language selection logic
    const t = Dictionary.tr;
    const m = t.modals;

    const contents = {
        nasil_calisir: {
            title: m.how_title,
            content: (
                <div className="space-y-8">
                    {/* Visual Flow Steps */}
                    <div className="hidden md:flex justify-between items-start relative px-4">
                        {/* Connecting Line */}
                        <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 -z-10 transform translate-y-1/2"></div>

                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2">
                            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-lg">
                                <i className="fas fa-user-plus"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Ücretsiz Kayıt</h4>
                            <p className="text-xs text-gray-500">KOBİ'ler sisteme ücretsiz üye olur.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2">
                            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-lg">
                                <i className="fas fa-file-invoice"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Veri Yükleme</h4>
                            <p className="text-xs text-gray-500">Fatura ve borç bilgileri yüklenir.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2">
                            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-lg">
                                <i className="fas fa-project-diagram"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Sirius Eşleşmesi</h4>
                            <p className="text-xs text-gray-500">Yapay zeka döngüleri tespit eder.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2">
                            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-lg">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Onay & Tamamlama</h4>
                            <p className="text-xs text-gray-500">Onayınızla borçlar silinir.</p>
                        </div>
                    </div>

                    {/* Detailed Text List (Mobile Friendly) */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 md:hidden">
                        <div className="flex gap-4 items-start">
                            <div className="min-w-[32px] h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                            <div>
                                <h4 className="font-bold text-brand-900 mb-1">Ücretsiz Kayıt</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">KOBİ'ler ve ticari kuruluşlar sisteme kayıt olur. Üyelik daima ücretsizdir ve ücretsiz kalacaktır.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="min-w-[32px] h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Veri Yükleme</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">Borçlu ve alacaklı şirketler, borç/alacak detaylarını resmi evrakları (fatura vb.) ile sisteme yükler.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="min-w-[32px] h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                            <div className="">
                                <h4 className="font-bold text-gray-900 mb-1">Sirius Eşleşmesi</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">Eşit tutardaki borçlu ve alacaklı KOBİ'ler, sistem havuzunda SİRİUS adını verdiğimiz formül ile otomatik eşleştirilir.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="min-w-[32px] h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">4</div>
                            <div className="">
                                <h4 className="font-bold text-gray-900 mb-1">Onay ve Tamamlama</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">Şirketiniz bir Sirius döngüsünde yer aldığında size ön onay bilgilendirmesi gelir. Onaylarınız dahilinde süreç resmen tamamlanır.</p>
                            </div>
                        </div>
                    </div>

                    {/* Profit Model Box */}
                    <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-xl p-6 text-white shadow-xl mt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <i className="fas fa-coins text-2xl text-yellow-400"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2 text-yellow-400">Kazanç Modeli</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    Sistem, mahsuplaşma işlemi başarıyla tamamlandığında, işlem gören borç/alacak tutarının <span className="text-white font-bold">%3 + KDV</span>'si oranında hizmet bedeli alır. Bu sayede hem sistem sürdürülebilir olur hem de KOBİ'ler büyük nakit yükünden kurtulur.
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
        <div className="animate-fade-in relative">
            <Navbar
                setView={setView}
                toggleLoginModal={toggleLoginModal}
                openModal={setModal}
                t={t.nav}
            />
            <Intro />
            <HeroSection openModal={setModal} toggleRegisterModal={toggleRegisterModal} t={t.hero} />
            <Vizyon t={t.vizyon} />
            <Footer t={t.footer} openModal={setModal} />


            {modal && contents[modal] && (
                <InfoModal
                    title={contents[modal].title}
                    content={contents[modal].content}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};
