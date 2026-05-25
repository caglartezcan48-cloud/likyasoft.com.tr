
window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Users = () => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState("all");
    const [filterType, setFilterType] = React.useState("all"); // 'all', 'company', 'supplier', 'employee'

    // --- FORM HANDLING ---
    const [newUser, setNewUser] = React.useState({
        title: '', username: '', sector: '', taxNo: '', kepAddress: '',
        email: '', password: '', phone: '',
        account_type: 'company', status: 'verified', permissions: {}
    });
    const [isEditing, setIsEditing] = React.useState(false);

    const resetForm = () => {
        setNewUser({
            title: '', username: '', sector: '', taxNo: '', kepAddress: '',
            email: '', password: '', phone: '',
            account_type: 'company', status: 'verified', permissions: {}
        });
        setIsEditing(false);
    };

    const handleEditClick = (user) => {
        setNewUser({ ...user, password: '' }); // Don't show password
        setIsEditing(true);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch('../data/api/delete_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                alert('Kullanıcı silindi.');
                fetchUsers();
            } else {
                alert('Hata: ' + data.message);
            }
        } catch (e) { console.error(e); }
    };

    const handleSaveUser = async () => {
        const endpoint = isEditing ? '../data/api/update_user.php' : '../data/api/register.php';
        // Note: register.php might expect different fields, but update_user.php handles updates.
        // For admin adding new user, we might need a specific 'admin_add_user.php' or reuse register.
        // Let's assume update_user.php can handle creation if ID is missing OR use register.php

        // Actually, register.php is for public registration. Let's use it but maybe it auto-logs in?
        // Safest is to use `approve_user.php` for updates and `register.php` for new but correct the flow.
        // Simplified: Use update_user for edit, and a new simple fetch for add.

        // Prepare payload to match API requirements (register.php expects companyName)
        const payload = {
            ...newUser,
            companyName: newUser.title, // Map title to companyName
            taxNumber: newUser.taxNo,   // Map taxNo to taxNumber if needed by register.php checks
            authorizedPerson: newUser.username // Map username as authorized person if needed
        };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert(isEditing ? 'Kullanıcı güncellendi.' : 'Yeni kullanıcı eklendi.');
                setIsAddModalOpen(false);
                fetchUsers();
            } else {
                alert('İşlem başarısız: ' + data.message);
            }
        } catch (e) { console.error(e); }
    };

    const handlePermissionChange = (field) => {
        setNewUser(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [field]: !prev.permissions?.[field] }
        }));
    };
    // Modal & Selection States
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [userTransactions, setUserTransactions] = React.useState([]); // Added missing state
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);


    // --- EFFECTS ---
    React.useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('../data/api/list_users.php');
            const data = await response.json();
            if (data.success && data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
        setUserTransactions([]);

        // Fetch Transactions
        try {
            const res = await fetch(`../data/api/admin_transactions.php?user_id=${user.id}`);
            const data = await res.json();

            if (data.success && data.data) {
                const relevant = data.data.filter(t =>
                    t.user_id == user.id || t.related_user_id == user.id
                ).map(t => ({
                    id: t.id,
                    category: t.description || 'İşlem',
                    date: t.date,
                    amount: parseFloat(t.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺',
                    type: t.user_id == user.id ? (t.type === 'debt' ? 'outcome' : 'income') : (t.type === 'debt' ? 'income' : 'outcome')
                }));
                setUserTransactions(relevant);
            }
        } catch (err) {
            console.error("Tx load error", err);
        }


    };

    // --- HELPERS ---

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const res = await fetch('../data/api/import_users.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                alert(`✅ Başarılı! ${data.message}\n` + (data.errors.length > 0 ? `⚠️ Bazı hatalar: \n${data.errors.join('\n')}` : ''));
                fetchUsers();
            } else {
                alert('❌ Hata: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Yükleme hatası.');
        } finally {
            setLoading(false);
            e.target.value = null; // Reset input
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Onaylı</span>;
            case 'pending': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Onay Bekliyor</span>;
            case 'pre_approved': return <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">Ön Onaylı</span>;
            case 'banned': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Engelli</span>;
            default: return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Bilinmiyor</span>;
        }
    };

    const getFilterLabel = (type) => {
        switch (type) {
            case 'all': return 'Tüm Tipler';
            case 'company': return 'Firma';
            case 'supplier': return 'Tedarikçi';
            case 'employee': return 'Personel';
            default: return '';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'all': return 'Tüm Durumlar';
            case 'verified': return 'Onaylı';
            case 'pending': return 'Başvuru';
            case 'pre_approved': return 'Ön Onaylı';
            case 'banned': return 'Engelli';
            default: return '';
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.taxNo || '').includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        // Robust Type Checking
        const userType = (user.account_type || 'company').trim().toLowerCase();
        const matchesType = filterType === 'all' || userType === filterType;

        return matchesSearch && matchesStatus && matchesType;
    });

    // --- RENDER ---
    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Üye İşlemleri</h1>
                    <p className="text-gray-500 text-sm">Kayıtlı şirketleri listeleyin ve yönetin.</p>
                </div>
                <div className="flex gap-2">
                    <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition flex items-center cursor-pointer">
                        <i className="fas fa-file-excel mr-2"></i> Excel/CSV Yükle
                        <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                    </label>
                    <a href="../data/api/download_template.php" className="text-sm text-gray-500 hover:text-brand-600 underline flex items-center">
                        <i className="fas fa-download mr-1"></i> Şablon İndir
                    </a>
                    <button
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="bg-brand-600 hover:bg-brand-700 text-gray-900 px-4 py-2 rounded-lg shadow-lg transition flex items-center"
                    >
                        <i className="fas fa-plus mr-2"></i> Yeni Üye Ekle
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
                {/* Search & Top Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <i className="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="İsim, e-posta veya vergi no ara..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Tabs Group */}
                <div className="flex flex-col md:flex-row justify-between gap-4 border-t pt-4">
                    {/* Status Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'verified', 'pending', 'pre_approved', 'banned'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${filterStatus === status
                                    ? 'bg-gray-800 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'Tüm Durumlar' :
                                    status === 'verified' ? 'Onaylılar' :
                                        status === 'pending' ? 'Başvurular' :
                                            status === 'pre_approved' ? 'Ön Onay' : 'Engelliler'}
                            </button>
                        ))}
                    </div>

                    {/* Type Filters (NEW) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {[
                            { id: 'all', label: 'Tüm Tipler', icon: 'fas fa-layer-group' },
                            { id: 'company', label: 'Firmalar', icon: 'fas fa-briefcase' },
                            { id: 'supplier', label: 'Tedarikçiler', icon: 'fas fa-truck' },
                            { id: 'employee', label: 'Personeller', icon: 'fas fa-user-shield' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setFilterType(type.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 ${filterType === type.id
                                    ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-100'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <i className={type.icon}></i> {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Firma Bilgileri</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">İletişim</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tür / Durum</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center p-4">
                                            <i className="fas fa-search text-4xl text-gray-200 mb-4"></i>
                                            <p className="font-medium text-gray-600">Kayıt Bulunamadı</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {filterType !== 'all' ? getFilterLabel(filterType) + ' kategorisinde ' : ''}
                                                {filterStatus !== 'all' ? getStatusLabel(filterStatus) + ' durumunda ' : ''}
                                                herhangi bir veri eşleşmedi.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-blue-50/30 transition group">
                                        <td className="p-4 text-sm text-gray-400 font-mono">#{user.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{user.title}</div>
                                            <div className="text-xs text-gray-500">Vergi No: {user.taxNo}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-600">{user.email}</div>
                                            <div className="text-xs text-gray-400">{user.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                {getStatusBadge(user.status)}
                                                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${user.account_type === 'employee' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                    {user.account_type === 'company' ? 'Firma' :
                                                        user.account_type === 'supplier' ? 'Tedarikçi' : 'Personel'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition">
                                                <button onClick={() => handleViewUser(user)} className="w-8 h-8 rounded bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition" title="Detay"><i className="fas fa-eye"></i></button>
                                                <button onClick={() => handleEditClick(user)} className="w-8 h-8 rounded bg-gray-100 hover:bg-amber-500 hover:text-white flex items-center justify-center transition" title="Düzenle"><i className="fas fa-pen"></i></button>
                                                <button onClick={() => handleDeleteClick(user.id)} className="w-8 h-8 rounded bg-gray-100 hover:bg-red-500 hover:text-white flex items-center justify-center transition" title="Sil"><i className="fas fa-trash-alt"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Üye Düzenle' : 'Yeni Üye Ekle'}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 border-b pb-2">Firma Bilgileri</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Firma Ünvanı <span className="text-red-500">*</span></label>
                                            <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={newUser.title} onChange={e => setNewUser({ ...newUser, title: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı <span className="text-red-500">*</span></label>
                                            <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50" placeholder="örn: celiksan" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Sektör</label>
                                            <select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white" value={newUser.sector} onChange={e => setNewUser({ ...newUser, sector: e.target.value })}>
                                                <option value="">Seçiniz...</option>
                                                <option value="Sanayi">Sanayi / Üretim</option>
                                                <option value="Lojistik">Lojistik</option>
                                                <option value="İnşaat">İnşaat</option>
                                                <option value="Tekstil">Tekstil</option>
                                                <option value="Enerji">Enerji</option>
                                                <option value="Gıda">Gıda</option>
                                                <option value="Teknoloji">Teknoloji</option>
                                                <option value="Turizm">Turizm</option>
                                                <option value="Sağlık">Sağlık</option>
                                                <option value="Otomotiv">Otomotiv</option>
                                                <option value="Diğer">Diğer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Vergi No <span className="text-red-500">*</span></label>
                                            <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={newUser.taxNo} onChange={e => setNewUser({ ...newUser, taxNo: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">KEP Adresi</label>
                                            <input type="email" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white" placeholder="ornek@hs01.kep.tr" value={newUser.kepAddress} onChange={e => setNewUser({ ...newUser, kepAddress: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 border-b pb-2">Güvenlik & İletişim</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta <span className="text-red-500">*</span></label>
                                            <input type="email" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre {!isEditing && <span className="text-red-500">*</span>}</label>
                                            <input type="password" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-red-50 text-red-700 font-mono" placeholder="*****" value={newUser.password || ''} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                            <input type="tel" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 border-b pb-2">Hesap Ayarları & Yetkiler (RBAC)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Türü</label>
                                            <select
                                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                                value={newUser.account_type}
                                                onChange={e => setNewUser({ ...newUser, account_type: e.target.value })}
                                            >
                                                <option value="company">Firma (Standart)</option>
                                                <option value="supplier">Tedarikçi</option>
                                                <option value="employee">Personel / Yetkili</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Durumu</label>
                                            <select
                                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                                value={newUser.status}
                                                onChange={e => setNewUser({ ...newUser, status: e.target.value })}
                                            >
                                                <option value="verified">Onaylı (Aktif)</option>
                                                <option value="pending">Onay Bekliyor</option>
                                                <option value="banned">Engelli / Pasif</option>
                                            </select>
                                        </div>
                                    </div>

                                    {newUser.account_type === 'employee' && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fade-in-up">
                                            <h4 className="font-bold text-blue-800 mb-3 text-sm flex items-center gap-2">
                                                <i className="fas fa-user-shield"></i> Personel Erişim Yetkileri
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <label className="flex items-center space-x-3 p-2 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                                                    <input type="checkbox" checked={newUser.permissions?.can_approve} onChange={() => handlePermissionChange('can_approve')} className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                                                    <span className="text-sm text-gray-700 font-medium">Üye Onaylayabilir</span>
                                                </label>
                                                <label className="flex items-center space-x-3 p-2 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                                                    <input type="checkbox" checked={newUser.permissions?.can_accounting} onChange={() => handlePermissionChange('can_accounting')} className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                                                    <span className="text-sm text-gray-700 font-medium">Muhasebe / Kasa Erişimi</span>
                                                </label>
                                                <label className="flex items-center space-x-3 p-2 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                                                    <input type="checkbox" checked={newUser.permissions?.can_settings} onChange={() => handlePermissionChange('can_settings')} className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                                                    <span className="text-sm text-gray-700 font-medium">Sistem Ayarlarını Yönetebilir</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-medium">İptal</button>
                                    <button type="submit" className="px-6 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 font-medium shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 active:scale-95">
                                        <i className="fas fa-save mr-2"></i> Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {isDetailModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Cari İşlem Detayı</h2>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {selectedUser.title}
                                    <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded text-gray-500">{selectedUser.account_type}</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    Vergi No: {selectedUser.taxNo}
                                </div>
                            </h3>

                            {/* Financial Summary */}
                            {userTransactions.length > 0 && (() => {
                                const totalDebt = userTransactions
                                    .filter(t => t.type === 'outcome')
                                    .reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^\d,-]/g, '').replace(',', '.')), 0);
                                const totalCredit = userTransactions
                                    .filter(t => t.type === 'income')
                                    .reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^\d,-]/g, '').replace(',', '.')), 0);
                                const balance = totalCredit - totalDebt;

                                return (
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                                            <div className="text-xs text-red-600 font-bold uppercase">Toplam Borç</div>
                                            <div className="text-lg font-bold text-red-700">₺{totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                                            <div className="text-xs text-green-600 font-bold uppercase">Toplam Alacak</div>
                                            <div className="text-lg font-bold text-green-700">₺{totalCredit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                                        </div>
                                        <div className={`bg-gray-50 p-3 rounded-lg border text-center ${balance >= 0 ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}>
                                            <div className="text-xs text-gray-500 font-bold uppercase">Net Bakiye</div>
                                            <div className={`text-lg font-bold ${balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                                {balance < 0 ? '-' : ''}₺{Math.abs(balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {userTransactions.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 text-left">Tarih</th>
                                            <th className="p-2 text-left">Açıklama</th>
                                            <th className="p-2 text-right">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userTransactions.map(t => (
                                            <tr key={t.id} className="border-b">
                                                <td className="p-2">{t.date}</td>
                                                <td className="p-2">
                                                    <span className={`block font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {t.type === 'income' ? 'ALACAK' : 'BORÇ'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{t.category}</span>
                                                </td>
                                                <td className="p-2 text-right font-bold">{t.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center text-gray-400 py-8 border-2 border-dashed rounded-xl">
                                    Bu cariye ait işlem kaydı bulunamadı.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
