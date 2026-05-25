// General Site Settings Page
// Path: views/frontend/admin/pages/GeneralSettings.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.GeneralSettings = ({ showToast }) => {
    // Initial State
    const [settings, setSettings] = React.useState({
        siteTitle: 'Likya Pay | Yeni Nesil Finansal Optimizasyon',
        contactEmail: 'destek@likyapay.com',
        maintenanceMode: false,
        logoPreview: null
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, logoPreview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();

        // Validation
        if (!settings.siteTitle || !settings.contactEmail) {
            window.showToast('Lütfen zorunlu alanları doldurunuz.', 'error');
            return;
        }

        // Simulate API delay
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Kaydediliyor...';

        setTimeout(() => {
            window.showToast('Site ayarları başarıyla güncellendi.', 'success');
            if (btn) btn.innerHTML = originalText;

            // Console log to verify data
            console.log('Saved Settings:', settings);
        }, 800);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Genel Site Ayarları</h1>
            <p className="text-gray-500 text-sm">Sitenin temel konfigürasyonunu buradan yönetebilirsiniz.</p>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Site Başlığı <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="siteTitle"
                            value={settings.siteTitle}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo Yükle</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden relative group">
                                {settings.logoPreview ? (
                                    <img src={settings.logoPreview} alt="Logo Önizleme" className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fas fa-image text-gray-300 text-2xl"></i>
                                )}
                            </div>
                            <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                                <i className="fas fa-upload mr-2"></i> Dosya Seç
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                            </label>
                            {settings.logoPreview && (
                                <button type="button" onClick={() => setSettings(p => ({ ...p, logoPreview: null }))} className="text-red-500 hover:text-red-700 text-sm">Orjinale Dön</button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">İletişim E-posta Adresi <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={settings.contactEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bakım Modu</label>
                        <label className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`block w-10 h-6 rounded-full transition ${settings.maintenanceMode ? 'bg-brand-600' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${settings.maintenanceMode ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-600 font-medium">Siteyi bakıma al (Ziyaretçilere 'Bakımdayız' sayfası gösterilir)</span>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button type="submit" className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition shadow-lg flex items-center">
                            <i className="fas fa-save mr-2"></i> Ayarları Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
