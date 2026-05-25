// Sirius Admin Management Page
// Path: views/frontend/admin/pages/Sirius.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Sirius = () => {
    const [stats, setStats] = React.useState({ active_groups: 0, total_volume: 0, pending_requests: 0 });
    const [groups, setGroups] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedGroup, setSelectedGroup] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('active');

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('../data/api/sirius.php?action=list_all_cycles');
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
            const res = await fetch('../data/api/sirius.php?action=run_engine', { method: 'POST' });
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
        if (!confirm('Bu Sirius grubunu onaylamak ve vergi numaralarına göre ödeme sürecini başlatmak istiyor musunuz?')) return;

        try {
            const res = await fetch('../data/api/sirius.php?action=approve_cycle', {
                method: 'POST',
                body: JSON.stringify({ id: id })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ " + data.message);
                fetchData();
                setSelectedGroup(null);
            } else {
                alert("Hata: " + data.message);
            }
        } catch (e) {
            alert("İşlem hatası.");
        }
    };

    const handleFinalize = async (id) => {
        if (!confirm('Tüm yasal süreç tamamlandı. Döngüyü kapatıp borçları silmek istiyor musunuz?')) return;
        setLoading(true);
        try {
            const res = await fetch('../data/api/sirius.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'finalize_cycle', id: id })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ " + data.message);
                // Refresh data
                fetchData();
                setSelectedGroup(null);
            } else {
                alert("Hata: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Sunucu hatası.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayment = async (cycle_id, target_tax_id) => {
        if (!confirm('Ödemeyi onaylıyor musunuz?')) return;
        try {
            const res = await fetch('../data/api/sirius.php?action=approve_payment', {
                method: 'POST',
                body: JSON.stringify({ cycle_id, target_tax_id })
            });
            const data = await res.json();
            if (data.success) {
                // Update local state to reflect change immediately without closing modal
                setSelectedGroup(prev => {
                    if (!prev) return null;
                    const newPs = JSON.parse(prev.payment_status || '{}');
                    newPs[target_tax_id] = 'approved';
                    return { ...prev, payment_status: JSON.stringify(newPs) };
                });
                fetchData(); // Sync with backend
            }
        } catch (e) { alert("Hata"); }
    };

    const handleApproveContract = async (cycleId, targetTaxId) => {
        try {
            const res = await fetch('../data/api/sirius.php?action=approve_contract', {
                method: 'POST',
                body: JSON.stringify({ cycle_id: cycleId, target_tax_id: targetTaxId })
            });
            const data = await res.json();
            if (data.success) {
                // Update local state without closing modal
                setSelectedGroup(prev => {
                    if (!prev) return null;
                    const newLs = JSON.parse(prev.legal_status || '{}');
                    newLs[targetTaxId] = 'approved';
                    return { ...prev, legal_status: JSON.stringify(newLs) };
                });
                fetchData();
            }
        } catch (e) { alert("Hata"); }
    };



    const handleSendReminders = async (id) => {
        try {
            const res = await fetch('../data/api/sirius.php?action=send_reminders', {
                method: 'POST',
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            alert(data.message);
        } catch (e) { alert("Hatırlatma gönderilemedi"); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu döngüyü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
        try {
            const res = await fetch('../data/api/sirius.php?action=delete_cycle', {
                method: 'POST',
                body: JSON.stringify({ id: id })
            });
            const data = await res.json();
            if (data.success) {
                alert("🗑️ " + data.message);
                fetchData();
                setSelectedGroup(null);
            } else { alert("Hata: " + data.message); }
        } catch (e) { alert("Hata"); }
    };

    const handleDownloadDoc = async (userId, type) => {
        // userId here is actually tax_id based on current usage
        // But user side usually uses 'download_contract' action with type 'temlik' or 'mahsuplasma'.
        // Admin needs to specify WHICH user's contract.
        // We'll trust the User Side API 'download_contract' but need to pass specific params or create a new Admin Action.
        // Let's create a NEW Admin action: 'admin_download_contract' in sirius.php

        window.open(`../data/api/sirius.php?action=admin_download_contract&cycle_id=${selectedGroup.id}&tax_id=${userId}&type=${type}`, '_blank');
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

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 font-bold border-b-2 transition ${activeTab === 'active' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Aktif Döngüler ({groups.filter(g => g.status !== 'completed').length})
                </button>
                <button
                    onClick={() => setActiveTab('archive')}
                    className={`px-6 py-3 font-bold border-b-2 transition ${activeTab === 'archive' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Arşiv ({groups.filter(g => g.status === 'completed').length})
                </button>
            </div>

            {/* Groups List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[300px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {activeTab === 'active' ? 'Devam Eden Süreçler' : 'Tamamlanmış Döngüler (Arşiv)'}
                    </h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Sıralama: Hacim (Yüksek &rarr; Düşük)</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400">
                        <i className="fas fa-circle-notch fa-spin text-3xl mb-4"></i>
                        <p>Analiz ediliyor...</p>
                    </div>
                ) : groups.filter(g => activeTab === 'active' ? g.status !== 'completed' : g.status === 'completed').length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-4xl">
                            <i className="fas fa-cubes"></i>
                        </div>
                        <p className="font-medium">
                            {activeTab === 'active' ? 'Henüz aktif bir döngü yok.' : 'Arşivde kayıtlı döngü bulunmuyor.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {groups.filter(g => activeTab === 'active' ? g.status !== 'completed' : g.status === 'completed').map(group => (
                            <div key={group.id} className="p-6 hover:bg-slate-50 transition group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                            {group.cycle_code ? group.cycle_code.split('-')[1] : group.id}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">Sirius Grubu #{group.cycle_code || group.id}</div>
                                            <div className="text-xs text-slate-400 font-mono" title={group.cycle_hash}>HASH: {group.cycle_hash ? group.cycle_hash.substring(0, 8) + '...' : 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-800">₺{parseFloat(group.total_volume).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                                        <div className="flex justify-end gap-2 mt-1">
                                            {/* Synergy Badge */}
                                            {group.sector_synergy > 0 && (
                                                <div className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded" title="Sektör Uyumu">
                                                    <i className="fas fa-star text-indigo-400 mr-1"></i>
                                                    Uyum: {group.sector_synergy}
                                                </div>
                                            )}
                                            <div className="text-xs font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded">
                                                {group.status === 'detected' ? 'Onay Bekliyor' : group.status}
                                            </div>
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
                                    <button
                                        onClick={() => setSelectedGroup(group)}
                                        className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-200 font-bold text-sm"
                                    >
                                        İncele
                                    </button>
                                    {group.status === 'detected' && (
                                        <button
                                            onClick={() => handleApprove(group.id)}
                                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-200"
                                        >
                                            Grubu Onayla & Başlat
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {/* INSPECT MODAL */}
            {
                selectedGroup && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800">Sirius Grubu Detayları</h3>
                                    <p className="text-sm text-slate-500">#{selectedGroup.cycle_code || selectedGroup.id} - {selectedGroup.status === 'detected' ? 'Onay Bekliyor' : 'İşleme Alındı'}</p>
                                </div>
                                <button onClick={() => setSelectedGroup(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Summary Card */}
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-center justify-between">
                                    <div>
                                        <div className="text-indigo-600 font-bold text-sm uppercase mb-1">Mahsuplaşılacak Tutar</div>
                                        <div className="text-3xl font-black text-indigo-900">₺{parseFloat(selectedGroup.total_volume).toLocaleString('tr-TR')}</div>
                                        <p className="text-xs text-indigo-600/70 mt-1">Bu gruptaki tüm üyeler bu tutar kadar borçtan kurtulacak.</p>
                                    </div>
                                    <div className="text-4xl text-indigo-200">
                                        <i className="fas fa-handshake"></i>
                                    </div>
                                </div>

                                {/* Node List Table */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <i className="fas fa-users text-slate-400"></i>
                                        Döngü Katılımcıları & İşlemler
                                    </h4>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-3 pl-4">Borçlu (Kimden)</th>
                                                    <th className="p-3 text-center"><i className="fas fa-arrow-right"></i></th>
                                                    <th className="p-3">Alacaklı (Kime)</th>
                                                    <th className="p-3 text-right">Mevcut Borç</th>
                                                    <th className="p-3 text-right text-green-600">Simule Edilen</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedGroup.node_names && selectedGroup.node_names.map((name, i) => {
                                                    const nextIndex = (i + 1) % selectedGroup.node_names.length;
                                                    const nextName = selectedGroup.node_names[nextIndex];
                                                    // Adjust detail access logic if details are not perfectly aligned with nodes
                                                    // Assuming details[i] corresponds to edge (nodes[i] -> nodes[i+1])
                                                    const currentDetail = selectedGroup.details ? selectedGroup.details[i] : null;
                                                    const originalDebt = currentDetail ? parseFloat(currentDetail.amount) : 0;
                                                    const clearedAmount = parseFloat(selectedGroup.total_volume);

                                                    return (
                                                        <tr key={i} className="hover:bg-slate-50">
                                                            <td className="p-3 pl-4 font-bold text-slate-700">{name}</td>
                                                            <td className="p-3 text-center text-slate-300"><i className="fas fa-angle-right"></i></td>
                                                            <td className="p-3 font-medium text-slate-600">{nextName}</td>
                                                            <td className="p-3 text-right font-mono text-slate-500">
                                                                {originalDebt > 0 ? "₺" + originalDebt.toLocaleString('tr-TR') : "-"}
                                                            </td>
                                                            <td className="p-3 text-right font-bold text-green-600 font-mono">
                                                                -₺{clearedAmount.toLocaleString('tr-TR')}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-slate-50 text-slate-500 text-xs p-4 rounded-xl leading-relaxed">
                                    <strong className="text-slate-700 block mb-1">Nasıl Çalışır?</strong>
                                    Bu döngüdeki her bir üye, bir sonraki üyeye borçludur. En düşük borç tutarı ({parseFloat(selectedGroup.total_volume).toLocaleString('tr-TR')} TL) baz alınarak, zincirdeki herkesin borcundan bu tutar düşülür. Böylece nakit kullanmadan borçlar temizlenir.
                                </div>

                                {/* STATUS TRACKING DOMAIN */}
                                {selectedGroup.status !== 'detected' && selectedGroup.status !== 'completed' && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <h4 className="font-bold text-slate-800 mb-2">Süreç Takibi: {selectedGroup.status === 'payment_stage' ? 'Ödeme Bekleniyor' : 'Yasal Onay'}</h4>
                                        <div className="space-y-2">
                                            {selectedGroup.node_names.map((name, i) => {
                                                const nodes = JSON.parse(selectedGroup.nodes || '[]');
                                                const tax_id = nodes[i];

                                                const ps = JSON.parse(selectedGroup.payment_status || '{}');
                                                const ls = JSON.parse(selectedGroup.legal_status || '{}');

                                                const payStatus = ps[tax_id] || 'pending';
                                                const legalStatus = ls[tax_id] || 'pending';

                                                return (
                                                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 hover:shadow-sm transition">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-slate-700">{name}</div>
                                                            <div className="text-xs text-slate-400 font-mono">{tax_id}</div>
                                                        </div>

                                                        <div className="flex gap-4">
                                                            {/* Service Fee Status */}
                                                            <div className="flex flex-col items-end w-32">
                                                                <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Hizmet Bedeli</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${payStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                                        payStatus === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                        {payStatus === 'pending' && 'Bekliyor'}
                                                                        {payStatus === 'submitted' && 'Ödeme Yaptı'}
                                                                        {payStatus === 'approved' && 'Onaylandı'}
                                                                    </span>
                                                                    {(payStatus === 'submitted' && selectedGroup.status === 'processing') && (
                                                                        <button onClick={() => handleApprovePayment(selectedGroup.id, tax_id)} className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700" title="Ödemeyi Onayla">
                                                                            <i className="fas fa-check text-xs"></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Contract Status */}
                                                            <div className="flex flex-col items-end w-32 border-l pl-4 border-slate-100">
                                                                <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Sözleşme</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${legalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                                        legalStatus === 'signed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                        {legalStatus === 'pending' && 'Bekliyor'}
                                                                        {legalStatus === 'signed' && 'İmzaladı'}
                                                                        {legalStatus === 'approved' && 'Onaylandı'}
                                                                    </span>
                                                                    {(legalStatus === 'signed' && selectedGroup.status === 'processing') && (
                                                                        <button onClick={() => handleApproveContract(selectedGroup.id, tax_id)} className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700" title="Sözleşmeyi Onayla">
                                                                            <i className="fas fa-check text-xs"></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    onClick={() => setSelectedGroup(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition"
                                >
                                    Kapat
                                </button>

                                {/* Delete Button - Available for all active cycles */}
                                {selectedGroup.status !== 'completed' && (
                                    <button
                                        onClick={() => handleDelete(selectedGroup.id)}
                                        className="px-5 py-2.5 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 transition flex items-center gap-2"
                                    >
                                        <i className="fas fa-trash-alt"></i> Sil
                                    </button>
                                )}

                                {/* Start Process - Detected Only */}
                                {selectedGroup.status === 'detected' && (
                                    <button
                                        onClick={() => handleApprove(selectedGroup.id)}
                                        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
                                    >
                                        <i className="fas fa-play"></i> Süreci Başlat
                                    </button>
                                )}

                                {/* Finalize - Legal Stage Only */}
                                {/* Finalize - Processing Stage */}
                                {selectedGroup.status === 'processing' && (
                                    <button
                                        onClick={() => handleFinalize(selectedGroup.id)}
                                        className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition flex items-center gap-2"
                                    >
                                        <i className="fas fa-check-circle"></i> Döngüyü Tamamla
                                    </button>
                                )}

                                {/* ARCHIVE DOCUMENTS */}
                                {/* DOCUMENT MANAGEMENT - Visible for ALL statuses */}
                                <div className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <i className="fas fa-file-contract text-slate-400"></i>
                                        {selectedGroup.status === 'completed' ? 'Arşivlenmiş Belgeler' : 'Sözleşme & Belge Yönetimi (Taslak/Onay)'}
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedGroup.node_names.map((name, i) => {
                                            const nodes = JSON.parse(selectedGroup.nodes || '[]');
                                            const tax_id = nodes[i];

                                            // LOGIC: "Mahsuplaşma formu son 2 şirket arasında oluşturulmalı"
                                            // List: [A, B, C]. 
                                            // i=0 (A -> B): Temlik
                                            // i=1 (B -> C): Mahsuplaşma (Last Pair)
                                            // i=2 (C -> A): Temlik (Loop closing) - OR maybe standard Temlik.

                                            // We define the "Mahsuplaşma Node" as the one at index (Length - 2).
                                            // Because it interacts with the Last Node (Length - 1).
                                            const isMahsup = (i === nodes.length - 2);

                                            return (
                                                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                                                    <div>
                                                        <div className="font-bold text-slate-700 text-sm">{name}</div>
                                                        <div className="text-xs text-slate-400">{tax_id}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {isMahsup ? (
                                                            <button
                                                                onClick={() => handleDownloadDoc(tax_id, 'mahsuplasma')}
                                                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded flex items-center gap-2 transition border border-indigo-200"
                                                                title="Mahsuplaşma Sözleşmesini Görüntüle"
                                                            >
                                                                <i className="fas fa-file-signature"></i> Mahsuplaşma
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDownloadDoc(tax_id, 'temlik')}
                                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded flex items-center gap-2 transition"
                                                                title="Temlik Sözleşmesini Görüntüle"
                                                            >
                                                                <i className="fas fa-file-contract text-red-500"></i> Temlik
                                                            </button>
                                                        )}

                                                        {selectedGroup.status !== 'completed' && (
                                                            <button
                                                                onClick={() => alert("E-posta gönderimi aktif.")}
                                                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded flex items-center gap-2 transition"
                                                            >
                                                                <i className="fas fa-envelope"></i> Gönder
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};
