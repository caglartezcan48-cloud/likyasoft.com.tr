<?php
// Simple Database Dump Script for Deployment
include_once 'core/database.php';

header('Content-Type: text/plain');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $tables = array();
    $result = $db->query('SHOW TABLES');
    while($row = $result->fetch(PDO::FETCH_NUM)){
        $tables[] = $row[0];
    }
    
    $return = "-- LİKYAPAY DATABASE DUMP \n";
    $return .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";
    $return .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
    $return .= "SET time_zone = \"+00:00\";\n\n";
    
    foreach($tables as $table){
        $result = $db->query('SELECT * FROM '.$table);
        $num_fields = $result->columnCount();
        
        $return .= "\n\n-- Table structure for table `$table`\n";
        $return .= "DROP TABLE IF EXISTS `$table`;\n";
        $row2 = $db->query('SHOW CREATE TABLE '.$table)->fetch(PDO::FETCH_NUM);
        $return .= $row2[1].";\n\n";
        
        $return .= "-- Dumping data for table `$table`\n";
        for ($i = 0; $i < $num_fields; $i++){
            while($row = $result->fetch(PDO::FETCH_NUM)){
                $return.= 'INSERT INTO `'.$table.'` VALUES(';
                for($j=0; $j < $num_fields; $j++){
                    $row[$j] = addslashes($row[$j]);
                    $row[$j] = preg_replace("/\n/","\\n",$row[$j]);
                    if (isset($row[$j])) { $return.= '"'.$row[$j].'"' ; } else { $return.= '""'; }
                    if ($j < ($num_fields-1)) { $return.= ','; }
                }
                $return.= ");\n";
            }
        }
        $return.="\n\n\n";
    }
    
    $file_name = 'likyapay_full_backup.sql';
    file_put_contents($file_name, $return);
    
    echo "Yedek başarıyla oluşturuldu: " . $file_name . "\n";
    echo "Bu dosyayı InfinityFree phpMyAdmin üzerinden 'İçe Aktar' (Import) diyerek yükleyebilirsiniz.";

} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
