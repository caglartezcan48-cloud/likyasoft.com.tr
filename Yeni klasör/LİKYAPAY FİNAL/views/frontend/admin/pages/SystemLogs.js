// System Logs Page
// Path: views/frontend/admin/pages/SystemLogs.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.SystemLogs = () => {
    return (
        <div className="animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Sistem Logları</h1>
            <p className="text-gray-500 text-sm">Sistemsel hareketler ve güvenlik kayıtları.</p>

            <div className="bg-black text-green-400 p-6 rounded-xl shadow-lg font-mono text-sm h-96 overflow-y-auto">
                <p><span className="text-gray-500">[2024-12-31 13:05:00]</span> SYSTEM STARTUP: Admin panel initialized.</p>
                <p><span className="text-gray-500">[2024-12-31 13:05:02]</span> AUTH: Admin user logged in from IP 192.168.1.1</p>
                <p><span className="text-gray-500">[2024-12-31 12:45:10]</span> CRON: Daily backup completed successfully.</p>
                <p><span className="text-gray-500">[2024-12-31 11:30:22]</span> USER: New registration request (ID: 204) received.</p>
                <p><span className="text-gray-500">[2024-12-31 10:15:00]</span> ERROR: Failed to connect to mail server (Retrying...)</p>
                <p><span className="text-gray-500">[2024-12-31 10:15:05]</span> INFO: Mail server connected.</p>
                <p className="animate-pulse mt-2">_ Waiting for new logs...</p>
            </div>
        </div>
    );
};
