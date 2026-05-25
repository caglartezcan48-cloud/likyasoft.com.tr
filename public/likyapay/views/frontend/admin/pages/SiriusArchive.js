window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.SiriusArchive = () => {
    const [loading, setLoading] = React.useState(true);
    const [documents, setDocuments] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 15;

    // Fetch and flatten data
    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch('../data/api/sirius.php?action=list_all_cycles&t=' + Date.now());
            const json = await res.json();
            if (json.success) {
                const completed = json.data.filter(c => c.status === 'completed' || c.status === 'COMPLETED');
                const flatDocs = [];

                completed.forEach(cycle => {
                    let nodes = [];
                    try { nodes = JSON.parse(cycle.nodes); } catch (e) { nodes = cycle.nodes || []; }
                    const names = cycle.node_names || [];

                    nodes.forEach((taxId, idx) => {
                        const name = names[idx] || taxId;
                        const date = cycle.updated_at || cycle.created_at;

                        // 1. Contract (Admin Download)
                        flatDocs.push({
                            id: `C-${cycle.id}-${taxId}`,
                            date: date,
                            protocol: cycle.cycle_code || cycle.code || cycle.id,
                            company: name,
                            taxId: taxId,
                            type: 'Sözleşme',
                            typeClass: 'bg-indigo-100 text-indigo-700',
                            url: `../data/api/sirius.php?action=admin_download_contract&id=${cycle.id}&tax_id=${taxId}`
                        });

                        // 2. Invoice
                        flatDocs.push({
                            id: `I-${cycle.id}-${taxId}`,
                            date: date,
                            protocol: cycle.cycle_code || cycle.code || cycle.id,
                            company: name,
                            taxId: taxId,
                            type: 'Fatura',
                            typeClass: 'bg-emerald-100 text-emerald-700',
                            url: `../data/api/sirius.php?action=download_invoice&cycle_id=${cycle.id}&target_tax_id=${taxId}`
                        });
                    });
                });

                // Sort by date desc
                flatDocs.sort((a, b) => new Date(b.date) - new Date(a.date));
                setDocuments(flatDocs);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { fetchReport(); }, []);

    // Filter
    const filtered = documents.filter(d =>
        (d.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.protocol || '').toString().includes(searchTerm) ||
        (d.taxId || '').toString().includes(searchTerm)
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Sirius Evrak Raporu</h1>
                    <p className="text-slate-500 text-sm">Tamamlanan döngülere ait resmi evrak ve fatura listesi.</p>
                </div>
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-3 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="Firma, VKN veya Protokol No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full md:w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Protokol</th>
                            <th className="p-4">Firma / VKN</th>
                            <th className="p-4">Belge Tipi</th>
                            <th className="p-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400">Yükleniyor...</td></tr>
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400">Kayıt bulunamadı.</td></tr>
                        ) : (
                            paginated.map((doc, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition">
                                    <td className="p-4 font-mono text-slate-600">
                                        {doc.date ? new Date(doc.date).toLocaleDateString('tr-TR') : '-'}
                                    </td>
                                    <td className="p-4 font-bold text-indigo-900">
                                        #{doc.protocol}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-700">{doc.company}</div>
                                        <div className="text-xs text-slate-400 font-mono">{doc.taxId}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${doc.typeClass}`}>
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 text-slate-600 hover:text-brand-600 font-medium transition"
                                        >
                                            <i className="fas fa-download"></i> <span className="hidden sm:inline">İndir</span>
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-3 py-1 rounded border hover:bg-slate-50 disabled:opacity-50"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <span className="px-2 py-1 text-slate-500 font-mono">{currentPage} / {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-3 py-1 rounded border hover:bg-slate-50 disabled:opacity-50"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
