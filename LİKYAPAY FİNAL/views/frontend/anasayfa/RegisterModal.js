// RegisterModal Component
// Path: views/frontend/anasayfa/RegisterModal.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.RegisterModal = ({ isOpen, onClose, onRegister, onLogin }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = React.useState({
        companyName: "",
        taxNumber: "",
        authorizedPerson: "",
        phone: "",
        email: "",
        password: ""
    });

    const [isLoading, setIsLoading] = React.useState(false);
    const [isAgreed, setIsAgreed] = React.useState(false);

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Input Masking
        if (name === 'phone') {
            value = value.replace(/\D/g, '');
            if (value.length > 0) value = '(' + value;
            if (value.length > 3) value = value.slice(0, 4) + ') ' + value.slice(4);
            if (value.length > 8) value = value.slice(0, 9) + ' ' + value.slice(9);
            if (value.length > 11) value = value.slice(0, 12) + ' ' + value.slice(12);
            value = value.slice(0, 15);
        }
        if (name === 'taxNumber') {
            value = value.replace(/\D/g, '');
            value = value.slice(0, 11);
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent Double Submission
        if (isLoading) return;

        if (formData.password.length < 6) {
            alert("Şifreniz en az 6 karakter olmalıdır.");
            return;
        }
        if (formData.phone.length < 14) {
            alert("Lütfen geçerli bir telefon numarası giriniz.");
            return;
        }
        if (!window.Validators.isValidTaxID(formData.taxNumber)) {
            alert("Geçerli bir Vergi Numarası (10 hane) veya T.C. Kimlik Numarası (11 hane) giriniz.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Register Request
            const response = await fetch('../data/api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, status: 'pending' })
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("Invalid JSON:", text);
                throw new Error("Sunucu yanıtı geçersiz.");
            }

            if (data.success) {
                // Auto Login Removed - User must wait for approval
                // Show success message
                // window.showToast logic or alert
                alert("Başvurunuz başarıyla alındı! Yönetici onayından sonra giriş yapabilirsiniz.");
                onClose();
            } else {
                alert("Kayıt Başarısız: " + data.message);
            }
        } catch (error) {
            console.error("Register Error:", error);
            alert("Kayıt sırasında bir hata oluştu: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-md animate-fade-in p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto relative transform transition-all border border-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-white/70 hover:text-white z-20 transition-colors bg-black/10 hover:bg-black/20 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm"
                >
                    <i className="fas fa-times text-lg"></i>
                </button>

                <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-blue-900 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    <h2 className="text-3xl font-bold relative z-10 mb-2">Likya Pay Dünyasına Katılın</h2>
                    <p className="text-brand-100 text-sm relative z-10 font-medium">Finansal operasyonlarınızı modernleştirmek için ilk adımı atın.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sol Kolon: Firma Bilgileri */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Firma Bilgileri</h3>

                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Firma Ünvanı</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                    required
                                    placeholder="Şirketinizin tam adı"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Vergi / T.C. No</label>
                                <input
                                    type="text"
                                    name="taxNumber"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                    required
                                    placeholder="1234567890"
                                    value={formData.taxNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Sağ Kolon: İletişim & Güvenlik */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Yetkili & Güvenlik</h3>

                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Ad Soyad</label>
                                <div className="relative">
                                    <i className="fas fa-user absolute left-4 top-3.5 text-gray-400 text-sm"></i>
                                    <input
                                        type="text"
                                        name="authorizedPerson"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                        required
                                        placeholder="Yetkili Kişi"
                                        value={formData.authorizedPerson}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Telefon</label>
                                <div className="relative">
                                    <i className="fas fa-phone absolute left-4 top-3.5 text-gray-400 text-sm"></i>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                        required
                                        placeholder="(5XX) XXX XX XX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Alt Kısım: Giriş Bilgileri (Full Width) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">E-Posta</label>
                            <div className="relative">
                                <i className="fas fa-envelope absolute left-4 top-3.5 text-gray-400 text-sm"></i>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                    required
                                    placeholder="kurumsal@eposta.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Şifre Belirleyin</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-3.5 text-gray-400 text-sm"></i>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                    required
                                    placeholder="En az 6 karakter"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        {/* Terms & Conditions Checkbox */}
                        <div className="flex items-start gap-3 mb-4 px-1">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                />
                            </div>
                            <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer select-none">
                                <a href="https://likyapaydemo.gt.tc/views/frontend/yasal/sozlesme.php" target="_blank" className="font-bold text-brand-600 hover:text-brand-800 underline decoration-brand-200 underline-offset-2">Kullanıcı Sözleşmesi</a>'ni ve
                                <a href="https://likyapaydemo.gt.tc/views/frontend/yasal/kvkk.php" target="_blank" className="font-bold text-brand-600 hover:text-brand-800 underline decoration-brand-200 underline-offset-2 ml-1">KVKK Aydınlatma Metni</a>'ni okudum, anladım ve kabul ediyorum.
                            </label>
                        </div>

                        <button
                            disabled={isLoading || !isAgreed}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3
                                ${isLoading || !isAgreed
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white hover:shadow-xl hover:shadow-brand-500/30 transform hover:-translate-y-0.5 active:scale-95'
                                }
                            `}
                        >
                            {isLoading ? (
                                <i className="fas fa-circle-notch fa-spin"></i>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                            {isLoading ? 'İşleniyor...' : 'Başvuruyu Tamamla'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
