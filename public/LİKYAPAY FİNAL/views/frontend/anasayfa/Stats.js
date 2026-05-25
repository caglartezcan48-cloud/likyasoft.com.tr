// Stats Component (Live Counters)
// Path: views/frontend/anasayfa/Stats.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Stats = () => {
    // Custom Hook for counting up
    const useCounter = (end, duration = 2000) => {
        const [count, setCount] = React.useState(0);
        const [isVisible, setIsVisible] = React.useState(false);
        const ref = React.useRef(null);

        React.useEffect(() => {
            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Only run once
                }
            }, { threshold: 0.5 });

            if (ref.current) observer.observe(ref.current);
            return () => observer.disconnect();
        }, []);

        React.useEffect(() => {
            if (!isVisible) return;

            let startTime = null;
            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                setCount(Math.floor(progress * end));
                if (progress < 1) window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
        }, [isVisible, end, duration]);

        return { count, ref };
    };

    // Stat Item Component
    const StatItem = ({ end, suffix, label, icon, delay }) => {
        const { count, ref } = useCounter(end);
        return (
            <div ref={ref} className={`glass-card p-6 rounded-2xl text-center transform hover:scale-105 transition duration-500 border-b-4 border-brand-500`}>
                <div className="w-16 h-16 mx-auto bg-brand-50 rounded-full flex items-center justify-center text-3xl text-brand-600 mb-4 shadow-inner">
                    <i className={icon}></i>
                </div>
                <div className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-2 font-mono tracking-tight">
                    {count}{suffix}
                </div>
                <div className="text-slate-500 font-medium uppercase tracking-wide text-xs lg:text-sm">
                    {label}
                </div>
            </div>
        );
    };

    return (
        <section className="py-20 bg-slate-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatItem end={1250} suffix="+" label="Aktif KOBİ" icon="fas fa-users" delay={0} />
                    <StatItem end={85} suffix="M TL" label="İşlem Hacmi" icon="fas fa-chart-pie" delay={100} />
                    <StatItem end={98} suffix="%" label="Eşleşme Oranı" icon="fas fa-check-double" delay={200} />
                    <StatItem end={24} suffix="/7" label="Kesintisiz Destek" icon="fas fa-headset" delay={300} />
                </div>
            </div>
        </section>
    );
};
