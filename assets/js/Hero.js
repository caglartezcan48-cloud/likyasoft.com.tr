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

    // Visitor counter count-up animation
    const targetCount = window.VISITOR_COUNT || 5429;
    const [count, setCount] = React.useState(Math.max(0, targetCount - 70));

    React.useEffect(() => {
        let start = Math.max(0, targetCount - 70);
        const duration = 2000; // 2 seconds
        const stepTime = Math.abs(Math.floor(duration / 70));
        
        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= targetCount) {
                clearInterval(timer);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [targetCount]);

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
        <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden">
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

                    {/* Hero Right Content: Visitor Counter Panel */}
                    <div className="lg:col-span-5 flex justify-center w-full">
                        <div className="relative w-full max-w-[380px] p-0.5 bg-gradient-to-br from-white/10 via-white/5 to-white/0 rounded-3xl shadow-2xl shadow-black/80">
                            
                            {/* Inner Container */}
                            <div className="bg-slate-950/80 backdrop-blur-xl p-8 rounded-[22px] border border-white/5 relative overflow-hidden flex flex-col items-center">
                                {/* Ambient Light behind Counter */}
                                <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyber-blue/20 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-violet-600/20 rounded-full blur-2xl"></div>

                                {/* Artificial Intelligence Core Pulse Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center mb-6 pulse-ring-element relative">
                                    <i className="fa-solid fa-microchip text-2xl text-cyber-blue"></i>
                                </div>

                                <span className="text-[10px] tracking-widest font-black text-cyber-blue mb-1 uppercase">
                                    {t.counter_prefix}
                                </span>

                                {/* Counter Display Panel */}
                                <div className="flex gap-1.5 py-4 px-6 bg-slate-900/80 border border-white/5 rounded-2xl mb-4 font-mono shadow-inner">
                                    {String(count).padStart(5, '0').split('').map((char, index) => (
                                        <div 
                                            key={index}
                                            className="w-8 h-12 rounded-lg bg-gradient-to-b from-slate-950 to-slate-900 border border-white/5 flex items-center justify-center text-2xl font-black text-white shadow shadow-black/50"
                                        >
                                            {char}
                                        </div>
                                    ))}
                                </div>

                                <h4 className="font-bold text-white text-base mb-1.5 text-center">
                                    {t.counter_title}
                                </h4>
                                
                                <p className="text-xs text-slate-400 text-center leading-relaxed max-w-[240px]">
                                    {t.counter_desc}
                                </p>

                                {/* Verification Tag */}
                                <div className="mt-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                    <i className="fa-solid fa-circle-check text-emerald-400"></i> SIRIUS AI VERIFIED
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
