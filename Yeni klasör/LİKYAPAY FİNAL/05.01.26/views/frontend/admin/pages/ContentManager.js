// Content Management Page
// Path: views/frontend/admin/pages/ContentManager.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.ContentManager = ({ showToast }) => {
    const [activeTab, setActiveTab] = React.useState('hero');
    const [isLoading, setIsLoading] = React.useState(false);

    // Initial Content State matching Homepage
    const [content, setContent] = React.useState({
        hero: {
            title: "Tüm Tahsilat Sürecinizi Kolaylıkla Yönetebilirsiniz.",
            subtitle: "Likya Pay, şirketler arası borç/alacak döngülerini tespit eder ve nakit akışına ihtiyaç duymadan mahsuplaşma sağlar. Finansal süreçlerinizi optimize edin.",
            ctaButton: "Hemen Başvur"
        },
        features: {
            title: "Likya Pay Nasıl Çalışır?",
            subtitle: "Karmaşık borç zincirlerini basitleştiren yenilikçi teknoloji.",
            card1Title: "Ağ Analizi",
            card1Desc: "Yapay zeka destekli algoritmamız, şirketler arasındaki karmaşık borç ağlarını anlık olarak analiz eder.",
            card2Title: "Döngü Tespiti",
            card2Desc: "Sistem, nakit akışı gerektirmeyen kapalı borç döngülerini otomatik olarak tespit eder (A -> B -> C -> A)."
        },
        vision: {
            title: "Vizyonumuz",
            description: "Likya Pay olarak hedefimiz, işletmelerin nakit akışı problemlerini en aza indirerek finansal sürdürülebilirliği artırmaktır."
        },
        footer: {
            address: "Maslak Mah. Büyükdere Cad. No:123, Sarıyer/İstanbul",
            email: "info@likyapay.com",
            phone: "+90 (212) 555 00 00"
        }
    });

    const handleChange = (section, field, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            window.showToast('İçerik güncellemeleri başarıyla kaydedildi.', 'success');
            console.log("Saved Content:", content);
        }, 1000);
    };

    const tabs = [
        { id: 'hero', label: 'Hero (Giriş)', icon: 'fa-home' },
        { id: 'features', label: 'Özellikler', icon: 'fa-star' },
        { id: 'vision', label: 'Vizyon & Hakkımızda', icon: 'fa-eye' },
        { id: 'footer', label: 'Footer & İletişim', icon: 'fa-info-circle' }
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">İçerik Yönetimi</h1>
                    <p className="text-gray-500 text-sm">Web sitesinin görünen yüzünü buradan yönetin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 transition shadow-lg flex items-center"
                >
                    {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                    {isLoading ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition ${activeTab === tab.id
                                    ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600'
                                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                                    }`}
                            >
                                <i className={`fas ${tab.icon} w-6 text-center mr-2 ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-400'}`}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">

                    {/* Hero Tab */}
                    {activeTab === 'hero' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Hero (Giriş) Bölümü</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ana Başlık (H1)</label>
                                <input
                                    type="text"
                                    value={content.hero.title}
                                    onChange={(e) => handleChange('hero', 'title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Açıklama</label>
                                <textarea
                                    rows="3"
                                    value={content.hero.subtitle}
                                    onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Buton Metni</label>
                                <input
                                    type="text"
                                    value={content.hero.ctaButton}
                                    onChange={(e) => handleChange('hero', 'ctaButton', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Features Tab */}
                    {activeTab === 'features' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Özellikler Bölümü</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bölüm Başlığı</label>
                                    <input
                                        type="text"
                                        value={content.features.title}
                                        onChange={(e) => handleChange('features', 'title', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bölüm Alt Başlığı</label>
                                    <input
                                        type="text"
                                        value={content.features.subtitle}
                                        onChange={(e) => handleChange('features', 'subtitle', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-600 mb-3">Kart 1</h4>
                                    <input
                                        type="text"
                                        placeholder="Başlık"
                                        value={content.features.card1Title}
                                        onChange={(e) => handleChange('features', 'card1Title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                                    />
                                    <textarea
                                        rows="2"
                                        placeholder="Açıklama"
                                        value={content.features.card1Desc}
                                        onChange={(e) => handleChange('features', 'card1Desc', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    ></textarea>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-600 mb-3">Kart 2</h4>
                                    <input
                                        type="text"
                                        placeholder="Başlık"
                                        value={content.features.card2Title}
                                        onChange={(e) => handleChange('features', 'card2Title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                                    />
                                    <textarea
                                        rows="2"
                                        placeholder="Açıklama"
                                        value={content.features.card2Desc}
                                        onChange={(e) => handleChange('features', 'card2Desc', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vision Tab */}
                    {activeTab === 'vision' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Vizyon & Misyon</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                                <input
                                    type="text"
                                    value={content.vision.title}
                                    onChange={(e) => handleChange('vision', 'title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vizyon Metni</label>
                                <textarea
                                    rows="5"
                                    value={content.vision.description}
                                    onChange={(e) => handleChange('vision', 'description', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* Footer Tab */}
                    {activeTab === 'footer' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Footer & İletişim</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                                <input
                                    type="text"
                                    value={content.footer.address}
                                    onChange={(e) => handleChange('footer', 'address', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">E-Posta</label>
                                    <input
                                        type="email"
                                        value={content.footer.email}
                                        onChange={(e) => handleChange('footer', 'email', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                                    <input
                                        type="tel"
                                        value={content.footer.phone}
                                        onChange={(e) => handleChange('footer', 'phone', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
