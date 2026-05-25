<?php
require_once 'api/db.php';
$stmt = $conn->query("SELECT id, title, slug, project_url FROM projects");
$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($projects, JSON_PRETTY_PRINT);
?>
