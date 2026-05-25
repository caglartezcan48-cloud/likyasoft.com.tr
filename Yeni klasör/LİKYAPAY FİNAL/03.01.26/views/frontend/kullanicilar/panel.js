// User Panel Container
// Path: views/frontend/kullanicilar/panel.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Panel = ({ onLogout, user }) => {
    const [activePage, setActivePage] = React.useState('dashboard');
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    // Shared Data State
    const [transactions, setTransactions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch Transactions
    React.useEffect(() => {
        fetch('/likyapay/data/api/transactions.php')
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
        fetch('/likyapay/data/api/transactions.php', {
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
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

        const credit = transactions
            .filter(t => t.type === 'credit')
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
            case 'profile':
                return <window.Kullanicilar.Profile user={user} />;
            default:
                return <div className="p-8">Sayfa Yapım Aşamasında</div>;
        }
    };

    // Remove old components map usage since we now use renderContent
    // const ActiveComponent = ... 

    const Sidebar = window.Kullanicilar.Sidebar;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">

            <Sidebar
                activePage={activePage}
                setPage={setActivePage}
                isMobileOpen={isMobileOpen}
                toggleMobile={() => setIsMobileOpen(!isMobileOpen)}
                user={user}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
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
                <header className="hidden lg:flex bg-white/80 backdrop-blur border-b border-slate-200 px-8 py-4 justify-between items-center sticky top-0 z-30">
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
        </div>
    );
};
