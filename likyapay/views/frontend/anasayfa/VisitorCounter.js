// VisitorCounter Component
// Path: views/frontend/anasayfa/VisitorCounter.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.VisitorCounter = () => {
    const [count, setCount] = React.useState(0);
    const [animatedCount, setAnimatedCount] = React.useState(0);

    React.useEffect(() => {
        // Sayacın başlangıç değerini API'den çek (inc=1 ile artırarak)
        const fetchCount = async () => {
            try {
                const response = await fetch('../api_visitor.php?inc=1');
                const data = await response.json();
                if (data.status === 'success') {
                    setCount(data.count);
                }
            } catch (error) {
                console.error("Sayaç yüklenemedi:", error);
                // Hata durumunda 0 olarak kalsın
                setCount(0); 
            }
        };

        fetchCount();
    }, []);

    // Sayı geldiğinde animasyonlu şekilde artır
    React.useEffect(() => {
        if (count === 0) return;
        
        let start = Math.floor(count * 0.95); // Yüzde 5 geriden başla animasyon için
        const duration = 2000;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // easeOutExpo animasyon fonksiyonu
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentCount = Math.floor(start + (count - start) * easeProgress);
            
            setAnimatedCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                setAnimatedCount(count);
            }
        };

        requestAnimationFrame(updateCounter);
    }, [count]);

    // Sayıyı formatla (örn: 4,382)
    const formattedCount = animatedCount.toLocaleString('tr-TR');

    return (
        <div className="relative py-8 bg-brand-900 border-t border-b border-brand-800/50 overflow-hidden">
            {/* Arka plan efektleri */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
                
                {/* Izgara (Grid) Deseni */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(2, 132, 199, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(2, 132, 199, 0.1) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    opacity: '0.2'
                }}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex flex-col items-center justify-center p-6 bg-brand-800/40 backdrop-blur-md rounded-2xl border border-brand-700/50 shadow-[0_0_40px_rgba(2,132,199,0.2)] hover:shadow-[0_0_60px_rgba(168,85,247,0.3)] transition-shadow duration-500">
                    
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <h3 className="text-brand-300 text-sm font-semibold uppercase tracking-widest">
                            Canlı Sistem Verisi
                        </h3>
                    </div>
                    
                    <div className="flex items-baseline space-x-2">
                        <span className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 tabular-nums tracking-tight filter drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                            {formattedCount}
                        </span>
                        <span className="text-brand-400 text-xl md:text-2xl font-medium">+</span>
                    </div>
                    
                    <p className="mt-3 text-gray-400 font-medium">
                        Sistemi ziyaret eden ve LikyaPay'i inceleyen kullanıcılar
                    </p>
                    
                    <div className="mt-4 px-4 py-1.5 rounded-full bg-brand-900/80 border border-brand-700/50 text-xs text-brand-300 flex items-center space-x-2 shadow-inner">
                        <i className="fas fa-microchip text-purple-400"></i>
                        <span>Sirius AI tarafından doğrulanmıştır</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
