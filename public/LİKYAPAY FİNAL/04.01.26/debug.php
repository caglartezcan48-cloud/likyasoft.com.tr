<?php
// Debug script to check database state
include_once 'core/database.php';

echo "<h1>LikyaPay Debug</h1>";

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("<p style='color:red'>❌ Connection failed! Check core/config.php</p>");
    }

    echo "<p style='color:green'>✅ Connected to database: " . DB_NAME . "</p>";

    // Check users table structure
    echo "<h3>Users Table Structure:</h3>";
    $stmt = $db->query("DESCRIBE users");
    echo "<table border='1' cellpadding='5' style='border-collapse:collapse'>
            <tr style='background:#f4f4f4'><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr>
                <td>" . $row['Field'] . "</td>
                <td>" . $row['Type'] . "</td>
                <td>" . $row['Null'] . "</td>
                <td>" . $row['Key'] . "</td>
                <td>" . $row['Default'] . "</td>
              </tr>";
    }
    echo "</table>";

    // Check users
    echo "<h3>Users Data:</h3>";
    $stmt = $db->query("SELECT id, name, email, role, status FROM users");
    echo "<table border='1' cellpadding='5' style='border-collapse:collapse'>
            <tr style='background:#f4f4f4'><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $color = ($row['status'] === 'Aktif') ? 'green' : 'red';
        echo "<tr>
                <td>" . $row['id'] . "</td>
                <td>" . $row['name'] . "</td>
                <td>" . $row['email'] . "</td>
                <td>" . $row['role'] . "</td>
                <td style='color:$color; font-weight:bold'>" . $row['status'] . "</td>
              </tr>";
    }
    echo "</table>";

} catch (Exception $e) {
    echo "<p style='color:red'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
