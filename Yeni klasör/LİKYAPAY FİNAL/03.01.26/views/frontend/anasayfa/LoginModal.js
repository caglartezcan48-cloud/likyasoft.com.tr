// LoginModal Component
// Path: views/frontend/anasayfa/LoginModal.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.LoginModal = ({ isOpen, onClose, onLogin, onRegisterClick }) => {
    if (!isOpen) return null;
    const [showPass, setShowPass] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Simulate network delay for UX
            await new Promise(r => setTimeout(r, 800));

            const response = await fetch('/likyapay/data/api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("Invalid JSON Response:", text);
                throw new Error("Sunucu hatası: " + text.substring(0, 100));
            }

            if (data.success) {
                if (onLogin) {
                    onLogin(data.user.role, data.user);
                } else {
                    // Fallback if no handler provided
                    window.location.reload();
                }
            } else {
                alert("Giriş Başarısız: " + data.message);
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Bağlantı hatası oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all scale-100 hover:scale-[1.01] duration-300 border border-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white z-20 transition-colors"
                >
                    <i className="fas fa-times text-2xl drop-shadow-md"></i>
                </button>

                {/* Premium Header */}
                <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-blue-900 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 shadow-inner">
                            <i className="fas fa-user-lock text-3xl text-white"></i>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-1">Hoş Geldiniz</h2>
                        <p className="text-brand-100 text-sm font-medium">Likya Pay Güvenli Giriş Portalı</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">E-Posta Adresi</label>
                        <div className="relative group">
                            <i className="fas fa-envelope absolute left-4 top-4 text-gray-400 group-focus-within:text-brand-600 transition-colors"></i>
                            <input
                                type="email"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium text-gray-800 placeholder-gray-400"
                                placeholder="ornek@sirket.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Şifre</label>
                        <div className="relative group">
                            <i className="fas fa-lock absolute left-4 top-4 text-gray-400 group-focus-within:text-brand-600 transition-colors"></i>
                            <input
                                type={showPass ? "text" : "password"}
                                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium text-gray-800 placeholder-gray-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-brand-600 transition-colors"
                            >
                                <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>

                        <div className="flex justify-between items-center mt-3 px-1">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 transition cursor-pointer" />
                                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition">Beni Hatırla</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-800 transition">Şifremi Unuttum?</a>
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-circle-notch fa-spin"></i> Giriş Yapılıyor...
                            </>
                        ) : (
                            <>
                                Giriş Yap <i className="fas fa-arrow-right"></i>
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-gray-500 text-sm">
                            Hesabınız yok mu?
                            <button
                                type="button"
                                onClick={() => {
                                    if (onRegisterClick) onRegisterClick();
                                    else onClose();
                                }}
                                className="ml-1 font-bold text-brand-600 hover:text-brand-800 underline"
                            >
                                Hemen Başvurun
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};
