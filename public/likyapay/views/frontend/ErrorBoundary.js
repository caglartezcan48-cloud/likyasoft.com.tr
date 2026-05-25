// Error Boundary Component
// Path: views/frontend/ErrorBoundary.js

window.ErrorBoundary = class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full border border-red-100">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Bir Hata Oluştu!</h2>
                        <p className="text-gray-500 text-center mb-6">Beklenmeyen bir sorun nedeniyle sayfa yüklenemedi. Lütfen sayfayı yenilemeyi deneyin.</p>

                        {this.state.error && (
                            <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
                                <code className="text-red-400 text-xs font-mono">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-red-500/30 flex items-center justify-center"
                        >
                            <i className="fas fa-sync-alt mr-2"></i> Sayfayı Yenile
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
};
