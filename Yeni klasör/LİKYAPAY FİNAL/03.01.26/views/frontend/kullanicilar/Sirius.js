// Sirius Cycles Component - Advanced Trade Engine Interface
// Path: views/frontend/kullanicilar/Sirius.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Sirius = () => {
    const [activeTab, setActiveTab] = React.useState('dashboard'); // 'dashboard', 'create_request', 'my_requests'
    const [requests, setRequests] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Create Request State
    const [newRequest, setNewRequest] = React.useState({
        target_tax_id: '',
        target_name: '', // Fetched from tax ID
        amount: '',
        document_type: 'invoice', // invoice, check, bond
        description: ''
    });

    // Check for Active Cycle
    const [activeCycle, setActiveCycle] = React.useState(null);

    const [searchLoading, setSearchLoading] = React.useState(false);

    // Fetch existing requests
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/likyapay/data/api/sirius.php?action=list_requests');
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRequests();

        // Check Cycle Status
        fetch('/likyapay/data/api/sirius.php?action=check_my_cycle')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.in_cycle) {
                    setActiveCycle(data.cycle);
                }
            })
            .catch(err => console.error("Cycle Check Error:", err));
    }, []);

    const handleSearchFirm = async () => {
        if (newRequest.target_tax_id.length < 10) return alert("Lütfen geçerli bir Vergi No girin.");
        setSearchLoading(true);
        try {
            // Mock Search or API Call to search_companies.php
            const res = await fetch(`/likyapay/data/api/search_companies.php?tax_id=${newRequest.target_tax_id}`);
            const data = await res.json();

            if (data.success && data.company) {
                setNewRequest(prev => ({ ...prev, target_name: data.company.name }));
            } else {
                alert("Firma bulunamadı. Lütfen sisteme kayıtlı bir vergi numarası giriniz.");
                setNewRequest(prev => ({ ...prev, target_name: '' }));
            }
        } catch (e) {
            console.error(e);
            alert("Arama hatası.");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newRequest.target_name || !newRequest.amount) return alert("Lütfen tüm alanları doldurun.");

        try {
            const res = await fetch('/likyapay/data/api/sirius.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_request',
                    ...newRequest
                })
            });
            const data = await res.json();

            if (data.success) {
                alert("✅ Sirius Talebiniz Oluşturuldu! Eşleşme aranıyor...");
                setActiveTab('my_requests');
                setNewRequest({ target_tax_id: '', target_name: '', amount: '', document_type: 'invoice', description: '' });
                fetchRequests(); // Refresh list
            } else {
                alert("Hata: " + data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- SUB-COMPONENTS ---

    const DashboardView = () => (
        <div className="space-y-8 animate-fade-in relative z-10">
            {/* Active Cycle Notification - If User is in a Loop */}
            {activeCycle && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden animate-pulse-slow border-2 border-emerald-400">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center text-2xl shadow-lg animate-bounce">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">Tebrikler! Sirius Grubundasınız 🚀</h2>
                                <p className="text-emerald-100 font-medium">Sistem sizi karlı bir takas döngüsüne dahil etti.</p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                {/* Chain Visual */}
                                <div className="flex-1 flex items-center gap-3 overflow-x-auto w-full pb-2 md:pb-0">
                                    {activeCycle.chain_names.map((name, i) => (
                                        <React.Fragment key={i}>
                                            <div className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap shadow-sm ${name === 'Siz' ? 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-400/30' : 'bg-white text-emerald-900'
                                                }`}>
                                                {name}
                                            </div>
                                            {/* Last Arrow goes back to start implicitly, or we show it */}
                                            {i < activeCycle.chain_names.length - 1 && (
                                                <i className="fas fa-arrow-right text-emerald-200 text-lg"></i>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <i className="fas fa-arrow-right text-emerald-200 text-lg"></i>
                                    <div className="px-4 py-2 rounded-lg font-bold text-sm bg-yellow-400 text-yellow-900 opacity-50">...</div>
                                </div>

                                {/* Volume Info */}
                                <div className="text-right shrink-0">
                                    <div className="text-emerald-100 text-xs font-bold uppercase mb-1">Mahsuplaşma Tutarı</div>
                                    <div className="text-3xl font-black tracking-tight">{parseFloat(activeCycle.volume).toLocaleString('tr-TR')} ₺</div>
                                    <div className="text-xs text-emerald-200 mt-1">Onay Bekleniyor</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Card */}
            <div className="bg-[#0f172a] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/50">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                            <i className="fas fa-star"></i> Sirius Trade Engine v1.0
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Ticaretin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Geleceği</span> Burada.
                        </h2>
                        <p className="text-indigo-200/80 text-lg leading-relaxed">
                            Nakit akışınız tıkanmasın. Sirius, alacaklarınızı ve borçlarınızı analiz ederek sizi kapalı devre takas döngülerine dahil eder. Tahsilat beklemeden borçlarınızı ödeyin.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setActiveTab('create_request')}
                                className="bg-white text-[#0f172a] px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg hover:shadow-white/20 transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                <i className="fas fa-plus-circle"></i> Talep Oluştur
                            </button>
                            <button
                                onClick={() => setActiveTab('my_requests')}
                                className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-white px-8 py-3.5 rounded-xl font-bold transition flex items-center gap-2 backdrop-blur-sm"
                            >
                                <i className="fas fa-list"></i> Taleplerim
                            </button>
                        </div>
                    </div>

                    {/* Visual Animation Placeholder */}
                    <div className="w-64 h-64 md:w-80 md:h-80 relative flex items-center justify-center">
                        <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute inset-4 border-2 border-purple-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-[0_0_50px_rgba(99,102,241,0.5)] flex items-center justify-center text-4xl text-white">
                                <i className="fas fa-infinity"></i>
                            </div>
                        </div>
                        {/* Orbiting Planets */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-6 h-6 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.8)]"></div>
                    </div>
                </div>
            </div>

            {/* Stats / How it works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                        <i className="fas fa-file-invoice-dollar"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">1. Alacağını Gir</h3>
                    <p className="text-slate-500 text-sm">Vadesi gelmemiş veya geçmiş alacaklarınızı sisteme yükleyin. Fatura veya çek bilgilerinizi girin.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                        <i className="fas fa-network-wired"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">2. Eşleşme Bekle</h3>
                    <p className="text-slate-500 text-sm">Sirius, alacaklı olduğunuz firmanın kime borcu olduğunu analiz eder ve zinciri tamamlar.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                        <i className="fas fa-check-double"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">3. Mahsuplaş</h3>
                    <p className="text-slate-500 text-sm">Döngü tamamlandığında onay verin. Borcunuz ve alacağınız birbirini nakitsiz olarak ödesin.</p>
                </div>
            </div>
        </div>
    );

    const CreateRequestView = () => (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
            <button onClick={() => setActiveTab('dashboard')} className="text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-2 transition">
                <i className="fas fa-arrow-left"></i> Geri Dön
            </button>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-slate-900"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold">Yeni Sirius Talebi</h3>
                        <p className="text-slate-400 text-sm mt-1">Sisteme bir alacak/borç ilişkisi tanımlayın.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Alacaklı Olduğunuz Firma */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Alacaklı Olduğunuz Firma (Vergi No)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition font-mono"
                                placeholder="1234567890"
                                maxLength="11"
                                value={newRequest.target_tax_id}
                                onChange={e => setNewRequest({ ...newRequest, target_tax_id: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={handleSearchFirm}
                                disabled={searchLoading}
                                className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                            >
                                {searchLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                            </button>
                        </div>
                        {newRequest.target_name && (
                            <div className="mt-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-bold flex items-center gap-2 animate-fade-in">
                                <i className="fas fa-check-circle"></i> {newRequest.target_name}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tutar (TL)</label>
                            <input
                                type="number"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition font-bold text-slate-800"
                                placeholder="0.00"
                                value={newRequest.amount}
                                onChange={e => setNewRequest({ ...newRequest, amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Belge Türü</label>
                            <select
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition bg-white"
                                value={newRequest.document_type}
                                onChange={e => setNewRequest({ ...newRequest, document_type: e.target.value })}
                            >
                                <option value="invoice">Fatura</option>
                                <option value="check">Çek / Senet</option>
                                <option value="contract">Sözleşme</option>
                                <option value="other">Diğer</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama (Opsiyonel)</label>
                        <textarea
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition h-24 resize-none"
                            placeholder="Vade tarihi, fatura numarası vb. notlar..."
                            value={newRequest.description}
                            onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition"
                    >
                        Talebi Oluştur
                    </button>
                </form>
            </div>
        </div>
    );

    const MyRequestsView = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <button onClick={() => setActiveTab('dashboard')} className="w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 transition">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h2 className="text-2xl font-bold text-slate-800">Taleplerim</h2>
            </div>
            {/* List Placeholder */}
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-3xl">
                    <i className="fas fa-inbox"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-700">Henüz talep yok</h3>
                <p className="text-slate-400 mb-6">Aktif bir mahsuplaşma talebiniz bulunmuyor.</p>
                <button onClick={() => setActiveTab('create_request')} className="text-indigo-600 font-bold hover:underline">Şimdi oluştur</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-[500px]">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'create_request' && <CreateRequestView />}
            {activeTab === 'my_requests' && <MyRequestsView />}
        </div>
    );
};
