<?php
// MAZELLO ERP - Automated Cron Backup Script
header("Content-Type: application/json; charset=UTF-8");
ini_set('display_errors', 0);
ini_set('max_execution_time', 300);

// GÜVENLİK ANAHTARI (SAYFAYA SADECE BU ANAHTARLA DIŞARIDAN ERİŞİLEBİLİR)
$SECRET_KEY = "MazelloBackup_2026_Secure";

if (!isset($_GET['key']) || $_GET['key'] !== $SECRET_KEY) {
    if (php_sapi_name() !== 'cli') { // CLI'dan (Terminalden) direk php_sapi çalışıyorsa izin ver
        echo json_encode(["status" => "error", "message" => "Yetkisiz erisim."]);
        exit;
    }
}

require_once 'db.php'; // Veritabanı bağlantısı

try {
    $backup_dir = __DIR__ . '/../backups/';
    if (!is_dir($backup_dir)) mkdir($backup_dir, 0755, true);

    $filename = 'mazello_auto_backup_' . date('Y-m-d_H-i-s') . '.sql';
    $filepath = $backup_dir . $filename;

    // CPanel veya VDS ortamında mysqldump farklı çalışabilir, bu yüzden en garantili fallback olan manual PDO döngüsünü kullanıyoruz.
    $sqlScript = "";
    $tables = [];
    $stmt = $db->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }

    foreach ($tables as $table) {
        $sqlScript .= "DROP TABLE IF EXISTS `$table`;\n";
        $createStmt = $db->query("SHOW CREATE TABLE `$table`");
        $row = $createStmt->fetch(PDO::FETCH_NUM);
        $sqlScript .= $row[1] . ";\n\n";

        $rows = $db->query("SELECT * FROM `$table`");
        while ($rowData = $rows->fetch(PDO::FETCH_ASSOC)) {
            $columns = array_keys($rowData);
            $values = array_values($rowData);
            $escapedValues = array_map(function ($val) use ($db) {
                if ($val === null) return "NULL";
                return $db->quote($val);
            }, $values);

            $sqlScript .= "INSERT INTO `$table` (`" . implode("`, `", $columns) . "`) VALUES (" . implode(", ", $escapedValues) . ");\n";
        }
        $sqlScript .= "\n";
    }

    if (file_put_contents($filepath, $sqlScript) === false) {
        throw new Exception("Yedek dosyasi yazilamadi.");
    }

    // ZIP Sıkıştırması
    $zip_filename = 'mazello_auto_backup_' . date('Y-m-d_H-i-s') . '.zip';
    $zip_filepath = $backup_dir . $zip_filename;
    
    $zip = new ZipArchive();
    if ($zip->open($zip_filepath, ZipArchive::CREATE) === TRUE) {
        $zip->addFile($filepath, $filename);
        $zip->close();
        unlink($filepath); // .sql sil, sadece zip kalsın
        $final_file = $zip_filename;
    } else {
        $final_file = $filename;
    }

    // Eski yedekleri temizle (Son 7 günden eskileri silerek diskin dolmasını önle)
    $files = glob($backup_dir . '*');
    $now = time();
    foreach ($files as $f) {
        if (is_file($f)) {
            if ($now - filemtime($f) >= 60 * 60 * 24 * 7) { // 7 Gün = 60*60*24*7
                unlink($f);
            }
        }
    }

    echo json_encode(["status" => "success", "message" => "Oto-Yedekleme Tamamlandi", "file" => $final_file]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
