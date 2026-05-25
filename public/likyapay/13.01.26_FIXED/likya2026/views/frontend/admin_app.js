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
