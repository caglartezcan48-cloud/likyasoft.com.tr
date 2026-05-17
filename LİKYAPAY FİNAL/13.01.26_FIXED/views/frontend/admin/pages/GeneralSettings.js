// General Site Settings Page
// Path: views/frontend/admin/pages/GeneralSettings.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.GeneralSettings = ({ showToast }) => {
    // --- TABS & STATE ---
    const [activeTab, setActiveTab] = React.useState('general');
    const [users, setUsers] = React.useState([]);
    const [loadingUsers, setLoadingUsers] = React.useState(false);

    // Initial State for Settings
    const [settings, setSettings] = React.useState({
        siteTitle: 'Likya Pay | Yeni Nesil Finansal Optimizasyon',
        contactEmail: 'destek@likyapay.com',
        maintenanceMode: false,
        logoPreview: `/views/frontend/gorsel/logo.png?v=${new Date().getTime()}`
    });

    // --- EFFECTS ---
    React.useEffect(() => {
        if (activeTab === 'managers') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch('../data/api/list_users.php');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingUsers(false);
        }
    };

    // --- HANDLERS (Settings) ---
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

        const formData = new FormData();
        formData.append('siteTitle', settings.siteTitle);
        formData.append('contactEmail', settings.contactEmail);
        formData.append('maintenanceMode', settings.maintenanceMode ? '1' : '0');

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput && fileInput.files[0]) {
            formData.append('logo', fileInput.files[0]);
        }

        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Kaydediliyor...';

        fetch('../data/api/update_settings.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.showToast(data.message, 'success');
                    // Force reload to refresh logo everywhere
                    setTimeout(() => window.location.reload(true), 1000);
                } else {
                    window.showToast(data.message || 'Bir hata oluştu.', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                window.showToast('Bağlantı hatası.', 'error');
            })
            .finally(() => {
                if (btn) btn.innerHTML = originalText;
            });
    };

    // --- HANDLERS (Managers) ---
    const handleRoleChange = async (user, newRole) => {
        if (!confirm(`${user.title} adlı kullanıcıyı ${newRole === 'admin' ? 'YÖNETİCİ yapmak' : 'Yöneticilikten çıkarmak'} istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch('../data/api/update_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    role: newRole
                })
            });
            const data = await res.json();
            if (data.success) {
                window.showToast('Kullanıcı yetkisi güncellendi.', 'success');
                fetchUsers(); // Refresh list
            } else {
                alert('Hata: ' + data.message);
            }
        } catch (e) {
            console.error(e);
            alert('İşlem başarısız.');
        }
    };

    // Filter Lists
    const admins = users.filter(u => u.role === 'admin');
    const employees = users.filter(u => u.account_type === 'employee' && u.role !== 'admin');

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Site Ayarları & Yöneticiler</h1>
                    <p className="text-gray-500 text-sm">Genel site yapılandırması ve yetkili atama işlemleri.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'general' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <i className="fas fa-cog mr-2"></i> Genel Ayarlar
                </button>
                <button
                    onClick={() => setActiveTab('managers')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'managers' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <i className="fas fa-user-shield mr-2"></i> Yöneticiler
                </button>
            </div>

            {/* CONTENT: GENERAL */}
            {activeTab === 'general' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
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
                                <span className="ml-3 text-sm text-gray-600 font-medium">Siteyi bakıma al</span>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button type="submit" className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition shadow-lg flex items-center">
                                <i className="fas fa-save mr-2"></i> Ayarları Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* CONTENT: MANAGERS */}
            {activeTab === 'managers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">

                    {/* Current Admins */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <i className="fas fa-crown text-amber-500"></i> Mevcut Yöneticiler
                            </h3>
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold">{admins.length}</span>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                            {admins.map(user => (
                                <div key={user.id} className="p-4 flex justify-between items-center hover:bg-amber-50/10 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                                            {user.title.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{user.title}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    {/* Prevent demoting self if logged in check could proceed here */}
                                    <button
                                        onClick={() => handleRoleChange(user, 'user')}
                                        className="text-gray-400 hover:text-red-600 p-2 rounded hover:bg-gray-100 transition"
                                        title="Yöneticilikten Çıkar (Normal Kullanıcı Yap)"
                                    >
                                        <i className="fas fa-user-minus"></i>
                                    </button>
                                </div>
                            ))}
                            {admins.length === 0 && <div className="p-6 text-center text-gray-400">Yönetici bulunamadı.</div>}
                        </div>
                    </div>

                    {/* Eligible Employees */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <i className="fas fa-user-tie text-blue-500"></i> Personel Listesi
                            </h3>
                            {/* Link to make new employees */}
                            <button onClick={() => window.Admin.handlePageChange && window.Admin.handlePageChange('users')} className="text-xs text-blue-600 hover:underline">
                                + Yeni Personel Ekle
                            </button>
                        </div>
                        <div className="p-3 bg-blue-50 text-xs text-blue-700 border-b border-blue-100">
                            Aşağıdaki personellerden birini seçerek <b>Tam Yetkili Yönetici</b> yapabilirsiniz.
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                            {employees.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500 mb-2">Uygun personel bulunamadı.</p>
                                    <p className="text-xs text-gray-400">Önce "Üye İşlemleri" sayfasından "Personel" tipinde kullanıcı eklemelisiniz.</p>
                                </div>
                            ) : (
                                employees.map(user => (
                                    <div key={user.id} className="p-4 flex justify-between items-center hover:bg-blue-50/10 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {user.title.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">{user.title}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRoleChange(user, 'admin')}
                                            className="bg-brand-100 hover:bg-brand-600 hover:text-white text-brand-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2"
                                        >
                                            <i className="fas fa-arrow-up"></i> Yönetici Yap
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};
