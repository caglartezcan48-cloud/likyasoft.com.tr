// HeroSection Component
// Path: views/frontend/anasayfa/HeroSection.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.HeroSection = ({ openModal, toggleRegisterModal, t }) => {
    const CycleAnimation = window.Anasayfa.CycleAnimation;

    // Generate Sirius Stars
    const stars = React.useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            size: Math.random() * 2 + 1 + 'px',
            duration: Math.random() * 3 + 2 + 's',
            delay: Math.random() * 5 + 's'
        }));
    }, []);

    return (
        <header className="hero-pattern pt-8 pb-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-900/95 via-brand-800/90 to-brand-900/95"></div>

            {stars.map(star => (
                <div key={star.id} className="sirius-star" style={{
                    left: star.left, top: star.top, width: star.size, height: star.size,
                    '--duration': star.duration, '--delay': star.delay
                }}></div>
            ))}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:items-start">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center space-x-2 py-1 px-3 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold mb-6 backdrop-blur">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                            </span>
                            <span>{t.badge}</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
                            {t.title_prefix} <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500 drop-shadow-md">{t.title_highlight}</span>
                            <br className="hidden lg:block" /> {t.title_suffix}
                        </h1>
                        <p className="text-lg lg:text-xl text-brand-100/80 mb-8 font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            {t.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                            <button onClick={toggleRegisterModal} className="group relative px-8 py-4 bg-white text-brand-900 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all">
                                <span className="flex items-center gap-3">{t.cta_join} <i className="fas fa-arrow-right"></i></span>
                                <span className="absolute bottom-1 left-0 right-0 text-[10px] text-brand-900/60 font-medium uppercase text-center">{t.cta_join_sub}</span>
                            </button>
                            <a href="#video-tanitim" className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition transform flex items-center">
                                <i className="fas fa-play mr-2"></i> Tanıtım Filmi
                            </a>
                            <button onClick={() => openModal('nasil_calisir')} className="px-8 py-4 bg-brand-800/50 hover:bg-brand-700/50 text-white rounded-xl font-medium border border-white/10 backdrop-blur transition-all flex items-center justify-center gap-2">
                                <i className="fas fa-info-circle text-brand-300"></i> {t.btn_how}
                            </button>
                        </div>
                    </div>
                    <div className="relative pt-10 lg:pt-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[100px] animate-pulse"></div>
                        <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
                            {CycleAnimation && <CycleAnimation t={t.cycle_anim} />}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
