<?php
function delete_dir($dir) {
    if (!is_dir($dir)) return;
    $files = array_diff(scandir($dir), array('.', '..'));
    foreach ($files as $file) {
        (is_dir("$dir/$file")) ? delete_dir("$dir/$file") : unlink("$dir/$file");
    }
    return rmdir($dir);
}

echo "<h1>Cleanup</h1>";
$targets = ["MAZELLOMOBİLYA", "node_modules", "_dev_tools", "backups", "config", "core", "css", "data", "js", "logs", "public", "temp", "api"];
// Note: Keeping 'assets', 'assest', 'index.html', 'sw.js', '.htaccess'

foreach ($targets as $t) {
    if (is_dir($t)) {
        delete_dir($t);
        echo "<p>Deleted folder: $t</p>";
    }
}

$files = ["build_helper.php", "mover.php", "package.json", "package-lock.json", "postcss.config.js", "tailwind.config.js", "vite.config.js", "README.md", "SESSION_NOTES.md", "DEPLOYMENT.md", "auto_backup.bat"];
foreach ($files as $f) {
    if (file_exists($f)) {
        unlink($f);
        echo "<p>Deleted file: $f</p>";
    }
}
?>
