<?php
include 'core/database.php';

// Config
$dbHost = 'localhost';
$dbName = 'likyapay';
$dbUser = 'root';
$dbPass = '';

try {
    $db = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8", $dbUser, $dbPass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$tables = array();
$result = $db->query("SHOW TABLES");
while ($row = $result->fetch(PDO::FETCH_NUM)) {
    $tables[] = $row[0];
}

$sqlScript = "SET FOREIGN_KEY_CHECKS=0;\n\n";
foreach ($tables as $table) {
    // Drop existing
    $sqlScript .= "\nDROP TABLE IF EXISTS `$table`;";

    // Structure
    $result = $db->query("SHOW CREATE TABLE $table");
    $row = $result->fetch(PDO::FETCH_NUM);
    $sqlScript .= "\n\n" . $row[1] . ";\n\n";

    // Data
    $result = $db->query("SELECT * FROM $table");
    $columnCount = $result->columnCount();

    while ($row = $result->fetch(PDO::FETCH_NUM)) {
        $sqlScript .= "INSERT INTO $table VALUES(";
        for ($j = 0; $j < $columnCount; $j++) {
            $row[$j] = $row[$j];
            if (isset($row[$j])) {
                $sqlScript .= '"' . addslashes($row[$j]) . '"';
            } else {
                $sqlScript .= '""';
            }
            if ($j < ($columnCount - 1)) {
                $sqlScript .= ',';
            }
        }
        $sqlScript .= ");\n";
    }
}

$sqlScript .= "\nSET FOREIGN_KEY_CHECKS=1;";

// Save locally first
$backup_file = 'likyapay_final.sql';
file_put_contents($backup_file, $sqlScript);

echo "New SQL exported to $backup_file";
?>
