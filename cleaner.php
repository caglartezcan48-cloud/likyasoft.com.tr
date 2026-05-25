<?php
// SQL Cleaner Script

function cleanSql($inputFile, $outputFile) {
    if (!file_exists($inputFile)) return false;
    $content = file_get_contents($inputFile);
    
    // Convert from UTF-16 to UTF-8 if necessary
    $encoding = mb_detect_encoding($content, ['UTF-16', 'UTF-8', 'ISO-8859-1']);
    if ($encoding === 'UTF-16' || strpos($content, "\xff\xfe") === 0) {
        $content = mb_convert_encoding($content, 'UTF-8', 'UTF-16');
    }

    // Remove CREATE DATABASE and USE statements
    $content = preg_replace('/CREATE DATABASE IF NOT EXISTS `.*?`;/i', '-- Removed CREATE DATABASE', $content);
    $content = preg_replace('/USE `.*?`;/i', '-- Removed USE', $content);
    
    file_put_contents($outputFile, $content);
    return true;
}

cleanSql('c:/Users/USER/Desktop/xammp/htdocs/likyasoft/database.sql', 'c:/Users/USER/Desktop/xammp/htdocs/likyasoft/likyasoft_clean.sql');
cleanSql('c:/Users/USER/Desktop/xammp/htdocs/likyasoft/public/likyapay/likyapay_full_backup.sql', 'c:/Users/USER/Desktop/xammp/htdocs/likyasoft/likyapay_clean.sql');

echo "Temizleme tamamlandı!";
?>
