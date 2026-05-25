// User Panel Container
// Path: views/frontend/kullanicilar/panel.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Panel = ({ onLogout, user }) => {
    const [activePage, setActivePage] = React.useState('dashboard');
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    // Shared Data State
    const [transactions, setTransactions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Sirius Notification State
    const [showSiriusNotification, setShowSiriusNotification] = React.useState(false);
    const [siriusCycleInfo, setSiriusCycleInfo] = React.useState(null);

    // Check Sirius Cycle Status on Load
    React.useEffect(() => {
        fetch('../data/api/sirius.php?action=check_my_cycle')
            .then(res => res.json())
            .then(data => {
                // If user is effectively in a cycle (and it's active/created), show popup
                if (data.success && data.in_cycle) {
                    setSiriusCycleInfo(data.cycle);
                    setShowSiriusNotification(true);
                }
            })
            .catch(err => console.error("Sirius Check Error:", err));
    }, []);

    // Fetch Transactions
    React.useEffect(() => {
        fetch('../data/api/transactions.php')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Ensure numbers are float
                    const formatted = data.data.map(item => ({
                        ...item,
                        amount: parseFloat(item.amount)
                    }));
                    setTransactions(formatted);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("API Error:", err);
                setLoading(false);
            });
    }, []);

    const addTransaction = (newTx) => {
        // Optimistic UI Update
        setTransactions(prev => [newTx, ...prev]);

        // Send to API
        fetch('../data/api/transactions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTx)
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    alert("Kayıt veritabanına eklenemedi: " + res.message);
                    // Rollback if needed
                } else {
                    // Update ID with real ID from DB
                    setTransactions(prev => prev.map(t => t.id === newTx.id ? { ...t, id: res.id } : t));
                }
            })
            .catch(err => console.error("Save Error:", err));
    };

    // Calculate Summary
    const summary = React.useMemo(() => {
        // Since API now returns correct 'type' (Mapped from effective_type), 
        // we just sum them up directly.
        // debt = My output
        // credit = My input

        const debt = transactions
            .filter(t => t.type === 'debt')
            // STRICT FILTER: Exclude LikyaPay Service Fees from user balance
            .filter(t => {
                const p = (t.party || '').toLowerCase();
                const d = (t.description || '').toLowerCase();
                // Exclude if 'LikyaPay' is the party or description contains fee keywords
                if (p.includes('likyapay') || p.includes('likya pay')) return false;
                if (d.includes('hizmet bedeli') || d.includes('komisyon') || d.includes('sirius-')) return false;
                return true;
            })
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

        const credit = transactions
            .filter(t => t.type === 'credit')
            // Same filter for credit just in case, to keep balance pure trade
            .filter(t => {
                const p = (t.party || '').toLowerCase();
                const d = (t.description || '').toLowerCase();
                if (p.includes('likyapay') || p.includes('likya pay')) return false;
                if (d.includes('hizmet bedeli') || d.includes('komisyon') || d.includes('sirius-')) return false;
                return true;
            })
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

        return {
            debt,
            credit,
            balance: credit - debt,
            cycleCount: Math.floor(transactions.length / 3) + 1
        };
    }, [transactions]);

    // Component Registry - Wrapped to pass props
    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <window.Kullanicilar.DashboardHome setPage={setActivePage} summary={summary} transactions={transactions} user={user} />;
            case 'invoices':
                return <window.Kullanicilar.Invoices transactions={transactions} onAddTransaction={addTransaction} />;
            case 'sirius':
                return <window.Kullanicilar.Sirius />;
            case 'archive':
                return <window.Kullanicilar.Archive />;
            case 'profile':
                return <window.Kullanicilar.Profile user={user} />;
            default:
                return <div className="p-8">Sayfa Yapım Aşamasında</div>;
        }
    };

    // Remove old components map usage since we now use renderContent
    // const ActiveComponent = ... 

    const Sidebar = window.Kullanicilar.Sidebar;

    // --- CHECK USER STATUS ---
    if (user && (user.status === 'pending' || user.status === 'Ön Kayıt' || user.status === 'pre_approved')) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-hourglass-half text-3xl text-orange-500 animate-pulse"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Üyeliğiniz İnceleniyor</h2>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        Kayıt başvurunuz başarıyla alınmıştır. Yönetici onayı beklemektesiniz.
                        <br />Onay süreci genellikle <strong>1-2 saat</strong> içinde tamamlanır.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-sm text-left">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-500">Firma Adı:</span>
                            <span className="font-bold text-slate-800">{user.title || user.name}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-500">Vergi No:</span>
                            <span className="font-bold text-slate-800">{user.taxNo || user.tax_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Durum:</span>
                            <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs uppercase">Onay Bekliyor</span>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="text-slate-500 hover:text-slate-800 font-medium transition flex items-center justify-center gap-2 mx-auto"
                    >
                        <i className="fas fa-arrow-left"></i> Çıkış Yap
                    </button>
                </div>
            </div>
        );
    }
    // Block Banned Users
    if (user && user.status === 'banned') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border-2 border-red-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-ban text-2xl text-red-600"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Erişim Engellendi</h2>
                    <p className="text-slate-600 mb-6">Hesabınız yönetici tarafından askıya alınmıştır.</p>
                    <button onClick={onLogout} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold">Çıkış</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">

            <Sidebar
                activePage={activePage}
                setPage={setActivePage}
                isMobileOpen={isMobileOpen}
                toggleMobile={() => setIsMobileOpen(!isMobileOpen)}
                user={user}
                onLogout={onLogout}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileOpen(true)} className="text-slate-500 hover:text-brand-600">
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                        <span className="font-bold text-slate-800">Likya Pay</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'M'}
                    </div>
                </header>

                {/* Top Bar (Desktop) */}
                <header className="hidden md:flex bg-white/80 backdrop-blur border-b border-slate-200 px-8 py-4 justify-between items-center sticky top-0 z-30">
                    <h2 className="text-xl font-bold text-slate-800 capitalize">
                        {activePage === 'dashboard' ? 'Genel Bakış' :
                            activePage === 'invoices' ? 'Borç ve Alacaklar' : activePage}
                    </h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-600">
                            <i className="far fa-calendar-alt"></i>
                            <span>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <button onClick={onLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-2 transition text-sm font-medium">
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Çıkış Yap</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>

            {/* Sirius Auto Notification Modal */}
            {showSiriusNotification && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden animate-scale-in border border-indigo-100">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-tr-full -z-0 opacity-50"></div>

                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                                <i className="fas fa-star text-2xl text-white animate-pulse"></i>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Tebrikler! Sirius Döngüsündesiniz
                            </h3>

                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                Sistemimiz sizi uygun bir ticaret döngüsüne yerleştirdi.
                                Borçlarınızı mahsuplaşmak ve süreci başlatmak için detayları inceleyin.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setShowSiriusNotification(false);
                                        setActivePage('sirius');
                                    }}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-md shadow-indigo-200 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <span>Detayları İncele</span>
                                    <i className="fas fa-arrow-right text-sm"></i>
                                </button>

                                <button
                                    onClick={() => setShowSiriusNotification(false)}
                                    className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Daha Sonra
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
