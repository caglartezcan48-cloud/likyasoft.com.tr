<?php
require_once 'api/db.php';

$projects = [
    ['Mazello ERP', 'mazello-mobilya', 'Mobilya', 'Lüks mobilya e-ticaret ve ERP entegrasyonu.', '', 'completed', '/public/mazelloerp/'],
    ['Fethiye Mazello ERP', 'fethiye-mazello-erp', 'Mobilya', 'Fethiye şubesi için özel mobilya ERP yönetim sistemi.', '', 'completed', '/public/fethiyemazello/'],
    ['LikyaPay', 'likyapay', 'Finans Sektörü', 'Yeni nesil ödeme ve finans yönetim altyapısı.', '', 'completed', '/public/likyapay/'],
    ['Likya Muhasebe', 'likya-muhasebe', 'Muhasebe', 'Bulut tabanlı ön muhasebe ve faturalama sistemi.', '', 'upcoming', ''],
    ['Golden Parfüm', 'golden-parfum', 'Parfümcü', 'Prestijli koku butiği için dijital vitrin.', '', 'completed', ''],
    ['Tech-Point', 'tech-point', 'Telefoncu', 'Akıllı cihaz ve teknik servis yönetim modülü.', '', 'completed', ''],
    ['Lezzet Restoran', 'lezzet-restoran', 'Restoran', 'QR Menü ve sipariş takip sistemi.', '', 'upcoming', ''],
    ['Sultan Kasap', 'sultan-kasap', 'Kasap', 'Kasap ve şarküteri yönetim altyapısı.', '', 'completed', ''],
    ['Likyasoft AI ERP', 'likyasoft-ai-erp', 'Yazılım', 'Yapay zeka destekli kurumsal kaynak planlama.', '', 'upcoming', '']
];

try {
    $conn->exec("DELETE FROM projects"); // Clear existing
    $stmt = $conn->prepare("INSERT INTO projects (title, slug, category, description, image_url, status, project_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($projects as $p) {
        $stmt->execute($p);
    }
    
    echo "Örnek projeler başarıyla eklendi! Şimdi ana sayfayı yenileyebilirsiniz.";
} catch (PDOException $e) {
    echo "Hata: " . $e->getMessage();
}
?>
