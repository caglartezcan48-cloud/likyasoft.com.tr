// Footer Component
// Path: views/frontend/anasayfa/Footer.js

window.Anasayfa = window.Anasayfa || {};


window.Anasayfa.Footer = ({ t, openModal }) => (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-4 text-center md:text-left mb-8 md:mb-0">
                <h4 className="text-white font-bold text-xl tracking-wider mb-2">LİKYA PAY FİNANSAL OPTİMİZASYON HİZMETLERİ LTD.ŞTİ.</h4>
                <p className="text-sm text-slate-500">{t.slogan}</p>
            </div>

            <div className="border-t border-slate-800 col-span-1 md:col-span-4 pt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h4 className="text-white font-bold mb-4">{t.corporate}</h4>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => openModal('hakkimizda')} className="hover:text-white text-left">{t.who_we_are}</button></li>
                        <li><button onClick={() => openModal('vizyon')} className="hover:text-white text-left">{t.vision_mission}</button></li>
                        <li><button onClick={() => openModal('iletisim')} className="hover:text-white text-left">{t.contact}</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">{t.legal}</h4>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => openModal('framework')} className="hover:text-white text-left">{t.framework}</button></li>
                        <li><button onClick={() => openModal('terms')} className="hover:text-white text-left">{t.terms}</button></li>
                        <li><button onClick={() => openModal('privacy')} className="hover:text-white text-left">{t.privacy}</button></li>
                        <li><button onClick={() => openModal('kvkk')} className="hover:text-white text-left">{t.kvkk}</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">{t.contact}</h4>
                    <p className="text-sm font-semibold text-white mb-1">Çağlar TEZCAN</p>
                    <p className="text-xs text-slate-500 mb-2">{t.manager}</p>
                    <p className="text-sm mb-2"><i className="fas fa-phone-alt mr-2 text-brand-500"></i>0543 823 15 56</p>
                    <p className="text-sm">info@likyapay.com</p>
                </div>
                <div>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-brand-600 transition"><i className="fab fa-linkedin-in"></i></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-brand-600 transition"><i className="fab fa-twitter"></i></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-brand-600 transition"><i className="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-center text-xs pt-8 border-t border-slate-800">
            {t.rights}
        </div>
    </footer>
);
