// TrustedBy Component (Infinite Scrolling Logos)
// Path: views/frontend/anasayfa/TrustedBy.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.TrustedBy = () => {
    // Mock References
    const references = [
        { icon: 'fas fa-shield-alt', name: 'Global Güvenlik A.Ş.' },
        { icon: 'fas fa-building', name: 'Metro İnşaat Yapı' },
        { icon: 'fas fa-chart-line', name: 'Finansal Çözümler' },
        { icon: 'fas fa-truck-moving', name: 'Ege Lojistik' },
        { icon: 'fas fa-bolt', name: 'Enerji Plus' },
        { icon: 'fas fa-industry', name: 'Anadolu Sanayi' },
        { icon: 'fas fa-ship', name: 'Marine İhracat' },
        { icon: 'fas fa-shopping-cart', name: 'AVM Perakende' },
    ];

    // Duplicate list for infinite scroll effect
    const scrollItems = [...references, ...references, ...references];

    return (
        <section className="py-10 bg-white border-b border-slate-100 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                    GÜVENLE KULLANAN SEKTÖR LİDERLERİ
                </p>
            </div>

            <div className="relative w-full">
                {/* Gradient Masks for Fade Efeckt */}
                <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-white to-transparent"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-white to-transparent"></div>

                {/* Scrolling Container */}
                <div className="flex gap-12 animate-scroll-infinite w-max hover:pause">
                    {scrollItems.map((ref, i) => (
                        <div key={i} className="flex items-center gap-3 text-slate-400 grayscale hover:grayscale-0 hover:text-brand-600 transition duration-500 cursor-default select-none group">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <i className={`${ref.icon} text-2xl`}></i>
                            </div>
                            <span className="font-bold text-lg hidden md:block">{ref.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); } /* Refs are tripled, so move 1/3 */
                }
                .animate-scroll-infinite {
                    animation: scroll 30s linear infinite;
                }
                .hover\\:pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
};
