<?php
// Mail Helper
// Path: core/mail_helper.php

require_once __DIR__ . '/config.php';

class MailHelper {
    /**
     * Send an email
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $body Email content (HTML supported)
     */
    public static function send($to, $subject, $body) {
        if (MAIL_METHOD === 'log') {
            return self::logMail($to, $subject, $body);
        }

        if (MAIL_METHOD === 'mail') {
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= 'From: <' . SMTP_FROM . '>' . "\r\n";
            return mail($to, $subject, $body, $headers);
        }

        if (MAIL_METHOD === 'smtp') {
            // Note: PHPMailer would be ideal here if installed via composer.
            // For now, we fall back to log if SMTP is not fully implemented.
            return self::logMail($to, $subject, $body, "[SMTP Simulation Mode]");
        }

        return false;
    }

    private static function logMail($to, $subject, $body, $prefix = "[LOG MODE]") {
        $logPath = __DIR__ . '/../data/logs/mail_log.txt';
        if (!file_exists(dirname($logPath))) mkdir(dirname($logPath), 0777, true);
        
        $entry = sprintf("[%s] %s TO: %s | SUBJECT: %s | BODY: %s\n", 
            date('Y-m-d H:i:s'), 
            $prefix,
            $to, 
            $subject, 
            strip_tags($body)
        );
        file_put_contents($logPath, $entry, FILE_APPEND);
        return true;
    }
}
?>
