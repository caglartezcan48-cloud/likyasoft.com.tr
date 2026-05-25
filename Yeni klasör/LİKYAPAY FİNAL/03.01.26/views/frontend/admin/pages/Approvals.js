// Approvals Management Page
// Path: views/frontend/admin/pages/Approvals.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Approvals = ({ pendings, setPendings, users, setUsers }) => {
    // Mock Pending Users (Managed by Parent)

    const handleApprove = async (id) => {
        if (confirm('Bu şirketi onaylamak istediğinize emin misiniz?')) {
            try {
                // Determine new status (usually 'verified')
                const updatedUser = { id: id, status: 'verified' };

                // Call API Update (Using existing company.php with POST or specific endpoint? 
                // Currently companies.php doesn't support UPDATE nicely via POST without tweaks or we reuse create logic? 
                // Actually usually PUT or special endpoint. Let's assume we create a simple update script or use companies.php DELETE/POST combination? 
                // No, let's create a quick status update action in companies.php or new endpoint)

                // Better: Use a dedicated 'approve_user.php'
                const res = await fetch('/likyapay/data/api/approve_user.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id, status: 'verified' })
                });

                const data = await res.json();

                if (data.success) {
                    // Update Local State in Parent (Ideally parent should handle this via callback, but we have setUsers)
                    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'verified' } : u));
                    window.showToast?.('Şirket onaylandı!', 'success');
                } else {
                    alert("Onay hatası: " + data.message);
                }

            } catch (err) {
                console.error(err);
                alert("Bir hata oluştu.");
            }
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Reddetme sebebini giriniz:");
        if (reason) {
            // API call to delete or ban
            try {
                const res = await fetch('/likyapay/data/api/approve_user.php', {
                    method: 'POST', // Or DELETE
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id, status: 'rejected', reason: reason })
                });
                const data = await res.json();
                if (data.success) {
                    setUsers(prev => prev.filter(u => u.id !== id)); // Remove from list
                    window.showToast?.('Başvuru reddedildi.', 'info');
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Onay Bekleyen İşlemler</h1>
                    <p className="text-gray-500 text-sm">Yeni üyelik başvurularını inceleyin ve karara bağlayın.</p>
                </div>
                <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold text-sm">
                    Bekleyen: {pendings.length}
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {pendings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <i className="fas fa-check-circle text-4xl text-emerald-400 mb-3"></i>
                        <p className="text-gray-500">Bekleyen başvuru bulunmuyor. Harika!</p>
                    </div>
                ) : (
                    pendings.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 text-xl">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-gray-500 mt-1">
                                        <span><i className="fas fa-id-card mr-1"></i> {item.taxNo}</span>
                                        <span className="hidden md:inline">•</span>
                                        <span><i className="get fa-calendar-alt mr-1"></i> {item.date}</span>
                                    </div>
                                    <div className="mt-3">
                                        <a href="#" className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition">
                                            <i className="fas fa-file-pdf mr-2"></i>
                                            {item.doc} (Görüntüle)
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <button
                                    onClick={() => handleReject(item.id)}
                                    className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition"
                                >
                                    Reddet
                                </button>
                                <button
                                    onClick={() => handleApprove(item.id)}
                                    className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-500/20 transition"
                                >
                                    <i className="fas fa-check mr-2"></i> Onayla
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
