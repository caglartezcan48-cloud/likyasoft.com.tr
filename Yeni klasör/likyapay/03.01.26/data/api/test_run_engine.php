<?php
// Test script for Sirius Engine
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define path to core relative to here
if (file_exists(__DIR__ . '/../../core/database.php')) {
    require_once __DIR__ . '/../../core/database.php';
} else {
    die("Database file not found!");
}

require_once __DIR__ . '/sirius_engine.php';

echo "Database and Engine loaded.\n";

try {
    $engine = new SiriusEngine();
    echo "Engine initialized.\n";
    
    $result = $engine->run();
    print_r($result);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
