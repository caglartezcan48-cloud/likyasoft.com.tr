<?php
// Path: data/install/fix_collation.php
// Fixes "Illegal mix of collations" error by standardizing everything to utf8mb4_unicode_ci

$root = dirname(dirname(__DIR__));
require_once $root . '/core/database.php';

try {
    global $db;
    if (!$db) {
        $database = new Database();
        $db = $database->getConnection();
    }

    echo "<h3>Veritabanı Karakter Seti Onarımı</h3>";

    // 1. Database Default
    $db->exec("ALTER DATABASE likyapay CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci");
    echo "✅ Veritabanı varsayılanı ayarlandı.<br>";

    // 2. Tables
    $tables = ['users', 'transactions', 'sirius_cycles', 'sirius_requests', 'system_transactions'];
    
    foreach ($tables as $table) {
        // Check if table exists first to avoid errors
        $check = $db->query("SHOW TABLES LIKE '$table'");
        if ($check->rowCount() > 0) {
            $db->exec("ALTER TABLE $table CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
             echo "✅ Tablo onarıldı: <b>$table</b><br>";
        }
    }

    echo "<br><b>İşlem Tamamlandı! Artık Excel yükleyebilirsiniz.</b>";

} catch (PDOException $e) {
    echo "<b style='color:red'>Hata:</b> " . $e->getMessage();
}
?>
