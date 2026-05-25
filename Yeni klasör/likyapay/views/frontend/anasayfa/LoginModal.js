// Path: views/frontend/anasayfa/LoginModal.js
const LoginModal = ({ isOpen, onClose, onLogin, onRegisterClick }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <i className="fa-solid fa-xmark text-2xl"></i>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Giriş Yap</h2>
                    <p className="text-slate-500 mb-8">LikyaPay hesabınıza erişin.</p>
                    {/* Basit Login Formu */}
                    <div className="space-y-4">
                        <input type="text" placeholder="E-posta veya Kullanıcı Adı" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-600 outline-none" />
                        <input type="password" placeholder="Şifre" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-600 outline-none" />
                        <button className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-all">Giriş Yap</button>
                    </div>
                    <p className="mt-6 text-center text-slate-500 text-sm">
                        Hesabınız yok mu? <button onClick={onRegisterClick} className="text-brand-600 font-bold hover:underline">Hemen Kaydolun</button>
                    </p>
                </div>
            </div>
        </div>
    );
};
if (!window.Anasayfa) window.Anasayfa = {};
window.Anasayfa.LoginModal = LoginModal;

// Path: views/frontend/anasayfa/RegisterModal.js
const RegisterModal = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <i className="fa-solid fa-xmark text-2xl"></i>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Ücretsiz Kayıt Ol</h2>
                    <p className="text-slate-500 mb-8">Finansal akışınızı bugün optimize etmeye başlayın.</p>
                    {/* Placeholder Register Form */}
                    <div className="space-y-4">
                        <input type="text" placeholder="Şirket Adı" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-600 outline-none" />
                        <button className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-all">Kayıt Ol</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
if (!window.Anasayfa) window.Anasayfa = {};
window.Anasayfa.RegisterModal = RegisterModal;
