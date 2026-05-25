<?php
require_once 'api/db.php';

$commercial_sectors = [
    'E-Ticaret / Perakende',
    'Kurumsal B2B',
    'Sağlık & Medikal',
    'Gayrimenkul & İnşaat',
    'Eğitim',
    'Turizm & Otelcilik',
    'Otomotiv',
    'Restoran & Gıda',
    'Medya & Eğlence',
    'Hukuk & Danışmanlık',
    'Finans & Muhasebe',
    'Lojistik & Kargo',
    'Üretim & Sanayi',
    'Teknoloji & Yazılım',
    'Mimarlık & Tasarım',
    'Kozmetik & Güzellik'
];

foreach ($commercial_sectors as $sector) {
    try {
        $stmt = $conn->prepare("INSERT IGNORE INTO categories (name) VALUES (:name)");
        $stmt->bindParam(':name', $sector);
        $stmt->execute();
        echo "Eklendi: $sector\n";
    } catch (Exception $e) {
        echo "Hata ($sector): " . $e->getMessage() . "\n";
    }
}
echo "\nTüm ticari sektörler başarıyla veritabanına eklendi!\n";
?>
