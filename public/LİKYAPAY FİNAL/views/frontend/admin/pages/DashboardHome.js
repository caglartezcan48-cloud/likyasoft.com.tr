// Dashboard Home Page
// Path: views/frontend/admin/pages/DashboardHome.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.DashboardHome = ({ users = [], pendings = [], transactions = [], systemTransactions = [] }) => {
    // Dynamic Stats from Props
    // Calculate totals for reuse
    // Include PENDING transactions as requested ("Tüm kayıtlı borç/alacak")
    // Exclude only rejected or cancelled
    // Prepare Chart Data (Last 6 Months)
    const Recharts = window.Recharts || (window.Recharts && window.Recharts.default);
    console.log("DashboardHome: Recharts object:", Recharts);
    const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts || {};

    if (!Recharts) {
        console.warn("Recharts library is not loaded.");
    }

    // Calculate missing totals for summary stats
    // Calculate System Totals
    // Reverting to separate sums based on user feedback (105k Debt != 160k Credit).
    // Including PENDING status because "Sistemde Kayıtlı" implies all active records.
    // Calculate System Totals
    // Reverting to Pure Input Sums (Loaded/Uploaded) based on user's request "Sitede yüklü toplam".
    // This sums exactly what users entered:
    // - Total Debt: Sum of rows where type='debt'
    // - Total Credit: Sum of rows where type='credit'

    const validTxs = (transactions || []).filter(t => t.status !== 'rejected' && t.status !== 'cancelled');

    const totalDebt = validTxs
        .filter(t => t.type === 'debt')
        .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

    const totalCredit = validTxs
        .filter(t => t.type === 'credit')
        .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

    // Fix: Filter specifically for Sirius Service Fees
    const siriusIncome = (systemTransactions || [])
        .filter(t => (t.type === 'income' || t.type === 'Income') && (t.category === 'Sirius Hizmet Bedeli' || t.category === 'Komisyon'))
        .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

    const chartData = React.useMemo(() => {
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = date.toLocaleString('tr-TR', { month: 'short' });
            const monthKey = date.toISOString().slice(0, 7);

            const monthTotal = transactions
                .filter(t => t.date && t.date.slice(0, 7) === monthKey && t.status !== 'rejected')
                .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

            last6Months.push({ name: monthName, value: monthTotal });
        }
        return last6Months;
    }, [transactions]);

    const stats = [
        { id: 1, label: 'Toplam Şirket', value: (users || []).length, icon: 'fa-building', color: 'bg-blue-500', trend: '+' },
        { id: 2, label: 'Bekleyen Onay', value: (pendings || []).length, icon: 'fa-clock', color: 'bg-orange-500', trend: (pendings || []).length > 0 ? '!' : '-' },
        { id: 5, label: 'Toplam Alacaklar', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalCredit), icon: 'fa-arrow-down', color: 'bg-teal-500', trend: '' },
        { id: 6, label: 'Toplam Borçlar', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalDebt), icon: 'fa-arrow-up', color: 'bg-rose-500', trend: '' },
        { id: 3, label: 'Aylık İşlem Hacmi', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format((transactions || []).reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)), icon: 'fa-chart-line', color: 'bg-indigo-500', trend: '+' },
        { id: 4, label: 'Sirius Geliri', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(siriusIncome), icon: 'fa-coins', color: 'bg-amber-500', trend: '+' }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Panel Özeti</h1>
                    <p className="text-gray-500 text-sm mt-1">Sistemin genel durumunu buradan takip edebilirsiniz.</p>
                </div>
                <div className="flex gap-2">
                    {/* Buttons removed as per request */}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map(stat => (
                    <div key={stat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center text-xl ${stat.color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform`}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Chart & Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800">İşlem Hacmi Trendi (TL)</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Toplam Hacim
                        </div>
                    </div>
                    <div style={{ height: 300, width: '100%' }}>
                        {Recharts ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value), 'Hacim']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400 border border-dashed rounded-lg">
                                <p>Grafik kütüphanesi yüklenemedi.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Hızlı Erişim</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <i className="fas fa-plus"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700">Yeni İşlem</div>
                                    <div className="text-xs text-slate-400">Muasebe kaydı oluştur</div>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <i className="fas fa-atom"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700">Sirius Başlat</div>
                                    <div className="text-xs text-slate-400">Takas motorunu çalıştır</div>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <i className="fas fa-file-pdf"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700">Dışa Aktar</div>
                                    <div className="text-xs text-slate-400">Tüm verileri Excel'e al</div>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Financial Pool Summary */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Sistem Finansal Havuzu</h2>
                        <p className="text-gray-400 text-sm max-w-md">Kullanıcıların sisteme yüklediği toplam borç ve alacak tutarlarının anlık durumu.</p>
                    </div>

                    <div className="flex gap-8 w-full md:w-auto">
                        {/* Total Receivables (Approved Credits) */}
                        <div className="flex-1 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 min-w-[150px]">
                            <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <i className="fas fa-arrow-down mr-2"></i> Toplam Alacak
                            </div>
                            <div className="text-2xl font-mono font-bold">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
                                    transactions
                                        .filter(t => t.type === 'credit' && t.status !== 'pending')
                                        .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)
                                )}
                            </div>
                        </div>

                        {/* Total Debts (Approved Debts) */}
                        <div className="flex-1 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 min-w-[150px]">
                            <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <i className="fas fa-arrow-up mr-2"></i> Toplam Borç
                            </div>
                            <div className="text-2xl font-mono font-bold">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
                                    transactions
                                        .filter(t => t.type === 'debt' && t.status !== 'pending')
                                        .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-6">İşlem Hacmi Grafiği</h3>
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                        <div className="text-center">
                            <i className="fas fa-chart-area text-4xl mb-3"></i>
                            <p>Grafik Bileşeni Buraya Gelecek</p>
                        </div>
                    </div>
                </div>

                {/* Pending Tasks */}
                {/* Pending Tasks -> Converted to Recent Transactions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Son İşlemler (Canlı Akış)</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {transactions.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">Henüz işlem yok.</p>
                            </div>
                        ) : (
                            transactions.slice(0, 10).map(tx => (
                                <div key={tx.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${tx.type === 'debt' ? 'bg-red-500' : 'bg-green-500'
                                        }`}>
                                        <i className={`fas ${tx.type === 'debt' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            {/* Logic: Who is the actor? Usually UserID is creator. */}
                                            {/* API returns debter_name (u1) and creditor_name (u2) based on JOINs, need to respect transaction direction */}
                                            {/* If Debt: User(u1) Owes Related(u2). Display: u1 -> u2 */}
                                            {/* If Credit: User(u1) is Owed by Related(u2). Display: u2 -> u1 ? Or User -> Related (Credit) */}
                                            {/* Let's simlpify: Always Source -> Target based on flow */}
                                            {tx.type === 'debt'
                                                ? `${tx.debter_name || 'Bilinmeyen'} -> ${tx.creditor_name || '...'}`
                                                : `${tx.creditor_name || 'Bilinmeyen'} -> ${tx.debter_name || '...'}`
                                            }
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(tx.created_at).toLocaleDateString('tr-TR')} • {tx.type === 'debt' ? 'Borç' : 'Alacak'}
                                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${tx.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {tx.status === 'approved' || tx.status === 'verified' ? 'Onaylı' : 'Bekliyor'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className={`font-bold text-sm ${tx.type === 'debt' ? 'text-red-600' : 'text-green-600'}`}>
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tx.amount)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button className="w-full mt-6 text-brand-600 text-sm font-medium hover:text-brand-800 transition">
                        Tümünü Gör <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
