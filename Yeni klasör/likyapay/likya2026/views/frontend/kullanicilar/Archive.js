
window.User.Pages.Archive = () => {
    const [cycles, setCycles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCycles = async () => {
            try {
                const res = await fetch('../data/api/sirius.php?action=list_completed_cycles');
                const json = await res.json();
                if (json.success) {
                    setCycles(json.data);
                }
            } catch (e) {
                console.error("Archive fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchCycles();
    }, []);

    const handleDownload = (cycleId) => {
        window.open(`../data/api/sirius.php?action=download_my_contract&cycle_id=${cycleId}`, '_blank');
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Yükleniyor...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 border-gray-100">Evrak Arşivi</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {cycles.length === 0 ? (
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
                                <tr key={c.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 font-mono text-xs">{new Date(c.completed_at).toLocaleDateString('tr-TR')}</td>
                                    <td className="p-4 font-bold text-gray-800">#{c.cycle_code}</td>
                                    <td className="p-4 text-right font-bold text-gray-600">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(c.total_volume)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleDownload(c.id)}
                                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition text-sm flex items-center justify-center mx-auto"
                                        >
                                            <i className="fas fa-file-contract mr-2"></i> İndir
                                        </button>
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
