// Topbar Component
// Path: views/frontend/admin/layout/Topbar.js
window.Admin = window.Admin || {};
window.Admin.Layout = window.Admin.Layout || {};
window.Admin.Layout.Topbar = ({ isOpen, setIsOpen, onLogout }) => {
    return (
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-600"><i className="fas fa-bars text-xl"></i></button>
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500">LikyaPay Yönetim Paneli</span>
            </div>
        </header>
    );
};

// DashboardHome Page
// Path: views/frontend/admin/pages/DashboardHome.js
window.Admin.Pages = window.Admin.Pages || {};
window.Admin.Pages.DashboardHome = ({ users, pendings, transactions, systemTransactions }) => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-slate-900">Panel Özeti</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Toplam Üye</p>
                    <p className="text-4xl font-black text-brand-600">{users ? users.length : 0}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Onay Bekleyen</p>
                    <p className="text-4xl font-black text-orange-500">{pendings ? pendings.length : 0}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">İşlem Hacmi</p>
                    <p className="text-4xl font-black text-emerald-600">₺2.5M</p>
                </div>
            </div>
        </div>
    );
};
