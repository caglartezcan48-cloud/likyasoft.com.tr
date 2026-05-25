
window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Messages = ({ user }) => {
    const [messages, setMessages] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('inbox'); // inbox, sent, new

    // New Message State
    const [subject, setSubject] = React.useState('');
    const [content, setContent] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [file, setFile] = React.useState(null); // File state

    // Initial Fetch
    const fetchMessages = async () => {
        try {
            const res = await fetch('../data/api/messages.php');
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMessages();
        // Poll every 30 seconds for new messages
        const interval = setInterval(fetchMessages, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = async () => {
        if (!subject || !content) return alert("Lütfen konu ve mesaj giriniz.");

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('message', content);
            if (file) {
                formData.append('attachment', file);
            }

            const res = await fetch('../data/api/messages.php', {
                method: 'POST',
                body: formData // No JSON, auto content-type
            });
            const data = await res.json();

            if (data.success) {
                alert("Mesajınız gönderildi.");
                setSubject('');
                setContent('');
                setFile(null); // Clear file
                setActiveTab('sent');
                fetchMessages();
            } else {
                alert(data.message || "Hata oluştu.");
            }
        } catch (err) {
            console.error(err);
            alert("Sunucu hatası.");
        } finally {
            setSending(false);
        }
    };

    const markAsRead = async (id, isRead) => {
        if (isRead) return;
        try {
            // Update local state immediately for UI response
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: 1 } : m));

            // Sync with backend
            await fetch('../data/api/messages.php', {
                method: 'PUT',
                body: JSON.stringify({ id })
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Helper to render attachment
    const renderAttachment = (path) => {
        if (!path) return null;
        // Fix path: backend saves relative to root, we are in views.
        // Path in DB: uploads/messages/xxx.jpg
        // View URL from frontend: ../uploads/messages/xxx.jpg (since we ARE in views/frontend/kullanicilar/ ?)
        // safer to use /uploads/messages/...
        const url = `/${path}`;
        const ext = path.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return (
                <div className="mt-2 mb-1">
                    <a href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="Attachment" className="max-w-[200px] rounded-lg border border-slate-200 hover:opacity-90 transition" />
                    </a>
                </div>
            );
        } else {
            return (
                <div className="mt-2 mb-1">
                    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-brand-600 font-bold hover:bg-slate-100">
                        <i className="fas fa-file-download text-lg"></i>
                        <span>Dosyayı İndir ({ext.toUpperCase()})</span>
                    </a>
                </div>
            );
        }
    };

    // Filter Logic
    const inbox = messages.filter(m => m.receiver_id == user.id);
    const sent = messages.filter(m => m.sender_id == user.id);

    const displayedMessages = activeTab === 'inbox' ? inbox : sent;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Destek ve Mesajlar</h2>
                    <p className="text-slate-500 text-sm">Yönetici ile iletişime geçin.</p>
                </div>
                <button
                    onClick={() => setActiveTab('new')}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-lg shadow-brand-500/30 flex items-center gap-2 transition"
                >
                    <i className="fas fa-pen"></i> Yeni Mesaj
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex mb-4">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'inbox' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-inbox"></i> Gelen Kutusu
                    {inbox.some(m => !m.is_read) && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                            {inbox.filter(m => !m.is_read).length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'sent' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-paper-plane"></i> Gönderilenler
                </button>
            </div>

            {activeTab === 'new' ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Yeni Destek Talebi / Mesaj</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Konu</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="Örn: Fatura itirazı hk."
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mesajınız</label>
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 h-32 resize-none focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="Sorununuzu detaylı bir şekilde anlatın..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        </div>
                        {file && (
                            <div className="mb-2 flex items-center gap-2 text-xs bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-100">
                                <i className="fas fa-paperclip"></i>
                                <span className="flex-1 truncate">{file.name}</span>
                                <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium">
                                <i className="fas fa-paperclip"></i> Dosya Ekle
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, application/pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </label>
                            <button
                                onClick={() => setActiveTab('inbox')}
                                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold shadow-md disabled:opacity-50"
                            >
                                {sending ? 'Gönderiliyor...' : 'Gönder'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Yükleniyor...</div>
                    ) : displayedMessages.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <i className="far fa-envelope-open text-4xl mb-3 opacity-30"></i>
                            <p>Bu klasörde mesajınız yok.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {displayedMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`p-4 hover:bg-slate-50 transition cursor-pointer ${!msg.is_read && activeTab === 'inbox' ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => {
                                        // Expand message logic? For now just simple toggle or alert
                                        // Better: Toggle expanded state locally
                                        // Let's implement simple expansion
                                        const el = document.getElementById(`msg-content-${msg.id}`);
                                        if (el) el.classList.toggle('hidden');

                                        if (activeTab === 'inbox' && !msg.is_read) {
                                            markAsRead(msg.id, msg.is_read);
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm
                                                ${activeTab === 'inbox' ? 'bg-brand-500' : 'bg-slate-400'}`}>
                                                {activeTab === 'inbox' ? 'A' : 'B'}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm ${!msg.is_read && activeTab === 'inbox' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                    {activeTab === 'inbox' ? msg.sender_name : 'Kime: ' + msg.receiver_name}
                                                </h4>
                                                <p className="text-xs text-slate-500">{msg.created_at}</p>
                                            </div>
                                        </div>
                                        {!msg.is_read && activeTab === 'inbox' && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                                        )}
                                    </div>
                                    <h5 className="font-bold text-slate-800 text-sm ml-14 mb-1">{msg.subject}</h5>

                                    {/* Preview / Content */}
                                    <div className="ml-14 text-sm text-slate-600">
                                        <p className="line-clamp-1 text-slate-400 text-xs italic mb-2">Tıklayarak oku...</p>
                                        <div id={`msg-content-${msg.id}`} className="hidden mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-800 whitespace-pre-wrap">
                                            {msg.message}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
