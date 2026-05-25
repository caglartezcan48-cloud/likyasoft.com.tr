// Invoices Component
// Path: views/frontend/kullanicilar/Invoices.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Invoices = ({ transactions, onAddTransaction }) => {
    const [activeTab, setActiveTab] = React.useState('debt'); // 'debt' or 'credit'

    // Transactions from Props

    // Modal State
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newInvoice, setNewInvoice] = React.useState({ party: '', amount: '', type: 'debt', date: '' });

    // Autocomplete State
    const [suggestions, setSuggestions] = React.useState([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    // Search existing companies
    const handleSearch = async (val) => {
        setNewInvoice(prev => ({ ...prev, party: val }));

        if (val.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const res = await fetch(`/likyapay/data/api/search_companies.php?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            if (data.success && data.data) {
                setSuggestions(data.data);
                setShowSuggestions(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const selectCompany = (company) => {
        setNewInvoice(prev => ({ ...prev, party: company.name, tax_id: company.tax_id })); // Store tax_id to link later if needed
        setShowSuggestions(false);
    };

    const handleSave = async () => {
        if (!newInvoice.party || !newInvoice.amount) return alert("Lütfen alanları doldurun.");

        // Validation: Tax ID Required for accurate mapping
        // Logic: Either selected from list (tax_id) OR newly entered (new_tax_id) must exist
        if (!newInvoice.id && !newInvoice.tax_id && !newInvoice.new_tax_id) {
            alert("Lütfen karşı firmanın/kişinin Vergi veya T.C. Kimlik numarasını giriniz.\n(Sistemde kayıtlı değilse manuel olarak ekleyebilirsiniz.)");
            return;
        }

        try {
            const method = newInvoice.id ? 'PUT' : 'POST';

            let body;
            let headers = {};

            if (method === 'PUT') {
                // Backend expects JSON for PUT
                body = JSON.stringify({
                    id: newInvoice.id,
                    party: newInvoice.party,
                    amount: parseFloat(newInvoice.amount),
                    type: newInvoice.type,
                    date: newInvoice.date,
                    description: newInvoice.description || ''
                });
                headers['Content-Type'] = 'application/json';
            } else {
                // POST allows File Upload (FormData)
                const formData = new FormData();
                formData.append('party', newInvoice.party);
                formData.append('amount', parseFloat(newInvoice.amount));
                formData.append('type', newInvoice.type);
                formData.append('date', newInvoice.date);
                formData.append('description', newInvoice.description || '');

                if (newInvoice.tax_id) formData.append('tax_id', newInvoice.tax_id);
                if (newInvoice.new_tax_id) formData.append('new_tax_id', newInvoice.new_tax_id);
                if (newInvoice.new_email) formData.append('new_email', newInvoice.new_email);
                if (newInvoice.id) formData.append('id', newInvoice.id);

                if (newInvoice.file) {
                    formData.append('file', newInvoice.file);
                }
                body = formData;
            }

            const res = await fetch('/likyasoft/public/likyapay/data/api/transactions.php', {
                method: method,
                headers: headers,
                body: body
            });
            const data = await res.json();

            if (data.success) {
                window.showToast?.('Kayıt başarıyla eklendi!', 'success') || alert('Kayıt Eklendi!');
                setIsModalOpen(false);
                setNewInvoice({ party: '', amount: '', type: 'debt', date: '' });
                // Trigger refresh in parent if possible, or reload
                if (window.location.reload) setTimeout(() => window.location.reload(), 1000);
            } else {
                alert("Hata: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        }
    };

    // Filter transactions from props
    const filteredData = transactions.filter(item => item.type === activeTab);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Borç ve Alacak Yönetimi</h2>
                    <p className="text-slate-500 text-sm">Finansal kayıtlarınızı buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-lg shadow-brand-500/30 flex items-center gap-2 transition transform hover:-translate-y-0.5">
                    <i className="fas fa-plus"></i>
                    Yeni Kayıt Ekle
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex">
                <button
                    onClick={() => setActiveTab('debt')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'debt' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Borçlarım
                </button>
                <button
                    onClick={() => setActiveTab('credit')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'credit' ? 'bg-green-50 text-green-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Alacaklarım
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Firma / Kişi</th>
                                <th className="px-6 py-4">Tutar</th>
                                <th className="px-6 py-4">Vade Tarihi</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">Belge</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.party}</td>
                                    <td className={`px-6 py-4 font-bold ${item.type === 'debt' ? 'text-red-500' : 'text-green-500'}`}>
                                        ₺{item.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`
                                                px-2.5 py-1 rounded-full text-xs font-bold w-fit
                                                ${item.status.includes('Sirius') ? 'bg-purple-100 text-purple-700' :
                                                    item.status === 'Onaylandı' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                                            `}>
                                                {item.status}
                                            </span>
                                            {item.description && (
                                                <span className="text-xs text-slate-400 mt-1 max-w-[150px] truncate" title={item.description}>
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400 hover:text-brand-600 cursor-pointer transition">
                                            <i className="fas fa-file-pdf"></i>
                                            {item.doc_path && (
                                                <a href={`/likyapay/uploads/documents/${item.doc_path}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline">
                                                    Görüntüle
                                                </a>
                                            )}
                                            {!item.doc_path && <span className="text-xs">Yok</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setNewInvoice({
                                                        id: item.id,
                                                        party: item.party,
                                                        amount: item.amount,
                                                        type: item.type, // Map effective type to original type if needed, or keep as is
                                                        date: item.date,
                                                        description: item.description
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-brand-600 hover:text-brand-800 p-2 text-xs font-bold"
                                                title="Düzenle">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                                                        try {
                                                            const res = await fetch('/likyasoft/public/likyapay/data/api/transactions.php', {
                                                                method: 'DELETE',
                                                                body: JSON.stringify({ id: item.id })
                                                            });
                                                            const data = await res.json();
                                                            if (data.success) {
                                                                // Reload or callback
                                                                if (window.location.reload) window.location.reload();
                                                            } else {
                                                                alert(data.message || 'Silinemedi');
                                                            }
                                                        } catch (e) { console.error(e); }
                                                    }
                                                }}
                                                className="text-red-400 hover:text-red-600 p-2 text-xs"
                                                title="Sil">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Empty State */}
                {filteredData.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <i className="far fa-folder-open text-4xl mb-3 opacity-50"></i>
                        <p>Henüz bu kategoride bir kayıt bulunmuyor.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Yeni Finansal Kayıt</h3>
                            <button onClick={() => setIsModalOpen(false)}><i className="fas fa-times text-slate-400"></i></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">İşlem Tipi</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 bg-slate-50"
                                    value={newInvoice.type}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, type: e.target.value })}
                                >
                                    <option value="debt">Borç Ekle (Ben Borçluyum)</option>
                                    <option value="credit">Alacak Ekle (Ben Alacaklıyım)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Firma / Kişi Adı</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                                        placeholder="Firma adı veya Vergi No ile arayın"
                                        value={newInvoice.party}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {suggestions.map(s => (
                                                <div
                                                    key={s.id}
                                                    onClick={() => selectCompany(s)}
                                                    className="px-4 py-2 hover:bg-brand-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                >
                                                    <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                                                    <div className="text-xs text-slate-500">Vergi No: {s.tax_id || '---'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* New Company Details (Shown only if not selecting existing) */}
                            {!newInvoice.tax_id && newInvoice.party.length > 2 && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-3 animate-fade-in">
                                    <p className="text-xs text-brand-600 font-bold mb-2 flex items-center">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Yeni Firma/Kişi Detayları
                                    </p>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Vergi Numarası / T.C.</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                            placeholder="Zorunlu Alan"
                                            value={newInvoice.new_tax_id || ''}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, new_tax_id: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">E-Posta</label>
                                            <input
                                                type="email"
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                                value={newInvoice.new_email || ''}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, new_email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Telefon</label>
                                            <input
                                                type="tel"
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                                value={newInvoice.new_phone || ''}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, new_phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tutar (TL)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="0.00"
                                    value={newInvoice.amount}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama / Fatura No</label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 text-sm h-20 resize-none"
                                    placeholder="İşlem ile ilgili açıklama veya belge numarası..."
                                    value={newInvoice.description || ''}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Vade Tarihi</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={newInvoice.date}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Belge Yükle (PDF / Resim)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full border rounded-lg px-3 py-2 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                    onChange={(e) => setNewInvoice({ ...newInvoice, file: e.target.files[0] })}
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition shadow-lg mt-2">
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
