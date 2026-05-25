<?php
// Debug Users List
// Check what is in DB vs what API logic sees

include_once '../../core/database.php';

$database = new Database();
$db = $database->getConnection();

header('Content-Type: text/plain');

echo "=== BAŞLANGIÇ ===\n";

// 1. Raw DB Query (All Users)
$stmt = $db->query("SELECT id, name, email, role, status FROM users");
$allUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "=== VERITABANI LISTESI ===\n";
foreach ($allUsers as $u) {
    echo "[ID: {$u['id']}] Isim: {$u['name']} | Email: {$u['email']} | Rol: {$u['role']}\n";
}
echo "=== LISTE SONU ===\n";

if (empty($allUsers)) {
    echo "!! TABLO BOS !! \n";
}

// 2. Filtered Query (What the API runs)
$queryAPI = "SELECT id, name, email, role, status FROM users WHERE role != 'admin' ORDER BY created_at DESC";
$stmt2 = $db->query($queryAPI);
$apiUsers = $stmt2->fetchAll(PDO::FETCH_ASSOC);

echo "<h3>2. API'nin Görmesi Gerekenler (Rol != admin):</h3>";
echo "Total: " . count($apiUsers) . "<br>";
echo "<table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>";
foreach ($apiUsers as $u) {
    echo "<tr><td>{$u['id']}</td><td>{$u['name']}</td><td>{$u['email']}</td><td>{$u['role']}</td><td>{$u['status']}</td></tr>";
}
echo "</table>";

?>
