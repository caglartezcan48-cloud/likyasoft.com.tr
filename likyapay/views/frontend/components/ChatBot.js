
window.Components = window.Components || {};

window.Components.ChatBot = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState([
        {
            id: 1,
            text: "LİKYAPAY YENİ NESİL FİNANSAL OPTİMİZASYON HİZMETLERİNE HOŞGELDİNİZ. LİKYA PAY HAKKINDA HERŞEYİ BANA SORABİLİRSİNİZ.. SİZE NASIL YARDIMCI OLABİLİRİM?",
            isBot: true
        }
    ]);
    const [input, setInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    React.useEffect(() => {
        window.openChatBot = () => setIsOpen(true);
        return () => { window.openChatBot = null; };
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Updated to root path to bypass potential 403 blocks on InfinityFree
            const res = await fetch('/likyasoft/public/likyapay/destek_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            if (!res.ok) {
                throw new Error(res.status + " " + res.statusText);
            }

            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, isBot: true }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "⚠️ " + data.message, isBot: true }]);
            }
        } catch (err) {
            console.error("ChatBot Error:", err);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Bağlantı hatası: " + err.message + ". Lütfen sayfayı yenileyip tekrar deneyin.", isBot: true }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans animate-fade-in flex items-center gap-4">

            {/* Tooltip / Contextual Help */}
            {!isOpen && (
                <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-brand-100 animate-bounce cursor-pointer" onClick={() => setIsOpen(true)}>
                    <p className="text-brand-800 text-sm font-semibold whitespace-nowrap">
                        👋 Merhaba! Size nasıl yardımcı olabilirim?
                    </p>
                    {/* Arrow */}
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-brand-100 transform rotate-45"></div>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col mb-0 overflow-hidden border border-slate-200 animate-slide-up origin-bottom-left">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <i className="fas fa-robot text-lg"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">LİKYAPAY YAPAY ZEKA</h3>
                                <div className="flex items-center gap-1 text-[10px] opacity-90">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    Çevrimiçi
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm leading-relaxed
                                    ${msg.isBot
                                        ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                        : 'bg-brand-600 text-white rounded-tr-none'}
                                `}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-slate-500 p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/20 transition">
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
                                placeholder="Bir soru sorun..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition shadow-sm
                                    ${input.trim()
                                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                `}
                            >
                                <i className="fas fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-slate-300">Powered by Gemini AI</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Launcher Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-2xl flex items-center justify-center transition transform hover:scale-110 group relative"
                >
                    <i className="fas fa-comment-dots text-2xl group-hover:rotate-12 transition"></i>
                    {/* Badge */}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            )}
        </div>
    );
};
