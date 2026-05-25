// My Companies Component
// Path: views/frontend/kullanicilar/MyCompanies.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.MyCompanies = () => {
    const [companies, setCompanies] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // New Company Form
    const [newComp, setNewComp] = React.useState({
        name: '', tax_id: '', email: '',
        tax_office: '', address: '', city: '', district: '',
        trade_registry_no: '', mersis_no: '', iban: ''
    });
    const [submitting, setSubmitting] = React.useState(false);

    // View Details Modal
    const [selectedCompany, setSelectedCompany] = React.useState(null);
    const [isDetailOpen, setIsDetailOpen] = React.useState(false);

    const fetchCompanies = async () => {
        try {
            const res = await fetch('../data/api/companies.php?v=' + Date.now());
            const data = await res.json();
            if (data.success) {
                setCompanies(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCompanies();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newComp.name || !newComp.tax_id) return alert("Şirket Adı ve Vergi No zorunludur.");

        // Validator Checks
        if (window.Validators) {
            if (!window.Validators.isValidTaxID(newComp.tax_id)) {
                return alert("Geçersiz Vergi/TC Kimlik Numarası (10 veya 11 hane olmalı).");
            }
            if (newComp.iban && !window.Validators.isValidIBAN(newComp.iban)) {
                return alert("Geçersiz IBAN formatı (TR + 24 hane).");
            }
        }

        setSubmitting(true);
        try {
            const res = await fetch('../data/api/companies.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComp)
            });
            const data = await res.json();

            if (data.success) {
                alert(data.message);
                setIsModalOpen(false);
                alert(data.message);
                setIsModalOpen(false);
                setNewComp({
                    name: '', tax_id: '', email: '',
                    tax_office: '', address: '', city: '', district: '',
                    trade_registry_no: '', mersis_no: '', iban: ''
                });
                fetchCompanies();
            } else {
                alert("Hata: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id, name) => {
        if (!confirm(`${name} isimli şirketi listenizden çıkarmak istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch('../data/api/companies.php', {
                method: 'POST', // or DELETE
                body: JSON.stringify({ id: id }),
                // If using DELETE method in logic but here POST with action or just body?
                // The API supports DELETE method or POST with specific logic.
                // Fetch default delete:
            });
            // Actually let's use explicit fetch method if supported or POST
            // The API code I wrote checks: ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete'))

            // Re-do correctly
            const res2 = await fetch('../data/api/companies.php?action=delete', {
                method: 'POST',
                body: JSON.stringify({ id: id })
            });

            const data = await res2.json();
            if (data.success) {
                fetchCompanies();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Çalıştığım Şirketler</h2>
                    <p className="text-slate-500 text-sm">Borç/Alacak kaydı girebileceğiniz firmaları buradan yönetin.</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        id="excelImport"
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const reader = new FileReader();
                            reader.onload = async (evt) => {
                                try {
                                    const bstr = evt.target.result;
                                    const wb = XLSX.read(bstr, { type: 'binary' });
                                    const wsname = wb.SheetNames[0];
                                    const ws = wb.Sheets[wsname];
                                    const data = XLSX.utils.sheet_to_json(ws);

                                    if (data.length === 0) return alert("Excel dosyası boş görünüyor.");

                                    if (!confirm(`${data.length} adet şirket aktarılacak. Onaylıyor musunuz?`)) return;

                                    const res = await fetch('../data/api/import_companies.php', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    });
                                    const result = await res.json();

                                    if (result.success) {
                                        window.showToast?.(`${result.added} şirket eklendi, ${result.skipped} şirket atlandı.`, 'success');
                                        fetchCompanies();
                                    } else {
                                        alert("Hata: " + result.message);
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert("Dosya okunurken bir hata oluştu. Lütfen formatı kontrol edin.");
                                }
                            };
                            reader.readAsBinaryString(file);
                            // Reset input
                            e.target.value = '';
                        }}
                    />
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => document.getElementById('excelImport').click()}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition"
                        >
                            <i className="fas fa-file-excel"></i> Excel'den Aktar
                        </button>
                        <button
                            onClick={() => {
                                const headers = [["Vergi No", "Şirket Adı", "Yetkili Kişi", "E-Posta", "Telefon", "Sektör", "Vergi Dairesi", "Şehir", "İlçe", "Adres", "Fatura Adresi", "KEP Adresi", "Mersis No", "Ticaret Sicil No", "IBAN"]];
                                const ws = XLSX.utils.aoa_to_sheet(headers);
                                const wb = XLSX.utils.book_new();
                                XLSX.utils.book_append_sheet(wb, ws, "Şirket Taslağı");
                                XLSX.writeFile(wb, "LikyaPay_Tam_Profil_Yukleme_Sablonu.xlsx");
                            }}


                            className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold flex items-center justify-center gap-1 transition"
                        >
                            <i className="fas fa-download text-[9px]"></i> Örnek Şablonu İndir
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-lg shadow-brand-500/30 flex items-center gap-2 transition"
                    >
                        <i className="fas fa-plus"></i> Şirket Ekle
                    </button>
                </div>


            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Şirket Adı</th>
                                <th className="px-6 py-4">Vergi No</th>
                                <th className="px-6 py-4">E-Posta</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">Yükleniyor...</td>
                                </tr>
                            ) : companies.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">
                                        <div className="flex flex-col items-center">
                                            <i className="far fa-building text-3xl mb-2 opacity-50"></i>
                                            <p>Henüz ekli şirketiniz yok. "Şirket Ekle" butonu ile başlayın.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                companies.map(company => (
                                    <tr key={company.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-bold text-slate-800">{company.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs bg-slate-100 rounded px-2 w-fit">{company.tax_id}</td>
                                        <td className="px-6 py-4 text-xs">{company.email.startsWith('pre_') ? '-' : company.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${company.status === 'verified' ? 'bg-green-100 text-green-700' :
                                                company.status === 'banned' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {company.status === 'verified' ? 'Onaylı' :
                                                    company.status === 'banned' ? 'Pasif' : 'Onay Bekliyor'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedCompany(company); setIsDetailOpen(true); }}
                                                    className="text-brand-600 hover:text-brand-800 p-2 text-xs transition bg-brand-50 rounded" title="Detaylar">
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(company.id, company.name)}
                                                    className="text-red-400 hover:text-red-600 p-2 text-xs transition bg-red-50 rounded" title="Listeden Çıkar">
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Using Portal */}
            {isModalOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in text-slate-900 font-sans">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 relative flex flex-col max-h-[95vh] my-auto">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>

                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex-shrink-0 pr-8">Yeni Şirket Ekle</h3>

                        <form onSubmit={handleAdd} className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-0.5">Vergi Numarası / T.C. <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        placeholder="10 haneli VKN veya 11 haneli TCKN"
                                        required
                                        value={newComp.tax_id}
                                        onChange={e => setNewComp({ ...newComp, tax_id: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-500 mt-0.5">Sistemde kayıtlı ise otomatik eşleşir.</p>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-0.5">Şirket / Kişi Adı <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                        placeholder="Tam ticari ünvan"
                                        required
                                        value={newComp.name}
                                        onChange={e => setNewComp({ ...newComp, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Vergi Dairesi</label>
                                    <input type="text" className="w-full border rounded-lg px-2.5 py-1.5 text-sm" placeholder="Vergi Dairesi"
                                        value={newComp.tax_office} onChange={e => setNewComp({ ...newComp, tax_office: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">E-Posta</label>
                                    <input type="email" className="w-full border rounded-lg px-2.5 py-1.5 text-sm" placeholder="firma@mail.com"
                                        value={newComp.email} onChange={e => setNewComp({ ...newComp, email: e.target.value })} />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Şehir</label>
                                    <input type="text" className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
                                        value={newComp.city} onChange={e => setNewComp({ ...newComp, city: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">İlçe</label>
                                    <input type="text" className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
                                        value={newComp.district} onChange={e => setNewComp({ ...newComp, district: e.target.value })} />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Açık Adres</label>
                                    <textarea className="w-full border rounded-lg px-2.5 py-1.5 text-sm h-14 resize-none"
                                        value={newComp.address} onChange={e => setNewComp({ ...newComp, address: e.target.value })}></textarea>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Ticaret Sicil No</label>
                                    <input type="text" className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
                                        value={newComp.trade_registry_no} onChange={e => setNewComp({ ...newComp, trade_registry_no: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Mersis No</label>
                                    <input type="text" className="w-full border rounded-lg px-2.5 py-1.5 text-sm"
                                        value={newComp.mersis_no} onChange={e => setNewComp({ ...newComp, mersis_no: e.target.value })} />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">IBAN</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg px-2.5 py-1.5 text-sm font-mono"
                                        placeholder="TR..."
                                        value={newComp.iban}
                                        onChange={e => {
                                            let val = e.target.value.toUpperCase();
                                            if (window.Validators) val = window.Validators.formatIBAN(val);
                                            setNewComp({ ...newComp, iban: val });
                                        }}
                                    />
                                </div>

                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-brand-600 text-white font-bold py-2.5 rounded-xl hover:bg-brand-700 transition shadow-lg mt-2 disabled:opacity-50"
                            >
                                {submitting ? 'Ekleniyor...' : 'Listeme Ekle'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
            {/* Detail Modal - Using Portal */}
            {isDetailOpen && selectedCompany && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in text-slate-900 font-sans">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative flex flex-col max-h-[85vh] my-4">
                        <button
                            onClick={() => setIsDetailOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                                <i className="fas fa-building"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{selectedCompany.name}</h3>
                            <p className="text-slate-500 text-sm">
                                {selectedCompany.city || '-'} {selectedCompany.district ? `/ ${selectedCompany.district}` : ''}
                            </p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${selectedCompany.status === 'verified' ? 'bg-green-100 text-green-700' :
                                selectedCompany.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {selectedCompany.status === 'verified' ? 'Onaylı' : selectedCompany.status === 'banned' ? 'Pasif' : 'Onay Bekliyor'}
                            </span>
                        </div>

                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-slate-500">Vergi Numarası:</div>
                                <div className="font-mono font-bold text-slate-700 text-right">{selectedCompany.tax_id}</div>

                                <div className="text-slate-500">Vergi Dairesi:</div>
                                <div className="font-bold text-slate-700 text-right">{selectedCompany.tax_office || '-'}</div>

                                <div className="text-slate-500">Mersis No:</div>
                                <div className="font-mono text-slate-700 text-right">{selectedCompany.mersis_no || '-'}</div>

                                <div className="text-slate-500">Ticaret Sicil:</div>
                                <div className="text-slate-700 text-right">{selectedCompany.trade_registry_no || '-'}</div>
                            </div>

                            <hr className="border-slate-200 my-2" />

                            <div>
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Adres</div>
                                <div className="text-sm text-slate-700 leading-snug">
                                    {selectedCompany.address || 'Adres bilgisi girilmemiş.'}
                                </div>
                            </div>

                            {selectedCompany.iban && (
                                <div className="mt-2 bg-white border border-slate-200 p-2 rounded lg:flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">IBAN:</span>
                                    <span className="text-xs font-mono text-slate-800">{selectedCompany.iban}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
