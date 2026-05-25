// Navbar Component
// Path: views/frontend/anasayfa/Navbar.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Navbar = ({ setView, toggleLoginModal, openModal, t }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const logoData = "/public/likyapay/views/frontend/gorsel/logo_optimized.png";


    return (
        <nav className="sticky top-0 z-50 bg-brand-900/40 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24">

                    {/* Logo Section - Orijinal Renkler + Hafif Parlama */}
                    <div className="flex items-center cursor-pointer gap-2" onClick={() => setView('home')}>
                        <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 hover:scale-110 transition-all duration-300 relative">
                            {/* Logonun arkasına çok hafif bir parıltı ekledik ki koyu zeminde kaybolmasın */}
                            <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                            <img 
                                src={logoData} 
                                alt="Likya Pay" 
                                className="relative z-10 h-full w-full object-contain" 
                                style={{ transform: 'scale(1.4)' }}
                                onError={(e) => {
                                    console.log("Logo yüklenemedi, alternatif yol deneniyor...");
                                    e.target.src = "/public/likyapay/views/frontend/gorsel/logo.png";
                                }}
                            />
                        </div>
                        <span className="font-black text-2xl md:text-3xl tracking-tighter text-white drop-shadow-lg hidden sm:block ml-2">likyapay</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#vizyon" className="text-white/70 hover:text-white font-bold transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
                            <i className="fas fa-circle-info text-brand-500 text-[8px]"></i> Nedir?
                        </a>
                        <button onClick={() => openModal('nasil_calisir')} className="text-white/70 hover:text-white font-bold transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
                            <i className="fas fa-play text-brand-500 text-[8px]"></i> Nasıl Çalışır?
                        </button>
                        
                        <button 
                            onClick={toggleLoginModal} 
                            className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-8 py-3 rounded-xl font-black transition-all shadow-xl shadow-blue-900/40 active:scale-95 flex items-center gap-3 border border-white/10"
                        >
                            <i className="fas fa-user-lock"></i> 
                            <span className="tracking-tighter uppercase">{t.login || "Giriş Yap"}</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-brand-400 focus:outline-none p-2">
                            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-24 left-0 w-full bg-brand-900/98 backdrop-blur-2xl border-b border-white/5 shadow-2xl animate-fade-in">
                    <div className="px-4 pt-6 pb-10 space-y-6 flex flex-col items-center text-center">
                        <a href="#vizyon" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-black text-lg w-full py-2 uppercase tracking-widest">Nedir?</a>
                        <button onClick={() => { openModal('nasil_calisir'); setIsMobileMenuOpen(false); }} className="text-white font-black text-lg w-full py-2 uppercase tracking-widest">Nasıl Çalışır?</button>
                        <button onClick={() => { toggleLoginModal(); setIsMobileMenuOpen(false); }} className="bg-[#0284c7] text-white px-12 py-4 rounded-xl font-black text-xl shadow-2xl w-full max-w-xs mt-4 uppercase">Giriş Yap</button>
                    </div>
                </div>
            )}
        </nav>
    );
};
