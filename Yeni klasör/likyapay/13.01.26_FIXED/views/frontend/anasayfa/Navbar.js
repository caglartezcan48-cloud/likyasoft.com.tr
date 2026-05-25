// Navbar Component
// Path: views/frontend/anasayfa/Navbar.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Navbar = ({ setView, toggleLoginModal, openModal, t }) => (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                <div className="flex items-center cursor-pointer gap-2" onClick={() => setView('home')}>
                    <div className="bg-white p-1 rounded-full border border-gray-100 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 hover:scale-105 transition-transform duration-300 relative z-10 overflow-hidden shadow-sm">
                        <img src="/likyasoft/public/likyapay/views/frontend/gorsel/logo.png" alt="Likya Pay" className="h-full w-full object-contain p-0.5" />
                    </div>
                    <span className="font-bold text-xl md:text-2xl tracking-tight text-brand-900 drop-shadow-sm hidden sm:block">likyapay</span>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    {/* Language toggle removed for now */}
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href="#vizyon"
                        className="hidden md:flex text-gray-600 hover:text-brand-600 font-medium transition items-center"
                    >
                        <i className="fas fa-question-circle mr-2"></i> LİKYA PAY Nedir?
                    </a>
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
