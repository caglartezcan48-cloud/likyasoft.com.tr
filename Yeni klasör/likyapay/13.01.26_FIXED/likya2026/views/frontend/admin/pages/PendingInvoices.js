
window.Admin.Pages.PendingInvoices = ({ systemTransactions }) => {
    // Filter for DRAFT invoices
    const [pendingInvoices, setPendingInvoices] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (systemTransactions) {
            setPendingInvoices(systemTransactions.filter(t => t.status === 'draft'));
        }
    }, [systemTransactions]);

    const handleApprove = async (id, entityName, amount) => {
        if (!confirm(`${entityName} firmasına ait ${amount} TL tutarındaki faturayı onaylamak ve carisine yansıtmak istiyor musunuz?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`../data/api/system_accounting.php?action=approve_invoice`, {
                method: 'POST',
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                alert("Fatura onaylandı. Carileşti.");
                // Optimistic Update
                setPendingInvoices(prev => prev.filter(p => p.id !== id));
                // Reload suppressed to prevent UI flash
            } else {
                alert("Hata: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("İşlem hatası.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Bekleyen Faturalar</h1>
                    <p className="text-slate-500">Sirius döngüsünden gelen ve onay bekleyen hizmet bedeli faturaları.</p>
                </div>
                <div className="bg-amber-100 text-amber-600 px-4 py-2 rounded-lg font-bold">
                    {pendingInvoices.length} Bekleyen
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {pendingInvoices.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <i className="fas fa-check-circle text-4xl mb-4 text-emerald-200"></i>
                        <p>Bekleyen fatura bulunmuyor.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Tarih</th>
                                <th className="p-4">Firma / Kurum</th>
                                <th className="p-4">Açıklama</th>
                                <th className="p-4 text-right">Tutar</th>
                                <th className="p-4 text-center">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pendingInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 font-mono text-xs">{new Date(inv.date).toLocaleDateString('tr-TR')}</td>
                                    <td className="p-4 font-bold text-slate-800">{inv.entity_name}</td>
                                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={inv.description}>{inv.description}</td>
                                    <td className="p-4 text-right font-bold text-indigo-600">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(inv.amount)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleApprove(inv.id, inv.entity_name, inv.amount)}
                                            disabled={loading}
                                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 text-sm disabled:opacity-50"
                                        >
                                            <i className="fas fa-check mr-2"></i> Onayla
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
