
// --- TRANSACTION MODAL ---
const TransactionModal = ({ isOpen, onClose, onSave, systemEntities }) => {
    if (!isOpen) return null;

    const [newTransaction, setNewTransaction] = React.useState({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: '',
        entityId: '', // Opsiyonel: Kayıtlı kullanıcılardan seçim
        customEntityName: '', // Opsiyonel: Manuel isim girişi
        desc: '',
        amount: ''
    });

    const [isEntityDropdownOpen, setIsEntityDropdownOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    const themeColor = newTransaction.type === 'income' ? 'emerald' : 'rose';
    const ThemeIcon = newTransaction.type === 'income' ? 'fas fa-arrow-down' : 'fas fa-arrow-up';

    const filteredEntities = (systemEntities || []).filter(entity =>
        (entity.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectEntity = (entity) => {
        setNewTransaction({ ...newTransaction, entityId: entity.id, customEntityName: entity.name });
        setIsEntityDropdownOpen(false);
        setSearchTerm('');
    };

    const validateAndSave = () => {
        if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
            alert('Lütfen geçerli bir tutar giriniz.');
            return;
        }
        if (!newTransaction.category) {
            alert('Lütfen bir kategori seçiniz.');
            return;
        }

        const entityName = newTransaction.customEntityName || (newTransaction.entityId ? systemEntities.find(e => e.id === newTransaction.entityId)?.name : '-') || '-';

        onSave({ ...newTransaction, entity_name: entityName });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 border-t-8 border-${themeColor}-500`}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                                {newTransaction.type === 'income' ? 'Para Girişi' : 'Para Çıkışı'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Muhasebe kaydı oluşturun.</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* İşlem Tipi Seçimi */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${newTransaction.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <i className="fas fa-arrow-down"></i> Gelir / Tahsilat
                            </button>
                            <button
                                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${newTransaction.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <i className="fas fa-arrow-up"></i> Gider / Ödeme
                            </button>
                        </div>

                        {/* Tutar ve Tarih */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tutar (₺)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className={`w-full pl-8 pr-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-${themeColor}-500 font-mono text-lg font-bold text-gray-800 transition`}
                                        value={newTransaction.amount}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        step="0.01"
                                    />
                                    <span className="absolute left-3 top-3.5 text-gray-400 font-bold">₺</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tarih</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-gray-400 font-medium text-gray-700"
                                    value={newTransaction.date}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kategori</label>
                            <select
                                className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-gray-400 bg-white"
                                value={newTransaction.category}
                                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                            >
                                <option value="">Seçiniz...</option>
                                {newTransaction.type === 'income' ? (
                                    <>
                                        <option value="Satış Geliri">Satış Geliri</option>
                                        <option value="Komisyon Geliri">Komisyon Geliri</option>
                                        <option value="Yatırım">Yatırım / Sermaye</option>
                                        <option value="Diğer Gelir">Diğer Gelir</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Personel Maaşı">Personel Maaşı</option>
                                        <option value="Kira">Kira / Ofis</option>
                                        <option value="Vergi">Vergi / Stopaj</option>
                                        <option value="Yazılım Gideri">Yazılım / Sunucu</option>
                                        <option value="Pazarlama">Reklam / Pazarlama</option>
                                        <option value="Diğer Gider">Diğer Gider</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Kaynak / Alıcı (Dropdown + Manuel Giriş) */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kaynak / Alıcı (Opsiyonel)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Kişi veya Kurum Adı"
                                    className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-gray-400 text-sm"
                                    value={newTransaction.customEntityName}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, customEntityName: e.target.value, entityId: '' })}
                                />
                                {systemEntities && systemEntities.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEntityDropdownOpen(!isEntityDropdownOpen)}
                                        className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-gray-600 transition"
                                        title="Listeden Seç"
                                    >
                                        <i className="fas fa-list"></i>
                                    </button>
                                )}
                            </div>

                            {isEntityDropdownOpen && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                                    <div className="p-2 sticky top-0 bg-white border-b">
                                        <input
                                            type="text"
                                            placeholder="Ara..."
                                            className="w-full px-2 py-1 bg-gray-50 border rounded text-sm"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {filteredEntities.map(entity => (
                                        <div
                                            key={entity.id}
                                            onClick={() => handleSelectEntity(entity)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                                        >
                                            <div className="font-bold text-gray-800">{entity.name}</div>
                                            <div className="text-xs text-gray-500">{entity.type === 'company' ? 'Firma' : 'Tedarikçi'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Açıklama */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Açıklama (Opsiyonel)</label>
                            <textarea
                                className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-gray-400 text-sm resize-none h-20"
                                placeholder="İşlem detayı..."
                                value={newTransaction.desc}
                                onChange={(e) => setNewTransaction({ ...newTransaction, desc: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">İptal</button>
                    <button
                        onClick={validateAndSave}
                        className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition bg-${themeColor}-600 hover:bg-${themeColor}-700 hover:shadow-${themeColor}-500/30`}
                    >
                        {newTransaction.type === 'income' ? 'Tahsilat Al' : 'Ödeme Yap'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN ACCOUNTING PAGE ---
window.Admin.Pages.Accounting = ({ users }) => {
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('cash'); // 'cash' | 'invoices'

    const [cashTransactions, setCashTransactions] = React.useState([]);
    const [invoiceTransactions, setInvoiceTransactions] = React.useState([]);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [stats, setStats] = React.useState({ income: 0, expense: 0, balance: 0 });

    const systemEntities = React.useMemo(() => {
        if (!users) return [];
        return users.map(u => ({ id: u.id, name: u.title || u.name, type: u.account_type || 'company' }));
    }, [users]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel Fetch
            const [resCash, resInvoices] = await Promise.all([
                fetch('/likyapay/data/api/system_accounting.php?t=' + Date.now()).then(r => r.json()),
                fetch('/likyapay/data/api/admin_transactions.php?t=' + Date.now()).then(r => r.json()) // Fetch ALL user transactions
            ]);

            if (resCash.success && Array.isArray(resCash.data)) {
                setCashTransactions(resCash.data);
                calculateStats(resCash.data);
            }

            if (resInvoices.success && Array.isArray(resInvoices.data)) {
                setInvoiceTransactions(resInvoices.data);
            }

        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (txList) => {
        let inc = 0, exp = 0;
        txList.forEach(t => { const val = parseFloat(t.amount); if (t.type === 'income') inc += val; else exp += val; });
        setStats({ income: inc, expense: exp, balance: inc - exp });
    };

    React.useEffect(() => { fetchData(); }, []);

    const handleSaveTransaction = async (transaction) => {
        // ... (Existing Save Logic)
        try {
            const payload = {
                type: transaction.type, category: transaction.category,
                entity_name: transaction.entity_name, entity_id: transaction.entityId,
                description: transaction.desc, amount: transaction.amount, date: transaction.date
            };
            const response = await fetch('/likyapay/data/api/system_accounting.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (data.success) { alert('✅ İşlem başarıyla kaydedildi.'); setIsModalOpen(false); fetchData(); }
            else { alert('❌ Kayıt Başarısız: ' + data.message); }
        } catch (err) { alert('Bir hata oluştu.'); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        try {
            await fetch('/likyapay/data/api/system_accounting.php', { method: 'DELETE', body: JSON.stringify({ id }) });
            fetchData();
        } catch (e) { }
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Muhasebe Paneli</h1>
                    <p className="text-gray-500 font-medium">Finansal hareketleri ve faturaları yönetin.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('cash')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'cash' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Kasa Hareketleri</button>
                    <button onClick={() => setActiveTab('invoices')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'invoices' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Faturalar</button>
                </div>
            </div>

            {activeTab === 'cash' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-emerald-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
                            <div className="text-sm opacity-80 mb-1">Toplam Gelir</div>
                            <div className="text-3xl font-black">{stats.income.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                        </div>
                        <div className="bg-rose-500 rounded-2xl p-6 text-white shadow-lg shadow-rose-200">
                            <div className="text-sm opacity-80 mb-1">Toplam Gider</div>
                            <div className="text-3xl font-black">{stats.expense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                            <div className="text-sm text-gray-400 mb-1">Net Kasa</div>
                            <div className={`text-3xl font-black ${stats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {stats.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={() => setIsModalOpen(true)} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition flex items-center gap-2"><i className="fas fa-plus"></i> Kasa Giriş/Çıkış</button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase w-12 text-center">Yön</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tarih</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Kategori</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Açıklama</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Tutar</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {cashTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-center">
                                            <i className={`fas ${t.type === 'income' ? 'fa-arrow-down text-emerald-500' : 'fa-arrow-up text-rose-500'}`}></i>
                                        </td>
                                        <td className="p-4 font-bold text-gray-700 text-sm">{t.date}</td>
                                        <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{t.category}</span></td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {t.description}
                                            {t.entity_name && <div className="text-xs text-gray-400 mt-0.5"><i className="fas fa-user-tag"></i> {t.entity_name}</div>}
                                        </td>
                                        <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{parseFloat(t.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                        <td className="p-4 text-right"><button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500"><i className="fas fa-trash"></i></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Fatura No</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Borçlu (Gönderen)</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Alacaklı (Alan)</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tutar</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tarih</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoiceTransactions.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-gray-400">Fatura kaydı bulunamadı.</td></tr> :
                                invoiceTransactions.map(inv => (
                                    <tr key={inv.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono text-xs text-gray-500">#{inv.id}</td>
                                        <td className="p-4 font-bold text-gray-700">{inv.debter_name || '-'}</td>
                                        <td className="p-4 font-bold text-gray-700">{inv.creditor_name || '-'}</td>
                                        <td className="p-4 font-bold text-gray-800">{parseFloat(inv.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                        <td className="p-4 text-sm text-gray-500">{inv.date}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${inv.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {inv.status === 'approved' ? 'Onaylı' : 'Bekliyor'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTransaction} systemEntities={systemEntities} />
        </div>
    );
};
