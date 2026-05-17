
window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.CycleAnimation = ({ t }) => {
    // 4 Companies: Top, Right, Bottom, Left positions in a square/circle
    // A -> B -> C -> D -> A

    // Step represents who is "paying" essentially, or where the active transfer focus is
    const [step, setStep] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => (s + 1) % 4);
        }, 1500); // Change step every 1.5 seconds
        return () => clearInterval(interval);
    }, []);

    // Positions for 4 nodes in a 300x300 box
    // Center is 150, 150. Radius 100.
    // 0: Top (150, 50)
    // 1: Right (250, 150)
    // 2: Bottom (150, 250)
    // 3: Left (50, 150)

    const nodes = [
        { id: 1, name: "A", x: 150, y: 50 },
        { id: 2, name: "B", x: 250, y: 150 },
        { id: 3, name: "C", x: 150, y: 250 },
        { id: 4, name: "D", x: 50, y: 150 }
    ];

    // SVG ViewBox is 0 0 300 300

    return (
        <div className="relative w-full max-w-sm mx-auto aspect-square">
            {/* Title Badge - Moved Outside to prevent clipping */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur z-30 shadow-lg">
                <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase whitespace-nowrap">{t.title}</span>
            </div>

            <div className="w-full h-full relative bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent pointer-events-none"></div>

                <div className="relative w-full h-full p-8 md:p-12">
                    <svg className="w-full h-full" viewBox="0 0 300 300">
                        <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="15" refY="3" orient="auto" fill="#60a5fa">
                                <path d="M0,0 L0,6 L6,3 z" />
                            </marker>
                            <linearGradient id="linkGradient" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>

                        {/* Inner Diamond Path for Pulse */}
                        <path
                            id="cyclePath"
                            d="M150,50 L250,150 L150,250 L50,150 L150,50"
                            fill="none"
                            stroke="url(#linkGradient)"
                            strokeWidth="2"
                        />

                        {/* Outer Orbit Path (Circle) */}
                        <circle cx="150" cy="150" r="135" fill="none" stroke="url(#linkGradient)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

                        {/* Outer Orbit Particles */}
                        <circle r="3" fill="#60a5fa">
                            <animateMotion
                                dur="8s"
                                repeatCount="indefinite"
                                path="M150,15 m0,0 a135,135 0 1,1 0,270 a135,135 0 1,1 0,-270"
                            />
                        </circle>
                        <circle r="3" fill="#8b5cf6">
                            <animateMotion
                                dur="8s"
                                begin="4s"
                                repeatCount="indefinite"
                                path="M150,15 m0,0 a135,135 0 1,1 0,270 a135,135 0 1,1 0,-270"
                            />
                        </circle>

                        {/* Active Link Highlight based on step */}
                        {/* 0: 0->1, 1: 1->2 ... */}
                        {/* We can just draw the lines manually */}
                        <line x1="150" y1="50" x2="250" y2="150" stroke={step === 0 ? "#60a5fa" : "#ffffff20"} strokeWidth={step === 0 ? "4" : "1"} markerEnd="url(#arrowhead)" className="transition-all duration-300" />
                        <line x1="250" y1="150" x2="150" y2="250" stroke={step === 1 ? "#60a5fa" : "#ffffff20"} strokeWidth={step === 1 ? "4" : "1"} markerEnd="url(#arrowhead)" className="transition-all duration-300" />
                        <line x1="150" y1="250" x2="50" y2="150" stroke={step === 2 ? "#60a5fa" : "#ffffff20"} strokeWidth={step === 2 ? "4" : "1"} markerEnd="url(#arrowhead)" className="transition-all duration-300" />
                        <line x1="50" y1="150" x2="150" y2="50" stroke={step === 3 ? "#60a5fa" : "#ffffff20"} strokeWidth={step === 3 ? "4" : "1"} markerEnd="url(#arrowhead)" className="transition-all duration-300" />

                    </svg>

                    {/* Nodes HTML Overlay */}
                    {nodes.map((node, i) => {
                        const isActive = step === i; // Being processed
                        // Calculate status text

                        // Positioning absolute based on %
                        const left = (node.x / 300) * 100;
                        const top = (node.y / 300) * 100;

                        return (
                            <div
                                key={node.id}
                                className={`absolute w-14 h-14 transform -translate-x-1/2 -translate-y-1/2 rounded-xl flex flex-col items-center justify-center border transition-all duration-500 shadow-lg
                                ${isActive ? 'bg-blue-600 border-blue-400 scale-110 ring-4 ring-blue-500/30 z-20' : 'bg-slate-800/80 border-slate-700 grayscale z-10'}
                            `}
                                style={{ left: `${left}%`, top: `${top}%` }}
                            >
                                <span className="text-white font-bold text-base">{node.name}</span>
                            </div>
                        );
                    })}

                    {/* Center Status */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-xl font-bold text-white mb-0 drop-shadow-lg tabular-nums tracking-tighter">
                            Sirius
                        </div>
                        <div className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold bg-blue-900/30 px-2 py-0.5 rounded">
                            {t.cleared}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
