// About.js
// Path: assets/js/About.js

window.Agency = window.Agency || {};

window.Agency.About = ({ t }) => {
    const getValueIconColor = (color) => {
        switch (color) {
            case 'cyan': return 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/20';
            case 'purple': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
            case 'emerald': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-white bg-white/10 border-white/20';
        }
    };

    return (
        <section id="about" className="relative py-24 overflow-hidden">
            {/* Glowing HSL Neon Spots */}
            <div className="glow-spot w-[450px] h-[450px] bg-violet-600/5 bottom-12 -right-20"></div>
            <div className="glow-spot w-[350px] h-[350px] bg-cyber-blue/5 top-12 -left-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <div className="text-center mb-20 flex flex-col items-center">
                    <span className="text-xs tracking-widest font-black text-violet-400 uppercase mb-2">
                        {t.subtitle}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                        {t.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-violet-600 to-cyber-blue rounded-full mb-6"></div>
                </div>

                {/* Grid Content: Narration + Values */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
                    
                    {/* Left: Brand Narration */}
                    <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left">
                        <div className="inline-flex self-center lg:self-start items-center gap-2 py-1 px-3 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-extrabold uppercase mb-6">
                            Plus Soft Architectures
                        </div>
                        <p className="text-slate-200 text-base sm:text-lg font-light leading-relaxed mb-6">
                            {t.desc_p1}
                        </p>
                        <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
                            {t.desc_p2}
                        </p>
                    </div>

                    {/* Right: Core Pillars */}
                    <div className="lg:col-span-6 space-y-6">
                        <h3 className="font-extrabold text-lg text-white mb-6 text-center lg:text-left">
                            {t.values_title}
                        </h3>
                        {t.values.map((val, idx) => {
                            const iconStyle = getValueIconColor(val.color);
                            return (
                                <div 
                                    key={idx}
                                    className="p-5 rounded-2xl bg-slate-900/30 border border-white/5 flex gap-4 items-start hover:border-white/10 transition-all duration-300 shadow-lg shadow-black/30"
                                >
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-lg shadow ${iconStyle}`}>
                                        <i className={`fa-solid ${val.icon}`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1.5 text-base">{val.title}</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed font-light">{val.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Bottom: Vision & Mission split cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    
                    {/* VISION */}
                    <div className="p-0.5 rounded-[24px] bg-gradient-to-br from-violet-500/15 via-white/5 to-white/0 shadow-xl flex">
                        <div className="bg-slate-950/70 backdrop-blur rounded-[22px] p-8 border border-white/5 w-full flex flex-col justify-center">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 text-lg mb-4 shadow">
                                <i className="fa-solid fa-eye"></i>
                            </div>
                            <h4 className="font-extrabold text-xl text-white mb-3">{t.vision}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">{t.vision_text}</p>
                        </div>
                    </div>

                    {/* MISSION */}
                    <div className="p-0.5 rounded-[24px] bg-gradient-to-br from-cyber-blue/15 via-white/5 to-white/0 shadow-xl flex">
                        <div className="bg-slate-950/70 backdrop-blur rounded-[22px] p-8 border border-white/5 w-full flex flex-col justify-center">
                            <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/25 flex items-center justify-center text-cyber-blue text-lg mb-4 shadow">
                                <i className="fa-solid fa-bullseye"></i>
                            </div>
                            <h4 className="font-extrabold text-xl text-white mb-3">{t.mission}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">{t.mission_text}</p>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};
