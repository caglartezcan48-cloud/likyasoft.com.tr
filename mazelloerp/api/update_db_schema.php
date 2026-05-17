<?php
require_once 'db.php';

// MAZELLOMOBİLYA - PERFORMANCE & SCHEMA UPDATE SCRIPT
// Bu dosya, eskiden API dosyaları içerisinde (dashboard_islem.php, reports.php vb.)
// her istekte gereksiz yere çalışan veritabanı kontrollerini tek bir yerde toplar.
// Yalnızca sistem yöneticisi tarafından (veya yeni kurulumlarda) 1 kez çalıştırılmalıdır.

echo "<h1>Veritabanı Şema & Performans Güncelleme Aracı</h1>";
echo "İşlem başlıyor...<br><hr>";

try {
    // 1. TEKLİFLER TABLOSU GÜNCELLEMELERİ
    echo "<b>Teklifler Tablosu Kontrol Ediliyor...</b><br>";
    $db->exec("ALTER TABLE `teklifler` MODIFY COLUMN `teslimat_durumu` enum('uretim','hazirlik','yolda','teslim','iptal') DEFAULT 'hazirlik'");
    $db->exec("ALTER TABLE `teklifler` ADD COLUMN IF NOT EXISTS `teslimat_ekibi` varchar(255) DEFAULT NULL");
    $db->exec("ALTER TABLE `teklifler` ADD COLUMN IF NOT EXISTS `teslimat_araci` varchar(50) DEFAULT NULL");
    $db->exec("ALTER TABLE `teklifler` ADD COLUMN IF NOT EXISTS `teslimat_notu` text DEFAULT NULL");

    $c1 = $db->query("SHOW COLUMNS FROM teklifler LIKE 'olusturan'");
    if ($c1->rowCount() == 0) {
        $db->exec("ALTER TABLE teklifler ADD COLUMN olusturan VARCHAR(50) DEFAULT 'Admin' AFTER created_at");
        echo "+ 'olusturan' kolonu eklendi.<br>";
    }

    // 2. TEKLİF DETAYLARI TABLOSU GÜNCELLEMELERİ
    echo "<b>Teklif Detayları Tablosu Kontrol Ediliyor...</b><br>";
    $c2 = $db->query("SHOW COLUMNS FROM teklif_detaylari LIKE 'fiyat'");
    if ($c2->rowCount() == 0) {
        $db->exec("ALTER TABLE teklif_detaylari ADD COLUMN fiyat DECIMAL(15,2) DEFAULT 0.00 AFTER miktar");
        echo "+ 'fiyat' kolonu eklendi.<br>";
    }

    // 3. VERİ SENKRONİZASYONU VE ONARIMI (SELF-HEALING)
    echo "<b>Veri Senkronizasyonu Yapılıyor...</b><br>";
    // a) Fiyat onarımı
    $db->exec("UPDATE teklif_detaylari SET fiyat = birim_fiyat WHERE (fiyat = 0 OR fiyat IS NULL) AND birim_fiyat > 0");
    // b) Teslimat durumu onarımı
    $db->exec("UPDATE teklifler SET teslimat_durumu = 'hazirlik' WHERE durum = 'satis' AND (teslimat_durumu IS NULL OR teslimat_durumu = '')");
    echo "+ Fiyat ve teslimat durumlarındaki Null/0 veriler onarıldı.<br>";


    echo "<hr><h2 style='color:green;'>Tüm güncellemeler başarıyla tamamlandı! Sistemin performans artışını gözlemleyebilirsiniz.</h2>";

} catch (PDOException $e) {
    echo "<hr><h2 style='color:red;'>SQL Hatası Oluştu:</h2> <p>" . $e->getMessage() . "</p>";
} catch (Exception $e) {
    echo "<hr><h2 style='color:red;'>Hata Oluştu:</h2> <p>" . $e->getMessage() . "</p>";
}
?>