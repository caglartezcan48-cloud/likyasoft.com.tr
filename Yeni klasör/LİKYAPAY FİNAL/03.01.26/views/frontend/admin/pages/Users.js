
window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Users = () => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState("all");
    const [filterType, setFilterType] = React.useState("all"); // 'all', 'company', 'supplier', 'employee'

    // Modal & Selection States
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
    const [userTransactions, setUserTransactions] = React.useState([]);

    // Edit Mode State
    const [isEditing, setIsEditing] = React.useState(false);
    const [editingId, setEditingId] = React.useState(null);

    // Form State (New User / Edit User)
    const initialFormState = {
        title: '',
        taxNo: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        status: 'verified',
        password: '',
        account_type: 'company',
        permissions: { can_approve: false, can_accounting: false, can_settings: false }
    };
    const [newUser, setNewUser] = React.useState(initialFormState);

    // --- FETCH DATA ---
    const fetchUsers = async () => {
        setLoading(true);
        const apiUrl = '/likyapay/data/api/companies.php?t=' + Date.now();

        try {
            const res = await fetch(apiUrl);
            const data = await res.json();

            if (data.records) {
                const formatted = data.records.map(u => ({
                    id: u.id,
                    title: u.name,
                    email: u.email,
                    taxNo: u.tax_id,
                    phone: u.phone || '-',
                    status: 'verified', // Backend mapping issue logic handled here or api
                    role: u.role,
                    account_type: u.account_type || 'company',
                    // Parse permissions safely
                    permissions: u.permissions
                        ? (typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions)
                        : {},
                    debt: 0, receivable: 0
                }));
                setUsers(formatted);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            // Optional: window.showToast('Hata: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    // --- ACTIONS ---

    const handlePermissionChange = (key) => {
        setNewUser(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
        }));
    };

    const resetForm = () => {
        setNewUser(initialFormState);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEditClick = (user) => {
        setNewUser({
            title: user.title,
            taxNo: user.taxNo,
            email: user.email,
            phone: user.phone,
            status: 'verified', // or user.status
            password: '', // Don't show password
            account_type: user.account_type || 'company',
            permissions: user.permissions || { can_approve: false, can_accounting: false, can_settings: false }
        });
        setIsEditing(true);
        setEditingId(user.id);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!confirm('Bu üyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            const response = await fetch('/likyapay/data/api/delete_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (data.success) {
                // Remove from local state immediately
                setUsers(prev => prev.filter(u => u.id !== id));
                // Optional: window.showToast('Kullanıcı silindi.', 'success');
                alert('✅ Kullanıcı silindi.');
            } else {
                alert('❌ Silinemedi: ' + data.message);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert('Sunucu hatası oluştu.');
        }
    };

    const handleSaveUser = async () => {
        // Validation
        if (!newUser.title?.trim()) { alert("Lütfen Firma Ünvanını giriniz."); return; }
        if (!newUser.taxNo?.trim()) { alert("Lütfen Vergi Numarasını giriniz."); return; }
        if (!newUser.email?.trim()) { alert("Lütfen E-Posta adresini giriniz."); return; }
        if (!isEditing && (!newUser.password || newUser.password.length < 5)) {
            alert('Şifre en az 5 karakter olmalıdır.');
            return;
        }

        const payload = {
            companyName: newUser.title,
            taxNumber: newUser.taxNo,
            email: newUser.email,
            phone: newUser.phone,
            status: newUser.status,
            role: newUser.account_type === 'employee' ? 'admin' : 'user', // Basic role logic
            account_type: newUser.account_type,
            permissions: newUser.permissions,
            password: newUser.password
        };

        try {
            let url = '/likyapay/data/api/register.php';
            if (isEditing) {
                url = '/likyapay/data/api/update_user.php';
                payload.id = editingId;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Handle possible JSON parse error from PHP
            const text = await response.text();
            let resData;
            try {
                resData = JSON.parse(text);
            } catch (e) {
                console.error("Server Response Error:", text);
                alert("Sunucu hatası. Konsolu kontrol edin.");
                return;
            }

            if (resData.success) {
                alert(isEditing ? '✅ Kullanıcı güncellendi!' : '✅ Yeni üye eklendi!');
                setIsAddModalOpen(false);
                resetForm();
                fetchUsers();
            } else {
                alert('❌ İşlem Başarısız: ' + (resData.message || 'Bilinmeyen hata'));
            }

        } catch (err) {
            console.error("Save Error:", err);
            alert('Bir hata oluştu: ' + err.message);
        }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
        setUserTransactions([]);

        try {
            const res = await fetch(`/likyapay/data/api/admin_transactions.php?user_id=${user.id}`);
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
                <button
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                    className="bg-brand-600 hover:bg-brand-700 text-gray-900 px-4 py-2 rounded-lg shadow-lg transition flex items-center"
                >
                    <i className="fas fa-plus mr-2"></i> Yeni Üye Ekle
                </button>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Vergi No <span className="text-red-500">*</span></label>
                                            <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={newUser.taxNo} onChange={e => setNewUser({ ...newUser, taxNo: e.target.value })} />
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
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                {selectedUser.title}
                                <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded text-gray-500">{selectedUser.account_type}</span>
                            </h3>

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
