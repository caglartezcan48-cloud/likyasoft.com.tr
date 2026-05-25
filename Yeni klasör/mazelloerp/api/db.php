<?php
/**
 * MAZELLO MASTER DB (api/db.php)
 * High-End ERP v20.1 - Armoured Connection & Rocket Sync Edition
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// PERFORMANCE: GZIP COMPRESSION
if (!ob_start("ob_gzhandler"))
    ob_start();

// TIMEZONE FIX
date_default_timezone_set('Europe/Istanbul');

// SECURE SESSION PRE-START
if (session_status() == PHP_SESSION_NONE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => isset($_SERVER['HTTPS'])
    ]);
    session_start();
}

$secrets = require __DIR__ . '/../config/db_secrets.php';
$serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';
$isLocal = ($serverName === 'localhost' || $serverName === '127.0.0.1' || php_sapi_name() === 'cli');

if ($isLocal) {
    $cfg = $secrets['local'];
    // JSON API'lerde HTML hata basılmamalı
    error_reporting(E_ALL);
    ini_set('display_errors', 0); // KESİNLİKLE 0 OLMALI
} else {
    $cfg = $secrets['production'];
    error_reporting(0);
    ini_set('display_errors', 0);
}

$host = $cfg['host'];
$db_name = $cfg['db'];
$username = $cfg['user'];
$password = $cfg['pass'];

try {
    $db = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $exception) {
    echo json_encode([
        "success" => false,
        "error" => "Veritabanı Bağlantı Hatası: " . $exception->getMessage(),
        "type" => "db_connection_error"
    ]);
    exit;
}

/**
 * CARİ BAKİYE GÜNCELLEME (ULTRA-ACCURATE & FAST CACHING)
 * @param PDO $db
 * @param int $cari_id
 */
function updateCariBakiye($db, $cari_id)
{
    if (!$cari_id || !is_numeric($cari_id))
        return;
    try {
        $sql = "
            UPDATE cariler c
            LEFT JOIN (
                SELECT musteri_id, SUM(CASE WHEN durum = 'alis' OR durum = 'iade' THEN -toplam_tutar ELSE toplam_tutar END) as tutar
                FROM teklifler 
                WHERE musteri_id = ? AND durum NOT IN ('teklif', 'iptal', 'alis_teklif')
                GROUP BY musteri_id
            ) satis_toplam ON c.id = satis_toplam.musteri_id
            LEFT JOIN (
                SELECT tedarikci_id, SUM(-toplam_tutar) as tutar
                FROM satin_almalar
                WHERE tedarikci_id = ? AND durum = 'tamamlandi'
                GROUP BY tedarikci_id
            ) satin_alma_toplam ON c.id = satin_alma_toplam.tedarikci_id
            LEFT JOIN (
                SELECT cari_id, SUM(tutar) as tutar 
                FROM kasa_hareketleri 
                WHERE cari_id = ? AND turu = 'gelir' AND durum = 'aktif'
                GROUP BY cari_id
            ) kasa_gelir ON c.id = kasa_gelir.cari_id
            LEFT JOIN (
                SELECT cari_id, SUM(tutar) as tutar 
                FROM kasa_hareketleri 
                WHERE cari_id = ? AND turu = 'gider' AND durum = 'aktif'
                GROUP BY cari_id
            ) kasa_gider ON c.id = kasa_gider.cari_id
            SET c.bakiye = (
                COALESCE(satis_toplam.tutar, 0) + 
                COALESCE(satin_alma_toplam.tutar, 0) - 
                COALESCE(kasa_gelir.tutar, 0) + 
                COALESCE(kasa_gider.tutar, 0)
            )
            WHERE c.id = ?
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute([$cari_id, $cari_id, $cari_id, $cari_id, $cari_id]);
    } catch (Exception $e) {
        error_log("Bakiye Güncelleme Hatası (Cari ID: $cari_id): " . $e->getMessage());
    }
}

/**
 * DATABASE SCHEMA HELPER
 */
function ensureColumnExists($db, $table, $column, $definition)
{
    try {
        $check = $db->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
        if ($check->rowCount() == 0) {
            $db->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
        }
    } catch (Exception $e) {
        // Log error but don't stop execution
        error_log("Column add error ($table.$column): " . $e->getMessage());
    }
}
?>