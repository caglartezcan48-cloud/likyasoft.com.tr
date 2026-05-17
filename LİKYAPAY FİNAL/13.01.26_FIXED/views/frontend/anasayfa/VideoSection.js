// VideoSection Component (Youtube Embed)
// Path: views/frontend/anasayfa/VideoSection.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.VideoSection = () => {
    return (
        <section id="video-tanitim" className="py-16 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-3">
                    <i className="fas fa-film text-brand-500"></i> Likya Pay Tanıtım Filmi
                </h2>

                {/* Youtube Embed */}
                <div className="relative w-full aspect-video rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.3)] overflow-hidden border border-slate-700 bg-black">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/usIwSQ-Rxdw"
                        title="Likya Pay Tanıtım Filmi"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        className="w-full h-full"
                    ></iframe>
                </div>

                <p className="text-slate-400 mt-6 text-sm">Finansal özgürlüğün yeni yolu ile tanışın.</p>
            </div>
        </section>
    );
};
