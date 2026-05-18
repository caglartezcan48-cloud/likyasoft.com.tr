// Services.js
// Path: assets/js/Services.js

window.Agency = window.Agency || {};

window.Agency.Services = ({ t }) => {
    const getColorClasses = (color) => {
        switch (color) {
            case 'violet':
                return {
                    border: 'hover:border-violet-500/30',
                    glow: 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(139,92,246,0.3)]',
                    icon: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
                    badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20'
                };
            case 'cyber':
                return {
                    border: 'hover:border-cyber-blue/30',
                    glow: 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.3)]',
                    icon: 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/20',
                    badge: 'bg-cyber-blue/10 text-cyber-blue-300 border-cyber-blue/20'
                };
            case 'emerald':
                return {
                    border: 'hover:border-emerald-500/30',
                    glow: 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.3)]',
                    icon: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                };
            case 'rose':
                return {
                    border: 'hover:border-rose-500/30',
                    glow: 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(244,63,94,0.3)]',
                    icon: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                };
            case 'yellow':
                return {
                    border: 'hover:border-yellow-500/30',
                    glow: 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(234,179,8,0.3)]',
                    icon: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                    badge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                };
            default:
                return {
                    border: 'hover:border-white/20',
                    glow: 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]',
                    icon: 'text-white bg-white/10 border-white/20',
                    badge: 'bg-white/10 text-white border-white/20'
                };
        }
    };

    const getIcon = (color) => {
        switch (color) {
            case 'violet': return 'fa-code';
            case 'cyber': return 'fa-compass-drafting';
            case 'emerald': return 'fa-layer-group';
            case 'rose': return 'fa-brain';
            case 'yellow': return 'fa-chart-simple';
            default: return 'fa-cubes';
        }
    };

    return (
        <section id="services" className="relative py-24 bg-slate-950/40 border-y border-white/5 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="glow-spot w-[400px] h-[400px] bg-cyber-blue/5 bottom-12 -left-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <div className="text-center mb-20 flex flex-col items-center">
                    <span className="text-xs tracking-widest font-black text-cyber-blue uppercase mb-2">
                        {t.subtitle}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                        {t.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-violet-600 to-cyber-blue rounded-full mb-6"></div>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                        {t.description}
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {t.items.map((service, index) => {
                        const styleClasses = getColorClasses(service.color);
                        return (
                            <div 
                                key={index}
                                className={`glass-card rounded-3xl p-8 border border-white/5 flex flex-col justify-between ${styleClasses.border} ${styleClasses.glow}`}
                            >
                                <div>
                                    {/* Card Header Illustration/Image */}
                                    <div className="w-full h-44 rounded-2xl overflow-hidden mb-6 bg-slate-900 border border-white/5 relative flex items-center justify-center">
                                        {/* Luxury 3D Pre-loaded image */}
                                        <img 
                                            src={service.image} 
                                            alt={service.title} 
                                            className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                                        
                                        {/* Floating Icon Indicator */}
                                        <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg ${styleClasses.icon}`}>
                                            <i className={`fa-solid ${getIcon(service.color)} text-sm`}></i>
                                        </div>
                                    </div>

                                    {/* Service Title */}
                                    <h3 className="font-extrabold text-xl text-white mb-3 tracking-tight">
                                        {service.title}
                                    </h3>

                                    {/* Service Description */}
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6 font-light">
                                        {service.desc}
                                    </p>
                                </div>

                                {/* Feature Badges */}
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                                    {service.features.map((feature, fIndex) => (
                                        <span 
                                            key={fIndex}
                                            className={`text-[10px] font-bold py-1 px-2.5 rounded-md border tracking-wider uppercase ${styleClasses.badge}`}
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};
