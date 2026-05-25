<?php
// cleanup_production.php
// Deletes temporary test and schema update files for security/cleanup.

$filesToDelete = [
    'check_files.php',
    'update_schema_profile.php',
    'update_schema_profile_v2.php',
    'test_sirius_setup.php',
    'test_sirius_real.php'
];

echo "<h1>🧹 Temizlik Zamanı</h1>";
echo "<ul>";

foreach ($filesToDelete as $file) {
    if (file_exists($file)) {
        if (unlink($file)) {
            echo "<li style='color:green'>✅ Silindi: <strong>$file</strong></li>";
        } else {
            echo "<li style='color:red'>❌ Silinemedi (Yetki Hatası): <strong>$file</strong> - Lütfen manuel siliniz.</li>";
        }
    } else {
        echo "<li style='color:gray'>ℹ️ Zaten yok: $file</li>";
    }
}

echo "</ul>";
echo "<p>İşlem tamamlandı. Güvenlik için şimdi <strong>bu dosyayı (cleanup_production.php)</strong> da manuel olarak silebilirsiniz.</p>";
?>
