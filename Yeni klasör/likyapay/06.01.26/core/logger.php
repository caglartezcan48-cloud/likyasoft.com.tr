<?php
// Core Logger Service
// Path: core/logger.php

class Logger {
    private static $db = null;

    private static function init() {
        if (self::$db === null) {
            if (file_exists(__DIR__ . '/database.php')) {
                require_once __DIR__ . '/database.php';
                $database = new Database();
                self::$db = $database->getConnection();
            }
        }
    }

    /**
     * Log an action to the system_logs table
     * @param string $action Short name of the action (e.g. 'LOGIN', 'TX_CREATED')
     * @param string $description Detailed message
     * @param int|null $user_id ID of the user performing the action
     */
    public static function log($action, $description, $user_id = null) {
        self::init();
        if (!self::$db) return false;

        try {
            if ($user_id === null && isset($_SESSION['user_id'])) {
                $user_id = $_SESSION['user_id'];
            }

            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

            $sql = "INSERT INTO system_logs (user_id, action, description, ip_address) 
                    VALUES (:uid, :act, :desc, :ip)";
            $stmt = self::$db->prepare($sql);
            $stmt->execute([
                ':uid' => $user_id,
                ':act' => $action,
                ':desc' => $description,
                ':ip' => $ip
            ]);
            return true;
        } catch (Exception $e) {
            // Silently fail to not break the main app flow, or log to a file
            error_log("Logging failed: " . $e->getMessage());
            return false;
        }
    }
}
?>
