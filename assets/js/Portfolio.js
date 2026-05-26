// Portfolio.js
// Path: assets/js/Portfolio.js

window.Agency = window.Agency || {};

window.Agency.Portfolio = ({ t }) => {
    const [activeFilter, setActiveFilter] = React.useState('all');

    const filteredItems = React.useMemo(() => {
        if (activeFilter === 'all') return t.items;
        return t.items.filter(item => item.category === activeFilter);
    }, [activeFilter, t.items]);

    const filters = [
        { id: 'all', label: t.all },
        { id: 'web', label: t.categories.web },
        { id: 'erp', label: t.categories.erp },
        { id: 'ai', label: t.categories.ai },
        { id: 'custom', label: t.categories.custom }
    ];

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'web': return 'fa-compass-drafting text-cyber-blue bg-cyber-blue/10 border-cyber-blue/20';
            case 'erp': return 'fa-layer-group text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'ai': return 'fa-brain text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'custom': return 'fa-code text-violet-400 bg-violet-500/10 border-violet-500/20';
            default: return 'fa-cubes text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <section id="portfolio" className="relative py-24 bg-slate-950/40 border-y border-white/5 overflow-hidden">
            {/* Background Glow */}
            <div className="glow-spot w-[400px] h-[400px] bg-violet-600/5 top-1/3 -left-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <div className="text-center mb-16 flex flex-col items-center">
                    <span className="text-xs tracking-widest font-black text-cyber-blue uppercase mb-2">
                        {t.subtitle}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                        {t.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-violet-600 to-cyber-blue rounded-full mb-6"></div>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-light">
                        {t.description}
                    </p>
                </div>

                {/* Filter Controls (Pills) */}
                <div className="flex flex-wrap justify-center gap-3 mb-16">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-5 py-2.5 rounded-full border text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 ${
                                activeFilter === filter.id 
                                    ? 'btn-neon-active text-white' 
                                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Grid Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item, index) => {
                        const iconClasses = getCategoryIcon(item.category);
                        return (
                            <div 
                                key={index}
                                className="glass-card rounded-[24px] p-6 border border-white/5 flex flex-col justify-between group animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div>
                                    {/* Card Icon Header */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg ${iconClasses}`}>
                                            <i className="fa-solid fa-folder-open text-xs"></i>
                                        </div>
                                        <span className="text-[10px] tracking-wider font-bold text-slate-400 bg-white/5 border border-white/5 py-1 px-3 rounded-full uppercase">
                                            {item.badge}
                                        </span>
                                    </div>

                                    {/* Project Name */}
                                    <h3 className="font-extrabold text-lg text-white mb-2 group-hover:text-violet-400 transition-colors">
                                        {item.title}
                                    </h3>

                                    {/* Project Details */}
                                    <p className="text-slate-400 text-xs leading-relaxed mb-6 font-light">
                                        {item.desc}
                                    </p>
                                </div>

                                {/* Link action placeholder */}
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-violet-400 font-bold tracking-wider group-hover:text-white transition-colors cursor-pointer">
                                    <span>EXPLORE METRICS</span>
                                    <i className="fa-solid fa-chevron-right group-hover:translate-x-1.5 transition-transform duration-300"></i>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};
