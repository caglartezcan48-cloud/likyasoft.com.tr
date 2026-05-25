
window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar = window.Kullanicilar || {};
window.Kullanicilar.Archive = () => {
    // Tabs: 'sirius' | 'general'
    const [activeTab, setActiveTab] = React.useState('general');

    const [cycles, setCycles] = React.useState([]);
    const [generalInvoices, setGeneralInvoices] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                // Fetch Sirius Cycles
                const res1 = await fetch('../data/api/sirius.php?action=list_completed_cycles');
                const json1 = await res1.json();
                if (json1.success && Array.isArray(json1.data)) setCycles(json1.data);

                // Fetch General Invoices
                const res2 = await fetch('../data/api/archive.php?action=list_my_invoices');
                const json2 = await res2.json();
                if (json2.success && Array.isArray(json2.data)) setGeneralInvoices(json2.data);
            } catch (e) {
                console.error("Archive fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleDownload = (cycleId) => {
        if (!cycleId) return;
        window.open(`../data/api/sirius.php?action=download_my_contract&cycle_id=${cycleId}`, '_blank');
    };

    const handleInvoiceDownload = (cycleId) => {
        if (!cycleId) return;
        window.open(`../data/api/sirius.php?action=download_invoice&cycle_id=${cycleId}`, '_blank');
    };

    const handleGeneralDownload = (url) => {
        window.open(url, '_blank');
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Yükleniyor...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 border-gray-100 flex items-center justify-between">
                <span>Evrak Arşivi</span>
                <div className="flex space-x-2 text-sm">
                    <button
                        onClick={() => setActiveTab('sirius')}
                        className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'sirius' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Sirius Döngüleri
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'general' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Genel Faturalar
                    </button>
                </div>
            </h1>

            {/* TAB: SIRIUS */}
            {activeTab === 'sirius' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                    {!cycles || cycles.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <i className="fas fa-folder-open text-4xl mb-4 text-blue-200"></i>
                            <p>Henüz tamamlanmış bir Sirius işleminiz bulunmuyor.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">Tamamlanma Tarihi</th>
                                    <th className="p-4">Döngü Kodu</th>
                                    <th className="p-4 text-right">İşlem Hacmi</th>
                                    <th className="p-4 text-center">Belge</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {cycles.map(c => (
                                    <tr key={c?.id || Math.random()} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-mono text-xs">{c?.completed_at ? new Date(c.completed_at).toLocaleDateString('tr-TR') : '-'}</td>
                                        <td className="p-4 font-bold text-gray-800">#{c?.cycle_code || '-'}</td>
                                        <td className="p-4 text-right font-bold text-gray-600">
                                            {c?.total_volume ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(c.total_volume) : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleDownload(c?.id)}
                                                    className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-bold hover:bg-blue-100 transition text-sm flex items-center"
                                                    title="Sözleşmeyi İndir"
                                                >
                                                    <i className="fas fa-file-contract mr-2"></i> Sözleşme
                                                </button>
                                                <button
                                                    onClick={() => handleInvoiceDownload(c?.id)}
                                                    className="bg-green-50 text-green-600 px-3 py-2 rounded-lg font-bold hover:bg-green-100 transition text-sm flex items-center"
                                                    title="Faturayı İndir"
                                                >
                                                    <i className="fas fa-file-invoice mr-2"></i> Fatura
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* TAB: GENERAL */}
            {activeTab === 'general' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                    {!generalInvoices || generalInvoices.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <i className="fas fa-file-invoice text-4xl mb-4 text-gray-200"></i>
                            <p>Arşivde kayıtlı fatura bulunamadı.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">Tarih</th>
                                    <th className="p-4">Dosya Adı</th>
                                    <th className="p-4">Boyut</th>
                                    <th className="p-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {generalInvoices.map((file, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-mono text-xs">{file.created_at}</td>
                                        <td className="p-4 font-semibold text-gray-700">
                                            <div className="flex items-center">
                                                <i className="fas fa-file-pdf text-red-500 mr-3 text-lg"></i>
                                                {file.filename}
                                                {file.type === 'Sirius Döngü Faturası' && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">SIRIUS</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500">{file.size}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleGeneralDownload(file.download_url)}
                                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition text-xs"
                                            >
                                                <i className="fas fa-download mr-2"></i> İndir / Görüntüle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

