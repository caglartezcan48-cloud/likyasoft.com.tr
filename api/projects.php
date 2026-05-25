<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    exit;
}

switch($method) {
    case 'GET':
        $query = "SELECT * FROM projects ORDER BY order_index ASC, created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        // --- SİLME İŞLEMİ (Action: delete ise) ---
        if (isset($data->action) && $data->action === 'delete') {
            try {
                $stmt = $conn->prepare("DELETE FROM projects WHERE id = :id");
                $stmt->execute([':id' => $data->id]);
                echo json_encode(["status" => "success", "message" => "Proje silindi."]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
            break;
        }

        // --- GÜNCELLEME İŞLEMİ (ID varsa) ---
        if (!empty($data->id)) {
            try {
                $query = "UPDATE projects SET title = :title, slug = :slug, category = :category, description = :description, 
                          image_url = :image_url, project_url = :project_url, status = :status, order_index = :order_index WHERE id = :id";
                $stmt = $conn->prepare($query);
                $stmt->execute([
                    ':id' => $data->id,
                    ':title' => $data->title,
                    ':slug' => $data->slug ?? '',
                    ':category' => $data->category,
                    ':description' => $data->description,
                    ':image_url' => $data->image_url,
                    ':project_url' => $data->project_url,
                    ':status' => $data->status ?? 'completed',
                    ':order_index' => $data->order_index ?? 0
                ]);
                echo json_encode(["status" => "success", "message" => "Proje güncellendi."]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        } else {
            // --- YENİ KAYIT İŞLEMİ ---
            try {
                $query = "INSERT INTO projects (title, slug, category, description, image_url, project_url, status, order_index) 
                          VALUES (:title, :slug, :category, :description, :image_url, :project_url, :status, :order_index)";
                $stmt = $conn->prepare($query);
                $stmt->execute([
                    ':title' => $data->title,
                    ':slug' => $data->slug ?? '',
                    ':category' => $data->category,
                    ':description' => $data->description,
                    ':image_url' => $data->image_url,
                    ':project_url' => $data->project_url,
                    ':status' => $data->status ?? 'completed',
                    ':order_index' => $data->order_index ?? 0
                ]);
                echo json_encode(["status" => "success", "message" => "Proje eklendi."]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
        break;
}
?>
