// Sirius Cycles Component - Advanced Trade Engine Interface
// Path: views/frontend/kullanicilar/Sirius.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Sirius = ({ user, isProfileComplete, setPage }) => {
    // Only check for active cycle, no request creation anymore
    const [activeCycle, setActiveCycle] = React.useState(null);
    const [showIntro, setShowIntro] = React.useState(false); // Modal State
    const [loading, setLoading] = React.useState(true);

    const refreshCycleStatus = () => {
        setLoading(true);
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

                    // Auto-show intro if detected and not seen (logic simplified)
                    // Auto-show intro if detected and not seen (logic simplified)
                    if (data.cycle.status === 'detected') {
                        const seenKey = `sirius_popup_seen_${data.cycle.id}`;
                        if (!localStorage.getItem(seenKey)) {
                            setShowIntro(true);
                            localStorage.setItem(seenKey, 'true');
                        } else {
                            setShowIntro(false);
                        }
                    } else {
                        setShowIntro(false);
                    }
                } else {
                    setActiveCycle(null);
                }
            })
            .catch(err => console.error("Cycle Check Error:", err))
            .finally(() => setLoading(false));
    };

    React.useEffect(() => {
        refreshCycleStatus();
    }, []);

    // --- HANDLERS for Active Cycle Actions ---
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
        } catch (e) {
            console.error(e);
            alert("İşlem sırasında bir hata oluştu: " + e.message);
        }
    };

    const createNewRequest = async () => {
        if (!newRequest.target_name || !newRequest.amount || !newRequest.target_tax_id) {
            return alert("Lütfen firma adı, vergi numarası ve tutar alanlarını doldurun.");
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('action', 'create_request');
            formData.append('target_tax_id', newRequest.target_tax_id);
            formData.append('target_name', newRequest.target_name);
            formData.append('amount', newRequest.amount);
            formData.append('document_type', newRequest.document_type || 'invoice');
            formData.append('description', newRequest.description || '');

            if (newRequest.file) {
                formData.append('file', newRequest.file);
            }

            const res = await fetch('../data/api/sirius.php', {
                method: 'POST',
                // Content-Type header is automatic with FormData
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert("Talebiniz başarıyla oluşturuldu.");
                setNewRequest({
                    target_tax_id: '',
                    target_name: '',
                    amount: '',
                    document_type: 'invoice',
                    description: '',
                    file: null,
                });
                fetchMyRequests(); // Refresh the list of requests
                setActiveTab('my_requests'); // Go to my requests tab
            } else alert(data.message);
        } catch (e) { alert("Hata oluştu: " + e.message); }
        finally { setLoading(false); }
    };

    // --- MODALS (Bank & Contract) ---
    // (Kept identical to previous version, just moved inside/hoisted effectively)
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
        return (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
                {/* WIDER MODAL for Split View */}
                <div className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col md:flex-row shadow-2xl relative overflow-hidden">

                    {/* LEFT SIDE: CONTROLS & INFO */}
                    <div className="w-full md:w-1/3 flex flex-col border-r border-slate-200 bg-white z-10">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center md:block">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Sözleşme Onayı</h3>
                                <p className="text-slate-500 text-sm mt-1 hidden md:block">Lütfen sağ taraftaki resmi belgeyi inceleyiniz.</p>
                            </div>
                            <button onClick={() => setShowContractModal(false)} className="md:hidden text-slate-400">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* Middle Content */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                    <i className="fas fa-info-circle"></i> Yasal Bilgilendirme
                                </h4>
                                <p className="text-sm text-indigo-800 leading-relaxed text-justify">
                                    Bu işlem <strong>5070 Sayılı Elektronik İmza Kanunu</strong> kapsamında yasal geçerliliğe sahiptir.
                                    Onayladığınızda, yan tarafta görüntülenen belge zaman damgası ile imzalanarak sisteme kalıcı olarak kaydedilecektir.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">İçerik Detayı</div>
                                <div className="flex items-center gap-3 text-slate-700 text-sm p-3 rounded-lg bg-slate-50 border hover:bg-white transition">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <i className="fas fa-file-contract"></i>
                                    </div>
                                    <div>
                                        <div className="font-bold">Ana Sözleşme</div>
                                        <div className="text-xs text-slate-500">Temlik / Mahsuplaşma</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 text-sm p-3 rounded-lg bg-slate-50 border hover:bg-white transition">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <i className="fas fa-file-signature"></i>
                                    </div>
                                    <div>
                                        <div className="font-bold">Ek Belgeler</div>
                                        <div className="text-xs text-slate-500">Borç Tasfiye / Zincir Beyanı</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
                            <button
                                onClick={() => { setShowContractModal(false); submitContract(); }}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-pen-nib"></i>
                                Belgeyi Okudum, Onaylıyorum
                            </button>

                            <button
                                onClick={() => setShowContractModal(false)}
                                className="w-full text-slate-500 font-bold py-3 hover:text-slate-800 transition"
                            >
                                Vazgeç
                            </button>
                        </div>
                    </div>

                    {/* RIGHT SIDE: IFRAME PREVIEW */}
                    <div className="hidden md:block w-2/3 bg-slate-200 relative">
                        {/* Loading State / Background */}
                        <div className="absolute inset-0 flex items-center justify-center z-0 text-slate-400">
                            <i className="fas fa-circle-notch fa-spin text-4xl"></i>
                        </div>

                        {/* Toolbar overlay */}
                        <div className="absolute top-4 right-6 z-20 flex gap-2">
                            <a
                                href={`../data/api/sirius.php?action=download_my_contract&cycle_id=${activeCycle.id}`}
                                target="_blank"
                                className="bg-white/90 backdrop-blur text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-white border border-slate-200"
                            >
                                <i className="fas fa-external-link-alt mr-1"></i> Tam Ekran
                            </a>
                        </div>

                        <iframe
                            src={`../data/api/sirius.php?action=download_my_contract&cycle_id=${activeCycle.id}&t=${new Date().getTime()}`}
                            className="w-full h-full border-none relative z-10 bg-white"
                            title="Sözleşme Önizleme"
                        ></iframe>
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
                                                    <React.Fragment>
                                                        <div className="w-full bg-green-500/20 text-green-300 font-bold py-2 rounded-lg text-center text-sm">
                                                            <i className="fas fa-check-circle"></i> Ödeme Onaylandı
                                                        </div>
                                                        <div className="mt-2 text-center">
                                                            <a href={`../data/api/sirius.php?action=download_invoice&cycle_id=${activeCycle.id}`}
                                                                target="_blank"
                                                                className="text-xs text-emerald-200 hover:text-white underline transition flex items-center justify-center gap-1">
                                                                <i className="fas fa-file-pdf"></i> Faturayı İndir
                                                            </a>
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            }
                                        })()}
                                    </div>

                                    {/* Contract Section */}
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                            <i className="fas fa-file-contract"></i> Sözleşme Onayı
                                        </h3>
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

            {/* If NO Active Cycle - Just show an info card, NO buttons */}
            {!activeCycle && (
                <div className="bg-[#0f172a] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/50">
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
                                Nakit akışınız tıkanmasın. Sirius, alacaklarınızı ve borçlarınızı analiz ederek sizi kapalı devre takas döngülerine dahil eder.
                            </p>

                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 mt-6 inline-block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-200 animate-pulse">
                                        <i className="fas fa-sync-alt"></i>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white">Sistem Analizi Devam Ediyor</div>
                                        <div className="text-xs text-indigo-300">Sizin için uygun bir döngü oluştuğunda burada göreceksiniz.</div>
                                    </div>
                                </div>
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
                        </div>
                    </div>
                </div>
            )}

            {/* Steps Info (Always Visible) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                        <i className="fas fa-file-invoice-dollar"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">1. İşlemlerini Yap</h3>
                    <p className="text-slate-500 text-sm">Fatura ve çeklerinizi sisteme kaydedin. Sistem otomatik olarak tarar.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                        <i className="fas fa-network-wired"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">2. Eşleşme Bekle</h3>
                    <p className="text-slate-500 text-sm">Yapay zeka alacaklı olduğunuz firmanın kime borcu olduğunu analiz eder.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                        <i className="fas fa-check-double"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">3. Mahsuplaş</h3>
                    <p className="text-slate-500 text-sm">Döngü tamamlandığında onay verin. Borcunuz ve alacağınız silinsin.</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-[500px]">
            {/* INCOMPLETE PROFILE BLOCKER */}
            {!isProfileComplete && (
                <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center border-2 border-orange-100 relative animate-scale-in">
                        <button
                            onClick={() => setPage && setPage('dashboard')}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>

                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <i className="fas fa-clipboard-list text-3xl text-orange-500"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Profil Bilgilerinizi Tamamlayın</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Yasal mevzuat gereği, Sirius Döngü Sistemine katılabilmek için firma bilgilerinizi (Vergi Dairesi, Adres vb.) eksiksiz doldurmanız gerekmektedir.
                        </p>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-6 text-sm text-left">
                            <strong className="block mb-2 text-orange-800"><i className="fas fa-info-circle mr-1"></i> Neden Gerekli?</strong>
                            <ul className="list-disc list-inside text-orange-700 space-y-1">
                                <li>Otomatik sözleşme oluşturma</li>
                                <li>Resmi mahsuplaşma işlemleri</li>
                                <li>Güvenli ödeme altyapısı</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPage && setPage('profile')}
                                className="flex-1 bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition shadow-lg shadow-brand-200"
                            >
                                <i className="fas fa-user-edit mr-2"></i> Profili Tamamla
                            </button>
                            <button
                                onClick={() => setPage && setPage('dashboard')}
                                className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                            >
                                Vazgeç
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {loading ? (
                <div className="flex justify-center items-center h-64 text-indigo-600">
                    <i className="fas fa-circle-notch fa-spin text-4xl"></i>
                    <span className="ml-3 font-bold">Veriler Analiz Ediliyor...</span>
                </div>
            ) : (
                <DashboardView />
            )}
        </div>
    );
};
