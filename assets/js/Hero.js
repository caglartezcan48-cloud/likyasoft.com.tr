// Hero.js
// Path: assets/js/Hero.js

window.Agency = window.Agency || {};

window.Agency.Hero = ({ t }) => {
    // Generate star field
    const stars = React.useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            size: Math.random() * 2 + 1 + 'px',
            duration: Math.random() * 4 + 3 + 's',
            delay: Math.random() * 5 + 's'
        }));
    }, []);



    const scrollToContact = () => {
        const element = document.getElementById('contact');
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

    const scrollToProducts = () => {
        const element = document.getElementById('products');
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
        <section className="relative pt-[260px] pb-24 md:pt-[280px] md:pb-36 overflow-hidden">
            {/* Glowing HSL Neon Blobs */}
            <div className="glow-spot w-[350px] h-[350px] bg-violet-600/15 top-1/4 -left-36"></div>
            <div className="glow-spot w-[450px] h-[450px] bg-cyber-blue/10 top-1/3 -right-36"></div>
            
            {/* Cyber background Grid */}
            <div className="absolute inset-0 cyber-grid z-0"></div>

            {/* Ambient Star Field */}
            {stars.map(star => (
                <div 
                    key={star.id} 
                    className="absolute bg-white rounded-full opacity-35" 
                    style={{
                        left: star.left,
                        top: star.top,
                        width: star.size,
                        height: star.size,
                        animation: `float ${star.duration} ease-in-out infinite`,
                        animationDelay: star.delay
                    }}
                ></div>
            ))}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Hero Left Content */}
                    <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
                        {/* Interactive Status Badge */}
                        <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-8 backdrop-blur">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            <span>{t.badge}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.12]">
                            {t.title_p1} <br />
                            <span className="text-gradient-purple drop-shadow-lg neon-text-violet">{t.title_glow}</span>
                            <br className="hidden sm:block" /> {t.title_p2}
                        </h1>

                        {/* Description */}
                        <p className="text-slate-300 text-base sm:text-lg lg:text-xl font-light mb-10 leading-relaxed max-w-2xl">
                            {t.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button 
                                onClick={scrollToContact}
                                className="shimmer-btn px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-violet-500/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
                            >
                                {t.cta_start} <i className="fa-solid fa-arrow-right text-sm"></i>
                            </button>
                            <button 
                                onClick={scrollToProducts}
                                className="px-8 py-4 bg-slate-900/60 hover:bg-slate-800/60 text-slate-200 border border-white/10 backdrop-blur rounded-xl font-semibold text-base sm:text-lg hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-cubes text-violet-400"></i> {t.cta_products}
                            </button>
                        </div>
                    </div>

                    {/* Hero Right Content: Image Collage */}
                    <div className="lg:col-span-5 flex justify-center items-center w-full relative">
                        {/* Ambient glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl -z-10"></div>
                        
                        <div className="w-full max-w-[460px] flex flex-col gap-4">
                            {/* Top Large Image */}
                            <div className="w-full h-[260px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80 relative group">
                                <img src="assets/images/hero_large.jpg" alt="Software Development" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyber-blue/20 backdrop-blur border border-cyber-blue/30 flex items-center justify-center">
                                        <i className="fa-solid fa-laptop-code text-cyber-blue text-sm"></i>
                                    </div>
                                    <span className="text-white font-extrabold text-sm sm:text-base tracking-wide">Özel Yazılım Çözümleri</span>
                                </div>
                            </div>

                            {/* Bottom 2 Small Images */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-[160px] rounded-2xl overflow-hidden border border-white/10 shadow-xl relative group">
                                    <img src="assets/images/hero_small_1.jpg" alt="Web Development" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-violet-500/20 backdrop-blur border border-violet-500/30 flex items-center justify-center">
                                            <i className="fa-solid fa-code text-violet-400 text-xs"></i>
                                        </div>
                                        <span className="text-slate-200 font-bold text-xs">Web Teknolojileri</span>
                                    </div>
                                </div>
                                <div className="h-[160px] rounded-2xl overflow-hidden border border-white/10 shadow-xl relative group">
                                    <img src="assets/images/hero_small_2.jpg" alt="UI/UX Design" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 backdrop-blur border border-emerald-500/30 flex items-center justify-center">
                                            <i className="fa-solid fa-pen-nib text-emerald-400 text-xs"></i>
                                        </div>
                                        <span className="text-slate-200 font-bold text-xs">UI / UX Tasarım</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
