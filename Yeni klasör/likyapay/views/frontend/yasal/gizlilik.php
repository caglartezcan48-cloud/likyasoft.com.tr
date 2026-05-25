<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gizlilik Politikası | LikyaPay</title>
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
<body class="bg-slate-50 font-sans text-slate-800">

    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <a href="../../../" class="flex items-center gap-3">
                <img src="../../frontend/gorsel/logo.png" alt="Likya Pay" class="h-10 w-10 bg-slate-100 rounded-full p-1">
                <span class="font-bold text-xl tracking-tight text-slate-900">likyapay</span>
            </a>
            <a href="../../../" class="text-sm font-medium text-slate-500 hover:text-brand-600 transition flex items-center gap-2">
                <i class="fas fa-arrow-left"></i> Ana Sayfaya Dön
            </a>
        </div>
    </nav>

    <main class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-3xl font-bold mb-8 text-slate-900">Gizlilik Politikası</h1>
        
        <div class="bg-white p-8 rounded-2xl shadow-sm space-y-6 text-sm leading-relaxed text-slate-600 border border-slate-100">
            <p><strong>Son Güncelleme:</strong> 10 Ocak 2026</p>

            <p>LikyaPay olarak gizliliğinize önem veriyoruz. Bu politika, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.</p>

            <h2 class="text-xl font-bold text-slate-800 mt-6">1. Toplanan Veriler</h2>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. Kimlik No, Vergi No.</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres.</li>
                <li><strong>Finansal Veriler:</strong> Yüklenen faturalar, borç/alacak tutarları, IBAN bilgileri.</li>
            </ul>

            <h2 class="text-xl font-bold text-slate-800 mt-6">2. Verilerin Kullanımı</h2>
            <p>Toplanan veriler şu amaçlarla kullanılır:</p>
            <ul class="list-disc pl-5 space-y-2">
                <li>Sirius döngü algoritmasını çalıştırmak ve eşleşmeleri bulmak.</li>
                <li>Yasal mevzuat gereği fatura doğrulama işlemlerini yapmak.</li>
                <li>Kullanıcıyla iletişime geçmek.</li>
            </ul>

            <h2 class="text-xl font-bold text-slate-800 mt-6">3. Veri Paylaşımı</h2>
            <p>Verileriniz, yasal zorunluluklar haricinde ve Sirius döngüsündeki eşleşen taraflar (sadece gerekli olduğu kadarıyla) dışında üçüncü taraflarla paylaşılmaz.</p>

            <h2 class="text-xl font-bold text-slate-800 mt-6">4. Çerezler (Cookies)</h2>
            <p>Sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.</p>
        </div>
    </main>

    <footer class="bg-slate-900 text-slate-400 py-8 text-center mt-12">
        <p>&copy; 2026 LikyaPay. Tüm hakları saklıdır.</p>
    </footer>

</body>
</html>
