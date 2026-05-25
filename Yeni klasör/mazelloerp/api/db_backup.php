<?php
// MAZELLO ERP - Database Backup Script
// Generates a .sql file or .zip backup of the database
header("Content-Type: application/json; charset=UTF-8");
ini_set('display_errors', 0);
ini_set('max_execution_time', 300); // 5 minutes max

require_once 'auth_check.php';
require_once 'db.php';

try {
    // Sadece adminler yedek alabilir
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        throw new Exception("Sadece yöneticiler yedek alabilir.");
    }

    $backup_dir = __DIR__ . '/../backups/';

    // Klasör yoksa oluştur
    if (!is_dir($backup_dir)) {
        if (!mkdir($backup_dir, 0755, true)) {
            throw new Exception("Backup dizini oluşturulamadı: " . $backup_dir);
        }
    }

    $filename = 'mazello_backup_' . date('Y-m-d_H-i-s') . '.sql';
    $filepath = $backup_dir . $filename;

    // MySQL Dump Commands
    $host = 'localhost';
    $user = 'root';
    $pass = ''; // XAMPP default
    $dbname = 'mazellomobilya';

    // Try using mysqldump if available (fastest)
    $mysqldump_path = 'mysqldump'; // Assuming it's in system PATH

    // Check if running on Windows (XAMPP default path)
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        if (file_exists('c:/xampp/mysql/bin/mysqldump.exe')) {
            $mysqldump_path = 'c:/xampp/mysql/bin/mysqldump.exe';
        }
    }

    $command = "$mysqldump_path --opt -h $host -u $user" . ($pass ? " -p$pass" : "") . " $dbname > $filepath 2>&1";

    exec($command, $output, $return_var);

    if ($return_var !== 0) {
        // Fallback: Manual PHP table dump if mysqldump fails
        // For larger DBs this might hit memory limits, but it's a safe fallback

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
                    if ($val === null)
                        return "NULL";
                    return $db->quote($val);
                }, $values);

                $sqlScript .= "INSERT INTO `$table` (`" . implode("`, `", $columns) . "`) VALUES (" . implode(", ", $escapedValues) . ");\n";
            }
            $sqlScript .= "\n";
        }

        if (file_put_contents($filepath, $sqlScript) === false) {
            throw new Exception("Yedek dosyasi yazilamadi.");
        }
    }

    // İsteğe bağlı: ZIP olarak sıkıştırma
    $type = isset($_GET['type']) ? $_GET['type'] : 'db';
    $zip_filename = ($type === 'full' ? 'mazello_TAM_SISTEM_' : 'mazello_db_backup_') . date('Y-m-d_H-i-s') . '.zip';
    $zip_filepath = $backup_dir . $zip_filename;

    $zip = new ZipArchive();
    if ($zip->open($zip_filepath, ZipArchive::CREATE) === TRUE) {
        $zip->addFile($filepath, $filename);

        // 2. Eğer TAM Sistem seçildiyse ana dizindeki tüm dosyaları da ZIP'e ekle
        if ($type === 'full') {
            $root_dir = realpath(__DIR__ . '/../');
            if ($root_dir) {
                $files = new RecursiveIteratorIterator(
                    new RecursiveDirectoryIterator($root_dir),
                    RecursiveIteratorIterator::LEAVES_ONLY
                );

                foreach ($files as $name => $file) {
                    if (!$file->isDir()) {
                        $filePath = $file->getRealPath();
                        $relativePath = substr($filePath, strlen($root_dir) + 1);
                        $relativePath = str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);

                        // Hariç tutulacak ağır klasörler (sonsuz loop ve gereksiz şişmeyi önlemek için)
                        if (strpos($relativePath, 'backups/') === 0) continue;
                        if (strpos($relativePath, 'node_modules/') === 0) continue;
                        if (strpos($relativePath, '.git/') === 0) continue;

                        $zip->addFile($filePath, $relativePath);
                    }
                }
            }
        }

        $zip->close();

        // Sıkıştırma başarılıysa orijinal SQL'i silebiliriz (alan tasarrufu)
        unlink($filepath);
        $final_file = $zip_filename;
        $download_path = 'backups/' . $zip_filename;
    } else {
        $final_file = $filename;
        $download_path = 'backups/' . $filename;
    }

    // Save backup record to settings if table exists (optional)

    echo json_encode([
        "status" => "success",
        "message" => "Yedek başarıyla alındı.",
        "file" => $final_file,
        "download_url" => $download_path
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>