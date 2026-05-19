// Contact.js
// Path: assets/js/Contact.js

window.Agency = window.Agency || {};

window.Agency.Contact = ({ t }) => {
    // Quote Estimator State
    const [serviceType, setServiceType] = React.useState('custom');
    const [scale, setScale] = React.useState('medium');
    const [time, setTime] = React.useState('standard');
    const [estimate, setEstimate] = React.useState(null);

    // Form Submission State
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = React.useState(null); // 'loading', 'success', 'error'

    // Form Field Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Calculate dynamic estimate
    const handleCalculate = () => {
        // Base coefficients in TL
        let baseMin = 40000;
        let baseMax = 70000;
        let timeFactor = 1.0;
        let weeks = "8-12 Weeks";

        // Service adjustment
        if (serviceType === 'web') { baseMin = 25000; baseMax = 45000; }
        else if (serviceType === 'erp') { baseMin = 65000; baseMax = 120000; }
        else if (serviceType === 'ai') { baseMin = 80000; baseMax = 150000; }
        else if (serviceType === 'seo') { baseMin = 15000; baseMax = 30000; }

        // Scale adjustment
        if (scale === 'small') { baseMin *= 0.65; baseMax *= 0.7; }
        else if (scale === 'large') { baseMin *= 2.2; baseMax *= 2.5; }

        // Duration Adjustment
        if (time === 'fast') {
            baseMin *= 1.3; baseMax *= 1.35; // Rushed fees
            timeFactor = 0.5;
            weeks = serviceType === 'web' ? "2 Weeks" : "4-6 Weeks";
        } else if (time === 'flexible') {
            baseMin *= 0.9; baseMax *= 0.9; // Flexible discount
            timeFactor = 1.4;
            weeks = "16+ Weeks";
        } else {
            // Standard time
            weeks = serviceType === 'web' ? "3-4 Weeks" : "8-10 Weeks";
        }

        // Format currency
        const formatTL = (num) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(num);

        setEstimate({
            min: formatTL(baseMin),
            max: formatTL(baseMax),
            duration: weeks
        });
    };

    // Auto-calculate on initial mount
    React.useEffect(() => {
        handleCalculate();
    }, [serviceType, scale, time]);

    // Send estimate details to contact form
    const applyEstimateToForm = () => {
        if (!estimate) return;
        
        let serviceName = "Özel Yazılım";
        if (serviceType === 'web') serviceName = "Web Tasarım";
        if (serviceType === 'erp') serviceName = "ERP / CRM Sistemleri";
        if (serviceType === 'ai') serviceName = "Yapay Zeka & Otomasyon";
        if (serviceType === 'seo') serviceName = "SEO / Hız Optimizasyonu";

        setFormData({
            ...formData,
            subject: `Hızlı Teklif Talebi - ${serviceName}`,
            message: `Merhaba, \n\nAkıllı Hesaplayıcı üzerinden aldığım tahmini bütçe aralığı (${estimate.min} - ${estimate.max}) ve teslim süresi (${estimate.duration}) doğrultusunda, ${serviceName} projemizin detaylı analizi ve kesin teklifi için görüşmek istiyorum.`
        });

        // Scroll to form inputs
        const formElement = document.getElementById('contact');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Form Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('contact_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error("Form Submit Error:", err);
            setStatus('error');
        }
    };

    return (
        <section id="pricing" className="relative py-24 bg-slate-950/40 border-t border-white/5 overflow-hidden">
            {/* Background Glow Spots */}
            <div className="glow-spot w-[450px] h-[450px] bg-cyber-blue/5 top-1/4 -right-20"></div>
            <div className="glow-spot w-[350px] h-[350px] bg-violet-600/5 bottom-12 -left-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <div className="text-center mb-20 flex flex-col items-center">
                    <span className="text-xs tracking-widest font-black text-cyber-blue uppercase mb-2">
                        {t.subtitle}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                        {t.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-violet-600 to-cyber-blue rounded-full mb-6"></div>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-light">
                        {t.description}
                    </p>
                </div>

                {/* 1. INTERACTIVE ESTIMATOR TOOL */}
                <div className="p-0.5 rounded-[32px] bg-gradient-to-br from-violet-500/10 via-white/5 to-white/0 shadow-2xl mb-20 relative overflow-hidden">
                    {/* Inner Panel */}
                    <div className="bg-slate-950/80 backdrop-blur-xl rounded-[30px] p-6 sm:p-10 border border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        {/* Selector Inputs (8 cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            <h3 className="font-extrabold text-xl text-white mb-4 flex items-center gap-2.5">
                                <i className="fa-solid fa-wand-magic-sparkles text-violet-400"></i> {t.calc.title}
                            </h3>
                            <p className="text-xs text-slate-400 font-light leading-relaxed max-w-xl mb-6">
                                {t.calc.desc}
                            </p>

                            {/* Service Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                                    {t.calc.service_label}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { id: 'web', label: 'Web Tasarım' },
                                        { id: 'custom', label: 'Özel Yazılım' },
                                        { id: 'erp', label: 'ERP / CRM' },
                                        { id: 'ai', label: 'Yapay Zeka' },
                                        { id: 'seo', label: 'SEO & Performans' }
                                    ].map(srv => (
                                        <button
                                            key={srv.id}
                                            onClick={() => setServiceType(srv.id)}
                                            className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                                serviceType === srv.id
                                                    ? 'bg-violet-500/20 border-violet-500 text-white shadow shadow-violet-500/10'
                                                    : 'bg-slate-900/30 border-white/5 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {srv.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scale Selector */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                                        {t.calc.scale_label}
                                    </label>
                                    <select
                                        value={scale}
                                        onChange={(e) => setScale(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900/60 border border-white/5 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                                    >
                                        <option value="small">{t.calc.scales.small}</option>
                                        <option value="medium">{t.calc.scales.medium}</option>
                                        <option value="large">{t.calc.scales.large}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                                        {t.calc.time_label}
                                    </label>
                                    <select
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900/60 border border-white/5 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                                    >
                                        <option value="fast">{t.calc.times.fast}</option>
                                        <option value="standard">{t.calc.times.standard}</option>
                                        <option value="flexible">{t.calc.times.flexible}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Result Display Panel (5 cols) */}
                        <div className="lg:col-span-5 w-full flex justify-center">
                            <div className="w-full max-w-[320px] p-6 bg-slate-900/60 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col items-center shadow-2xl">
                                {/* Glowing neon border accents */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-violet-500 to-cyber-blue rounded-full"></div>

                                <span className="text-[9px] tracking-widest font-black text-violet-400 mb-4 uppercase">
                                    CALCULATOR ESTIMATION
                                </span>

                                {estimate && (
                                    <>
                                        <span className="text-xs text-slate-400 mb-1">{t.calc.result_budget}</span>
                                        <span className="text-xl sm:text-2xl font-black text-white text-gradient-purple mb-4 text-center">
                                            {estimate.min} - {estimate.max}
                                        </span>

                                        <span className="text-xs text-slate-400 mb-1">{t.calc.result_time}</span>
                                        <span className="text-base font-bold text-white mb-6 flex items-center gap-2 text-cyber-blue">
                                            <i className="fa-regular fa-clock"></i> {estimate.duration}
                                        </span>

                                        <button
                                            onClick={applyEstimateToForm}
                                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <i className="fa-solid fa-file-invoice-dollar"></i> {t.calc.submit_estimate}
                                        </button>
                                    </>
                                )}

                                <span className="text-[9px] text-slate-500 italic mt-4 text-center leading-relaxed">
                                    {t.calc.result_info}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 2. CONTACT DETAILS & MESSAGE FORM SPLIT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch pt-24 mt-12 border-t border-white/5" id="contact">
                    
                    {/* Left: Contact Info (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
                        <div>
                            <h3 className="font-extrabold text-2xl text-white mb-4 tracking-tight">
                                Likya Soft HQ
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-light">
                                Bizimle iletişime geçerek hayalinizdeki projeyi gerçeğe dönüştürün. Fethiye ve İstanbul teknoloji ofislerimizle hizmetinizdeyiz.
                            </p>
                        </div>

                        {/* Contact details list */}
                        <div className="space-y-6">
                            {/* ADRES */}
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <i className="fa-solid fa-map-location-dot text-sm"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-1">{t.address}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-light">{t.address_text}</p>
                                </div>
                            </div>

                            {/* E-POSTA */}
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center text-cyber-blue">
                                    <i className="fa-solid fa-envelope-open-text text-sm"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-1">{t.email}</h4>
                                    <a href="mailto:info@likyasoft.com.tr" className="text-xs text-slate-400 hover:text-white transition font-light">
                                        info@likyasoft.com.tr
                                    </a>
                                </div>
                            </div>

                            {/* TELEFON */}
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <i className="fa-solid fa-mobile-screen-button text-sm"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-1">{t.phone}</h4>
                                    <a href="tel:05438231556" className="text-xs text-slate-400 hover:text-white transition font-light">
                                        0543 823 15 56
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Status Tag */}
                        <div className="p-4 rounded-2xl bg-slate-900/30 border border-white/5 flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="text-xs text-slate-400 font-bold">
                                Ortalama Yanıt Süresi: <span className="text-white">2 Saat</span>
                            </span>
                        </div>
                    </div>

                    {/* Right: Message Form (8 cols) */}
                    <div className="lg:col-span-8 p-0.5 rounded-[28px] bg-gradient-to-br from-white/10 via-white/5 to-white/0 shadow-2xl flex">
                        <form 
                            onSubmit={handleSubmit}
                            className="bg-slate-950/80 rounded-[26px] p-6 sm:p-8 border border-white/5 flex flex-col gap-5 w-full justify-between"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">{t.form.name}</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl agency-input border border-white/5 text-sm text-white focus:outline-none focus:border-violet-500"
                                        placeholder="Çağlar Tezcan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">{t.form.email}</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl agency-input border border-white/5 text-sm text-white focus:outline-none focus:border-violet-500"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">{t.form.phone}</label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl agency-input border border-white/5 text-sm text-white focus:outline-none focus:border-violet-500"
                                        placeholder="05xx xxx xx xx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">{t.form.subject}</label>
                                    <input 
                                        type="text" 
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl agency-input border border-white/5 text-sm text-white focus:outline-none focus:border-violet-500"
                                        placeholder="E.g. Web Sitesi Yenileme"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">{t.form.message}</label>
                                <textarea 
                                    name="message"
                                    rows="4"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl agency-input border border-white/5 text-sm text-white focus:outline-none focus:border-violet-500"
                                    placeholder="Proje hedefleriniz, bütçeniz ve sormak istedikleriniz..."
                                ></textarea>
                            </div>

                            {/* Status Notifications */}
                            {status === 'success' && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2.5 animate-slide-up">
                                    <i className="fa-solid fa-circle-check"></i> {t.form.success}
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2.5 animate-slide-up">
                                    <i className="fa-solid fa-circle-xmark"></i> {t.form.error}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={status === 'loading'}
                                className={`w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl transition shadow-lg shadow-violet-500/20 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 ${
                                    status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch animate-spin"></i> {t.form.sending}
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-paper-plane text-sm"></i> {t.form.send}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                </div>

            </div>
        </section>
    );
};
