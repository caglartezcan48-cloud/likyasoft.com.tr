<?php
// Backup Manager - Direct Backup Download
// Path: backup_manager.php

// Security settings
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 600);

// 1. DATABASE BACKUP FUNCTION (Outputs directly)
function backupDatabase($host, $user, $pass, $name)
{
    $mysqli = new mysqli($host, $user, $pass, $name);
    if ($mysqli->connect_error) {
        throw new Exception("MySQL Bağlantı Hatası: " . $mysqli->connect_error);
    }
    $mysqli->select_db($name);
    $mysqli->query("SET NAMES 'utf8'");

    $content = "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\r\nSET time_zone = \"+00:00\";\r\n\r\n/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;\r\n/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;\r\n/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;\r\n/*!40101 SET NAMES utf8 */;\r\n--\r\n-- Database: `" . $name . "`\r\n-- Backup Date: " . date('Y-m-d H:i:s') . "\r\n--\r\n\r\n";

    $queryTables = $mysqli->query('SHOW TABLES');
    while ($row = $queryTables->fetch_row()) {
        $table = $row[0];

        $res = $mysqli->query('SHOW CREATE TABLE `' . $table . '`');
        $TableMLine = $res->fetch_row();
        $content .= "\n\n" . $TableMLine[1] . ";\n\n";

        $result = $mysqli->query('SELECT * FROM `' . $table . '`');
        $fields_amount = $result->field_count;
        $rows_num = $mysqli->affected_rows;

        for ($i = 0, $st_counter = 0; $i < $fields_amount; $i++, $st_counter = 0) {
            while ($row = $result->fetch_row()) {
                if ($st_counter % 100 == 0 || $st_counter == 0) {
                    $content .= "\nINSERT INTO `" . $table . "` VALUES";
                }
                $content .= "\n(";
                for ($j = 0; $j < $fields_amount; $j++) {
                    $row[$j] = str_replace("\n", "\\n", addslashes($row[$j]));
                    if (isset($row[$j])) {
                        $content .= '"' . $row[$j] . '"';
                    } else {
                        $content .= '""';
                    }
                    if ($j < ($fields_amount - 1)) {
                        $content .= ',';
                    }
                }
                $content .= ")";
                if ((($st_counter + 1) % 100 == 0 && $st_counter != 0) || $st_counter + 1 == $rows_num) {
                    $content .= ";";
                } else {
                    $content .= ",";
                }
                $st_counter = $st_counter + 1;
            }
        }
    }

    $content .= "\r\n/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;\r\n/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;\r\n/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;";

    // OUTPUT HEADERS FOR DOWNLOAD
    $filename = $name . "_backup_" . date('Y-m-d_H-i-s') . ".sql";
    header("Cache-Control: no-cache, must-revalidate");
    header("Content-Type: application/octet-stream");
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . strlen($content));

    echo $content;
    exit;
}

// MAIN EXECUTION
try {
    $paths = [
        'core/database.php',
        '../core/database.php',
        $_SERVER['DOCUMENT_ROOT'] . '/core/database.php',
        $_SERVER['DOCUMENT_ROOT'] . '/likyapay/core/database.php',
        __DIR__ . '/core/database.php'
    ];

    $dbInstance = null;
    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            if (class_exists('Database')) {
                $dbInstance = new Database();
                break;
            }
        }
    }

    if (!$dbInstance)
        throw new Exception("core/database.php bulunamadı.");

    $reflector = new ReflectionClass('Database');
    function getProp($ref, $ins, $name)
    {
        try {
            if ($ref->hasProperty($name)) {
                $p = $ref->getProperty($name);
                $p->setAccessible(true);
                return $p->getValue($ins);
            }
        } catch (Exception $e) {
        }
        return null;
    }

    $host = getProp($reflector, $dbInstance, 'host') ?? 'localhost';
    $db_name = getProp($reflector, $dbInstance, 'db_name');
    $username = getProp($reflector, $dbInstance, 'username');
    $password = getProp($reflector, $dbInstance, 'password');

    if (empty($db_name))
        throw new Exception("Veritabanı bilgileri okunamadı.");

    // Direct Download
    backupDatabase($host, $username, $password, $db_name);

} catch (Exception $e) {
    echo "<h3 style='color:red; font-family:sans-serif;'>Hata: " . $e->getMessage() . "</h3>";
}
?>