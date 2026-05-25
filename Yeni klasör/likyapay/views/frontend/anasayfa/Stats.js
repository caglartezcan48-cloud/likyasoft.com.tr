// Stats Component
// Path: views/frontend/anasayfa/Stats.js
window.Anasayfa = window.Anasayfa || {};
window.Anasayfa.Stats = () => {
    return (
        <div className="bg-white py-12 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-brand-600 mb-1">10B+</div>
                        <div className="text-gray-500 text-sm font-medium">Aktif KOBİ</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-brand-600 mb-1">₺2.5M</div>
                        <div className="text-gray-500 text-sm font-medium">Günlük İşlem</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-brand-600 mb-1">%99.9</div>
                        <div className="text-gray-500 text-sm font-medium">Başarı Oranı</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-brand-600 mb-1">24/7</div>
                        <div className="text-gray-500 text-sm font-medium">Aktif Destek</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Vizyon Component
// Path: views/frontend/anasayfa/Vizyon.js
window.Anasayfa.Vizyon = ({ t }) => {
    return (
        <section id="vizyon" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-black text-slate-900 mb-8">{t.what_is_title}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <h4 className="text-xl font-bold mb-4 text-brand-600">{t.card_1_title}</h4>
                        <p className="text-slate-600 leading-relaxed">{t.card_1_desc}</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <h4 className="text-xl font-bold mb-4 text-brand-600">{t.card_2_title}</h4>
                        <p className="text-slate-600 leading-relaxed">{t.card_2_desc}</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <h4 className="text-xl font-bold mb-4 text-brand-600">{t.card_3_title}</h4>
                        <p className="text-slate-600 leading-relaxed">{t.card_3_desc}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
