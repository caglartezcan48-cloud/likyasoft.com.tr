
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CRITICAL APP ERROR:", error, errorInfo);
        this.setState({ error: error, errorInfo: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-red-100">
                        <div className="bg-red-600 p-6 text-white">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <i className="fas fa-exclamation-triangle"></i>
                                Sistem Hatası (System Error)
                            </h2>
                        </div>
                        <div className="p-8">
                            <p className="text-gray-700 text-lg mb-6">
                                Beklenmedik teknik bir sorun oluştu. Yazılımcı ekibi bilgilendirildi.
                                (An unexpected technical issue occurred.)
                            </p>
                            
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left overflow-auto max-h-60">
                                <p className="font-mono text-sm text-red-800 break-words font-bold mb-2">
                                    {this.state.error && this.state.error.toString()}
                                </p>
                                <pre className="text-xs text-red-700 whitespace-pre-wrap">
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </div>

                            <div className="flex gap-4 justify-end">
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow-lg font-medium"
                                >
                                    <i className="fas fa-sync-alt mr-2"></i>
                                    Sayfayı Yenile (Refresh)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

window.ErrorBoundary = ErrorBoundary;
