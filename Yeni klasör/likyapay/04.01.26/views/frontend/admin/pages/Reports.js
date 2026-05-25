// Financial Reports Page
// Path: views/frontend/admin/pages/Reports.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Reports = ({ transactions, setTransactions }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <style>{`
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    body { background: white !important; }
                    button, .sidebar, header, .no-print { display: none !important; }
                    .min-h-screen { height: auto !important; }
                    /* Expand content */
                    .flex-1 { margin: 0 !important; padding: 0 !important; }
                    
                    table { width: 100% !important; border-collapse: collapse; font-size: 10pt; color: black !important; }
                    th, td { border: 1px solid #ddd !important; padding: 8px !important; }
                    /* Cards */
                    .grid { display: flex !important; gap: 20px; margin-bottom: 20px; }
                    .grid > div { flex: 1; border: 1px solid #ccc; box-shadow: none; }
                }
            `}</style>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Finansal Raporlar</h1>
                    <p className="text-gray-500 text-sm">Gerçekleşen mahsuplaşma işlemleri ve komisyon gelirleri.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                        <i className="fas fa-filter mr-2"></i> Filtrele
                    </button>
                    <button onClick={() => window.print()} className="bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-800 transition shadow">
                        <i className="fas fa-print mr-2"></i> Yazdır / PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase">Toplam İşlem Hacmi</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
                            transactions.reduce((acc, t) => acc + t.amount, 0)
                        )}
                    </h3>
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                        <i className="fas fa-minus mr-1"></i> Veri Yok
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase">Toplam Komisyon Geliri</p>
                    <h3 className="text-2xl font-bold text-brand-600 mt-2">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(
                            transactions.reduce((acc, t) => acc + t.commission, 0)
                        )}
                    </h3>
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                        <i className="fas fa-minus mr-1"></i> Veri Yok
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase">Başarılı Döngü</p>
                    <h3 className="text-2xl font-bold text-purple-600 mt-2">{transactions.length}</h3>
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                        <i className="fas fa-minus mr-1"></i> Veri Yok
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-700">Son İşlem Hareketleri</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-3">İşlem ID</th>
                                <th className="px-6 py-3">Tarih</th>
                                <th className="px-6 py-3">Taraflar (Borçlu &rarr; Alacaklı)</th>
                                <th className="px-6 py-3">Tutar</th>
                                <th className="px-6 py-3">Komisyon</th>
                                <th className="px-6 py-3">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((t, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{t.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-800">{t.firmA}</span>
                                            <i className="fas fa-arrow-right text-xs text-gray-400"></i>
                                            <span className="font-medium text-gray-800">{t.firmB}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                                        +{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.commission)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {t.status === 'completed' ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Tamamlandı</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">İşleniyor</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
