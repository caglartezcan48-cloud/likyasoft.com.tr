<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once 'api/db.php';
    
    // api/db.php dosyasında bağlantı değişkeni $conn olarak tanımlanmış
    if (!isset($conn)) {
        die("Hata: Veritabanı bağlantı değişkeni (\$conn) bulunamadı.");
    }

    echo "Veritabanı bağlantısı başarılı. Tablo oluşturuluyor...<br>";

    $sql = "CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        summary TEXT,
        content LONGTEXT,
        image_url VARCHAR(255),
        category VARCHAR(100),
        author VARCHAR(100) DEFAULT 'Likyasoft AI',
        status ENUM('draft', 'published') DEFAULT 'published',
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $conn->exec($sql);
    echo "<b>Başarılı:</b> 'blogs' tablosu oluşturuldu veya zaten mevcut.<br>";

    // Örnek bir yazı ekleyelim
    $check = $conn->query("SELECT COUNT(*) FROM blogs")->fetchColumn();
    if ($check == 0) {
        $stmt = $conn->prepare("INSERT INTO blogs (title, slug, summary, content, category) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            'Yapay Zeka ile Dijital Dönüşümün Geleceği',
            'yapay-zeka-ile-dijital-donusumun-gelecegi',
            'İşletmeler için yapay zeka entegrasyonu neden bir lüks değil, zorunluluktur?',
            '<h3>Gelecek Yapay Zekada</h3><p>Günümüzde işletmelerin rekabet gücünü koruması için dijitalleşme şart...</p>',
            'Yapay Zeka'
        ]);
        echo "Örnek blog yazısı eklendi.";
    }

} catch (Exception $e) {
    echo "<b>Hata Oluştu:</b> " . $e->getMessage();
}
?>
