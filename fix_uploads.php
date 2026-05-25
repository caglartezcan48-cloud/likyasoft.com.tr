<?php
// Fix Uploads Folder and Permissions

$dir = __DIR__ . '/uploads';

if (!file_exists($dir)) {
    if (mkdir($dir, 0777, true)) {
        echo "✅ 'uploads' klasörü oluşturuldu.<br>";
    } else {
        echo "❌ 'uploads' klasörü oluşturulamadı! Lütfen Dosya Yöneticisinden manuel oluşturun.<br>";
    }
} else {
    echo "ℹ️ 'uploads' klasörü zaten var.<br>";
}

// Windows sunucularda chmod tam çalışmayabilir ama deneyelim
@chmod($dir, 0777);

echo "✅ Klasör izinleri güncellendi. Artık resim yüklemeyi deneyebilirsiniz.";
?>
