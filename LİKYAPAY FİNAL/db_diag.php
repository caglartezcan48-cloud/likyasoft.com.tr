<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include 'core/database.php';
$database = new Database();
$db = $database->getConnection();

echo "<h3>DB Check</h3>";
echo "DB Name: " . $db->query("SELECT DATABASE()")->fetchColumn() . "<br>";
echo "User: " . $db->query("SELECT USER()")->fetchColumn() . "<br>";

echo "<h3>Tables</h3>";
$tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo implode(", ", $tables) . "<br>";

if (in_array('users', $tables)) {
    echo "Users Count: " . $db->query("SELECT count(*) FROM users")->fetchColumn() . "<br>";
} else {
    echo "Users table MISSING!<br>";
}

if (in_array('sirius_cycles', $tables)) {
    echo "Cycles Count: " . $db->query("SELECT count(*) FROM sirius_cycles")->fetchColumn() . "<br>";
} else {
    echo "Cycles table MISSING!<br>";
}
?>
