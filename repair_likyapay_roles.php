<?php
include_once 'public/likyapay/core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Rollere göre kullanıcıları bul ve normalize et
    // 'YÖNETİCİ', 'ADMIN', 'Admin' -> 'admin'
    // 'Kullanıcı', 'USER', 'Müşteri', 'MÜŞTERİ' -> 'user'
    
    $fixes = [
        'admin' => ['YÖNETİCİ', 'ADMIN', 'Admin', 'Yönetici'],
        'user' => ['Kullanıcı', 'USER', 'Müşteri', 'MÜŞTERİ', 'kullanici']
    ];

    foreach ($fixes as $target => $sources) {
        foreach ($sources as $source) {
            $stmt = $db->prepare("UPDATE users SET role = :target WHERE role = :source");
            $stmt->execute([':target' => $target, ':source' => $source]);
            echo "Güncellendi: $source -> $target (" . $stmt->rowCount() . " kayıt)\n";
        }
    }

    // 2. Boş rolleri varsayılan olarak 'user' yap
    $stmt = $db->prepare("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''");
    $stmt->execute();
    echo "Boş roller 'user' olarak güncellendi (" . $stmt->rowCount() . " kayıt)\n";

    echo "\nRol onarımı tamamlandı.";

} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
