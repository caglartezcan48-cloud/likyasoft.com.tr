// Sidebar Component
// Path: views/frontend/kullanicilar/Sidebar.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Sidebar = ({ activePage, setPage, isMobileOpen, toggleMobile, user, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Genel Bakış', icon: 'fas fa-home' },
        { id: 'my_companies', label: 'Çalıştığım Şirketler', icon: 'fas fa-briefcase' }, // NEW
        { id: 'invoices', label: 'Borç / Alacak Yönetimi', icon: 'fas fa-file-invoice-dollar' },
        { id: 'archive', label: 'Evrak Arşivi', icon: 'fas fa-folder-open' },
        { id: 'messages', label: 'Destek / Mesaj', icon: 'fas fa-envelope' },
        { id: 'sirius', label: 'Sirius Döngülerim', icon: 'fas fa-project-diagram' },

        { id: 'profile', label: 'Profil & Ayarlar', icon: 'fas fa-user-cog' },
    ];

    return (
        <React.Fragment>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={toggleMobile}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 z-50 overflow-y-auto
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden p-0">
                            <img src="../views/frontend/gorsel/logo.png" alt="Logo" className="w-full h-full object-cover object-center scale-110" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-wide">Likya Pay</span>
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Kurumsal</span>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setPage(item.id);
                                if (window.innerWidth < 768) toggleMobile();
                            }}
                            className={`
                                w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                                ${activePage === item.id
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }
                            `}
                        >
                            <i className={`${item.icon} w-6 text-center text-lg ${activePage === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}></i>
                            <span className="font-medium">{item.label}</span>
                            {activePage === item.id && (
                                <i className="fas fa-chevron-right ml-auto text-xs opacity-70"></i>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-200 truncate">{user?.name || 'Misafir'}</h4>
                            <p className="text-xs text-slate-500 truncate">{user?.role === 'user' ? 'Kurumsal Üye' : 'Ziyaretçi'}</p>
                        </div>
                        <button onClick={onLogout} className="text-slate-500 hover:text-red-400 transition" title="Çıkış Yap">
                            <i className="fas fa-power-off"></i>
                        </button>
                    </div>
                </div>
            </aside>
        </React.Fragment>
    );
};
