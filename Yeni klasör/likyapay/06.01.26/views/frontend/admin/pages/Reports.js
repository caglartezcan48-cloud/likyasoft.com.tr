// Financial Reports Page
// Path: views/frontend/admin/pages/Reports.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Reports = ({ transactions, setTransactions }) => {

    // Fetch Data
    const [stats, setStats] = React.useState({
        total_users: 0,
        total_volume: 0,
        completed_cycles: 0,
        system_revenue: 0,
        monthly_trend: []
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('../data/api/reports.php');
                const json = await res.json();
                if (json.success) {
                    setStats(json.data);
                }
            } catch (err) {
                console.error("Rapor verisi alınamadı", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Filter State
    const [filters, setFilters] = React.useState({
        startDate: '',
        endDate: '',
        category: 'all', // Transaction Type
        reportType: 'transactions' // transactions, users, cycles
    });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const downloadReport = (type) => {
        if (type === 'excel') {
            // Build Query String
            const params = new URLSearchParams({
                type: 'transactions', // Base type
                all: 'true',
                start_date: filters.startDate,
                end_date: filters.endDate,
                category: filters.category
            });

            // Redirect to Trigger Download
            window.location.href = `../data/api/export.php?${params.toString()}`;
        } else if (type === 'pdf') {
            // Pass filters to print report too if needed (future)
            window.open('../data/api/print_report.php', '_blank');
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <style>{`
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    body { background: white !important; }
                    button, .sidebar, header, .no-print, .filters-section { display: none !important; } 
                    .min-h-screen { height: auto !important; }
                    /* Expand content */
                    .flex-1 { margin: 0 !important; padding: 0 !important; }
                    
                    table { width: 100% !important; border-collapse: collapse; font-size: 10pt; color: black !important; }
                    th, td { border: 1px solid #ddd !important; padding: 8px !important; }
                    /* Cards */
                    .grid { display: flex !important; gap: 20px; margin-bottom: 20px; }
                    .grid > div { flex: 1; border: 1px solid #ccc; box-shadow: none; }
                }
            `}</style>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 filters-section">
                <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase"><i className="fas fa-filter mr-2"></i> Rapor Filtreleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Başlangıç Tarihi</label>
                        <input
                            type="date"
                            name="startDate"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Bitiş Tarihi</label>
                        <input
                            type="date"
                            name="endDate"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Kategori / İşlem Tipi</label>
                        <select
                            name="category"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500 bg-white"
                            value={filters.category}
                            onChange={handleFilterChange}
                        >
                            <option value="all">Tüm Hesap Hareketleri (Genel)</option>
                            <option value="120">120 - Alıcılar (Ticari Alacaklar)</option>
                            <option value="320">320 - Satıcılar (Ticari Borçlar)</option>
                            <option value="600">600 - Yurt İçi Satışlar (Kesilen Faturalar)</option>
                            <option value="153">153 - Ticari Mallar (Gelen Faturalar)</option>
                            <option value="100">100 - Kasa İşlemleri (Nakit)</option>
                            <option value="102">102 - Banka İşlemleri (Ödemeler/Tahsilatlar)</option>
                            <option value="329">329 - Sirius Mahsuplaşma Kayıtları</option>
                            <option value="770">770 - Genel Giderler</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => downloadReport('excel')} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition shadow flex items-center justify-center">
                            <i className="fas fa-file-excel mr-2"></i> Excel İndir
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Finansal Raporlar</h1>
                    <p className="text-gray-500 text-sm">Gerçekleşen mahsuplaşma işlemleri ve sistem özeti.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => downloadReport('pdf')} className="bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-800 transition shadow">
                        <i className="fas fa-print mr-2"></i> Yazdır / PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase">Toplam İşlem Hacmi</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats.total_volume)}
                    </h3>
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                        <i className="fas fa-minus mr-1"></i> Veri Yok
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase">Toplam Komisyon Geliri</p>
                    <h3 className="text-2xl font-bold text-brand-600 mt-2">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(stats.system_revenue)}
                    </h3>
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                        <i className="fas fa-minus mr-1"></i> Veri Yok
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase">Başarılı Döngü</p>
                    <h3 className="text-2xl font-bold text-purple-600 mt-2">{stats.completed_cycles} <span className='text-sm text-gray-400'>/ {parseInt(stats.active_cycles) + parseInt(stats.completed_cycles)}</span></h3>
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                        {stats.active_cycles} Aktif Süreç
                    </div>
                </div>
            </div>

            {/* Monthly Trend Chart Placeholder */}
            {stats.monthly_trend && stats.monthly_trend.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-700 mb-4">Aylık İşlem Hacmi</h3>
                    <div className="flex items-end gap-2 h-40">
                        {stats.monthly_trend.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group relative">
                                <div
                                    className="w-full bg-indigo-100 hover:bg-indigo-200 transition-all rounded-t-lg relative"
                                    style={{ height: `${(m.total / (Math.max(...stats.monthly_trend.map(x => x.total)) || 1)) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                        ₺{parseFloat(m.total).toLocaleString('tr-TR')}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 font-medium">{m.month}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
