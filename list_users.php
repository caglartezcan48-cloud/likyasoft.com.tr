<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'likyapay';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->query("SELECT id, email, role FROM users LIMIT 10");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h2>Veritabanındaki Kullanıcılar:</h2>";
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>ID</th><th>Email</th><th>Rol</th></tr>";
    foreach ($users as $u) {
        echo "<tr><td>{$u['id']}</td><td>{$u['email']}</td><td>'{$u['role']}'</td></tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
