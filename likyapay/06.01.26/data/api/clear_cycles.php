<?php
require_once __DIR__ . '/../../core/database.php';
$db = (new Database())->getConnection();
$c = $db->query("SELECT count(*) FROM sirius_cycles")->fetchColumn();
echo "Cycles before: $c\n";
$db->query("TRUNCATE TABLE sirius_cycles");
echo "Cycles truncated.\n";
