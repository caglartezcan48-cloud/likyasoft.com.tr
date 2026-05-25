<?php
// data/api/services/KEPService.php

class KEPService {
    
    // Mock Sending KEP Mail
    public static function send($to, $subject, $body, $attachments = []) {
        // Standardize output for demo
        $logParams = [
            'to' => $to,
            'subject' => $subject,
            'body_length' => strlen($body),
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // In a real scenario, this would use SOAP/REST API of TÜRKKEP
        // For now, we simulate success.
        
        // Log simulation
        error_log("KEP_SIMULATION: Sending to $to | " . json_encode($logParams));
        
        return [
            'success' => true,
            'message' => 'KEP iletisi başarıyla kuyruğa alındı (Simülasyon).',
            'transaction_id' => 'KEP-' . uniqid()
        ];
    }

    public static function checkStatus($transactionId) {
        return [
            'status' => 'DELIVERED', // SENT, DELIVERED, READ
            'read_date' => date('Y-m-d H:i:s')
        ];
    }
}
?>
