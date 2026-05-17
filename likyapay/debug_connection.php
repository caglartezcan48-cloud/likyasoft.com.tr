<?php
// Debug Connection Script
// Upload this to the root directory and run it from the browser.

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>LikyaPay Database Connection Debugger</h1>";

// 1. Check Config Inclusion
if (!file_exists('core/config.php')) {
    die("<h3 style='color:red'>Critical Error: core/config.php not found!</h3>");
}

include 'core/config.php';

echo "<h3>Environment Detection</h3>";
echo "<strong>Server Host (HTTP_HOST):</strong> " . $_SERVER['HTTP_HOST'] . "<br>";
echo "<strong>Client IP (REMOTE_ADDR):</strong> " . $_SERVER['REMOTE_ADDR'] . "<br>";
echo "<strong>Debug Mode (SYSTEM_DEBUG):</strong> " . (defined('SYSTEM_DEBUG') && SYSTEM_DEBUG ? 'TRUE (Local Mode)' : 'FALSE (Live Mode)') . "<br>";

echo "<hr>";

echo "<h3>Database Configuration (Loaded from config.php)</h3>";
if (!defined('DB_HOST')) die("<h3 style='color:red'>Error: DB constants not defined. Check config logic.</h3>");

echo "<strong>DB_HOST:</strong> " . DB_HOST . "<br>";
echo "<strong>DB_NAME:</strong> " . DB_NAME . "<br>";
echo "<strong>DB_USER:</strong> " . DB_USER . "<br>";
echo "<strong>DB_PASS:</strong> " . (strlen(DB_PASS) > 0 ? "****** (Length: ".strlen(DB_PASS).")" : "Empty") . "<br>";

echo "<hr>";

echo "<h3>Connection Attempt</h3>";

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8";
    echo "Attempting connection to: $dsn <br>";
    
    $start = microtime(true);
    $conn = new PDO($dsn, DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $end = microtime(true);
    
    echo "<h2 style='color:green'>✅ Connection Successful!</h2>";
    echo "Time taken: " . round(($end - $start) * 1000, 2) . " ms<br>";
    
    // Check tables
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<strong>Tables found (" . count($tables) . "):</strong> " . implode(", ", $tables);
    
} catch(PDOException $e) {
    echo "<h2 style='color:red'>❌ Connection Failed!</h2>";
    echo "<strong>Error Code:</strong> " . $e->getCode() . "<br>";
    echo "<strong>Error Message:</strong> " . $e->getMessage() . "<br>";
    
    if ($e->getCode() == 2002) {
        echo "<br><strong>Troubleshooting Tip (Timeout/Network):</strong><br>";
        echo "1. Verify 'DB_HOST' is correct. Is it really <em>".DB_HOST."</em>?<br>";
        echo "2. Check if the hosting allows remote connections (if you are running this locally).<br>";
        echo "3. If running on InfinityFree, double-check the 'MySQL Hostname' in your Control Panel.<br>";
    }
}
?>
