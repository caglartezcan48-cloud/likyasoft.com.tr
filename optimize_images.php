<?php
/**
 * Likyasoft Image Optimizer
 * Converts PNG/JPG to WebP, resizes for performance, and sets quality to 80%.
 */

$source_dirs = ['gorseller', 'public/uploads'];
$max_width = 1200;
$quality = 80;

foreach ($source_dirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    if (!is_dir($path)) continue;

    $files = scandir($path);
    foreach ($files as $file) {
        $file_path = $path . '/' . $file;
        if (!is_file($file_path)) continue;

        $info = pathinfo($file_path);
        $ext = strtolower($info['extension']);
        
        if (in_array($ext, ['jpg', 'jpeg', 'png'])) {
            $webp_path = $path . '/' . $info['filename'] . '.webp';
            
            // Skip if webp already exists and is newer
            if (file_exists($webp_path) && filemtime($webp_path) > filemtime($file_path)) {
                echo "Skipping $file (WebP exists)\n";
                continue;
            }

            echo "Optimizing $file... ";
            
            if ($ext == 'png') {
                $img = imagecreatefrompng($file_path);
                imagepalettetotruecolor($img);
                imagealphablending($img, true);
                imagesavealpha($img, true);
            } else {
                $img = imagecreatefromjpeg($file_path);
            }

            if (!$img) {
                echo "FAILED to load image\n";
                continue;
            }

            // Resize if too large
            $width = imagesx($img);
            $height = imagesy($img);
            if ($width > $max_width) {
                $new_width = $max_width;
                $new_height = floor($height * ($max_width / $width));
                $tmp = imagecreatetruecolor($new_width, $new_height);
                
                if ($ext == 'png') {
                    imagealphablending($tmp, false);
                    imagesavealpha($tmp, true);
                }
                
                imagecopyresampled($tmp, $img, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
                imagedestroy($img);
                $img = $tmp;
            }

            if (imagewebp($img, $webp_path, $quality)) {
                echo "SUCCESS -> " . basename($webp_path) . "\n";
            } else {
                echo "FAILED to save WebP\n";
            }
            
            imagedestroy($img);
        }
    }
}
echo "Optimization Complete!\n";
?>
