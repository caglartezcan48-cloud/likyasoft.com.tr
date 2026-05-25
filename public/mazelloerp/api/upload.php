<?php
require_once 'auth_check.php'; // GÜVENLİK DUVARI
/**
 * MAZELLO IMAGE UPLOAD API
 */
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 0);

$response = ["status" => "error", "message" => "İşlem başarısız", "url" => ""];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['file']['tmp_name'];
            $fileName = $_FILES['file']['name'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));

            $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');
            if (in_array($fileExtension, $allowedfileExtensions)) {
                // Directory
                $uploadFileDir = '../uploads/products/';
                if (!file_exists($uploadFileDir)) {
                    mkdir($uploadFileDir, 0777, true);
                }

                // New Filename (Unique)
                $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
                $dest_path = $uploadFileDir . $newFileName;

                // --- IMAGE OPTIMIZATION (GD) Safety Check ---
                $optimized = false;

                if (function_exists('getimagesize') && function_exists('imagecreatetruecolor')) {
                    list($width, $height) = getimagesize($fileTmpPath);
                    $maxDim = 1200;

                    if (($width > $maxDim || $height > $maxDim) && $fileExtension !== 'gif') {
                        $targetWidth = $width;
                        $targetHeight = $height;

                        if ($width > $height) {
                            $targetWidth = $maxDim;
                            $targetHeight = ($height / $width) * $maxDim;
                        } else {
                            $targetHeight = $maxDim;
                            $targetWidth = ($width / $height) * $maxDim;
                        }

                        $src = null;
                        if ($fileExtension == 'png' && function_exists('imagecreatefrompng'))
                            $src = imagecreatefrompng($fileTmpPath);
                        elseif ($fileExtension == 'webp' && function_exists('imagecreatefromwebp'))
                            $src = imagecreatefromwebp($fileTmpPath);
                        elseif (function_exists('imagecreatefromjpeg'))
                            $src = imagecreatefromjpeg($fileTmpPath);

                        if ($src) {
                            $dst = imagecreatetruecolor($targetWidth, $targetHeight);
                            imagealphablending($dst, false);
                            imagesavealpha($dst, true);
                            imagecopyresampled($dst, $src, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

                            // Save as same extension if possible
                            if ($fileExtension == 'png')
                                imagepng($dst, $dest_path, 8);
                            elseif ($fileExtension == 'webp')
                                imagewebp($dst, $dest_path, 80);
                            else
                                imagejpeg($dst, $dest_path, 85);

                            imagedestroy($src);
                            imagedestroy($dst);
                            $optimized = true;
                        }
                    }
                }

                if (!$optimized) {
                    $success = move_uploaded_file($fileTmpPath, $dest_path);
                } else {
                    $success = true;
                }

                if ($success) {
                    $response['status'] = 'success';
                    $response['message'] = 'Dosya başarıyla yüklendi.';
                    $response['url'] = 'uploads/products/' . $newFileName;
                } else {
                    $response['message'] = 'Dosya yazılamadı. İzinleri kontrol edin.';
                }
            } else {
                $response['message'] = 'Uyumsuz format: ' . $fileExtension;
            }
        } else {
            $error = isset($_FILES['file']) ? $_FILES['file']['error'] : 'No File';
            $response['message'] = 'Yükleme Hatası (PHP Code): ' . $error;
        }
    }
} catch (Exception $e) {
    $response['message'] = "Sistem Hatası: " . $e->getMessage();
} catch (Error $e) {
    $response['message'] = "Kritik PHP Hatası: " . $e->getMessage();
}

echo json_encode($response);
?>