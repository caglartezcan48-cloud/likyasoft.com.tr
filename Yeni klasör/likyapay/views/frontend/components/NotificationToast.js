// Notification Toast Component
// Path: views/frontend/components/NotificationToast.js

window.Components = window.Components || {};

window.Components.NotificationToast = () => {
    const [show, setShow] = React.useState(false);
    const [lastUnreadCount, setLastUnreadCount] = React.useState(0);
    const [message, setMessage] = React.useState('');

    const checkMessages = async () => {
        try {
            const res = await fetch('../data/api/messages.php');
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                // Determine user role logic
                // If I am admin (sender_id=0 is me), unread is where receiver_id=0 and is_read=0
                // If I am user, unread is where receiver_id=myId and is_read=0
                // The API returns 'role' in response now

                const myRole = data.role; // 'admin' or 'user'
                let unread = 0;

                if (myRole === 'admin') {
                    unread = data.data.filter(m => m.receiver_id == 0 && m.is_read == 0).length;
                } else {
                    // For user, receiver_id is their own ID. 
                    // Since API filters by "sender_id = :uid OR receiver_id = :uid", we check logic:
                    // receiver_id should be :uid (which is NOT 0).
                    // But simpler logic: Am I the receiver? And is it unread?
                    // In backend we know current user ID.
                    // Let's filter client side:
                    // If role is user, my ID is NOT 0.
                    // The message object has receiver_id.
                    // Wait, we don't know our own ID easily here without props.
                    // But we know 'role'.
                    // If role == user, message must have receiver_id != 0 to be for me? 
                    // Actually, if sender_id is 0, it's FROM admin TO me. 
                    // So unread = sender_id == 0 && is_read == 0.
                    unread = data.data.filter(m => m.sender_id == 0 && m.is_read == 0).length;
                }

                if (unread > lastUnreadCount) {
                    setMessage(`${unread - lastUnreadCount} yeni mesajınız var!`);
                    setShow(true);
                    // Play sound
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.volume = 0.5;
                    audio.play().catch(e => console.log('Audio play failed', e));

                    setTimeout(() => setShow(false), 5000);
                }

                setLastUnreadCount(unread);
            }
        } catch (err) {
            // silent fail
        }
    };

    React.useEffect(() => {
        checkMessages();

        // Adaptive Polling Logic
        let intervalId = null;
        let idleTime = 0;

        const resetTimer = () => { idleTime = 0; };

        // Track activity
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('scroll', resetTimer); // Consider scroll as activity

        const startPolling = () => {
            if (intervalId) clearInterval(intervalId);

            intervalId = setInterval(() => {
                // If tab is hidden, poll very slowly (5 mins)
                if (document.hidden) {
                    if (new Date().getSeconds() % 300 === 0) checkMessages(); // Rudimentary check
                    return;
                }

                idleTime++;

                // Active: poll every 20s
                // Idle > 2 mins: poll every 60s
                // Idel > 10 mins: poll every 5 mins

                if (idleTime < 6) { // Less than ~2 mins (6 * 20s = 120s? No, logic depends on interval)
                    // Let's set interval to run every 20s
                    checkMessages();
                } else if (idleTime < 30) { // < 10 mins
                    // Poll every 3rd cycle (60s)
                    if (idleTime % 3 === 0) checkMessages();
                } else {
                    // Poll every 15th cycle (5 mins)
                    if (idleTime % 15 === 0) checkMessages();
                }

            }, 20000); // Base cycle: 20 seconds (Safe for 10k users)
        };

        startPolling();

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('scroll', resetTimer);
        };
    }, [lastUnreadCount]);

    if (!show) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-white border-l-4 border-brand-500 shadow-2xl rounded-lg p-4 z-50 animate-slide-up flex items-center gap-4 min-w-[300px]">
            <div className="bg-brand-100 text-brand-600 w-10 h-10 rounded-full flex items-center justify-center">
                <i className="fas fa-envelope"></i>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">Yeni Mesaj</h4>
                <p className="text-xs text-gray-600">{message}</p>
            </div>
            <button
                onClick={() => {
                    setShow(false);
                    // Redirect to messages
                    // For Admin: setView('messages')
                    // For User: setActiveTab('messages') or hash
                    // Since this is generic, we might rely on global navigation or just close properly
                    // Let's try to detect context
                    if (window.Admin && window.Admin.Layout) {
                        // We are in admin panel, but setView is inside layout scope. 
                        // We can't easily switch view from here without context.
                        // Ideally we pass context or reload with param.
                        // Simple alert or just close for now.
                        document.querySelector('button[title="Mesajlar / Destek"]')?.click(); // Hacky but works if sidebar rendered
                    } else {
                        // User panel
                        // Trigger click on sidebar
                        const link = Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.includes('Destek') || el.textContent.includes('Mesaj'));
                        if (link) link.click();
                    }
                }}
                className="bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-brand-700 transition"
            >
                Oku
            </button>
            <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};
