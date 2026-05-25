// Path: views/frontend/anasayfa/Vizyon.js

const Vizyon = () => {
    return (
        <section id="vizyon" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-black text-slate-900 mb-4">Vizyonumuz</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    KOBİ'lerin finansal süreçlerini optimize ederek, Türkiye'nin dijital dönüşümüne öncülük etmek.
                </p>
            </div>
        </section>
    );
};

if (!window.Anasayfa) window.Anasayfa = {};
window.Anasayfa.Vizyon = Vizyon;
