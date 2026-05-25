
window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Messages = () => {
    const [conversations, setConversations] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [reply, setReply] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [msgLoading, setMsgLoading] = React.useState(false);
    const [file, setFile] = React.useState(null);
    const [showNewMsgModal, setShowNewMsgModal] = React.useState(false);
    const [userList, setUserList] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const messagesEndRef = React.useRef(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch('../data/api/list_users.php');
            const data = await res.json();
            if (data.success) {
                setUserList(data.users);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startChat = (user) => {
        setShowNewMsgModal(false);
        // Check if conversation exists
        const existing = conversations.find(c => c.id == user.id);
        if (existing) {
            selectUser(existing);
        } else {
            // Create temporary conversation item
            const newConv = {
                id: user.id,
                name: user.title,
                unreadCount: 0,
                messages: [],
                lastMsg: { message: '', created_at: new Date() }
            };
            setConversations(prev => [newConv, ...prev]);
            setSelectedUser(newConv);
            setMessages([]);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('../data/api/messages.php?v=' + Date.now());
            const data = await res.json();
            if (data.success) {
                const groups = {};
                data.data.forEach(msg => {
                    const otherId = msg.sender_id == 0 ? msg.receiver_id : msg.sender_id;
                    const otherName = msg.sender_id == 0 ? msg.receiver_name : msg.sender_name;

                    if (!groups[otherId]) {
                        groups[otherId] = {
                            id: otherId,
                            name: otherName,
                            lastMsg: msg,
                            unreadCount: 0,
                            messages: []
                        };
                    }
                    groups[otherId].messages.push(msg);

                    if (new Date(msg.created_at) > new Date(groups[otherId].lastMsg.created_at)) {
                        groups[otherId].lastMsg = msg;
                    }

                    if (msg.receiver_id == 0 && !msg.is_read) {
                        groups[otherId].unreadCount++;
                    }
                });

                const sorted = Object.values(groups).sort((a, b) =>
                    new Date(b.lastMsg.created_at) - new Date(a.lastMsg.created_at)
                );

                setConversations(sorted);

                if (selectedUser) {
                    const updatedUser = sorted.find(u => u.id === selectedUser.id);
                    if (updatedUser) {
                        setMessages(updatedUser.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 15000);
        return () => clearInterval(interval);
    }, [selectedUser]);

    const selectUser = (conv) => {
        setSelectedUser(conv);
        setMessages(conv.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));

        // Mark as read immediately in UI
        const unreadIds = conv.messages.filter(m => m.receiver_id == 0 && !m.is_read).map(m => m.id);
        if (unreadIds.length > 0) {
            unreadIds.forEach(id => {
                fetch('../data/api/messages.php', {
                    method: 'PUT',
                    body: JSON.stringify({ id: id })
                });
            });
            // Update local state to remove badge
            setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
        }
    };

    const sendReply = async () => {
        if ((!reply.trim() && !file) || !selectedUser) return;

        setMsgLoading(true);
        try {
            const formData = new FormData();
            formData.append('receiver_id', selectedUser.id);
            formData.append('subject', 'RE: Destek');
            formData.append('message', reply);
            if (file) {
                formData.append('attachment', file);
            }

            const res = await fetch('../data/api/messages.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setReply('');
                setFile(null);
                fetchConversations();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMsgLoading(false);
        }
    };

    const renderAttachment = (path, isMe) => {
        if (!path) return null;
        const url = `/${path}`;
        const ext = path.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return (
                <div className="mt-1 mb-1">
                    <a href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="Attachment" className="max-w-[200px] rounded-lg border border-black/10" />
                    </a>
                </div>
            );
        } else {
            return (
                <div className="mt-1 mb-1">
                    <a href={url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold ${isMe ? 'bg-white/20 text-white' : 'bg-slate-100 text-brand-600'}`}>
                        <i className="fas fa-file-download text-lg"></i>
                        <span>Dosyayı İndir ({ext.toUpperCase()})</span>
                    </a>
                </div>
            );
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] bg-white rounded-none md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in relative">

            {/* 1. CONTACT LIST (SIDEBAR) */}
            <div className={`
                w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-white transition-all duration-300 absolute inset-0 md:static z-10
                ${selectedUser ? 'translate-x-[-100%] md:translate-x-0' : 'translate-x-0'}
            `}>
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-slate-800 text-lg">Mesajlar</h2>
                    <div className="flex gap-2 text-slate-400">
                        <button
                            onClick={() => { setShowNewMsgModal(true); fetchUsers(); }}
                            className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white flex items-center justify-center transition"
                            title="Yeni Mesaj"
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                        <i className="fas fa-search hover:text-slate-600 cursor-pointer p-2"></i>
                        <i className="fas fa-ellipsis-v hover:text-slate-600 cursor-pointer p-2"></i>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400 text-sm mt-10">
                            <i className="fas fa-circle-notch fa-spin mr-2"></i> Yükleniyor...
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <i className="far fa-comments text-2xl"></i>
                            </div>
                            <p>Henüz mesaj yok.</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => selectUser(conv)}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition border-b border-slate-50
                                    ${selectedUser?.id === conv.id ? 'bg-slate-100' : 'hover:bg-slate-50'}
                                `}
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0">
                                    {conv.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className="font-semibold text-slate-800 truncate">{conv.name}</h4>
                                        <span className={`text-xs ${conv.unreadCount > 0 ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
                                            {new Date(conv.lastMsg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-slate-500 truncate pr-2">
                                            {conv.lastMsg.sender_id == 0 && <i className="fas fa-check-double text-blue-500 text-[10px] mr-1"></i>}
                                            {conv.lastMsg.attachment_path ? <span><i className="fas fa-camera text-xs mr-1"></i> Fotoğraf</span> : conv.lastMsg.message}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 2. CHAT AREA (MAIN) */}
            <div className={`
                w-full md:w-2/3 flex flex-col bg-[#efeae2] transition-all duration-300 absolute inset-0 md:static z-20
                ${selectedUser ? 'translate-x-0' : 'translate-x-[100%] md:translate-x-0'}
            `}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 bg-slate-50 border-b border-slate-200 flex items-center px-4 shadow-sm z-30">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="md:hidden mr-3 text-slate-600 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center transition"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold mr-3">
                                {selectedUser.name.charAt(0)}
                            </div>
                            <div className="flex-1 cursor-pointer" onClick={() => { /* View Profile? */ }}>
                                <h3 className="font-bold text-slate-800 leading-tight">{selectedUser.name}</h3>
                                <span className="text-xs text-slate-500">Mükellef</span>
                            </div>
                            <div className="flex gap-4 text-slate-500">
                                <i className="fas fa-phone hover:text-slate-700 cursor-pointer"></i>
                                <i className="fas fa-paperclip hover:text-slate-700 cursor-pointer"></i>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-repeat" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}>
                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id == 0;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col max-w-[85%] md:max-w-[65%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                                    >
                                        <div className={`
                                            relative px-3 py-2 rounded-lg text-sm shadow-sm
                                            ${isMe
                                                ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                                                : 'bg-white text-gray-900 rounded-tl-none'
                                            }
                                        `}>
                                            {!isMe && <div className="text-xs font-bold text-orange-600 mb-1">{selectedUser.name}</div>}

                                            {renderAttachment(msg.attachment_path, isMe)}

                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                                            <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 opacity-60 select-none
                                                ${isMe ? 'text-gray-600' : 'text-gray-500'}
                                            `}>
                                                {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                {isMe && (
                                                    <i className={`fas fa-check-double ${msg.is_read ? 'text-blue-500' : 'text-gray-400'}`}></i>
                                                )}
                                            </div>

                                            {/* Triangle Tail */}
                                            <div className={`absolute top-0 w-0 h-0 border-[6px] border-transparent 
                                                ${isMe
                                                    ? 'right-[-6px] border-t-[#d9fdd3] border-l-[#d9fdd3]'
                                                    : 'left-[-6px] border-t-white border-r-white'
                                                }
                                            `}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-slate-50 border-t border-slate-200">
                            {file && (
                                <div className="flex items-center gap-3 p-3 mb-2 bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-file text-brand-600"></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{file.name}</p>
                                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button onClick={() => setFile(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            )}

                            <div className="flex items-end gap-2">
                                <label className="p-3 text-slate-500 hover:text-slate-600 cursor-pointer transition">
                                    <i className="fas fa-plus text-xl"></i>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/png, image/jpeg, application/pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </label>
                                <div className="flex-1 bg-white rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/50 transition flex items-center px-4 py-2 shadow-sm">
                                    <input
                                        type="text"
                                        className="flex-1 outline-none text-slate-800 placeholder:text-slate-400 max-h-32 bg-transparent"
                                        placeholder="Bir mesaj yazın"
                                        value={reply}
                                        onChange={e => setReply(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendReply()}
                                    />
                                </div>
                                <button
                                    onClick={sendReply}
                                    disabled={msgLoading || (!reply.trim() && !file)}
                                    className={`
                                        w-12 h-12 rounded-full flex items-center justify-center shadow-md transition
                                        ${(reply.trim() || file)
                                            ? 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105 active:scale-95'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <i className="fas fa-paper-plane text-lg translate-x-[-1px] translate-y-[1px]"></i>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Desktop Welcome Screen */
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-b-[6px] border-brand-500 bg-[#f0f2f5]">
                        <div className="text-center p-10 max-w-md">
                            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-8">
                                <img src="../views/frontend/gorsel/logo.png" className="w-24 opacity-80" />
                            </div>
                            <h2 className="text-3xl font-light text-slate-700 mb-4">Likya Pay Destek</h2>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Mesaj göndermek ve destek taleplerini yönetmek için sol taraftan bir kullanıcı seçin.
                            </p>
                            <div className="mt-8 text-xs text-slate-400 flex items-center justify-center gap-2">
                                <i className="fas fa-lock text-[10px]"></i> Uçtan uca şifreli güvenli mesajlaşma
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* 3. NEW MESSAGE MODAL */}
            {showNewMsgModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Yeni Mesaj</h3>
                            <button onClick={() => setShowNewMsgModal(false)} className="text-slate-400 hover:text-red-500 transition">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="p-3 border-b border-slate-100">
                            <div className="bg-slate-100 rounded-lg flex items-center px-3 py-2">
                                <i className="fas fa-search text-slate-400 mr-2"></i>
                                <input
                                    type="text"
                                    placeholder="Kişi ara..."
                                    className="bg-transparent border-none outline-none w-full text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {userList
                                .filter(u => u.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => startChat(user)}
                                        className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold group-hover:bg-brand-600 group-hover:text-white transition">
                                            {user.title.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{user.title}</h4>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
