// Products.js
// Path: assets/js/Products.js

window.Agency = window.Agency || {};

window.Agency.Products = ({ t }) => {
    return (
        <section id="products" className="relative pt-10 pb-16 overflow-hidden">
            {/* Background glowing spots */}
            <div className="glow-spot w-[500px] h-[500px] bg-violet-600/10 top-1/4 -right-20"></div>
            <div className="glow-spot w-[500px] h-[500px] bg-emerald-600/10 bottom-1/4 -left-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <div className="text-center mb-10 flex flex-col items-center">
                    <span className="text-xs tracking-widest font-black text-violet-400 uppercase mb-2">
                        {t.subtitle}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                        {t.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full mb-6"></div>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-light">
                        {t.description}
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
                    
                    {/* PRODUCT 1: MAZELLO ERP */}
                    <div className="p-0.5 rounded-[32px] bg-gradient-to-br from-emerald-500/20 via-white/5 to-white/0 shadow-2xl relative group flex">
                        <div className="bg-slate-950/80 backdrop-blur-xl rounded-[30px] p-8 border border-white/5 flex flex-col justify-between w-full hover:border-emerald-500/20 transition-all duration-300">
                            
                            <div>
                                {/* Product Logo & Badge */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400 text-xl font-black shadow-inner">
                                            <i className="fa-solid fa-layer-group"></i>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-2xl text-white tracking-tight">
                                                {t.items.mazello.title}
                                            </h3>
                                            <span className="text-[10px] tracking-wider font-extrabold text-emerald-400 uppercase">
                                                {t.items.mazello.badge}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">
                                        Active SaaS
                                    </div>
                                </div>

                                {/* Product Description */}
                                <p className="text-slate-300 text-sm leading-relaxed mb-8 font-light">
                                    {t.items.mazello.desc}
                                </p>

                                {/* Features List */}
                                <div className="space-y-3 mb-10">
                                    {t.items.mazello.features.map((feat, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-3 text-sm text-slate-400">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400">
                                                <i className="fa-solid fa-check"></i>
                                            </div>
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Link Button */}
                            <a 
                                href="mazelloerp/"
                                className="w-full text-center py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-extrabold rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {t.explore} <i className="fa-solid fa-square-arrow-up-right"></i>
                            </a>

                        </div>
                    </div>

                    {/* PRODUCT 2: LIKYAPAY */}
                    <div className="p-0.5 rounded-[32px] bg-gradient-to-br from-violet-500/20 via-white/5 to-white/0 shadow-2xl relative group flex">
                        <div className="bg-slate-950/80 backdrop-blur-xl rounded-[30px] p-8 border border-white/5 flex flex-col justify-between w-full hover:border-violet-500/20 transition-all duration-300">
                            
                            <div>
                                {/* Product Logo & Badge */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/25 rounded-2xl flex items-center justify-center text-violet-400 text-xl font-black shadow-inner">
                                            <i className="fa-solid fa-brain"></i>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-2xl text-white tracking-tight">
                                                {t.items.likyapay.title}
                                            </h3>
                                            <span className="text-[10px] tracking-wider font-extrabold text-violet-400 uppercase">
                                                {t.items.likyapay.badge}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] font-extrabold text-violet-400 uppercase tracking-widest">
                                        AI Powered
                                    </div>
                                </div>

                                {/* Product Description */}
                                <p className="text-slate-300 text-sm leading-relaxed mb-8 font-light">
                                    {t.items.likyapay.desc}
                                </p>

                                {/* Features List */}
                                <div className="space-y-3 mb-10">
                                    {t.items.likyapay.features.map((feat, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-3 text-sm text-slate-400">
                                            <div className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[10px] text-violet-400">
                                                <i className="fa-solid fa-check"></i>
                                            </div>
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Link Button */}
                            <a 
                                href="likyapay/"
                                className="w-full text-center py-4 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-extrabold rounded-2xl transition-all shadow-lg hover:shadow-violet-500/10 hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {t.explore} <i className="fa-solid fa-square-arrow-up-right"></i>
                            </a>

                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};
