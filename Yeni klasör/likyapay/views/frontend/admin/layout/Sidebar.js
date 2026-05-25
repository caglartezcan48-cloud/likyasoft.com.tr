// Sidebar Component
// Path: views/frontend/admin/layout/Sidebar.js
window.Admin = window.Admin || {};
window.Admin.Layout = window.Admin.Layout || {};
window.Admin.Layout.Sidebar = ({ view, setView, isOpen, setIsOpen, onLogout }) => {
    const [user, setUser] = React.useState({ name: '', role: '' });
    const [counts, setCounts] = React.useState({ pending_users: 0, pending_invoices: 0 });
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const u = JSON.parse(stored);
                setUser({ name: u.name, role: u.role });
            }
        } catch (e) { }
    }, []);
    React.useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await fetch('../data/api/admin_dashboard.php');
                const data = await res.json();
                if (data.success) { setCounts(data.counts); }
            } catch (e) { }
        };
        fetchCounts();
    }, []);
    const MenuItem = ({ item }) => (
        <button onClick={() => setView(item.id)} className={`w-full flex items-center px-4 py-3 rounded-xl mb-1 ${view === item.id ? 'bg-brand-800 text-white' : 'text-brand-300 hover:text-white'}`}>
            <div className="w-8 mr-2 text-center"><i className={`fas ${item.icon}`}></i></div>
            <span className="text-sm">{item.label}</span>
        </button>
    );
    return (
        <div className={`w-64 bg-brand-900 h-screen fixed left-0 top-0 text-white z-30 border-r border-brand-800 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="h-20 flex items-center px-6 border-b border-brand-800/50">
                <span className="font-bold text-lg">Likya Yönetim</span>
            </div>
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                <MenuItem item={{ id: 'dashboard', icon: 'fa-home', label: 'Panel Özeti' }} />
                <MenuItem item={{ id: 'approvals', icon: 'fa-check-circle', label: 'Onay Bekleyenler' }} />
                <MenuItem item={{ id: 'users', icon: 'fa-users', label: 'Üye İşlemleri' }} />
                <MenuItem item={{ id: 'accounting', icon: 'fa-calculator', label: 'Muhasebe' }} />
                <MenuItem item={{ id: 'sirius', icon: 'fa-infinity', label: 'Sirius Döngüleri' }} />
                <MenuItem item={{ id: 'admin_users', icon: 'fa-user-shield', label: 'Yöneticiler' }} />
            </nav>
            <div className="p-4 border-t border-white/10">
                <button onClick={onLogout} className="w-full bg-red-600/20 text-red-400 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all font-bold">
                    <i className="fas fa-power-off mr-2"></i> Çıkış Yap
                </button>
            </div>
        </div>
    );
};
