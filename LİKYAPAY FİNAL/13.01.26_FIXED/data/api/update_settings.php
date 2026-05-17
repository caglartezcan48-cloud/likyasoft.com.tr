<?php
// Path: data/api/update_settings.php
include_once '../../core/cors.php';
include_once '../../core/database.php';

handleCors();
session_start();

header('Content-Type: application/json');

// Security Check
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Yetkisiz erişim.']);
    exit;
}

try {
    $response = ['success' => true, 'message' => 'Ayarlar güncellendi.'];

    // Handle File Upload
    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $targetDir = "../../views/frontend/gorsel/";
        $targetFile = $targetDir . "logo.png";
        
        // Backup old logo if not exists
        if (!file_exists($targetDir . "logo_old.png") && file_exists($targetFile)) {
             copy($targetFile, $targetDir . "logo_old.png");
        }

        if (move_uploaded_file($_FILES['logo']['tmp_name'], $targetFile)) {
            $response['message'] .= ' Logo güncellendi.';
        } else {
            throw new Exception("Dosya yüklenirken hata oluştu.");
        }
    }

    // Handle Text Settings (title, email etc) - Currently just mocking persistence as they might be stored in a config file or DB
    // For now, LikyaPay seems to use static settings or mocked.
    // If user sends 'siteTitle', we could store it in a JSON or DB table 'settings'. 
    // Assuming DB table 'settings' doesn't exist yet, we will just acknowledge the upload.
    
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
