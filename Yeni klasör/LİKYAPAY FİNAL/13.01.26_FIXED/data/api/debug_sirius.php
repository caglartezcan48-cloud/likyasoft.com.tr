<?php
// Debug Script for InfinityFree 500 Errors
// Upload this to main folder or data/api/ and visit it.

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>LikyaPay Debug Tool</h1>";
echo "<pre>";

echo "Current Directory: " . __DIR__ . "\n";

// 1. Check Database File
$dbPath = __DIR__ . '/../../core/database.php';
echo "Checking Database path ($dbPath): ";
if (file_exists($dbPath)) {
    echo "✅ FOUND\n";
    include_once $dbPath;
    try {
        $db = new Database();
        $conn = $db->getConnection();
        echo "✅ Database Connection Successful\n";
    } catch (Exception $e) {
        echo "❌ Database Connection Failed: " . $e->getMessage() . "\n";
    }
} else {
    echo "❌ NOT FOUND\n";
}

// 2. Check Sirius Engine Execution
$enginePath = __DIR__ . '/sirius_engine.php';
echo "Checking Sirius Engine ($enginePath): ";
if (file_exists($enginePath)) {
    echo "✅ FOUND\n";
    try {
        include_once $enginePath;
        if (class_exists('SiriusEngine')) {
            echo "✅ Class 'SiriusEngine' Exists\n";
            $eng = new SiriusEngine();
            echo "✅ SiriusEngine Instantiated. Attempting to RUN...\n";
            
            // Capture Output Buffer to prevent JSON interference
            ob_start();
            $result = $eng->run();
            $output = ob_get_clean();
            
            echo "✅ Engine Run Completed.\n";
            echo "Result: ";
            print_r($result);
            if ($output) echo "\nCaptured Output (Unexpected): $output\n";
            
        } else {
            echo "❌ Class 'SiriusEngine' NOT Found in file\n";
        }
    } catch (Throwable $e) { // Catch ALL Errors including Fatal
        echo "❌ FATAL ENGINE ERROR: " . $e->getMessage() . "\n";
        echo "Trace: " . $e->getTraceAsString() . "\n";
    }
} else {
    echo "❌ NOT FOUND\n";
}

// 3. Check Other Dependencies
$deps = [
    '../../core/logger.php' => 'Check Logger',
    '../../core/mail_helper.php' => 'Check Mail Helper',
    '../../core/cors.php' => 'Check CORS'
];

foreach ($deps as $path => $name) {
    echo "$name ($path): ";
    if (file_exists(__DIR__ . '/' . $path)) {
        echo "✅ FOUND\n";
        try {
            include_once __DIR__ . '/' . $path;
            echo "✅ Included Successfully\n";
        } catch (Exception $e) {
            echo "❌ Include Error: " . $e->getMessage() . "\n";
        }
    } else {
        echo "❌ NOT FOUND\n";
    }
}

// 4. Test Logger Write Permission
if (class_exists('Logger')) {
    echo "Testing Logger Write Permission: ";
    try {
        Logger::log('DEBUG_TEST', 'Test Log Entry');
        echo "✅ Log Written Successfully\n";
    } catch (Exception $e) {
        echo "❌ Logger Failed: " . $e->getMessage() . "\n";
    }
}

// 3. PHP Info
echo "\nPHP Version: " . phpversion() . "\n";
echo "</pre>";
?>
