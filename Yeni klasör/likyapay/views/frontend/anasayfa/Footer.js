// Footer Component
// Path: views/frontend/anasayfa/Footer.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Footer = ({ openModal, t }) => {
    return (
        <footer className="bg-brand-900 text-white pt-20 pb-10 relative overflow-hidden">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="font-black text-2xl tracking-tighter text-white">likyapay</span>
                        </div>
                        <p className="text-brand-200/60 text-sm leading-relaxed mb-6 italic">"{t.slogan}"</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">{t.corporate}</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => openModal('footer_modal_about')} className="text-brand-200/60 hover:text-white transition text-sm">{t.who_we_are}</button></li>
                            <li><button onClick={() => openModal('footer_modal_vision')} className="text-brand-200/60 hover:text-white transition text-sm">{t.vision_mission}</button></li>
                            <li><button onClick={() => openModal('footer_modal_contact')} className="text-brand-200/60 hover:text-white transition text-sm">{t.contact}</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">{t.legal}</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => openModal('footer_modal_legal')} className="text-brand-200/60 hover:text-white transition text-sm">{t.framework}</button></li>
                            <li><button onClick={() => openModal('footer_modal_terms')} className="text-brand-200/60 hover:text-white transition text-sm">{t.terms}</button></li>
                            <li><button onClick={() => openModal('footer_modal_privacy')} className="text-brand-200/60 hover:text-white transition text-sm">{t.privacy}</button></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-brand-200/40 text-xs">{t.rights}</p>
                </div>
            </div>
        </footer>
    );
};
