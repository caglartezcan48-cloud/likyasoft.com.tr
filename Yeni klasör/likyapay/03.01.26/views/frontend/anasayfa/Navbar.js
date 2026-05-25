// Navbar Component
// Path: views/frontend/anasayfa/Navbar.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Navbar = ({ setView, toggleLoginModal, openModal, t }) => (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                <div className="flex items-center cursor-pointer gap-3" onClick={() => setView('home')}>
                    <div className="bg-white p-1 rounded-full shadow-lg border-2 border-gray-100 flex items-center justify-center w-16 h-16 md:w-24 md:h-24 hover:scale-105 transition-transform duration-300 relative z-10">
                        <img
                            src="/likyasoft/public/likyapay/views/frontend/gorsel/logo.png?v=6"
                            alt="Likya Pay Logo"
                            className="w-full h-full object-contain rounded-full"
                        />
                    </div>
                    <span className="font-bold text-xl md:text-4xl tracking-tight text-brand-900 drop-shadow-sm hidden sm:block">likyapay</span>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    {/* Language toggle removed for now */}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openModal('nasil_calisir')}
                        className="hidden md:flex text-gray-600 hover:text-brand-600 font-medium transition items-center"
                    >
                        <i className="far fa-play-circle mr-2"></i> Sistem Nasıl Çalışır?
                    </button>
                    <button
                        onClick={toggleLoginModal}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full font-medium transition shadow-lg shadow-brand-500/30 flex items-center"
                    >
                        <i className="fas fa-sign-in-alt mr-2"></i> {t.login}
                    </button>
                </div>
            </div>
        </div>
    </nav>
);
