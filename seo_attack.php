<?php
require_once 'api/db.php';

if (!isset($conn)) {
    die("Hata: Veritabanı bağlantısı kurulamadı.");
}

$project_blogs = [
    [
        'title' => 'Mobilya Sektöründe Dijital Dönüşüm: Mazello ERP vaka Analizi',
        'slug' => 'mobilya-sektorunde-dijital-donusum-mazello-erp',
        'category' => 'Vaka Analizi',
        'summary' => 'Mazello Mobilya için geliştirdiğimiz uçtan uca ERP çözümü ile üretim ve satış süreçlerini nasıl %40 hızlandırdık?',
        'content' => '<h3>Karmaşık Süreçlerden Dijital Kolaylığa</h3>
            <p>Geleneksel mobilya üretimi, stok takibinden sevkiyata kadar yüzlerce farklı parametrenin yönetilmesini gerektirir. <strong>Mazello Mobilya</strong> projemizde, bu karmaşayı yapay zeka destekli bir <a href="/">ERP yazılımı</a> ile çözüme kavuşturduk.</p>
            <h4>Neler Başardık?</h4>
            <p>Geliştirdiğimiz sistem sayesinde Mazello ekibi şu avantajları elde etti:</p>
            <ul>
                <li><strong>Anlık Stok Takibi:</strong> Hammaddeden son ürüne kadar tüm envanter tek bir ekranda.</li>
                <li><strong>Satış Entegrasyonu:</strong> Mağaza satışlarının üretim bandına saniyeler içinde düşmesi.</li>
                <li><strong>AI Destekli Tahminleme:</strong> Hangi ürünlerin daha çok satacağını önceden öngören akıllı algoritmalar.</li>
            </ul>
            <p>Siz de işletmeniz için özel <a href="/projelerimiz">yazılım çözümleri</a> arıyorsanız, Likyasoft yanınızda.</p>',
        'image_url' => 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80'
    ],
    [
        'title' => 'Finans Teknolojilerinde Yeni Dönem: LikyaPay Altyapısı',
        'slug' => 'finans-teknolojilerinde-yeni-donem-likyapay',
        'category' => 'Fintech',
        'summary' => 'Güvenli, hızlı ve ölçeklenebilir ödeme sistemleri inşa etmek. LikyaPay projemizin teknik detayları.',
        'content' => '<h3>Geleceğin Ödeme Sistemlerini Bugün İnşa Ediyoruz</h3>
            <p>Dijital ekonominin kalbi ödeme sistemleridir. <strong>LikyaPay</strong> projemizde, en yüksek güvenlik standartlarına sahip, kullanıcı dostu bir finansal altyapı oluşturduk.</p>
            <h4>Teknik Üstünlükler</h4>
            <p>LikyaPay projesinde odaklandığımız temel noktalar:</p>
            <ul>
                <li><strong>Yüksek Güvenlik:</strong> PCI-DSS uyumlu mimari ve gelişmiş şifreleme yöntemleri.</li>
                <li><strong>Hızlı API:</strong> Diğer platformlarla milisaniyeler içinde haberleşen entegrasyon gücü.</li>
                <li><strong>Analitik Dashboard:</strong> İşletmelerin finansal durumunu net bir şekilde görebileceği <a href="/kurumsal">kurumsal yönetim</a> paneli.</li>
            </ul>
            <p>Finansal teknolojilerde (Fintech) Likyasoft\'un <a href="/">yapay zeka destekli yazılım</a> gücünden yararlanın.</p>',
        'image_url' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80'
    ],
    [
        'title' => 'Lüks Perakende ve E-Ticaret: Golden Parfüm Dijital Vitrini',
        'slug' => 'luks-perakende-e-ticaret-golden-parfum',
        'category' => 'E-Ticaret',
        'summary' => 'Prestijli bir markanın dijital dünyadaki yüzü nasıl olmalı? Golden Parfüm projesindeki tasarım ve teknoloji yaklaşımımız.',
        'content' => '<h3>Zarafeti Dijitale Taşıdık</h3>
            <p>Lüks tüketim sektöründe görsellik her şeydir. <strong>Golden Parfüm</strong> için tasarladığımız <a href="/">premium web sitesi</a>, markanın prestijini her pikselde hissettiriyor.</p>
            <h4>Tasarım ve Fonksiyonun Uyumu</h4>
            <p>Bu projede öne çıkan özellikler:</p>
            <ul>
                <li><strong>Premium UX:</strong> Ziyaretçilerin aradığı kokuya en şık yoldan ulaşmasını sağlayan kullanıcı deneyimi.</li>
                <li><strong>Hızlı Checkout:</strong> Sepetten ödemeye pürüzsüz ve güvenli bir satın alma süreci.</li>
                <li><strong>Mobil Dönüşüm:</strong> Akıllı telefonlarda mükemmel görünen <a href="/projelerimiz">responsive tasarım</a>.</li>
            </ul>
            <p>E-ticarette fark yaratmak ve markanızı yukarı taşımak için Likyasoft\'un yaratıcı çözümleriyle tanışın.</p>',
        'image_url' => 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80'
    ]
];

try {
    $stmt = $conn->prepare("INSERT INTO blogs (title, slug, category, summary, content, image_url, author) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($project_blogs as $blog) {
        $stmt->execute([
            $blog['title'],
            $blog['slug'],
            $blog['category'],
            $blog['summary'],
            $blog['content'],
            $blog['image_url'],
            'Likyasoft SEO'
        ]);
    }
    echo "<b>SEO Operasyonu Başarılı:</b> 3 adet proje bazlı Case Study yazısı eklendi! 🚀✅";
} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
