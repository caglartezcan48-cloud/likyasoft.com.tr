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
    const [showIntro, setShowIntro] = React.useState(false); // Modal State

    const [searchLoading, setSearchLoading] = React.useState(false);

    // Fetch existing requests
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('../data/api/sirius.php?action=list_requests');
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

    const refreshCycleStatus = () => {
        fetch('../data/api/sirius.php?action=check_my_cycle')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.in_cycle) {
                    setActiveCycle({
                        ...data.cycle,
                        my_tax_id: data.my_tax_id,
                        my_company_name: data.my_company_name,
                        my_details: data.my_details,
                        my_debtor: data.my_debtor,
                        my_creditor: data.my_creditor,
                        show_mahsup: data.show_mahsup
                    });

                    // Auto-show intro if new and not completed
                    // Only show intro if we haven't seen it in this session?
                    // For now, let's just rely on the existing logic or keep it simple.
                    if (data.cycle.status === 'detected' && !activeCycle) {
                        setShowIntro(true);
                    }
                }
            })
            .catch(err => console.error("Cycle Check Error:", err));
    };

    React.useEffect(() => {
        fetchRequests();
        refreshCycleStatus();
    }, []);

    const handleSearchFirm = async () => {
        if (newRequest.target_tax_id.length < 10) return alert("Lütfen geçerli bir Vergi No girin.");
        setSearchLoading(true);
        try {
            // Mock Search or API Call to search_companies.php
            const res = await fetch(`../data/api/search_companies.php?tax_id=${newRequest.target_tax_id}`);
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

        setLoading(true);
        try {
            const res = await fetch('../data/api/sirius.php', {
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
        } finally {
            setLoading(false);
        }
    };

    // Old handlers removed to prevent conflict with updated workflow logic defined in sub-components.
    // The actual handlers should be defined where they are used or hoist correctly if needed.
    // However, looking at the code, DashboardView is defined INSIDE Sirius component, so it can access variables.
    // But the handlers handlePayFee and handleSignContract were defined at top level (lines 206-258 in previous steps?)
    // Let's consolidated them.

    // Redefining them here CORRECTLY for the scope:

    const [showBankModal, setShowBankModal] = React.useState(false);
    const [showContractModal, setShowContractModal] = React.useState(false);

    const handlePayFeeClick = () => setShowBankModal(true);
    const handleSignContractClick = () => setShowContractModal(true);

    const submitPayment = async () => {
        try {
            const res = await fetch('../data/api/sirius.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'submit_payment', cycle_id: activeCycle.id })
            });
            const data = await res.json();
            if (data.success) {
                alert("Ödeme bildirimi başarıyla alındı. Yönetici onaylayacaktır.");
                setShowBankModal(false);
                refreshCycleStatus();
            } else alert(data.message);
        } catch (e) { alert("Hata"); }
    };

    const submitContract = async () => {
        try {
            const res = await fetch('../data/api/sirius.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'sign_contract', cycle_id: activeCycle.id })
            });
            const data = await res.json();
            if (data.success) {
                alert("Sözleşme başarıyla imzalandı.");
                setShowContractModal(false);
                refreshCycleStatus();
            } else alert(data.message);
        } catch (e) { alert("Hata"); }
    };
    // --- SUB-COMPONENTS ---

    // --- MODALS ---

    // --- MODALS ---

    const BankModal = () => (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="bg-slate-900 p-6 text-white text-center">
                    <h3 className="text-xl font-bold">Hizmet Bedeli Ödemesi</h3>
                    <p className="text-slate-400 text-sm">Lütfen aşağıda belirtilen hesaba ödemeyi yapınız.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Banka / Şube</div>
                        <div className="text-slate-800 font-bold">Ziraat Bankası / Genel Merkez</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">IBAN</div>
                        <div className="text-slate-800 font-mono font-bold text-lg select-all">TR12 0001 0002 0003 0004 0005 00</div>
                        <div className="text-xs text-indigo-600 mt-1 cursor-pointer hover:underline" onClick={() => navigator.clipboard.writeText("TR120001000200030004000500")}>Kopyala</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Alıcı Adı</div>
                        <div className="text-slate-800 font-bold">LikyaPay Teknoloji A.Ş.</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800 text-sm">
                        <i className="fas fa-info-circle mr-2"></i>
                        Açıklama kısmına mutlaka <strong>SIRIUS-{activeCycle?.id}</strong> yazınız.
                    </div>
                    <button
                        onClick={() => { setShowBankModal(false); submitPayment(); }}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition"
                    >
                        Ödemeyi Yaptım, Onayla
                    </button>
                    <button
                        onClick={() => setShowBankModal(false)}
                        className="w-full text-slate-500 font-bold py-3 hover:text-slate-700 transition"
                    >
                        Vazgeç
                    </button>
                </div>
            </div>
        </div>
    );

    const ContractModal = () => {
        const [activeDocTab, setActiveDocTab] = React.useState('temlik');

        return (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="bg-slate-50 border-b p-4 flex justify-between items-center z-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Sözleşme Onayı</h3>
                            <p className="text-xs text-slate-500">
                                {activeCycle?.show_mahsup
                                    ? 'İşlemin tamamlanması için her iki belgeyi de onaylamanız gerekmektedir.'
                                    : 'Lütfen Alacağın Devri (Temlik) formunu inceleyip onaylayınız.'}
                            </p>
                        </div>
                        <button onClick={() => setShowContractModal(false)} className="text-slate-400 hover:text-slate-600">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b bg-slate-100/50">
                        <button
                            onClick={() => setActiveDocTab('temlik')}
                            className={`flex-1 py-4 text-sm font-bold transition flex items-center justify-center gap-2 ${activeDocTab === 'temlik' ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm z-10' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <i className="fas fa-file-contract"></i> 1. Alacağın Devri (Temlik) Formu
                        </button>

                        {activeCycle?.show_mahsup && (
                            <button
                                onClick={() => setActiveDocTab('mahsup')}
                                className={`flex-1 py-4 text-sm font-bold transition flex items-center justify-center gap-2 ${activeDocTab === 'mahsup' ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm z-10' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <i className="fas fa-balance-scale"></i> 2. Mahsuplaşma Formu
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-serif text-slate-900 leading-relaxed text-sm">
                        {activeDocTab === 'temlik' && (
                            <div className="max-w-3xl mx-auto bg-white p-8 shadow-sm border border-slate-200">
                                <h4 className="text-center font-bold text-lg mb-8 uppercase underline">Alacağın Devri (Temlik) Sözleşmesi</h4>
                                <div className="space-y-6 text-justify">
                                    <p>
                                        İşbu Aleğain Devri (Temlik) Sözleşmesi ("Sözleşme"), aşağıda imzası bulunan taraflar arasında, <strong>{new Date().toLocaleDateString('tr-TR')}</strong> tarihinde akdedilmiştir.
                                    </p>


                                    <div className="space-y-4">
                                        <h5 className="font-bold underline text-center mb-4">1. TARAFLAR VE İLGİLİ ŞİRKETLER</h5>

                                        <div className="space-y-4">
                                            {/* Devreden */}
                                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg relative overflow-hidden">
                                                <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] uppercase font-bold px-2 py-1 rounded-bl">Devir Eden Şirket (Siz)</div>
                                                <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
                                                    {activeCycle?.my_details?.name?.toLocaleUpperCase('tr-TR')}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                                                    <div><span className="font-semibold">Vergi No:</span> {activeCycle?.my_details?.tax_id}</div>
                                                    <div><span className="font-semibold">V. Dairesi:</span> {activeCycle?.my_details?.tax_office || '---'}</div>
                                                    <div><span className="font-semibold">Mersis No:</span> {activeCycle?.my_details?.mersis_no || '---'}</div>
                                                    <div><span className="font-semibold">Ticaret Sicil:</span> {activeCycle?.my_details?.trade_registry_no || '---'}</div>
                                                    <div className="col-span-1 sm:col-span-2"><span className="font-semibold">Adres:</span> {activeCycle?.my_details?.address || 'Adres bilgisi bulunamadı'}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Borçlu */}
                                                <div className="bg-red-50/50 border border-red-100 p-4 rounded-lg relative">
                                                    <div className="text-[10px] uppercase font-bold text-red-500 mb-2 border-b border-red-100 pb-1">Borçlu Şirket (Muhatap)</div>
                                                    <div className="font-bold text-slate-900 text-sm mb-2">{activeCycle?.my_debtor?.name?.toLocaleUpperCase('tr-TR') || 'BİLİNMİYOR'}</div>
                                                    <div className="space-y-1 text-xs text-slate-600">
                                                        <div><span className="font-semibold">VN:</span> {activeCycle?.my_debtor?.tax_id || '---'} / {activeCycle?.my_debtor?.tax_office}</div>
                                                        <div><span className="font-semibold">Mersis:</span> {activeCycle?.my_debtor?.mersis_no || '---'}</div>
                                                        <div className="truncate" title={activeCycle?.my_debtor?.address}><span className="font-semibold">Adres:</span> {activeCycle?.my_debtor?.address || '---'}</div>
                                                    </div>
                                                </div>

                                                {/* Devralan */}
                                                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg relative">
                                                    <div className="text-[10px] uppercase font-bold text-indigo-600 mb-2 border-b border-indigo-100 pb-1">Devir Alan Şirket (Yeni Alacaklı)</div>
                                                    <div className="font-bold text-slate-900 text-sm mb-2">{activeCycle?.my_creditor?.name?.toLocaleUpperCase('tr-TR') || 'BİLİNMİYOR'}</div>
                                                    <div className="space-y-1 text-xs text-slate-600">
                                                        <div><span className="font-semibold">VN:</span> {activeCycle?.my_creditor?.tax_id || '---'} / {activeCycle?.my_creditor?.tax_office}</div>
                                                        <div><span className="font-semibold">Mersis:</span> {activeCycle?.my_creditor?.mersis_no || '---'}</div>
                                                        <div className="truncate" title={activeCycle?.my_creditor?.address}><span className="font-semibold">Adres:</span> {activeCycle?.my_creditor?.address || '---'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-6">
                                        <h5 className="font-bold underline">2. KONU</h5>
                                        <p className="bg-yellow-50 p-3 border border-yellow-200 rounded text-slate-900 font-medium leading-relaxed text-justify">
                                            <strong>{activeCycle?.my_company_name?.toLocaleUpperCase('tr-TR')}</strong> şirketi,
                                            <strong>{activeCycle?.my_debtor?.name?.toLocaleUpperCase('tr-TR')}</strong> şirketinden alacağı olan
                                            <strong> {parseFloat(activeCycle?.volume).toLocaleString('tr-TR')} TL</strong>'yi,
                                            kendi borcuna karşılık olmak üzere işbu sözleşme ile
                                            <strong> {activeCycle?.my_creditor?.name?.toLocaleUpperCase('tr-TR')}</strong> şirketine devir etmiştir.
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Bu devir işlemi, Sirius Döngü Sistemi (Döngü No: <strong>#{activeCycle?.code}</strong>) altyapısı kullanılarak,
                                            Türk Borçlar Kanunu'nun 183. maddesi uyarınca taraflar arasında elektronik ortamda gerçekleştirilmiştir.
                                        </p>
                                    </div>

                                    <div className="bg-slate-100 p-4 border border-slate-300">
                                        <h5 className="font-bold mb-2">Temlike Konu Alacak Tutarı:</h5>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span>Toplam Tutar:</span> <span className="font-bold font-mono">₺{parseFloat(activeCycle?.volume).toLocaleString('tr-TR')}</span>
                                            <span>Döngü Referansı:</span> <span className="font-bold font-mono">#{activeCycle?.code}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="font-bold underline">3. BEYAN VE TAAHHÜTLER</h5>
                                        <p>
                                            DEVREDEN, işbu Sözleşme konusu alacağın var olduğunu, işbu alacak üzerinde herhangi bir rehin, haciz veya başkaca bir takyidat bulunmadığını,
                                            alacağı daha önce başka bir kişiye devretmediğini beyan ve taahhüt eder.
                                        </p>
                                    </div>

                                    <p className="mt-8 pt-8 border-t border-slate-300 text-center italic">
                                        (İşbu belge elektronik ortamda zaman damgası ile imzalanmıştır.)
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeDocTab === 'mahsup' && (
                            <div className="max-w-3xl mx-auto bg-white p-8 shadow-sm border border-slate-200">
                                <h4 className="text-center font-bold text-lg mb-8 uppercase underline">Mahsuplaşma Protokolü</h4>
                                <div className="space-y-6 text-justify">
                                    <p>
                                        İşbu Mahsuplaşma Protokolü ("Protokol"), Sirius Döngü Sistemi kapsamında tarafların karşılıklı borç ve alacaklarının takas ve mahsup edilmesi amacıyla düzenlenmiştir.
                                    </p>

                                    <div className="space-y-2">
                                        <h5 className="font-bold underline">1. TARAFLAR VE KONU</h5>
                                        <p>
                                            <strong>{activeCycle?.my_details?.name?.toLocaleUpperCase('tr-TR')}</strong> (Vergi No: {activeCycle?.my_details?.tax_id}), Sirius Döngü Sistemi'nde (Cycle #{activeCycle?.code}) oluşan alacağını temlik ederek elde ettiği alacak hakkını,
                                            yine aynı sistem içerisinde tespit edilen <strong>{activeCycle?.my_creditor?.name?.toLocaleUpperCase('tr-TR')}</strong> firmasına olan borcuna karşılık mahsup etmeyi kabul ve beyan eder.
                                        </p>
                                    </div>

                                    <div className="bg-slate-100 p-4 border border-slate-300 my-4">
                                        <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
                                            <span>Mahsup Edilecek Borç Tutarı:</span>
                                            <span className="font-bold font-mono text-red-600">- ₺{parseFloat(activeCycle?.volume).toLocaleString('tr-TR')}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
                                            <span>Temlik Edilen Alacak Tutarı:</span>
                                            <span className="font-bold font-mono text-green-600">+ ₺{parseFloat(activeCycle?.volume).toLocaleString('tr-TR')}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                            <span>KALAN BORÇ:</span>
                                            <span className="font-mono text-slate-800">₺0,00</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="font-bold underline">2. SONUÇ</h5>
                                        <p>
                                            Taraflar, yukarıda belirtilen tutarların karşılıklı olarak mahsup edildiğini, bu işlem sonucunda kullanıcı nezdinde ilgili borç ilişkisinin sona erdiğini,
                                            borcun ifa edilmiş sayıldığını ve birbirlerini bu tutar nispetinde gayrikabili rücu ibra ettiklerini kabul ederler.
                                        </p>
                                    </div>

                                    <p className="mt-8 pt-8 border-t border-slate-300 text-center italic">
                                        (İşbu belge elektronik ortamda zaman damgası ile imzalanmıştır.)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t bg-white z-10 flex gap-4 items-center flex-col sm:flex-row">
                        <div className="text-xs text-slate-500 flex-1">
                            <i className="fas fa-lock mr-1"></i>
                            Bu işlem <strong>5070 Sayılı Elektronik İmza Kanunu</strong> kapsamında yasal geçerliliğe sahiptir.
                            <br />
                            IP: {window.myIp || 'Kaydediliyor...'} | TS: {new Date().toISOString()}
                        </div>
                        <button
                            onClick={() => { setShowContractModal(false); submitContract(); }}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition w-full sm:w-auto shadow-lg shadow-indigo-200"
                        >
                            <i className="fas fa-file-signature mr-2"></i>
                            {activeCycle?.show_mahsup ? 'Temlik ve Mahsuplaşma Belgelerini Onaylıyorum' : 'Alacağın Devri (Temlik) Sözleşmesini Onaylıyorum'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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
                                <p className="text-emerald-100 font-medium">Sistem sizi karlı bir takas döngüsüne dahil etti. <span className="inline-block bg-white/20 px-2 py-0.5 rounded text-white font-mono text-sm ml-2">#{activeCycle.code || activeCycle.id}</span></p>
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

                        {/* WORKFLOW ACTIONS */}
                        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            {/* PROCESSING STAGE (Payment + Contract) */}
                            {(activeCycle.status === 'processing' || activeCycle.status === 'payment_stage' || activeCycle.status === 'legal_stage') && (
                                <div className="space-y-6">
                                    {/* Payment Section */}
                                    {/* Payment Section */}
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                            <i className="fas fa-credit-card"></i> Hizmet Bedeli Ödemesi
                                        </h3>
                                        <div className="flex items-center justify-between mb-4 text-sm">
                                            <span>Hizmet Bedeli (%3 + KDV)</span>
                                            <span className="font-bold">₺{(parseFloat(activeCycle.volume) * 0.03 * 1.2).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                                        </div>
                                        {(() => {
                                            const myPayStatus = activeCycle.payment_status[activeCycle.my_tax_id] || 'pending';
                                            if (myPayStatus === 'pending') {
                                                return (
                                                    <button onClick={handlePayFeeClick} className="w-full bg-white text-emerald-600 font-bold py-2 rounded-lg hover:bg-emerald-50 transition text-sm">
                                                        💳 Hizmet Bedelini Öde
                                                    </button>
                                                );
                                            } else if (myPayStatus === 'submitted') {
                                                return (
                                                    <button disabled className="w-full bg-yellow-500/20 text-yellow-200 font-bold py-2 rounded-lg cursor-not-allowed text-sm">
                                                        <i className="fas fa-clock"></i> Ödeme Bildirildi - Onay Bekliyor
                                                    </button>
                                                );
                                            } else if (myPayStatus === 'approved') {
                                                return (
                                                    <div className="w-full bg-green-500/20 text-green-300 font-bold py-2 rounded-lg text-center text-sm">
                                                        <i className="fas fa-check-circle"></i> Ödeme Onaylandı
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>

                                    {/* Contract Section */}
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                            <i className="fas fa-file-contract"></i> Sözleşme Onayı
                                        </h3>
                                        <div className="bg-white/90 text-slate-800 p-3 rounded mb-3 text-xs h-24 overflow-y-auto leading-relaxed">
                                            <strong>TEMLİK VE MAHSUPLAŞMA SÖZLEŞMESİ</strong><br />
                                            İşbu sözleşme, Sirius Döngü Sistemi aracılığıyla tespit edilen borç/alacak ilişkilerinin...
                                        </div>
                                        {(() => {
                                            const myLegalStatus = activeCycle.legal_status[activeCycle.my_tax_id] || 'pending';
                                            if (myLegalStatus === 'pending') {
                                                return (
                                                    <button onClick={handleSignContractClick} className="w-full bg-emerald-500/20 border border-emerald-400/30 text-white font-bold py-2 rounded-lg hover:bg-emerald-500/30 transition text-sm flex items-center justify-center gap-2">
                                                        <i className="fas fa-pen-nib"></i> Sözleşmeyi İmzala
                                                    </button>
                                                );
                                            } else if (myLegalStatus === 'signed') {
                                                return (
                                                    <button disabled className="w-full bg-yellow-500/20 text-yellow-200 font-bold py-2 rounded-lg cursor-not-allowed text-sm">
                                                        <i className="fas fa-clock"></i> İmzalandı - Yönetici Onayı Bekliyor
                                                    </button>
                                                );
                                            } else if (myLegalStatus === 'approved') {
                                                return (
                                                    <div className="w-full bg-green-500/20 text-green-300 font-bold py-2 rounded-lg text-center text-sm">
                                                        <i className="fas fa-check-circle"></i> Sözleşme Onaylandı
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* COMPLETED */}
                            {activeCycle.status === 'completed' && (
                                <div className="text-center py-4">
                                    <div className="text-5xl mb-2">🎉</div>
                                    <h3 className="font-bold text-2xl">İşlem Başarıyla Tamamlandı!</h3>
                                    <p className="text-emerald-100">Borçlarınız silindi ve muhasebe kayıtları güncellendi.</p>
                                </div>
                            )}

                            {activeCycle.status === 'detected' && (
                                <div className="text-center py-2 opacity-80">
                                    <i className="fas fa-clock mb-2"></i>
                                    <p>Yönetici onayı bekleniyor...</p>
                                </div>
                            )}
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
        </div >
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
            {/* INTRO MODAL */}
            {showIntro && activeCycle && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-[fadeIn_0.3s_ease-out]">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <h2 className="text-2xl font-black text-white relative z-10">✨ Tebrikler!</h2>
                            <p className="text-indigo-100 relative z-10">Sirius Döngü Sistemine Dahil Oldunuz</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="text-center">
                                <div className="inline-block bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-mono font-bold mb-4">
                                    Döngü Kodu: #{activeCycle.code}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">
                                    ₺{parseFloat(activeCycle.volume).toLocaleString('tr-TR')}
                                </h3>
                                <p className="text-slate-500 text-sm">Tutarındaki borcunuz bu döngü ile silinecektir.</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Ödenecek Hizmet Bedeli</span>
                                    <span className="font-bold text-slate-800">₺{(parseFloat(activeCycle.volume) * 0.03 * 1.2).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">İmzalanacak Sözleşme</span>
                                    <span className="font-bold text-slate-800">Temlik & Mahsuplaşma</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowIntro(false)}
                                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                            >
                                Detayları İncele ve Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBankModal && <BankModal />}
            {showContractModal && <ContractModal />}

            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'create_request' && <CreateRequestView />}
            {activeTab === 'my_requests' && <MyRequestsView />}
        </div>
    );
};
