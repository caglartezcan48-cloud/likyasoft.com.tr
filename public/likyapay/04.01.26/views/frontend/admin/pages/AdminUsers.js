// Admin User Management Page
// Path: views/frontend/admin/pages/AdminUsers.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};


window.Admin.Pages.AdminUsers = ({ showToast }) => {
    // State
    const [admins, setAdmins] = React.useState([
        { id: 1, name: 'Admin User', email: 'admin@likyapay.com', role: 'super_admin', status: 'active', lastLogin: 'Şimdi' },
        { id: 2, name: 'Merve Yılmaz', email: 'merve@likyapay.com', role: 'sales_marketing', status: 'active', lastLogin: '2 gün önce' },
        { id: 3, name: 'Ahmet Demir', email: 'ahmet@likyapay.com', role: 'it_support', status: 'active', lastLogin: '1 saat önce' },
        { id: 4, name: 'Zeynep Kara', email: 'zeynep@likyapay.com', role: 'finance', status: 'active', lastLogin: 'Dün' }
    ]);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalMode, setModalMode] = React.useState('add'); // 'add' or 'edit'
    const [currentAdmin, setCurrentAdmin] = React.useState({ name: '', email: '', role: 'sales_marketing', status: 'active', permissions: [] });

    // Role Logic - Corporate Standards
    const roles = {
        super_admin: { label: 'Genel Müdür / CEO (Süper Admin)', color: 'bg-purple-100 text-purple-700', desc: 'Tam Yetkili Erişim' },
        finance: { label: 'Finansman ve Muhasebe', color: 'bg-green-100 text-green-700', desc: 'Bütçe ve Raporlama Yetkisi' },
        operations: { label: 'Operasyon Sorumlusu', color: 'bg-blue-100 text-blue-700', desc: 'Günlük İşleyiş ve Denetim' },
        it_support: { label: 'Bilgi Teknolojileri (IT)', color: 'bg-indigo-100 text-indigo-700', desc: 'Sistem ve Teknik Destek' },
        sales_marketing: { label: 'Satış ve Pazarlama', color: 'bg-orange-100 text-orange-700', desc: 'Müşteri ve Kampanya Yönetimi' },
        hr: { label: 'İnsan Kaynakları', color: 'bg-pink-100 text-pink-700', desc: 'Personel Yönetimi' },
        customer_relations: { label: 'Müşteri İlişkileri', color: 'bg-teal-100 text-teal-700', desc: 'Destek ve İletişim' },
        legal: { label: 'Hukuk Departmanı', color: 'bg-red-100 text-red-700', desc: 'Yasal Süreçler' },
        intern: { label: 'Stajyer', color: 'bg-gray-100 text-gray-700', desc: 'Kısıtlı Görüntüleme' }
    };

    const allPermissions = [
        { id: 'manage_users', label: 'Üye Yönetimi (Ekle/Sil/Düzenle)' },
        { id: 'view_reports', label: 'Finansal Raporları Görüntüle' },
        { id: 'manage_settings', label: 'Site Ayarlarını Değiştir' },
        { id: 'manage_content', label: 'İçerik Yönetimi' },
        { id: 'system_logs', label: 'Sistem Loglarını İncele' }
    ];

    const handleDelete = (id) => {
        if (confirm('Bu yöneticiyi silmek istediğinize emin misiniz?')) {
            setAdmins(admins.filter(admin => admin.id !== id));
            window.showToast('Yönetici başarıyla silindi.', 'success');
        }
    };

    const handleEdit = (admin) => {
        setModalMode('edit');
        setCurrentAdmin({ ...admin, permissions: ['manage_users', 'view_reports'] }); // Mock permissions
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setModalMode('add');
        setCurrentAdmin({ name: '', email: '', role: 'editor', status: 'active', permissions: [] });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!currentAdmin.name || !currentAdmin.email) {
            window.showToast('Lütfen isim ve e-posta alanlarını doldurun.', 'error');
            return;
        }

        if (modalMode === 'add') {
            const newId = admins.length + 1;
            setAdmins([...admins, { ...currentAdmin, id: newId, lastLogin: '-' }]);
            window.showToast('Yeni yönetici eklendi.', 'success');
        } else {
            setAdmins(admins.map(a => a.id === currentAdmin.id ? { ...currentAdmin, lastLogin: a.lastLogin } : a));
            window.showToast('Yönetici bilgileri güncellendi.', 'success');
        }
        setIsModalOpen(false);
    };

    const togglePermission = (permId) => {
        if (currentAdmin.permissions.includes(permId)) {
            setCurrentAdmin({ ...currentAdmin, permissions: currentAdmin.permissions.filter(p => p !== permId) });
        } else {
            setCurrentAdmin({ ...currentAdmin, permissions: [...currentAdmin.permissions, permId] });
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Yöneticiler & Personel</h1>
                    <p className="text-gray-500 text-sm">Panel erişimi olan şirket çalışanlarını yönetin ve yetkilendirin.</p>
                </div>
                <button onClick={handleAdd} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-brand-700 transition">
                    <i className="fas fa-user-shield mr-2"></i> Yeni Yönetici Ekle
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-3">Kullanıcı</th>
                            <th className="px-6 py-3">Rol / Yetki</th>
                            <th className="px-6 py-3">E-Posta</th>
                            <th className="px-6 py-3">Son Giriş</th>
                            <th className="px-6 py-3">Durum</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {admins.map(admin => (
                            <tr key={admin.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {admin.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-800">{admin.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded w-fit mb-1 ${roles[admin.role]?.color || 'bg-gray-100'}`}>
                                            {roles[admin.role]?.label}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{roles[admin.role]?.desc}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{admin.lastLogin}</td>
                                <td className="px-6 py-4">
                                    {admin.status === 'active'
                                        ? <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded border border-green-100">Aktif</span>
                                        : <span className="text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded border border-gray-200">Pasif</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(admin)} className="text-gray-400 hover:text-brand-600 transition"><i className="fas fa-edit"></i></button>
                                        {admin.role !== 'super_admin' && (
                                            <button onClick={() => handleDelete(admin.id)} className="text-gray-400 hover:text-red-500 transition"><i className="fas fa-trash-alt"></i></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{modalMode === 'add' ? 'Yeni Yönetici Ekle' : 'Yönetici Düzenle'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={currentAdmin.name}
                                    onChange={e => setCurrentAdmin({ ...currentAdmin, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="Örn: Ahmet Yılmaz"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresi</label>
                                <input
                                    type="email"
                                    value={currentAdmin.email}
                                    onChange={e => setCurrentAdmin({ ...currentAdmin, email: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="ornek@likyapay.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol Seçimi</label>
                                    <select
                                        value={currentAdmin.role}
                                        onChange={e => setCurrentAdmin({ ...currentAdmin, role: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                    >
                                        {Object.entries(roles).map(([key, role]) => (
                                            <option key={key} value={key}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Durumu</label>
                                    <select
                                        value={currentAdmin.status}
                                        onChange={e => setCurrentAdmin({ ...currentAdmin, status: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Pasif / Askıda</option>
                                    </select>
                                </div>
                            </div>

                            {/* Permission Checkboxes */}
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Özel Yetkilendirme (Kısıtlamalar)</label>
                                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 h-40 overflow-y-auto">
                                    {allPermissions.map(perm => (
                                        <label key={perm.id} className="flex items-center cursor-pointer hover:bg-white p-1 rounded transition">
                                            <input
                                                type="checkbox"
                                                checked={currentAdmin.permissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">* Süper Admin rolü tüm yetkilere sahiptir.</p>
                            </div>

                            <button onClick={handleSave} className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg mt-2">
                                {modalMode === 'add' ? 'Yöneticiyi Kaydet' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
