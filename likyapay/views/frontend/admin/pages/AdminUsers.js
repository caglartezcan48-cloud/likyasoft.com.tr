
window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.AdminUsers = () => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // --- EFFECTS ---
    React.useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Add timestamp to prevent caching
            const res = await fetch('../data/api/list_users.php?_=' + new Date().getTime());
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleRoleChange = async (user, newRole) => {
        if (!confirm(`${user.title} adlı kullanıcıyı ${newRole === 'admin' ? 'YÖNETİCİ yapmak' : 'Yöneticilikten çıkarmak'} istediğinize emin misiniz?`)) return;

        // Optimistic Update
        const originalUsers = [...users];
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));

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
                if (window.showToast) window.showToast('Kullanıcı yetkisi güncellendi.', 'success');
                else alert('Kullanıcı yetkisi güncellendi.');

                fetchUsers(); // Refresh list to be sure
            } else {
                alert('Hata: ' + data.message);
                setUsers(originalUsers); // Revert on error
            }
        } catch (e) {
            console.error(e);
            alert('İşlem başarısız.');
            setUsers(originalUsers); // Revert on error
        }
    };

    // Filter Lists
    const admins = users.filter(u => u.role === 'admin');
    const candidates = users.filter(u => u.role !== 'admin');

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Yöneticiler</h1>
                    <p className="text-gray-500 text-sm">Sisteme tam yetkili erişimi olan kullanıcıları yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">

                {/* Current Admins */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <i className="fas fa-crown text-amber-500"></i> Mevcut Yöneticiler
                        </h3>
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold">{admins.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
                        {admins.map(user => (
                            <div key={user.id} className="p-3 flex justify-between items-center hover:bg-amber-50 transition rounded-lg border border-transparent hover:border-amber-100 mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold shadow-inner">
                                        {user.title.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{user.title}</div>
                                        <span className="text-[10px] uppercase bg-gray-100 px-1 rounded text-gray-500">{user.account_type === 'employee' ? 'Personel' : 'Firma'} Hesabı</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRoleChange(user, 'user')}
                                    className="text-gray-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition"
                                    title="Yöneticilikten Çıkar"
                                >
                                    <i className="fas fa-arrow-down"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Candidate List (All Users) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <i className="fas fa-users text-blue-500"></i> Yönetici Ekle
                            </h3>
                        </div>
                        {/* Search Input for Candidates */}
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-xs"></i>
                            <input
                                type="text"
                                placeholder="Kullanıcı ara (İsim, E-posta)..."
                                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                onChange={(e) => {
                                    // Just update search term state, logic handled in render
                                    const term = e.target.value.toLowerCase();
                                    const items = document.querySelectorAll('.candidate-item');
                                    items.forEach(item => {
                                        const text = item.innerText.toLowerCase();
                                        item.style.display = text.includes(term) ? 'flex' : 'none';
                                    });
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 bg-slate-50">
                        {candidates.slice(0, 50).map(user => (
                            <div key={user.id} className="candidate-item p-3 flex justify-between items-center bg-white hover:bg-blue-50 transition rounded-lg border border-gray-100 mb-2 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-inner ${user.account_type === 'employee' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {user.title.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">{user.title}</div>
                                        <span className={`text-[10px] uppercase px-1 rounded ${user.account_type === 'employee' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {user.account_type === 'employee' ? 'Personel' : user.account_type === 'supplier' ? 'Tedarikçi' : 'Firma'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRoleChange(user, 'admin')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                                >
                                    Seç
                                </button>
                            </div>
                        ))}
                        {candidates.length > 50 && (
                            <div className="p-4 text-center text-xs text-gray-400">
                                İlk 50 kayıt gösteriliyor. Daha fazlası için arama yapın.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
