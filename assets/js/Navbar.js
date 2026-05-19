// Navbar.js
// Path: assets/js/Navbar.js

window.Agency = window.Agency || {};

window.Agency.Navbar = ({ activeSection, lang, setLang, t }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'services', label: t.services },
        { id: 'products', label: t.products },
        { id: 'portfolio', label: t.portfolio },
        { id: 'about', label: t.about },
        { id: 'contact', label: t.contact }
    ];

    const scrollToSection = (id) => {
        setMobileOpen(false);
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? 'glass-panel py-3 shadow-lg border-b border-white/5' : 'bg-transparent py-5'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="bg-gradient-to-tr from-violet-600 to-cyber-blue p-0.5 rounded-2xl shadow-lg shadow-violet-500/20">
                            <div className="bg-slate-950 p-3 rounded-[14px]">
                                <img src="logo.png" alt="Likya Soft" className="h-[72px] w-auto object-contain" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                                LİKYA <span className="text-gradient-purple font-black">SOFT</span>
                            </span>
                            <span className="text-[9px] tracking-widest text-cyber-blue font-bold uppercase -mt-1">DİJİTAL MİMARİ</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`text-sm font-medium transition-colors hover:text-white ${
                                    activeSection === item.id 
                                        ? 'text-white border-b-2 border-violet-500 pb-1 -mb-[3px]' 
                                        : 'text-slate-400'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                        
                        {/* Lang Switcher */}
                        <button 
                            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
                            className="flex items-center gap-1 text-xs font-bold text-cyber-blue hover:text-white transition px-2.5 py-1 rounded bg-cyber-blue/10 border border-cyber-blue/20"
                        >
                            <i className="fa-solid fa-globe text-[10px]"></i> {t.lang}
                        </button>

                        <button 
                            onClick={() => scrollToSection('contact')}
                            className="shimmer-btn bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <i className="fa-solid fa-calculator text-xs"></i> {t.quote}
                        </button>
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center gap-3">
                        <button 
                            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
                            className="text-xs font-bold text-cyber-blue px-2.5 py-1 rounded bg-cyber-blue/10 border border-cyber-blue/20"
                        >
                            {t.lang}
                        </button>
                        <button 
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="text-slate-400 hover:text-white p-2 rounded-xl border border-white/5 bg-slate-900/40"
                        >
                            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileOpen && (
                <div className="md:hidden glass-panel border-t border-white/5 animate-fade-in absolute top-full left-0 right-0 py-6 px-4 shadow-2xl flex flex-col gap-4">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`text-left text-base font-semibold py-2 px-3 rounded-lg hover:bg-white/5 transition-all ${
                                activeSection === item.id ? 'text-white bg-violet-500/10 border-l-4 border-violet-500' : 'text-slate-400'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                    
                    <button
                        onClick={() => scrollToSection('contact')}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center font-bold py-3 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-calculator text-sm"></i> {t.quote}
                    </button>
                </div>
            )}
        </nav>
    );
};
