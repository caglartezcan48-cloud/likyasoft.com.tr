<?php
// data/api/site_content.php
// Manages dynamic site content (Hero, Features, Videos, etc.)

header('Content-Type: application/json; charset=utf-8');
include_once '../../core/database.php';
// handleCors(); // If available

session_start();

function response($success, $data = [], $message = '')
{
    echo json_encode(['success' => $success, 'data' => $data, 'message' => $message]);
    exit;
}

try {
    $db = (new Database())->getConnection();

    // Auto-Create Table if missing
    $db->exec("CREATE TABLE IF NOT EXISTS site_contents (
        section_key VARCHAR(50) PRIMARY KEY,
        content_json TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM site_contents");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $content = [];
        foreach ($rows as $row) {
            $content[$row['section_key']] = json_decode($row['content_json'], true);
        }

        // Return empty structure if DB empty (Default Values Fallback handled in Frontend usually, but we can seed)
        if (empty($content)) {
            // Optional: return defaults or just empty
        }

        response(true, $content);

    } elseif ($method === 'POST') {
        // Admin Check
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403);
            response(false, [], "Yetkisiz işlem.");
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input)
            response(false, [], "No data.");

        $db->beginTransaction();
        try {
            $stmt = $db->prepare("INSERT INTO site_contents (section_key, content_json) VALUES (:key, :json) ON DUPLICATE KEY UPDATE content_json = :json");

            foreach ($input as $key => $value) {
                // $value is an array/object, convert to JSON
                $json = json_encode($value, JSON_UNESCAPED_UNICODE);
                $stmt->execute([':key' => $key, ':json' => $json]);
            }
            $db->commit();
            response(true, [], "İçerik güncellendi.");
        } catch (Exception $ex) {
            $db->rollBack();
            throw $ex;
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    response(false, [], $e->getMessage());
}
?>