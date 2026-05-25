// Topbar Component
// Path: views/frontend/admin/layout/Topbar.js

window.Admin = window.Admin || {};
window.Admin.Layout = window.Admin.Layout || {};

window.Admin.Layout.Topbar = ({ isOpen, setIsOpen, onLogout }) => {
    return (

        <header className="h-12 bg-white border-b border-gray-200 w-full flex-shrink-0 z-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
            {/* Left: Hamburger & Breadcrumb */}
            <div className="flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden mr-4 text-gray-500 hover:text-brand-600 focus:outline-none"
                >
                    <i className="fas fa-bars text-lg"></i>
                </button>

                <div className="flex items-center text-gray-400 text-xs">
                    <span className="mr-2 hidden md:inline">Yönetim Paneli</span>
                    <i className="fas fa-chevron-right text-[10px] mx-2 hidden md:inline"></i>
                    <span className="text-gray-800 font-medium">Genel Bakış</span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-5">
                <button className="relative text-gray-400 hover:text-brand-600 transition">
                    <i className="fas fa-bell text-lg"></i>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-2 pl-3 md:pl-5 border-l border-gray-100">
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-gray-800">Admin User</div>
                        <div className="text-[10px] text-gray-500">Süper Yönetici</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-white shadow-sm">
                        AD
                    </div>
                    <button
                        onClick={onLogout}
                        className="ml-2 w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                        title="Güvenli Çıkış"
                    >
                        <i className="fas fa-power-off text-xs"></i>
                    </button>
                </div>
            </div>
        </header>
    );
};
