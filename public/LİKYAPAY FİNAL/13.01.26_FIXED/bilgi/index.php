<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Likya Pay Nedir? | Tanıtım Filmi</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        brand: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 900: '#0c4a6e' }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-slate-900 font-sans text-white h-screen flex flex-col">

    <!-- Navbar -->
    <nav class="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <a href="/" class="flex items-center gap-3">
                <img src="../views/frontend/gorsel/logo.png" alt="Likya Pay" class="h-10 w-10 bg-white rounded-full p-1">
                <span class="font-bold text-xl tracking-tight">likyapay</span>
            </a>
            <a href="/" class="text-sm font-medium text-slate-300 hover:text-white transition flex items-center gap-2">
                <i class="fas fa-arrow-left"></i> Ana Sayfaya Dön
            </a>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div class="w-full max-w-5xl mx-auto relative z-10 text-center">
            
            <h1 class="text-3xl md:text-5xl font-bold mb-8 md:mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-brand-500">
                Likya Pay Nedir?
            </h1>

            <div class="relative w-full rounded-2xl shadow-[0_0_60px_rgba(14,165,233,0.2)] overflow-hidden border border-slate-700 bg-black group">
                <video controls autoplay class="w-full h-auto max-h-[70vh] object-contain mx-auto" poster="https://cdni.iconscout.com/illustration/premium/thumb/business-network-4439169-3728636.png?f=webp">
                    <source src="../views/frontend/gorsel/tanitim.mp4" type="video/mp4">
                    Tarayıcınız video etiketini desteklemiyor.
                </video>
            </div>

            <p class="text-slate-400 mt-8 text-lg max-w-2xl mx-auto">
                Finansal özgürlüğün yeni yolu ile tanışın. Mahsuplaşma ve nakit akışı yönetiminde devrim.
            </p>

        </div>
    </main>

</body>
</html>
