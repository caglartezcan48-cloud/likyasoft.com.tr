<?php
// Run Sirius Engine (CLI Mode)
// Path: data/run_engine_cli.php

// Mock Session for Database class relying on it (if any, though Database class usually doesn't)
if (session_status() == PHP_SESSION_NONE) {
    // session_start();
}

include_once __DIR__ . '/api/sirius_engine.php';

try {
    echo "Sirius Motoru Başlatılıyor...\n";
    
    $engine = new SiriusEngine();
    $result = $engine->run();
    
    // Output Result nicely
    print_r($result);
    
    if (isset($result['cycles'])) {
        echo "\n--- BULUNAN DÖNGÜLER ---\n";
        foreach ($result['cycles'] as $i => $cycle) {
            echo "Döngü #" . ($i+1) . "\n";
            echo "  Hacim: " . number_format($cycle['volume'], 2) . " TL\n";
            echo "  Katılımcı Sayısı: " . $cycle['count'] . "\n";
            echo "  SEKTÖR UYUM PUANI (Synergy): " . ($cycle['sector_synergy'] ?? 'YOK') . "\n"; // Verify this exists
            echo "  Firmalar: " . implode(" -> ", $cycle['nodes']) . "\n";
            echo "-------------------------\n";
        }
    }

} catch (Exception $e) {
    echo "HATA: " . $e->getMessage() . "\n";
}
?>
