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
                setUser({
                    name: u.name,
                    role: u.role
                });
            }
        } catch (e) { }
    }, []);

    // Fetch Counts
    React.useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await fetch('../data/api/admin_dashboard.php');
                const data = await res.json();
                if (data.success) {
                    setCounts(data.counts);
                }
            } catch (e) { console.error("Count fetch error", e); }
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 30000); // 30 sec polling
        return () => clearInterval(interval);
    }, []);

    // Filter for Accountant
    const isAccountant = user.role === 'accountant' || user.email === 'muhasebe@muhasebe';

    const companyMenu = [
        { id: 'dashboard', icon: 'fa-home', label: 'Panel Özeti' },
        {
            id: 'approvals',
            icon: 'fa-check-circle',
            label: 'Onay Bekleyenler',
            badge: counts.pending_users > 0 ? counts.pending_users : null
        },
        { id: 'users', icon: 'fa-users', label: 'Üye İşlemleri' },
        { id: 'accounting', icon: 'fa-calculator', label: 'Muhasebe' },
        {
            id: 'pending_invoices',
            icon: 'fa-file-invoice',
            label: 'Onay Bekleyenler',
            badge: counts.pending_invoices > 0 ? counts.pending_invoices : null // 'FATURA' 
        },
        { id: 'sirius', icon: 'fa-infinity', label: 'Sirius Döngüleri', badge: 'YENİ' },
        { id: 'sirius_archive', icon: 'fa-archive', label: 'Sirius Arşivi' },
        { id: 'messages', icon: 'fa-envelope', label: 'Mesajlar / Destek' },
        { id: 'reports', icon: 'fa-chart-pie', label: 'Finansal Raporlar' }
    ].filter(item => {
        if (isAccountant) {
            return ['dashboard', 'accounting', 'pending_invoices', 'sirius', 'sirius_archive'].includes(item.id);
        }
        return true;
    });

    const settingsMenu = [
        { id: 'site_settings', icon: 'fa-sliders-h', label: 'Genel Ayarlar' },
        { id: 'content_manager', icon: 'fa-edit', label: 'İçerik Yönetimi' },
        { id: 'admin_users', icon: 'fa-user-shield', label: 'Yöneticiler' },
        { id: 'system_logs', icon: 'fa-terminal', label: 'Sistem Logları' }
    ].filter(item => !isAccountant);

    const MenuItem = ({ item }) => (
        <button
            onClick={(e) => { e.preventDefault(); console.log('Navigating to:', item.id); setView(item.id); }}
            type="button"
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${view === item.id
                ? 'bg-brand-800 text-white shadow-lg shadow-brand-900/50'
                : 'text-brand-300 hover:bg-white/5 hover:text-white'
                }`}
        >
            <div className={`w-8 flex justify-center mr-2 ${view === item.id ? 'text-emerald-400' : 'text-brand-400 group-hover:text-emerald-300'}`}>
                <i className={`fas ${item.icon} text-lg transition-transform group-hover:scale-110`}></i>
            </div>
            <span className="font-medium text-sm tracking-wide">{item.label}</span>
            {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    {item.badge}
                </span>
            )}
        </button>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`w-64 bg-brand-900 h-screen fixed left-0 top-0 text-white shadow-xl flex flex-col z-30 border-r border-brand-800 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-brand-800/50 bg-brand-900/50 backdrop-blur-sm">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-lg overflow-hidden">
                        <img src="../views/frontend/gorsel/logo.png" alt="Logo" className="w-full h-full object-cover object-center scale-110" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block leading-none">Likya Yönetim</span>
                        <span className="text-[10px] text-brand-400 font-medium tracking-widest uppercase">Admin v1.0</span>
                    </div>
                    {/* Close Button (Mobile Only) */}
                    <button onClick={() => setIsOpen(false)} className="md:hidden ml-auto text-white/50 hover:text-white">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Menu Container */}
                <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar">

                    {/* Group 1: Company Management */}
                    <div>
                        <h3 className="px-4 text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-3 flex items-center">
                            <i className="fas fa-building mr-2"></i>
                            Şirket Yönetimi
                        </h3>
                        {companyMenu.map(item => <MenuItem key={item.id} item={item} />)}
                    </div>

                    <div className="border-t border-brand-800/50 mx-2"></div>

                    {/* Group 2: Site Settings */}
                    <div>
                        <h3 className="px-4 text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-3 flex items-center">
                            <i className="fas fa-cogs mr-2"></i>
                            Site Ayarları
                        </h3>
                        {settingsMenu.map(item => <MenuItem key={item.id} item={item} />)}
                    </div>

                </nav>

                {/* Footer with User Info */}
                <div className="absolute bottom-0 w-full p-4 border-t border-white/10 bg-brand-900/50 backdrop-blur">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-800 border border-brand-700">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                            {user.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-100 truncate">{user.name || 'Admin User'}</h4>
                            <p className="text-[10px] text-brand-300 truncate font-medium uppercase">
                                {user.role === 'admin' ? 'Yönetici' : (user.role === 'accountant' ? 'Muhasebe' : 'Personel')}
                            </p>
                        </div>
                        <button onClick={onLogout} className="text-brand-400 hover:text-red-300 transition" title="Çıkış Yap">
                            <i className="fas fa-power-off"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
