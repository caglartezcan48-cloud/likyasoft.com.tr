// Admin App Entry Point
// Path: views/frontend/admin_app.js

const { useState, useEffect } = React;

const AdminApp = () => {
    // In valid implementation, checking session would be here
    const [view, setView] = useState('dashboard');

    // Centralized Data State - Cleared for Production
    const [users, setUsers] = useState([]);
    const [pendings, setPendings] = useState([]);

    // Initial Mock Transactions - Cleared
    const [transactions, setTransactions] = useState([]);

    const AdminLayout = window.Admin.Layout.Main;
    const DashboardHome = window.Admin.Pages.DashboardHome;
    const UsersPage = window.Admin.Pages.Users;
    const AccountingPage = window.Admin.Pages.Accounting;
    const ReportsPage = window.Admin.Pages.Reports;
    const ApprovalsPage = window.Admin.Pages.Approvals;
    const PendingInvoicesPage = window.Admin.Pages.PendingInvoices;
    const SiriusPage = window.Admin.Pages.Sirius;

    // Dynamic Component Wrapper to handle script loading order
    const SiriusArchivePage = (props) => {
        const Cmp = window.Admin.Pages.SiriusArchive;
        if (Cmp) return <Cmp {...props} />;
        return (
            <div className="p-8 text-center animate-fade-in">
                <div className="text-amber-600 text-xl font-bold mb-2"><i className="fas fa-hammer mr-2"></i>Modül Yükleniyor veya Bulunamadı</div>
                <p className="text-gray-500 mb-4">
                    Eğer bu ekran uzun süre kalıyorsa, sayfayı (CTRL+F5) yenileyin.<br />
                    Dosya: <b>views/frontend/admin/pages/SiriusArchive.js</b>
                </p>
                <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
            </div>
        );
    };

    const MessagesPage = window.Admin.Pages.Messages;

    // Settings Group Components
    const GeneralSettingsPage = window.Admin.Pages.GeneralSettings;
    const ContentManagerPage = window.Admin.Pages.ContentManager;
    const AdminUsersPage = window.Admin.Pages.AdminUsers;
    const SystemLogsPage = window.Admin.Pages.SystemLogs;

    return (
        <AdminLayout view={view} setView={setView}>
            {view === 'dashboard' && (
                <DashboardHome
                    users={users}
                    pendings={pendings}
                    transactions={transactions}
                />
            )}

            {/* Company Management Views */}
            {view === 'users' && <UsersPage users={users} setUsers={setUsers} transactions={transactions} />}
            {view === 'accounting' && <AccountingPage users={users} setUsers={setUsers} transactions={transactions} setTransactions={setTransactions} />}
            {view === 'reports' && <ReportsPage transactions={transactions} setTransactions={setTransactions} />}
            {view === 'approvals' && <ApprovalsPage />}
            {view === 'pending_invoices' && <PendingInvoicesPage />}
            {view === 'sirius' && <SiriusPage />}
            {view === 'sirius_archive' && <SiriusArchivePage />}
            {view === 'messages' && <MessagesPage />}

            {/* Site Settings Views */}
            {view === 'site_settings' && <GeneralSettingsPage />}
            {view === 'content_manager' && <ContentManagerPage />}
            {view === 'admin_users' && <AdminUsersPage />}
            {view === 'system_logs' && <SystemLogsPage />}
        </AdminLayout>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
const ErrorBoundary = window.ErrorBoundary;
root.render(
    <ErrorBoundary>
        <AdminApp />
    </ErrorBoundary>
);
