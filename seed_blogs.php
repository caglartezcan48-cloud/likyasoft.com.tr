<?php
require_once 'api/db.php';

// api/db.php dosyasında bağlantı değişkeni $conn olarak tanımlanmış
if (!isset($conn)) {
    die("Hata: Veritabanı bağlantı değişkeni (\$conn) bulunamadı.");
}

$blogs = [
    [
        'title' => 'Yapay Zeka Destekli Yazılımlar: İşletmenizi Geleceğe Nasıl Taşır?',
        'slug' => 'yapay-zeka-destekli-yazilimlar-isletmenizi-gelecege-tasir',
        'category' => 'Yapay Zeka',
        'summary' => 'Geleneksel yazılımlar artık yetersiz kalıyor. Likyasoft olarak yapay zekayı iş süreçlerinizin merkezine nasıl yerleştirdiğimizi keşfedin.',
        'content' => '<h3>Yapay Zeka Bir Lüks Değil, Zorunluluktur</h3>
            <p>Günümüzün hızla değişen dijital dünyasında, sadece veri depolayan yazılımlar artık rekabet avantajı sağlamıyor. Veriyi anlayan, yorumlayan ve sizin yerinize karar verebilen <strong>yapay zeka (AI)</strong> destekli sistemler, yeni nesil dijital dönüşümün kalbini oluşturuyor.</p>
            <h4>Likyasoft AI Çözümleri Ne Sunuyor?</h4>
            <ul>
                <li><strong>Tahminleme Analitiği:</strong> Stok durumunuzu veya satış trendlerinizi yapay zeka ile önceden görün.</li>
                <li><strong>Akıllı Asistanlar:</strong> Müşterilerinizle 7/24 profesyonelce iletişim kuran AI tabanlı chatbotlar.</li>
                <li><strong>Otomasyon:</strong> Tekrarlayan işleri makinelerinize bırakın, enerjinizi yaratıcılığa saklayın.</li>
            </ul>
            <p>Likyasoft olarak, işletmenizin DNA\'sına uygun özel yapay zeka modelleri geliştirerek sizi rakiplerinizin bir adım önüne taşıyoruz.</p>',
        'image_url' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80'
    ],
    [
        'title' => '2024 Web Tasarım Trendleri: Neden Premium Bir Görünüm Şart?',
        'slug' => '2024-web-tasarim-trendleri-premium-gorunum',
        'category' => 'Web Tasarım',
        'summary' => 'Kullanıcılar bir web sitesine girdikten sonra saniyeler içinde karar veriyor. Siteniz güven mi veriyor yoksa kaçırıyor mu?',
        'content' => '<h3>Dijital Vitrininiz Gücünüzdür</h3>
            <p>Bir web sitesi sadece kod yığınından ibaret değildir; o sizin dijital dünyadaki ofisiniz, mağazanız ve kimliğinizdir. 2024 yılında trendler artık <strong>"Glassmorphism"</strong> ve <strong>"Dinamik Etkileşimler"</strong> üzerine kurulu.</p>
            <h4>Likyasoft Tasarım Felsefesi</h4>
            <p>Biz sadece site yapmıyoruz, bir deneyim tasarlıyoruz. Tasarımlarımızda kullandığımız yöntemler:</p>
            <ul>
                <li><strong>Kullanıcı Odaklılık:</strong> Ziyaretçinin aradığına en hızlı ve estetik şekilde ulaşması.</li>
                <li><strong>Premium Estetik:</strong> Yüksek çözünürlüklü görseller, yumuşak geçişler ve özel tipografi.</li>
                <li><strong>Mobil Öncelik:</strong> Telefonlarda kusursuz çalışan, parmak dostu arayüzler.</li>
            </ul>
            <p>Markanızın prestijini dijital dünyaya yansıtmak için profesyonel dokunuşlara her zamankinden daha fazla ihtiyacınız var.</p>',
        'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'
    ],
    [
        'title' => 'ERP Sistemleri ile Operasyonel Mükemmellik: Mazello Örneği',
        'slug' => 'erp-sistemleri-operasyonel-mukemmellik-mazello',
        'category' => 'ERP & Yazılım',
        'summary' => 'Karmaşık iş süreçlerini tek bir merkezden yönetmek mümkün. Mazello ERP ile tanışın ve verimliliğinizi artırın.',
        'content' => '<h3>İşinizi Yönetmek Hiç Bu Kadar Kolay Olmamıştı</h3>
            <p>Stok takibi, cari yönetim, faturalandırma ve üretim süreçleri... Hepsi farklı yerlerdeyse hata kaçınılmazdır. <strong>Bulut tabanlı ERP çözümleri</strong>, tüm bu karmaşayı tek bir ekrana sığdırır.</p>
            <h4>Mazello ERP Neden Farklı?</h4>
            <p>Özellikle mobilya ve üretim sektörüne odaklanan Mazello ERP, karmaşık süreçleri basitleştirir:</p>
            <ul>
                <li><strong>Gerçek Zamanlı Takip:</strong> Fabrikadaki üretimden depodaki son ürüne kadar her şey canlı.</li>
                <li><strong>Entegrasyon Gücü:</strong> E-ticaret sitenizle ve muhasebe sisteminizle tam uyum.</li>
                <li><strong>Güvenlik:</strong> Verileriniz bulut güvencesiyle daima koruma altında.</li>
            </ul>
            <p>Likyasoft\'un yazılım gücüyle birleşen ERP çözümleri, işletmenizin büyümesini engelleyen tüm engelleri kaldırır.</p>',
        'image_url' => 'https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80'
    ]
];

try {
    $conn->exec("DELETE FROM blogs WHERE author = 'Likyasoft AI'"); // Eskileri temizle
    $stmt = $conn->prepare("INSERT INTO blogs (title, slug, category, summary, content, image_url) VALUES (?, ?, ?, ?, ?, ?)");
    
    foreach ($blogs as $blog) {
        $stmt->execute([
            $blog['title'],
            $blog['slug'],
            $blog['category'],
            $blog['summary'],
            $blog['content'],
            $blog['image_url']
        ]);
    }
    echo "<b>Başarılı:</b> 3 adet SEO uyumlu profesyonel yazı eklendi! ✅";
} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
