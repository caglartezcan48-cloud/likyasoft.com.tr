<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Likya Pay | Yeni Nesil Finansal Optimizasyon</title>
    <meta name="description" content="Likya Pay ile ticari borç ve alacaklarınızı nakit akışına ihtiyaç duymadan mahsuplaşarak yönetin.">
    <link rel="icon" type="image/png" href="/likyasoft/public/likyapay/views/frontend/gorsel/logo.png">
    <link rel="manifest" href="/manifest.json">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Likya Pay">
    <meta property="og:description" content="Finansal Optimizasyon Platformu">
    
    <!-- Fonts & Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        brand: {
                            50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9',
                            600: '#0284c7', 700: '#0369a1', 900: '#0c4a6e',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .hero-pattern {
            background-color: #0c4a6e;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f172a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
    </style>
</head>
<body class="text-slate-800">

    <!-- Navbar -->
    <nav class="sticky top-0 z-50 glass-panel">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <div class="flex items-center gap-3">
                    <div class="bg-white p-1 rounded-full shadow-lg border border-slate-100 flex items-center justify-center w-12 h-12">
                        <img src="/likyasoft/public/likyapay/views/frontend/gorsel/logo.png" alt="Likya Pay" class="h-full w-full object-cover">
                    </div>
                    <span class="font-bold text-2xl tracking-tight text-brand-900">likyapay</span>
                </div>
                <div class="hidden md:flex items-center gap-6">
                    <a href="#nasil-calisir" class="text-slate-600 hover:text-brand-600 font-medium transition">Nasıl Çalışır?</a>
                    <a href="#video-tanitim" class="text-slate-600 hover:text-brand-600 font-medium transition"><i class="fas fa-play-circle mr-1"></i> Tanıtım Videosu</a>
                    <a href="#vizyon" class="text-slate-600 hover:text-brand-600 font-medium transition">Nedir?</a>
                </div>
                <div>
                    <a href="app.php" class="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full font-medium transition shadow-lg shadow-brand-500/30 flex items-center gap-2">
                        <i class="fas fa-sign-in-alt"></i> Giriş Yap
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero-pattern pt-16 pb-32 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-brand-900/95 via-brand-800/90 to-brand-900/95"></div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="text-center lg:text-left">
                    <div class="inline-flex items-center space-x-2 py-1 px-3 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold mb-6 backdrop-blur">
                        <span class="flex h-2 w-2 relative">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        <span>Yeni Nesil Finans</span>
                    </div>

                    <h1 class="text-4xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                        Ticarette Nakit <br>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Akışını Hızlandırın</span>
                    </h1>

                    <p class="text-lg text-brand-100/80 mb-8 font-light max-w-2xl leading-relaxed">
                        Likya Pay ile borç ve alacaklarınızı nakit paraya ihtiyaç duymadan, çoklu takas ve mahsuplaşma zincirleriyle kapatın.
                    </p>

                    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <a href="app.php" class="px-8 py-4 bg-white text-brand-900 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition transform">
                            Hemen Başlayın <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                        <a href="#video-tanitim" class="px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition transform flex items-center">
                             <i class="fas fa-play mr-2"></i> Tanıtım Filmi
                        </a>
                        <a href="#nasil-calisir" class="px-8 py-4 bg-brand-800/50 text-white rounded-xl font-medium border border-white/10 hover:bg-brand-700/50 backdrop-blur transition hidden sm:inline-flex">
                            <i class="fas fa-info-circle mr-2"></i> Nasıl Çalışır?
                        </a>
                    </div>
                </div>
                
                <div class="relative hidden lg:block">
                     <!-- Simple Visual Illustration -->
                     <img src="https://cdni.iconscout.com/illustration/premium/thumb/business-network-4439169-3728636.png?f=webp" alt="Network" class="relative z-10 w-full drop-shadow-2xl animate-pulse">
                </div>
            </div>
        </div>
    </header>

    <!-- Video Section -->
    <section id="video-tanitim" class="py-16 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
        <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div class="max-w-5xl mx-auto px-4 relative z-10 text-center">
            <h2 class="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-3">
                <i class="fas fa-film text-brand-500"></i> Likya Pay Tanıtım Filmi
            </h2>
            
            <div class="relative w-full aspect-video rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.3)] overflow-hidden border border-slate-700 bg-black">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/usIwSQ-Rxdw" 
                    title="Likya Pay Tanıtım Filmi" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    class="w-full h-full"
                ></iframe>
            </div>

            <p class="text-slate-400 mt-6 text-sm">Finansal özgürlüğün yeni yolu ile tanışın.</p>
        </div>
    </section>

    <!-- Info Section (Vizyon) -->
    <section id="vizyon" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-slate-800 mb-4">Likya Pay Nedir?</h2>
                <div class="w-24 h-1 bg-brand-500 mx-auto rounded-full"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl mb-4"><i class="fas fa-network-wired"></i></div>
                    <h3 class="font-bold text-xl mb-2">Zincirleme Mahsuplaşma</h3>
                    <p class="text-slate-600 text-sm">Borçlunuzun alacaklısıyla eşleşerek aradaki nakit ihtiyacını ortadan kaldırır.</p>
                </div>
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl mb-4"><i class="fas fa-handshake"></i></div>
                    <h3 class="font-bold text-xl mb-2">Güvenli Mutabakat</h3>
                    <p class="text-slate-600 text-sm">Tüm işlemler yasal e-sözleşmeler ve KEP altyapısıyla güvence altındadır.</p>
                </div>
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl mb-4"><i class="fas fa-robot"></i></div>
                    <h3 class="font-bold text-xl mb-2">Sirius Algoritması</h3>
                    <p class="text-slate-600 text-sm">Yapay zeka destekli motorumuz en uygun takas döngülerini otomatik bulur.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section id="nasil-calisir" class="py-20 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-slate-800 mb-4">Sistem Nasıl Çalışır?</h2>
                <div class="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                    <span class="text-4xl font-bold text-slate-200">01</span>
                    <h4 class="font-bold text-lg mt-2 mb-2">Kayıt Ol</h4>
                    <p class="text-sm text-slate-500">Firmanızı sisteme kaydedin ve doğrulama sürecini tamamlayın.</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                    <span class="text-4xl font-bold text-slate-200">02</span>
                    <h4 class="font-bold text-lg mt-2 mb-2">Borç/Alacak Gir</h4>
                    <p class="text-sm text-slate-500">Kimden alacağınız, kime borcunuz olduğunu sisteme yükleyin.</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                    <span class="text-4xl font-bold text-slate-200">03</span>
                    <h4 class="font-bold text-lg mt-2 mb-2">Eşleşme Bekle</h4>
                    <p class="text-sm text-slate-500">Sirius algoritması uygun döngüyü bulduğunda size haber verir.</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                    <span class="text-4xl font-bold text-slate-200">04</span>
                    <h4 class="font-bold text-lg mt-2 mb-2">Onayla ve Bitir</h4>
                    <p class="text-sm text-slate-500">Döngüyü onaylayın, borçlarınız alacaklarınızla silinsin.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 text-center md:text-left">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div class="col-span-1 md:col-span-2">
                    <h4 class="text-white font-bold text-lg mb-4">LİKYA PAY FİNANSAL OPTİMİZASYON</h4>
                    <p class="text-sm max-w-sm">KOBİ'lerin finansal özgürlüğü için geliştirilmiş, Türkiye'nin ilk yapay zeka destekli barter ve mahsuplaşma ağı.</p>
                </div>
                <div>
                    <h4 class="text-white font-bold mb-4">İletişim</h4>
                    <p class="text-sm">Çağlar TEZCAN</p>
                    <p class="text-sm">0543 823 15 56</p>
                    <p class="text-sm">info@likyapay.com</p>
                </div>
                <div>
                    <h4 class="text-white font-bold mb-4">Adres</h4>
                    <p class="text-sm">Teknopark İstanbul, Pendik</p>
                    <p class="text-sm">İstanbul, Türkiye</p>
                </div>
            </div>
            <div class="border-t border-slate-800 mt-12 pt-8 text-xs text-center">
                &copy; 2026 Likya Pay. Tüm hakları saklıdır.
            </div>
        </div>
    </footer>

</body>
</html>
