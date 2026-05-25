// Admin Layout Wrapper
// Path: views/frontend/admin/layout/AdminLayout.js

window.Admin = window.Admin || {};
window.Admin.Layout = window.Admin.Layout || {};

window.Admin.Layout.Main = ({ children, view, setView, onLogout }) => {
    const Sidebar = window.Admin.Layout.Sidebar;
    const Topbar = window.Admin.Layout.Topbar;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Flex layout: Sidebar (fixed/static) + Main Content Area (flex-1)
    // Main Content Area: Topbar (sticky) + Page Content
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
            {/* Sidebar */}
            <Sidebar view={view} setView={setView} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} onLogout={onLogout} />

            {/* Main Wrapper */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'md:ml-64' : 'md:ml-64'}`}>
                {/* Header - No longer fixed, but sticky or part of flow */}
                <Topbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} onLogout={onLogout} />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-slate-50">
                    <div className="max-w-7xl mx-auto pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
