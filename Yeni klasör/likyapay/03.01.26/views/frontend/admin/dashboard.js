// Admin Dashboard Entry Point (Glue Code)
// Path: views/frontend/admin/dashboard.js

window.Admin = window.Admin || {};

window.Admin.Dashboard = ({ onLogout }) => {
    const Layout = window.Admin.Layout.Main;
    const [view, setView] = React.useState('dashboard');
    const [users, setUsers] = React.useState([]);
    const [transactions, setTransactions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Initial Data Fetch
    React.useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Users
                const userRes = await fetch('/likyasoft/public/likyapay/data/api/companies.php');
                const userData = await userRes.json();
                if (userData.records) {
                    const formattedUsers = userData.records.map(u => ({
                        id: u.id,
                        title: u.name,
                        email: u.email,
                        taxNo: u.tax_id,
                        phone: u.phone || '',
                        status: u.status || 'pending',
                        contactPerson: u.contact_person || '', // If available
                        role: u.role
                    }));
                    setUsers(formattedUsers);
                }

                // Fetch All Transactions
                const txRes = await fetch('/likyasoft/public/likyapay/data/api/admin_transactions.php');
                const txData = await txRes.json();

                if (txData.success && txData.data) {
                    // Format amounts slightly if needed, or keeping raw
                    setTransactions(txData.data);
                } else {
                    setTransactions([]);
                }

            } catch (err) {
                console.error("Data load error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Page Routing
    const renderPage = () => {
        const commonProps = { users, setUsers, transactions, setTransactions };

        switch (view) {
            case 'dashboard':
                return <window.Admin.Pages.DashboardHome
                    users={users}
                    pendings={users.filter(u => u.status === 'pending' || u.status === 'pre_approved')}
                    transactions={transactions}
                />;
            case 'approvals':
                return <window.Admin.Pages.Approvals
                    pendings={users.filter(u => u.status === 'pending' || u.status === 'pre_approved')}
                    setPendings={(newPendings) => {
                        // Optimistic update of local users state
                        // Logic to remove approved/rejected user from local state 'users' pending list
                        // This complex update usually requires re-fetching or better state management, 
                        // but for now we rely on the component to handle its own API calls and maybe parent re-fetch.
                        // Actually, setPendings prop in Approvals.js updates its local prop? No, it expects a setter.
                        // Ideally we pass a callback "onApprove"
                    }}
                    users={users} // Pass all users so we can find full obj
                    setUsers={setUsers}
                />;
            case 'users':
                return <window.Admin.Pages.Users {...commonProps} />;
            case 'accounting':
                // Check if Accounting page exists, else fallback
                return window.Admin.Pages.Accounting ?
                    <window.Admin.Pages.Accounting {...commonProps} /> : <div>Muhasebe Modülü Yüklenemedi</div>;
            case 'sirius':
                return window.Admin.Pages.Sirius ? <window.Admin.Pages.Sirius /> : <div>Sirius Modülü Yüklenemedi</div>;
            case 'admin_users':
                return window.Admin.Pages.AdminUsers ? <window.Admin.Pages.AdminUsers {...commonProps} /> : <div>Yönetici Modülü Yüklenemedi</div>;
            case 'reports':
                return window.Admin.Pages.Reports ? <window.Admin.Pages.Reports {...commonProps} /> : <div>Raporlar Hazırlanıyor...</div>;
            case 'site_settings':
                return window.Admin.Pages.GeneralSettings ? <window.Admin.Pages.GeneralSettings /> : <div>Ayarlar Yüklenemedi</div>;
            case 'content_manager':
                return window.Admin.Pages.ContentManager ? <window.Admin.Pages.ContentManager /> : <div>İçerik Yöneticisi Yüklenemedi</div>;
            case 'system_logs':
                return window.Admin.Pages.SystemLogs ? <window.Admin.Pages.SystemLogs /> : <div>Loglar Yüklenemedi</div>;
            // Add other pages as needed
            default:
                return <window.Admin.Pages.DashboardHome {...commonProps} />;
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400">Yükleniyor...</div>;

    return (
        <Layout view={view} setView={setView} onLogout={onLogout}>
            {renderPage()}
        </Layout>
    );
};
