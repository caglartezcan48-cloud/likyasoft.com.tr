
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
        (entity.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.tax_id || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNewTransaction({ ...newTransaction, customEntityName: val, entityId: '' });
                                        if (val.length > 0) {
                                            setSearchTerm(val);
                                            setIsEntityDropdownOpen(true);
                                        } else {
                                            setIsEntityDropdownOpen(false);
                                        }
                                    }}
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
                                    {filteredEntities.length === 0 ? (
                                        <div className="p-3 text-xs text-gray-400 text-center italic">Cari kaydı bulunamadı.</div>
                                    ) : (
                                        filteredEntities.map(entity => (
                                            <div
                                                key={entity.id}
                                                onClick={() => handleSelectEntity(entity)}
                                                className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                                            >
                                                <div className="font-bold text-gray-800">{entity.name}</div>
                                                <div className="text-xs text-gray-500">{entity.type === 'company' ? 'Firma' : 'Tedarikçi'}</div>
                                            </div>
                                        ))
                                    )}
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

// --- INVOICE MODAL ---
const InvoiceModal = ({ isOpen, onClose, onSave, systemEntities }) => {
    if (!isOpen) return null;

    const [invoice, setInvoice] = React.useState({
        recipient_name: '',
        tax_id: '',
        address: '',
        service: 'Yazılım Geliştirme Hizmeti',
        amount: '',
        vat_rate: 20
    });

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredEntities = (systemEntities || []).filter(e =>
        (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.tax_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectEntity = (entity) => {
        setInvoice({
            ...invoice,
            entity_id: entity.id, // Store ID
            recipient_name: entity.name,
            tax_id: entity.tax_id || '',
            address: entity.address || ''
        });
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const calculateTotal = () => {
        const amt = parseFloat(invoice.amount) || 0;
        const tax = amt * (invoice.vat_rate / 100);
        return { subtotal: amt, tax: tax, total: amt + tax };
    };

    const totals = calculateTotal();

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold">Resmi Fatura Oluştur</h2>
                        <p className="text-slate-400 text-sm">Fatura detaylarını giriniz.</p>
                    </div>
                    <button onClick={onClose}><i className="fas fa-times text-xl"></i></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b pb-2">Alicı Bilgileri</h3>

                        {/* Recipient Selection */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Müşteri / Kurum Adı</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={invoice.recipient_name}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setInvoice({ ...invoice, recipient_name: val, entity_id: null });
                                        if (val.length > 0) {
                                            setSearchTerm(val);
                                            setIsDropdownOpen(true);
                                        } else {
                                            setIsDropdownOpen(false);
                                        }
                                    }}
                                    placeholder="Manuel giriş veya listeden seçin"
                                />
                                {systemEntities && systemEntities.length > 0 && (
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-slate-600"
                                        title="Listeden Seç"
                                    >
                                        <i className="fas fa-list"></i>
                                    </button>
                                )}
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                                    <div className="p-2 sticky top-0 bg-white border-b">
                                        <input
                                            type="text"
                                            placeholder="Ara..."
                                            className="w-full px-2 py-1 bg-slate-50 border rounded text-sm"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {filteredEntities.length === 0 ? (
                                        <div className="p-3 text-xs text-gray-400 text-center italic">Cari kaydı bulunamadı.</div>
                                    ) : (
                                        filteredEntities.map(entity => (
                                            <div
                                                key={entity.id}
                                                onClick={() => handleSelectEntity(entity)}
                                                className="p-3 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-0"
                                            >
                                                <div className="font-bold text-slate-800">{entity.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    {entity.tax_id ? `VKN: ${entity.tax_id}` : 'VKN Yok'}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vergi Numarası / T.C.</label>
                            <input
                                type="text"
                                className={`w-full border rounded-lg px-3 py-2 ${(!invoice.tax_id && invoice.entity_id) ? 'border-red-500 bg-red-50' : ''}`}
                                value={invoice.tax_id}
                                onChange={e => setInvoice({ ...invoice, tax_id: e.target.value })}
                            />
                            {(!invoice.tax_id && invoice.entity_id) && <div className="text-xs text-red-500 mt-1 font-bold">Vergi No Zorunludur!</div>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Adres</label>
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
                                value={invoice.address}
                                onChange={e => setInvoice({ ...invoice, address: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b pb-2">Hizmet Detayları</h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hizmet Adı</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2"
                                value={invoice.service}
                                onChange={e => setInvoice({ ...invoice, service: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tutar (KDV Hariç)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-400">₺</span>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg pl-8 pr-3 py-2 font-bold text-lg"
                                    value={invoice.amount}
                                    onChange={e => setInvoice({ ...invoice, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">KDV Oranı (%)</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2"
                                value={invoice.vat_rate}
                                onChange={e => setInvoice({ ...invoice, vat_rate: parseInt(e.target.value) })}
                            >
                                <option value="0">0%</option>
                                <option value="1">1%</option>
                                <option value="10">10%</option>
                                <option value="20">20%</option>
                            </select>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Ara Toplam:</span>
                                <span className="font-bold">{totals.subtotal.toFixed(2)} ₺</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>KDV ({invoice.vat_rate}%):</span>
                                <span className="font-bold">{totals.tax.toFixed(2)} ₺</span>
                            </div>
                            <div className="flex justify-between text-lg font-black text-slate-800 border-t pt-2 mt-2">
                                <span>GENEL TOPLAM:</span>
                                <span>{totals.total.toFixed(2)} ₺</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-200">İptal</button>
                    <button
                        onClick={() => onSave(invoice)}
                        className="px-8 py-2 rounded-lg font-bold text-white bg-slate-900 hover:bg-black shadow-lg"
                    >
                        Faturayı Oluştur
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- PRINTABLE INVOICE TEMPLATE ---
const PrintableInvoice = ({ data, onClose }) => {
    if (!data) return null;
    const details = data.details ? JSON.parse(data.details) : {};

    // Auto-print
    React.useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <div className="fixed inset-0 bg-white z-[1000] overflow-auto">
            <div className="max-w-[210mm] mx-auto p-12 bg-white min-h-screen relative">
                {/* Close Button for Screen */}
                <button onClick={onClose} className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded no-print font-bold shadow-lg">
                    <i className="fas fa-times mr-2"></i> Kapat
                </button>

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">LikyaPay</h1>
                        <p className="text-sm font-bold text-slate-500">TEKNOLOJİ A.Ş.</p>
                        <div className="mt-4 text-xs text-slate-600">
                            Maslak Mah. Büyükdere Cad.<br />
                            No: 123, Sarıyer / İSTANBUL<br />
                            V.D: Maslak / 1234567890<br />
                            Mersis: 012345678900001
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-light text-slate-300 uppercase">E-Arşiv Fatura</h2>
                        <div className="mt-4 space-y-1">
                            <div className="flex justify-end gap-4"><span className="font-bold text-slate-500">Fatura No:</span> <span className="font-mono font-bold">LKY2026-{data.id.toString().padStart(6, '0')}</span></div>
                            <div className="flex justify-end gap-4"><span className="font-bold text-slate-500">Tarih:</span> <span>{data.date}</span></div>
                        </div>
                    </div>
                </div>

                {/* Recipient */}
                <div className="mb-12 p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">SAYIN:</h3>
                    <div className="text-xl font-bold text-slate-900 mb-1">{details.recipient_name || data.entity_name}</div>
                    <div className="text-sm text-slate-600 mb-4 whitespace-pre-line">{details.address || 'Adres bilgisi girilmedi.'}</div>
                    <div className="text-sm">
                        <span className="font-bold text-slate-500">Vergi No / T.C.:</span> {details.tax_id || '---'}
                    </div>
                </div>

                {/* Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left py-3 font-bold uppercase text-xs">Hizmet / Açıklama</th>
                            <th className="text-right py-3 font-bold uppercase text-xs w-32">Adet</th>
                            <th className="text-right py-3 font-bold uppercase text-xs w-32">Birim Fiyat</th>
                            <th className="text-right py-3 font-bold uppercase text-xs w-32">Toplam</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-4 border-b border-slate-100">
                                <div className="font-bold text-slate-900">{details.service || data.category}</div>
                                <div className="text-xs text-slate-500">{data.description}</div>
                            </td>
                            <td className="py-4 border-b border-slate-100 text-right">1</td>
                            <td className="py-4 border-b border-slate-100 text-right">{parseFloat(data.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                            <td className="py-4 border-b border-slate-100 text-right font-bold">{parseFloat(data.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-1/3 space-y-3">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Ara Toplam</span>
                            <span>{parseFloat(data.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>KDV (%{details.vat_rate || 20})</span>
                            <span>{(parseFloat(data.amount) * ((details.vat_rate || 20) / 100)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t-2 border-slate-900">
                            <span>GENEL TOPLAM</span>
                            <span>{(parseFloat(data.amount) * (1 + ((details.vat_rate || 20) / 100))).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-slate-400 mt-20 border-t pt-8">
                    <p>LikyaPay Teknoloji A.Ş. - Mersis: 012345678900001 - Ticaret Sicil: 123456</p>
                    <p>Bu belge 5070 sayılı Elektronik İmza Kanunu kapsamında elektronik olarak imzalanmıştır.</p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};

// --- MAIN ACCOUNTING PAGE ---
// --- MAIN ACCOUNTING PAGE ---
window.Admin.Pages.Accounting = ({ users, setUsers }) => {
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('cash'); // 'cash' | 'invoices'

    const [cashTransactions, setCashTransactions] = React.useState([]);
    const [invoiceTransactions, setInvoiceTransactions] = React.useState([]);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);

    const [stats, setStats] = React.useState({ income: 0, expense: 0, balance: 0 });
    const [printInvoiceData, setPrintInvoiceData] = React.useState(null);

    // --- FILTERS & PAGINATION STATE ---
    const [filterStart, setFilterStart] = React.useState('');
    const [filterEnd, setFilterEnd] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');

    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const systemEntities = React.useMemo(() => {
        if (!users) return [];
        return users.map(u => ({
            id: u.id,
            name: u.title || u.name,
            type: u.user_type || 'company',
            tax_id: u.taxNo || u.tax_id || '',
            address: u.address || ''
        }));
    }, [users]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resCash = await fetch('../data/api/system_accounting.php?t=' + Date.now()).then(r => r.json());

            if (resCash.success && Array.isArray(resCash.data)) {
                // Sort by ID desc (newest first)
                const sortedData = resCash.data.sort((a, b) => b.id - a.id);
                setCashTransactions(sortedData);
                calculateStats(sortedData);

                setInvoiceTransactions(sortedData.filter(t =>
                    t.type === 'income' &&
                    ['Satış Geliri', 'Komisyon Geliri', 'Yazılım', 'Hizmet Bedeli'].includes(t.category)
                ));
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (txList) => {
        let inc = 0, exp = 0;
        txList.forEach(t => {
            const val = parseFloat(t.amount);
            if (t.type === 'income') inc += val; else exp += val;
        });
        setStats({ income: inc, expense: exp, balance: inc - exp });
    };

    React.useEffect(() => {
        fetchData();

        // Fetch users if missing (needed for entities dropdown)
        if ((!users || users.length === 0) && typeof setUsers === 'function') {
            fetch('../data/api/list_users.php')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.users) {
                        setUsers(data.users);
                    }
                })
                .catch(err => console.error("Error fetching users for accounting:", err));
        }
    }, []);

    // --- FILTER LOGIC ---
    const getFilteredData = () => {
        let source = activeTab === 'cash' ? cashTransactions : invoiceTransactions;

        return source.filter(item => {
            // Date Range
            if (filterStart && item.date < filterStart) return false;
            if (filterEnd && item.date > filterEnd) return false;

            // Category
            if (filterCategory && item.category !== filterCategory) return false;

            // Search (Description or Entity Name)
            if (searchQuery) {
                const term = searchQuery.toLowerCase();
                const desc = (item.description || '').toLowerCase();
                const ent = (item.entity_name || '').toLowerCase();
                if (!desc.includes(term) && !ent.includes(term)) return false;
            }

            return true;
        });
    };

    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination when filters change
    React.useEffect(() => { setCurrentPage(1); }, [filterStart, filterEnd, filterCategory, searchQuery, activeTab]);


    // ... (Handlers: handleSaveTransaction, handleSaveInvoice, handleDelete unchanged) ...
    const handleSaveTransaction = async (transaction) => {
        try {
            const payload = {
                type: transaction.type, category: transaction.category,
                entity_name: transaction.entity_name, entity_id: transaction.entityId,
                description: transaction.desc, amount: transaction.amount, date: transaction.date
            };
            const response = await fetch('../data/api/system_accounting.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (data.success) { alert('✅ İşlem başarıyla kaydedildi.'); setIsModalOpen(false); fetchData(); }
            else { alert('❌ Kayıt Başarısız: ' + data.message); }
        } catch (err) { alert('Bir hata oluştu.'); }
    };

    const handleSaveInvoice = async (inv) => {
        try {
            const payload = {
                type: 'income',
                category: 'Satış Geliri',
                entity_name: inv.recipient_name,
                entity_id: inv.entity_id,
                description: inv.service,
                amount: inv.amount,
                date: new Date().toISOString().split('T')[0],
                details: JSON.stringify(inv)
            };
            const response = await fetch('../data/api/system_accounting.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (data.success) { alert('✅ Fatura başarıyla oluşturuldu.'); setIsInvoiceModalOpen(false); fetchData(); }
            else { alert('❌ Kayıt Başarısız: ' + data.message); }
        } catch (err) { alert('Bir hata oluştu.'); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        try {
            await fetch('../data/api/system_accounting.php?action=delete', { method: 'POST', body: JSON.stringify({ id }) });
            fetchData();
        } catch (e) { }
    };


    // CSV Export Function
    const downloadCSV = () => {
        const headers = ["ID", "Tarih", "Yön", "Kategori", "Açıklama", "Kişi/Kurum", "Tutar"];
        const csvContent = [
            headers.join(";"),
            ...filteredData.map(t => [
                t.id,
                t.date,
                t.type === 'income' ? 'Gelir' : 'Gider',
                t.category,
                `"${(t.description || '').replace(/"/g, '""')}"`,
                `"${(t.entity_name || '').replace(/"/g, '""')}"`,
                t.amount.toString().replace('.', ',') // Format for Turkish Excel
            ].join(";"))
        ].join("\n");

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `muhasebe_raporu_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Arama</label>
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-3 text-gray-300"></i>
                        <input
                            type="text"
                            placeholder="Açıklama veya Kişi Ara..."
                            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Kategori</label>
                    <select
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500 min-w-[150px]"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">Tümü</option>
                        <option value="Satış Geliri">Satış Geliri</option>
                        <option value="Komisyon Geliri">Komisyon Geliri</option>
                        <option value="Yatırım">Yatırım</option>
                        <option value="Personel Maaşı">Personel Maaşı</option>
                        <option value="Kira">Kira</option>
                        <option value="Vergi">Vergi</option>
                        <option value="Diğer">Diğer</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Başlangıç</label>
                        <input
                            type="date"
                            className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500"
                            value={filterStart}
                            onChange={(e) => setFilterStart(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Bitiş</label>
                        <input
                            type="date"
                            className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500"
                            value={filterEnd}
                            onChange={(e) => setFilterEnd(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setFilterStart(''); setFilterEnd(''); setFilterCategory(''); setSearchQuery(''); }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-bold transition"
                    >
                        <i className="fas fa-undo mr-1"></i> Temizle
                    </button>
                    <button
                        onClick={downloadCSV}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-indigo-200"
                    >
                        <i className="fas fa-file-download mr-1"></i> Rapor Al
                    </button>
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
                                {paginatedData.map(t => (
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
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => window.open(`../data/api/system_accounting.php?action=print_invoice&id=${t.id}`, '_blank')} className="text-gray-300 hover:text-indigo-600 transition" title="Yazdır">
                                                <i className="fas fa-print"></i>
                                            </button>
                                            <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500 transition" title="Sil">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                                Toplam <b>{filteredData.length}</b> kayıttan <b>{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)}</b> arası gösteriliyor
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded bg-white border hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) && (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`px-3 py-1 rounded border ${currentPage === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100'}`}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded bg-white border hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                    {/* Invoice Stats */}
                    {/* ... (Kept Invoice Stats same as before, simplified for brevity in this replace but fully functional in logic) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 border-b border-gray-100">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Toplam Matrah (Net)</div>
                            <div className="text-2xl font-black text-gray-800">
                                {(invoiceTransactions || []).reduce((acc, inv) => acc + (parseFloat(inv?.amount || 0)), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                        </div>
                        {/* More stats if needed (omitted for brevity but logic is there) */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Genel Toplam (KDV Dahil)</div>
                            <div className="text-2xl font-black text-emerald-600">
                                {(invoiceTransactions || []).reduce((acc, inv) => {
                                    const amt = parseFloat(inv?.amount || 0);
                                    let rate = 20;
                                    try {
                                        if (inv.details) {
                                            const d = (typeof inv.details === 'string') ? JSON.parse(inv.details) : inv.details;
                                            if (d?.vat_rate) rate = parseInt(d.vat_rate);
                                        }
                                    } catch (e) { }
                                    return acc + (amt * (1 + rate / 100));
                                }, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-b flex justify-between items-center bg-white">
                        <div className="font-bold text-gray-700">Resmi Fatura Listesi</div>
                        <button
                            onClick={() => setIsInvoiceModalOpen(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <i className="fas fa-file-invoice"></i> Yeni Fatura Kes
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Belge No</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Müşteri / Kurum</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tutar (KDV Hariç)</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tarih</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Kategori</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedData.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-gray-400">Kayıt bulunamadı.</td></tr> :
                                paginatedData.map(inv => (
                                    <tr key={inv.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono text-xs text-gray-500">LKY-{inv.id}</td>
                                        <td className="p-4 font-bold text-gray-700">{inv.entity_name || 'Bilinmiyor'}</td>
                                        <td className="p-4 font-bold text-emerald-600">{parseFloat(inv.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                        <td className="p-4 text-sm text-gray-500">{inv.date}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-blue-50 text-blue-700">
                                                {inv.category}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2 justify-end">
                                            <button onClick={() => window.open(`../data/api/system_accounting.php?action=print_invoice&id=${inv.id}`, '_blank')} className="text-slate-400 hover:text-indigo-600 transition" title="Yazdır">
                                                <i className="fas fa-print"></i>
                                            </button>
                                            <button onClick={() => handleDelete(inv.id)} className="text-slate-400 hover:text-rose-600 transition" title="Sil">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    {/* Pagination for Invoices */}
                    <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                            Toplam <b>{filteredData.length}</b> kayıttan <b>{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)}</b> arası gösteriliyor
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-white border hover:bg-gray-100 disabled:opacity-50"
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) && (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`px-3 py-1 rounded border ${currentPage === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100'}`}
                                    >
                                        {p}
                                    </button>
                                )
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded bg-white border hover:bg-gray-100 disabled:opacity-50"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTransaction} systemEntities={systemEntities} />
            <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} onSave={handleSaveInvoice} systemEntities={systemEntities} />
            {/* Printable Invoice Overlay */}
            {printInvoiceData && <PrintableInvoice data={printInvoiceData} onClose={() => setPrintInvoiceData(null)} />}
        </div>
    );
};
