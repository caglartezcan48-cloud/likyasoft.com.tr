// Footer.js
// Path: assets/js/Footer.js

window.Agency = window.Agency || {};

window.Agency.Footer = ({ t }) => {
    const scrollToSection = (id) => {
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
        <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
            {/* Background glowing elements */}
            <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-violet-600/5 rounded-full blur-[100px]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    
                    {/* Column 1: Brand & Bio (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col space-y-6">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="bg-gradient-to-tr from-violet-600 to-cyber-blue p-0.5 rounded-xl shadow-lg">
                                <div className="bg-slate-950 p-2 rounded-[10px]">
                                    <img src="logo.png" alt="Likya Soft" className="h-6 w-auto object-contain" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                                    LİKYA <span className="text-gradient-purple font-black">SOFT</span>
                                </span>
                                <span className="text-[9px] tracking-widest text-cyber-blue font-bold uppercase -mt-1">DİJİTAL MİMARİ</span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm font-light">
                            {t.text}
                        </p>
                        
                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {['instagram', 'twitter', 'linkedin', 'github'].map((social, sIdx) => (
                                <a 
                                    key={sIdx}
                                    href="#" 
                                    className="w-9 h-9 rounded-lg bg-slate-900 border border-white/5 hover:border-violet-500/30 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow shadow-black"
                                >
                                    <i className={`fa-brands fa-${social} text-sm`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col space-y-4">
                        <h4 className="font-bold text-white text-sm uppercase tracking-widest border-b border-white/5 pb-2">
                            {t.quick_links}
                        </h4>
                        <div className="flex flex-col space-y-2.5">
                            {[
                                { id: 'services', label: 'Hizmetler / Services' },
                                { id: 'products', label: 'Ürünler / SaaS Apps' },
                                { id: 'portfolio', label: 'Portfolyo / Case Studies' },
                                { id: 'about', label: 'Hakkımızda / Corporate' }
                            ].map((lnk, lIdx) => (
                                <button
                                    key={lIdx}
                                    onClick={() => scrollToSection(lnk.id)}
                                    className="text-left text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 font-light"
                                >
                                    <i className="fa-solid fa-angle-right text-[10px] text-violet-500"></i> {lnk.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Column 3: Legal & Products Links (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col space-y-4">
                        <h4 className="font-bold text-white text-sm uppercase tracking-widest border-b border-white/5 pb-2">
                            {t.legal}
                        </h4>
                        <div className="flex flex-col space-y-2.5">
                            <a href="likyapay/" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 font-light">
                                <i className="fa-solid fa-scale-balanced text-[10px] text-cyber-blue"></i> LikyaPay Finansal Optimizasyon
                            </a>
                            <a href="mazelloerp/" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 font-light">
                                <i className="fa-solid fa-scale-balanced text-[10px] text-emerald-400"></i> Mazello ERP Otomasyonu
                            </a>
                            <a href="#" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 font-light">
                                <i className="fa-solid fa-scroll text-[10px] text-slate-500"></i> Gizlilik & Kullanım Koşulları (Privacy & Terms)
                            </a>
                            <a href="#" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 font-light">
                                <i className="fa-solid fa-user-shield text-[10px] text-slate-500"></i> KVKK Aydınlatma Metni (GDPR/KVKK)
                            </a>
                        </div>
                    </div>

                </div>

                {/* Bottom line: Copyright */}
                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                    <span className="text-[10px] sm:text-xs text-slate-500 font-light">
                        {t.rights}
                    </span>
                    <div className="flex gap-6 text-[10px] sm:text-xs text-slate-500">
                        <a href="mailto:info@likyasoft.com.tr" className="hover:text-white transition">info@likyasoft.com.tr</a>
                        <span>•</span>
                        <a href="tel:05438231556" className="hover:text-white transition">0543 823 15 56</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};
