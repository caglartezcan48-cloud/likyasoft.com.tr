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

    // 3. Scan Sirius Archive (New Structure: uploads/sirius_archive/YYYY-MM/ID/...)
    $siriusRoot = "../../uploads/sirius_archive/";
    if (is_dir($siriusRoot)) {
        // We use RecursiveIterator to find all files in subfolders
        $dirIterator = new RecursiveDirectoryIterator($siriusRoot, RecursiveDirectoryIterator::SKIP_DOTS);
        $iterator = new RecursiveIteratorIterator($dirIterator, RecursiveIteratorIterator::SELF_FIRST);

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $filename = $file->getFilename();

                // Check if file belongs to this user (Matches Tax ID)
                // contract_TAXID.html or invoice_TAXID.html
                if (strpos($filename, "_" . $taxId . ".html") !== false) {
                    $type = 'Diğer';
                    if (strpos($filename, "invoice_") === 0)
                        $type = 'Sirius Döngü Faturası';
                    if (strpos($filename, "contract_") === 0)
                        $type = 'Sirius Döngü Sözleşmesi';

                    $files[] = [
                        'filename' => $filename,
                        'created_at' => date('d.m.Y H:i', $file->getMTime()),
                        'display_date' => date('d.m.Y', $file->getMTime()),
                        'size' => round($file->getSize() / 1024, 2) . ' KB',
                        // We need to pass the FULL relative path or a smart identifier to view_sirius_file
                        // Since view_sirius_file expects just a filename and searches in fixed paths, we need to update view_sirius_file too.
                        // OR we send the relative path from sirius_archive root.
                        // Let's modify view_sirius_file to handle relative paths if we pass them.
                        // For now, let's pass the relative path in a 'path' param or encode it.
                        // Hack: We can pass "YYYY-MM/ID/filename" as 'file' param if we update view logic.
                        // Let's try passing the relative path from siriusRoot.
                        'download_url' => "../data/api/archive.php?action=view_sirius_file&file=" . urlencode($iterator->getSubPathName()) . ($action === 'list_user_invoices' ? "&target_uid=$targetUserId" : ""),
                        'type' => $type
                    ];
                }
            }
        }
    }

    // Sort by Date Desc
    usort($files, function ($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    echo json_encode(["success" => true, "data" => $files]);
    exit;
} elseif ($action === 'view_file') {
    // Serve Generic Invoice
    $file = $_GET['file'] ?? '';
    if (!$file)
        die("Dosya yok.");

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
} elseif ($action === 'view_sirius_file') {
    // Serve Sirius Invoice
    $file = $_GET['file'] ?? '';
    if (!$file)
        die("Dosya yok.");

    // Security: Prevent going up directories
    if (strpos($file, '..') !== false)
        die("Geçersiz dosya yolu.");

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

    if (strpos($file, "_" . $taxId . ".html") === false) {
        die("Yetkisiz erişim.");
    }

    // Try new structure
    $path = "../../uploads/sirius_archive/" . $file;

    // Fallback to old structure if not found (clean filename for old structure)
    if (!file_exists($path)) {
        $path = "../../uploads/archives/sirius/" . basename($file);
    }

    if (file_exists($path)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($path);
        exit;
    } else {
        http_response_code(404);
        echo "Dosya bulunamadı: " . htmlspecialchars($file);
    }
}
?>