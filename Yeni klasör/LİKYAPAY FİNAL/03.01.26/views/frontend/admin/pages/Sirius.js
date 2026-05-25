// Sirius Admin Management Page
// Path: views/frontend/admin/pages/Sirius.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Sirius = () => {
    const [stats, setStats] = React.useState({ active_groups: 0, total_volume: 0, pending_requests: 0 });
    const [groups, setGroups] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/likyapay/data/api/sirius.php?action=list_all_cycles');
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                setGroups(data.data);

                // Calculate Stats from Real Data
                const active = data.data.filter(g => g.status === 'detected' || g.status === 'approved').length;
                const vol = data.data.reduce((acc, g) => acc + parseFloat(g.total_volume), 0);

                // Pending requests cannot be fetched easily from cycles API, set as placeholder or separate fetch
                setStats({ active_groups: active, total_volume: vol, pending_requests: '-' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleRunEngine = async () => {
        try {
            const res = await fetch('/likyapay/data/api/sirius.php?action=run_engine', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                alert("✅ " + data.message);
                fetchData();
            } else {
                alert("Bilgi: " + data.message);
            }
        } catch (e) {
            alert("Sunucu hatası veya yetki sorunu.");
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Bu Sirius grubunu onaylamak ve takas döngüsünü başlatmak istiyor musunuz?')) return;

        try {
            const res = await fetch('/likyapay/data/api/sirius.php?action=approve_cycle', {
                method: 'POST',
                body: JSON.stringify({ id: id })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Grup onaylandı ve süreç başlatıldı.");
                fetchData();
            } else {
                alert("Hata: " + data.message);
            }
        } catch (e) {
            alert("İşlem hatası.");
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <i className="fas fa-atom text-indigo-600 animate-spin-slow"></i>
                        Sirius Döngü Yönetimi
                    </h1>
                    <p className="text-slate-500 font-medium">Sistemdeki ticari takas döngülerini izleyin ve onaylayın.</p>
                </div>
                <button
                    onClick={handleRunEngine}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <i className="fas fa-play"></i> Motoru Çalıştır
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Aktif Gruplar</div>
                    <div className="text-3xl font-black text-slate-800">{stats.active_groups}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Toplam İşlem Hacmi</div>
                    <div className="text-3xl font-black text-indigo-600">₺{stats.total_volume.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Bekleyen Talepler</div>
                    <div className="text-3xl font-black text-orange-500">{stats.pending_requests}</div>
                </div>
            </div>

            {/* Groups List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[300px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Tespit Edilen Döngüler</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Sıralama: Hacim (Yüksek &rarr; Düşük)</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400">
                        <i className="fas fa-circle-notch fa-spin text-3xl mb-4"></i>
                        <p>Analiz ediliyor...</p>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-4xl">
                            <i className="fas fa-cubes"></i>
                        </div>
                        <p className="font-medium">Henüz bir döngü oluşmadı.</p>
                        <p className="text-sm mt-1 opacity-70">Yeterli sayıda birbiriyle eşleşen talep girildiğinde burada görünecek.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {groups.map(group => (
                            <div key={group.id} className="p-6 hover:bg-slate-50 transition group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                            {group.id}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">Sirius Grubu #{group.id}</h4>
                                            <div className="text-xs text-slate-400 font-mono">HASH: {group.cycle_hash ? group.cycle_hash.green : 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-800">₺{parseFloat(group.total_volume).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                                        <div className="text-xs font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded inline-block mt-1">
                                            {group.status === 'detected' ? 'Onay Bekliyor' : group.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Chain Visualization */}
                                <div className="bg-slate-100 rounded-xl p-4 overflow-x-auto">
                                    <div className="flex items-center gap-3">
                                        {group.node_names && group.node_names.map((name, i) => {
                                            // Find edge detail amount
                                            // details is array [ {from, to, amount}, ... ] ordered same as path
                                            // The amount for arrow after node i is usually at index i
                                            let amountLabel = null;
                                            if (group.details && group.details[i]) {
                                                amountLabel = "₺" + parseFloat(group.details[i].amount).toLocaleString('tr-TR');
                                            } else if (group.total_volume) {
                                                // Fallback if details missing (for old records)
                                                amountLabel = "₺" + parseFloat(group.total_volume).toLocaleString('tr-TR');
                                            }

                                            return (
                                                <React.Fragment key={i}>
                                                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-sm font-bold text-slate-700 whitespace-nowrap">
                                                        {name}
                                                    </div>
                                                    {i < group.node_names.length - 1 && (
                                                        <div className="flex flex-col items-center px-2">
                                                            <span className="text-[10px] font-bold text-slate-400 mb-0.5">{amountLabel}</span>
                                                            <i className="fas fa-arrow-right text-slate-300"></i>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-200 font-bold text-sm">İncele</button>
                                    <button
                                        onClick={() => handleApprove(group.id)}
                                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-200"
                                    >
                                        Grubu Onayla & Başlat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
