// VideoSection Component (Youtube Embed)
// Path: views/frontend/anasayfa/VideoSection.js

window.Anasayfa = window.Anasayfa || {};

// VideoSection Component (Youtube Embed)
// Path: views/frontend/anasayfa/VideoSection.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.VideoSection = () => {
    const [videos, setVideos] = React.useState([]);
    const [mainVideo, setMainVideo] = React.useState(null);

    React.useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch('../data/api/site_content.php');
                const data = await res.json();
                if (data.success && data.data && data.data.videos) {
                    const validVideos = data.data.videos.filter(v => v.url && v.url.trim() !== '');
                    if (validVideos.length > 0) {
                        setVideos(validVideos);
                        setMainVideo(validVideos[0]);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchVideos();
    }, []);

    const getEmbedUrl = (url) => {
        if (!url) return '';
        // Handle various youtube formats
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1];
        } else if (url.includes('embed/')) {
            return url; // Already embed
        }

        if (videoId) {
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url;
    };

    if (videos.length === 0) {
        // Fallback or Empty
        return (
            <section id="video-tanitim" className="py-16 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-3">
                        <i className="fas fa-film text-brand-500"></i> Likya Pay Tanıtım Filmi
                    </h2>
                    <div className="relative w-full aspect-video rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.3)] overflow-hidden border border-slate-700 bg-black">
                        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/usIwSQ-Rxdw" title="Demo" frameBorder="0" allowFullScreen></iframe>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="video-tanitim" className="py-16 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-3 text-center">
                    <i className="fas fa-film text-brand-500"></i> Tanıtım Videoları
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Player */}
                    <div className="lg:col-span-2">
                        <div className="relative w-full aspect-video rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.3)] overflow-hidden border border-slate-700 bg-black sticky top-4">
                            <iframe
                                width="100%"
                                height="100%"
                                src={mainVideo ? getEmbedUrl(mainVideo.url) : ''}
                                title={mainVideo?.title || 'Video'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                        <h3 className="text-white font-bold text-xl mt-4 pl-2">{mainVideo?.title}</h3>
                    </div>

                    {/* Playlist */}
                    <div className="lg:col-span-1 h-[400px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {videos.map((vid, idx) => (
                            <div
                                key={idx}
                                onClick={() => setMainVideo(vid)}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${mainVideo === vid ? 'bg-brand-900/50 border-brand-500' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'}`}
                            >
                                <div className="w-24 h-16 bg-black rounded-lg flex-shrink-0 overflow-hidden relative group">
                                    <img
                                        src={`https://img.youtube.com/vi/${getEmbedUrl(vid.url).split('/').pop()}/mqdefault.jpg`}
                                        alt="Thumb"
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <i className="fas fa-play text-white opacity-80 drop-shadow-md"></i>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`text-sm font-medium truncate ${mainVideo === vid ? 'text-brand-400' : 'text-slate-300'}`}>
                                        {vid.title || `Video #${idx + 1}`}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-1">Oynatmak için tıklayın</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};
