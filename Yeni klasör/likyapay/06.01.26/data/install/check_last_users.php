<?php
// data/install/check_last_users.php
require_once '../../core/database.php';
$database = new Database();
$db = $database->getConnection();

echo "<pre>";
echo "<h3>Son Eklenen 5 Kullanıcı (Users Tablosu)</h3>";

$stmt = $db->query("SELECT id, name, email, role, status, created_at FROM users ORDER BY id DESC LIMIT 5");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$users) {
    echo "Tablo BOŞ!";
} else {
    print_r($users);
}
echo "</pre>";
?>
