<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$file = __DIR__ . '/visitor_count.txt';

// Dosya yoksa oluştur ve başlangıç değeri ata
if (!file_exists($file)) {
    file_put_contents($file, '4382');
}

$count = (int)file_get_contents($file);

// Eğer sadece okuma isteği değilse (POST veya parametre ile artırma isteği geldiyse veya genel olarak artır)
// Ziyaretçi sayısını artırmak için basit bir kontrol: Aynı session'da bir kez artsın diye session kullanılabilir
// Ancak basitlik için GET isteğinde 'inc=1' varsa artırıyoruz.
if (isset($_GET['inc']) && $_GET['inc'] == '1') {
    $count++;
    file_put_contents($file, (string)$count);
}

echo json_encode(['count' => $count, 'status' => 'success']);
?>
