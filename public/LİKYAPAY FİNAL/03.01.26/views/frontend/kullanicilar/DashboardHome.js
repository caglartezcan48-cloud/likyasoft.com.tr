// Dashboard Home Component
// Path: views/frontend/kullanicilar/DashboardHome.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.DashboardHome = ({ setPage, summary, transactions, user }) => {
    // Notification Logic
    const [incomingTxs, setIncomingTxs] = React.useState([]);
    const [showNotification, setShowNotification] = React.useState(false);

    React.useEffect(() => {
        if (transactions && user) {
            // Find transactions where:
            // 1. I am NOT the creator (someone else created it for me)
            // 2. Status is 'pending'
            const incoming = transactions.filter(t => t.user_id != user.id && t.status === 'pending');

            if (incoming.length > 0) {
                setIncomingTxs(incoming);
                setShowNotification(true);
            }
        }
    }, [transactions, user]);

    const handleDecision = async (id, decision) => {
        try {
            const res = await fetch('/likyapay/data/api/approve_transaction.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: decision })
            });
            const data = await res.json();

            if (data.success) {
                // Remove from list
                const remaining = incomingTxs.filter(t => t.id !== id);
                setIncomingTxs(remaining);

                // If no more items, auto close
                if (remaining.length === 0) {
                    setShowNotification(false);
                    // Reload to reflect approved/rejected status in main table
                    if (window.location.reload) setTimeout(() => window.location.reload(), 500);
                }

                window.showToast?.(`İşlem ${decision === 'approved' ? 'onaylandı' : 'reddedildi'}.`, 'success');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Debt */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div>
                        <h4 className="text-slate-500 font-medium mb-1">Toplam Borcunuz</h4>
                        <div className="text-3xl font-bold text-slate-800">₺{summary.debt.toLocaleString()}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 w-fit px-3 py-1 rounded-full text-xs font-bold">
                        <i className="fas fa-arrow-up"></i>
                        <span>Aktif</span>
                    </div>
                </div>

                {/* Total Credit */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div>
                        <h4 className="text-slate-500 font-medium mb-1">Toplam Alacağınız</h4>
                        <div className="text-3xl font-bold text-slate-800">₺{summary.credit.toLocaleString()}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full text-xs font-bold">
                        <i className="fas fa-arrow-down"></i>
                        <span>Tahsil Edilecek</span>
                    </div>
                </div>

                {/* Net Balance */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div>
                        <h4 className="text-slate-500 font-medium mb-1">Sirius Potansiyeli</h4>
                        <div className="text-3xl font-bold text-brand-600">{summary.cycleCount} Döngü</div>
                    </div>
                    <button onClick={() => setPage('sirius')} className="mt-4 flex items-center gap-2 text-brand-600 hover:text-brand-800 text-sm font-medium transition">
                        <span>Döngüleri İncele</span>
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Yeni Borç veya Alacak Ekleyin</h3>
                        <p className="text-slate-300 max-w-lg">Sisteme fatura veya sözleşmelerinizi yükleyerek Sirius döngülerine katılın ve nakitsiz mahsuplaşmaya başlayın.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setPage('invoices')} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition shadow-lg flex items-center gap-2 whitespace-nowrap">
                            <i className="fas fa-plus"></i>
                            Veri Yükle
                        </button>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Son Hareketler</h3>
                    <button className="text-sm text-brand-600 hover:underline">Tümünü Gör</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {transactions && transactions.length > 0 ? (
                        transactions.slice(0, 5).map(t => (
                            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <i className={`fas ${t.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800">{t.party}</h4>
                                        <p className="text-xs text-slate-500">{t.status}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`block font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        ₺{t.amount.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-slate-400">{t.date}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <i className="fas fa-inbox text-3xl mb-2 opacity-50"></i>
                            <p>Henüz işlem kaydı yok.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Incoming Transaction Notification Modal */}
            {showNotification && incomingTxs.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                        {/* Header */}
                        <div className="bg-brand-600 p-6 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                                <i className="fas fa-bell text-3xl shake-animation"></i>
                            </div>
                            <h3 className="text-xl font-bold">Yeni İşlem Bildirimi</h3>
                            <p className="text-brand-100 text-sm mt-1">Lütfen aşağıdaki işlemleri inceleyip onaylayınız.</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                            {incomingTxs.map((tx, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            <i className={`fas ${tx.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-800 text-sm">
                                                <span className="font-bold">{tx.party}</span> firması, size <span className="font-bold">₺{parseFloat(tx.amount).toLocaleString()}</span> tutarında bir <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'credit' ? 'Alacak' : 'Borç'}</span> işlemiştir.
                                            </p>
                                            <div className="mt-2 text-xs text-slate-500 flex gap-3">
                                                <span><i className="far fa-calendar-alt mr-1"></i> {tx.date}</span>
                                                {tx.description && <span><i className="far fa-comment-alt mr-1"></i> {tx.description}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-1 pt-3 border-t border-slate-200">
                                        <button
                                            onClick={() => handleDecision(tx.id, 'rejected')}
                                            className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold transition">
                                            İtiraz Et
                                        </button>
                                        <button
                                            onClick={() => handleDecision(tx.id, 'approved')}
                                            className="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-bold transition shadow-md shadow-green-200">
                                            Onayla
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <button
                                onClick={() => setShowNotification(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                            >
                                Şimdilik Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
