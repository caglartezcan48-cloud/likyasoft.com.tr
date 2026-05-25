<?php
require_once __DIR__ . '/../../core/database.php';
$db = (new Database())->getConnection();
$db->query("DELETE FROM sirius_cycles WHERE id = 1");
echo "Deleted test cycle ID 1.\n";
