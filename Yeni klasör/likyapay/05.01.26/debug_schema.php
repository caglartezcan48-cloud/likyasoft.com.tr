<?php
include_once 'core/database.php';
try {
    $db = (new Database())->getConnection();
    $q = $db->query("DESCRIBE sirius_cycles");
    $cols = $q->fetchAll(PDO::FETCH_ASSOC);
    print_r($cols);
} catch(Exception $e) {
    echo $e->getMessage();
}
?>
