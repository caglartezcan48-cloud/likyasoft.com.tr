<?php
// data/api/archive.php

header('Content-Type: application/json');
include_once '../../core/database.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Oturum gerekli."]);
    exit;
}

$action = $_GET['action'] ?? '';
$user_id = $_SESSION['user_id'];

$db = (new Database())->getConnection();

if ($action === 'list_my_invoices' || $action === 'list_user_invoices') {
    $targetUserId = $user_id; // Default to self

    // Admin Override
    if ($action === 'list_user_invoices') {
        // Check if current user is admin
        $stmt = $db->prepare("SELECT role, user_type FROM users WHERE id = :uid");
        $stmt->execute([':uid' => $user_id]);
        $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($currentUser && ($currentUser['role'] === 'admin' || $currentUser['user_type'] === 'employee')) {
            if (isset($_GET['user_id'])) {
                $targetUserId = $_GET['user_id'];
            }
        } else {
            http_response_code(403);
            die(json_encode(["success" => false, "message" => "Yetkisiz işlem."]));
        }
    }

    // 1. Get User Tax ID
    $stmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
    $stmt->execute([':uid' => $targetUserId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || empty($user['tax_id'])) {
        echo json_encode(["success" => true, "data" => []]);
        exit;
    }

    $taxId = $user['tax_id'];
    
    // 2. Scan Directory
    $archiveDir = "../../uploads/archives/invoices/$taxId/";
    $files = [];

    if (is_dir($archiveDir)) {
        $scan = scandir($archiveDir);
        foreach ($scan as $file) {
            if ($file !== '.' && $file !== '..') {
                $path = $archiveDir . $file;
                $files[] = [
                    'filename' => $file,
                    'created_at' => date('d.m.Y H:i', filemtime($path)), // Keep full timestamp for sorting
                    'display_date' => date('d.m.Y', filemtime($path)),   // For UI display
                    'size' => round(filesize($path) / 1024, 2) . ' KB',
                    'download_url' => "../data/api/archive.php?action=view_file&file=" . urlencode($file) . ($action === 'list_user_invoices' ? "&target_uid=$targetUserId" : "")
                ];
            }
        }
    }
    
    // Also include SIRIUS invoices from sirius folder?
    $siriusDir = "../../uploads/archives/sirius/";
    if (is_dir($siriusDir)) {
         $scan = scandir($siriusDir);
         foreach ($scan as $file) {
             if (strpos($file, "invoice_") === 0 && strpos($file, "_$taxId.html") !== false) {
                 $path = $siriusDir . $file;
                 $files[] = [
                     'filename' => $file,
                     'created_at' => date('d.m.Y H:i', filemtime($path)),
                     'display_date' => date('d.m.Y', filemtime($path)),
                     'size' => round(filesize($path) / 1024, 2) . ' KB',
                     'download_url' => "../data/api/archive.php?action=view_sirius_file&file=" . urlencode($file) . ($action === 'list_user_invoices' ? "&target_uid=$targetUserId" : ""),
                     'type' => 'Sirius Döngü Faturası'
                 ];
             }
         }
    }
    
    // Sort by Date Desc
    usort($files, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    echo json_encode(["success" => true, "data" => $files]);
    exit;
}

elseif ($action === 'view_file') {
    // Serve Generic Invoice
    $file = $_GET['file'] ?? '';
    if (!$file) die("Dosya yok.");
    
    // Security Check: No directory traversal
    $file = basename($file); 

    // Determine Target User
    $targetUserId = $user_id;
    if (isset($_GET['target_uid'])) {
         // Check Admin Perms
         $stmt = $db->prepare("SELECT role, user_type FROM users WHERE id = :uid");
         $stmt->execute([':uid' => $user_id]);
         $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);

         if ($currentUser && ($currentUser['role'] === 'admin' || $currentUser['user_type'] === 'employee')) {
             $targetUserId = $_GET['target_uid'];
         } else {
             die("Yetkisiz erişim.");
         }
    }

    // Get Tax ID
    $stmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
    $stmt->execute([':uid' => $targetUserId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $taxId = $user['tax_id'];

    $path = "../../uploads/archives/invoices/$taxId/" . $file;
    
    if (file_exists($path)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($path);
    } else {
        http_response_code(404);
        echo "Dosya bulunamadı.";
    }
}

elseif ($action === 'view_sirius_file') {
     // Serve Sirius Invoice
     $file = $_GET['file'] ?? '';
     if (!$file) die("Dosya yok.");
     $file = basename($file);
     
     // Determine Target User
     $targetUserId = $user_id;
     if (isset($_GET['target_uid'])) {
          // Check Admin Perms
          $stmt = $db->prepare("SELECT role, user_type FROM users WHERE id = :uid");
          $stmt->execute([':uid' => $user_id]);
          $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);
 
          if ($currentUser && ($currentUser['role'] === 'admin' || $currentUser['user_type'] === 'employee')) {
              $targetUserId = $_GET['target_uid'];
          } else {
              die("Yetkisiz erişim.");
          }
     }

     // Security: Ensure it belongs to this user
     $stmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
     $stmt->execute([':uid' => $targetUserId]);
     $user = $stmt->fetch(PDO::FETCH_ASSOC);
     $taxId = $user['tax_id'];
     
     if (strpos($file, "_$taxId.html") === false) {
         die("Yetkisiz erişim.");
     }

     $path = "../../uploads/archives/sirius/" . $file;
     if (file_exists($path)) {
         header('Content-Type: text/html; charset=utf-8');
         readfile($path);
     } else {
        http_response_code(404);
        echo "Dosya bulunamadı.";
    }
}
?>
