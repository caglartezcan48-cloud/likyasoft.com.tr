// Intro Component
// Path: views/frontend/anasayfa/Intro.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Intro = ({ onComplete }) => {
    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
        // Check if intro has already been shown in this session
        const hasShown = sessionStorage.getItem('introShown');

        if (hasShown) {
            setVisible(false);
            if (onComplete) onComplete();
            return;
        }

        // Using a longer timeout to ensure the animation plays out fully for the first time
        const timer = setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem('introShown', 'true');
            if (onComplete) onComplete();
        }, 3500); // Slightly increased to 3.5s to match animation + buffer

        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-white animate-fade-out-delay">
            <div className="text-center animate-bounce-in">
                {/* Logo or Icon */}
                <div className="w-32 h-32 md:w-48 md:h-48 mb-8 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 border-4 border-blue-400 p-2">
                    <img src="/likyasoft/public/likyapay/views/frontend/gorsel/logo.png" className="w-full h-full object-contain rounded-full" alt="Logo" />
                </div>

                {/* Brand Name */}
                <h1 className="text-4xl md:text-5xl font-bold tracking-wider mb-2 animate-slide-up">
                    LİKYA PAY
                </h1>

                {/* Slogan */}
                <p className="text-blue-300 text-sm md:text-lg tracking-[0.2em] uppercase animate-pulse">
                    FİNANSAL OPTİMİZASYON HİZMETLERİ
                </p>
            </div>

            {/* Loading Bar */}
            <div className="absolute bottom-20 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-loading-bar"></div>
            </div>

            <style>{`
                @keyframes fade-out-delay {
                    0% { opacity: 1; pointer-events: all; }
                    80% { opacity: 1; pointer-events: all; }
                    100% { opacity: 0; pointer-events: none; }
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes loading-bar {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-fade-out-delay { animation: fade-out-delay 3s forwards; }
                .animate-slide-up { animation: slide-up 1s ease-out forwards; }
                .animate-bounce-in { animation: bounce-in 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
                .animate-loading-bar { animation: loading-bar 2.5s ease-in-out forwards; }
            `}</style>
        </div>
    );
};
