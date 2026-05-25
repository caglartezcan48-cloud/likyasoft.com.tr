// Navbar Component
// Path: views/frontend/anasayfa/Navbar.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Navbar = ({ setView, toggleLoginModal, openModal, t }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo Section */}
                    <div className="flex items-center cursor-pointer gap-2" onClick={() => setView('home')}>
                        <div className="bg-white rounded-full border border-gray-100 flex items-center justify-center w-20 h-20 md:w-32 md:h-32 hover:scale-105 transition-transform duration-300 relative z-10 overflow-hidden shadow-sm mt-4 md:mt-6">
                            <img src="/views/frontend/gorsel/logo.png" alt="Likya Pay" className="h-full w-full object-cover object-center" style={{ transform: 'scale(1.6)' }} />
                        </div>
                        <span className="font-bold text-xl md:text-2xl tracking-tight text-brand-900 drop-shadow-sm hidden sm:block">likyapay</span>
                    </div>

                    {/* Desktop Menu (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="#vizyon"
                            className="text-gray-600 hover:text-brand-600 font-medium transition flex items-center"
                        >
                            <i className="fas fa-question-circle mr-2"></i> LİKYA PAY Nedir?
                        </a>
                        <button
                            onClick={() => openModal('nasil_calisir')}
                            className="text-gray-600 hover:text-brand-600 font-medium transition flex items-center"
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

                    {/* Mobile Menu Button (Hamburger) */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-brand-600 focus:outline-none p-2"
                        >
                            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl animate-fade-in">
                    <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col items-center">
                        <a
                            href="#vizyon"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-700 hover:text-brand-600 font-medium text-lg w-full text-center py-2 border-b border-gray-100"
                        >
                            LİKYA PAY Nedir?
                        </a>
                        <button
                            onClick={() => {
                                openModal('nasil_calisir');
                                setIsMobileMenuOpen(false);
                            }}
                            className="text-gray-700 hover:text-brand-600 font-medium text-lg w-full text-center py-2 border-b border-gray-100"
                        >
                            Sistem Nasıl Çalışır?
                        </button>
                        <button
                            onClick={() => {
                                toggleLoginModal();
                                setIsMobileMenuOpen(false);
                            }}
                            className="bg-brand-600 text-white px-8 py-3 rounded-full font-medium text-lg shadow-md w-full max-w-xs mt-2"
                        >
                            🚀 {t.login}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};
