<?php
// run_engine_no_auth.php
// Bypass auth to test Sirius Engine

include_once 'api/sirius_engine_v2.php';

header('Content-Type: application/json');

try {
    $engine = new SiriusEngine();
    $result = $engine->run();
    echo json_encode($result, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
