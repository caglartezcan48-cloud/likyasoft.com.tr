// Admin Layout Wrapper
// Path: views/frontend/admin/layout/AdminLayout.js
window.Admin = window.Admin || {};
window.Admin.Layout = window.Admin.Layout || {};
window.Admin.Layout.Main = ({ children, view, setView, onLogout }) => {
    const Sidebar = window.Admin.Layout.Sidebar;
    const Topbar = window.Admin.Layout.Topbar;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    React.useEffect(() => {
        const currentHash = window.location.hash.replace('#', '') || 'dashboard';
        if (currentHash !== view) { window.history.pushState({ view }, '', `#${view}`); }
    }, [view]);
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
            {Sidebar && <Sidebar view={view} setView={setView} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} onLogout={onLogout} />}
            <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 md:ml-64`}>
                {Topbar && <Topbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} onLogout={onLogout} />}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-slate-50">
                    <div className="max-w-7xl mx-auto pb-10">{children}</div>
                </main>
            </div>
        </div>
    );
};
