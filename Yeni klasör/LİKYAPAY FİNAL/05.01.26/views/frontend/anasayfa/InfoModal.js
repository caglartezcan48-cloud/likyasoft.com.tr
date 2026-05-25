// InfoModal Component
// Path: views/frontend/anasayfa/InfoModal.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.InfoModal = ({ title, content, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-fade-in-up">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 text-slate-600 leading-relaxed text-lg">
                    {content}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition">
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};
