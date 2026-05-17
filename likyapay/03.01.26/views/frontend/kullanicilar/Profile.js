// Profile Settings Component
// Path: views/frontend/kullanicilar/Profile.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Profile = ({ user }) => {
    // Form State
    const [formData, setFormData] = React.useState({
        email: user?.email || '',
        phone: user?.phone || '',
        authorized_person: user?.authorized_person || '',
        invoice_address: user?.invoice_address || ''
    });

    const [passData, setPassData] = React.useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [activeTab, setActiveTab] = React.useState('company');

    // Update state when user prop changes (initial load)
    React.useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                phone: user.phone || '',
                authorized_person: user.authorized_person || '',
                invoice_address: user.invoice_address || ''
            });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        try {
            const res = await fetch('/likyasoft/public/likyapay/data/api/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                window.showToast?.('Profil başarıyla güncellendi.', 'success') || alert('Güncellendi!');
            } else {
                alert('Hata: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası.');
        }
    };

    const handleChangePassword = async () => {
        if (passData.new !== passData.confirm) {
            return alert("Yeni şifreler uyuşmuyor.");
        }
        if (passData.new.length < 6) {
            return alert("Yeni şifre en az 6 karakter olmalı.");
        }

        try {
            const res = await fetch('/likyasoft/public/likyapay/data/api/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: passData.current,
                    new_password: passData.new
                })
            });
            const data = await res.json();
            if (data.success) {
                window.showToast?.('Şifreniz değiştirildi.', 'success') || alert('Şifre Değiştirildi!');
                setPassData({ current: '', new: '', confirm: '' });
            } else {
                alert('Hata: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası.');
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Profil ve Ayarlar</h2>
                    <p className="text-slate-500 text-sm">Firma bilgilerinizi ve hesap tercihlerinizi yönetin.</p>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-white">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'M'}
                </div>
                <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl font-bold text-slate-800">{user?.name || 'Firma Ünvanı'}</h3>
                    <p className="text-slate-500">Vergi No: {user?.tax_id || user?.taxNo || '---'}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <i className="fas fa-check-circle"></i> Onaylı Üye
                        </span>
                        <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <i className="fas fa-cube"></i> Sirius Paketi
                        </span>
                    </div>
                </div>
                <button className="px-5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition text-sm">
                    <i className="fas fa-camera mr-2"></i> Fot. Değiştir
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'company' ? 'bg-slate-50 text-brand-600 border-b-2 border-brand-600 md:border-b-0' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-building"></i> Firma Bilgileri
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'security' ? 'bg-slate-50 text-brand-600 border-b-2 border-brand-600 md:border-b-0' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-shield-alt"></i> Güvenlik
                </button>
                <button
                    onClick={() => setActiveTab('preferences')}
                    className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'preferences' ? 'bg-slate-50 text-brand-600 border-b-2 border-brand-600 md:border-b-0' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-bell"></i> Tercihler
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

                {/* Company Content */}
                {activeTab === 'company' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Firma Ünvanı</label>
                                <input type="text" defaultValue={user?.name || ''} className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed uppercase" disabled />
                                <p className="text-xs text-slate-400">Ünvan değişikliği için destek talebi oluşturun.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Vergi Dairesi / No</label>
                                <input type="text" defaultValue={user?.taxNo || user?.tax_id || ''} className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed uppercase" disabled />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Vergi Numarası / T.C.</label>
                                <input type="text" defaultValue={user?.tax_id || user?.taxNo || ''} className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed" disabled />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700">Yetkili Ad Soyad</label>
                                <input
                                    type="text"
                                    value={formData.authorized_person}
                                    onChange={(e) => setFormData({ ...formData, authorized_person: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700">E-Posta Adresi</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-sm font-bold text-slate-700">Telefon</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Fatura Adresi</label>
                                <textarea
                                    rows="3"
                                    value={formData.invoice_address}
                                    onChange={(e) => setFormData({ ...formData, invoice_address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20">
                                Değişiklikleri Kaydet
                            </button>
                        </div>
                    </div>
                )}

                {/* Security Content */}
                {activeTab === 'security' && (
                    <div className="space-y-6 max-w-lg animate-fade-in">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Mevcut Şifre</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passData.current}
                                    onChange={(e) => setPassData({ ...passData, current: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Yeni Şifre</label>
                                <input
                                    type="password"
                                    value={passData.new}
                                    onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Yeni Şifre (Tekrar)</label>
                                <input
                                    type="password"
                                    value={passData.confirm}
                                    onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 transition"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={handleChangePassword} className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition">
                                Şifreyi Güncelle
                            </button>
                        </div>
                    </div>
                )}

                {/* Preferences - unchanged... */}


                {/* Preferences Content */}
                {activeTab === 'preferences' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="space-y-4 divide-y divide-slate-100">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <h4 className="font-bold text-slate-800">E-Posta Bildirimleri</h4>
                                    <p className="text-sm text-slate-500">Yeni fatura ve onaylar hakkında mail al.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <h4 className="font-bold text-slate-800">SMS Bildirimleri</h4>
                                    <p className="text-sm text-slate-500">Acil durumlar ve güvenlik kodları için SMS al.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <h4 className="font-bold text-slate-800">Sirius Eşleşme Uyarıları</h4>
                                    <p className="text-sm text-slate-500">Şirketimle eşleşen döngü olduğunda anında bildir.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
