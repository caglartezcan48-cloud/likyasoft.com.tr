
window.Kullanicilar = window.Kullanicilar || {};
window.Kullanicilar.Archive = () => {
    const [cycles, setCycles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCycles = async () => {
            try {
                const res = await fetch('../data/api/sirius.php?action=list_completed_cycles');
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setCycles(json.data);
                } else {
                    setCycles([]); // Fallback to empty array
                }
            } catch (e) {
                console.error("Archive fetch error", e);
                setCycles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCycles();
    }, []);

    const handleDownload = (cycleId) => {
        if (!cycleId) return;
        window.open(`../data/api/sirius.php?action=download_my_contract&cycle_id=${cycleId}`, '_blank');
    };

    const handleInvoiceDownload = (cycleId) => {
        if (!cycleId) return;
        window.open(`../data/api/sirius.php?action=download_invoice&cycle_id=${cycleId}`, '_blank');
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Yükleniyor...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 border-gray-100">Evrak Arşivi</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
        </div>
    );
};
