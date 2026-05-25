<?php
$host = 'localhost'; $user = 'root'; $pass = ''; $dbname = 'likyapay';
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $stmt = $pdo->query("SHOW TABLES");
    echo "<h3>Tablo Listesi:</h3><ul>";
    while($row = $stmt->fetch()) { echo "<li>" . $row[0] . "</li>"; }
    echo "</ul>";
} catch (Exception $e) { echo "Hata: " . $e->getMessage(); }
?>
