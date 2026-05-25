<?php
if (php_sapi_name() === 'cli') {
    $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
    $_SERVER['HTTP_HOST'] = 'localhost';
    $_SERVER['REQUEST_METHOD'] = 'GET';
}

include_once 'core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $sql = "CREATE TABLE IF NOT EXISTS user_companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_user_id INT NOT NULL,
        company_user_id INT NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (parent_user_id),
        UNIQUE KEY unique_company (parent_user_id, company_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql);
    echo "Table 'user_companies' created successfully.";

} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage();
}
?>
