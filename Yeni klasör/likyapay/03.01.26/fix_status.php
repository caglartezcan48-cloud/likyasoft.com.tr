<?php
// Fix User Statuses
// Sets empty status to 'Aktif' for existing users
include 'core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Update Query: Set status to 'Aktif' where empty and not admin
    $query = "UPDATE users SET status = 'Aktif' WHERE role != 'admin' AND (status = '' OR status IS NULL)";
    
    $stmt = $db->prepare($query);
    
    if ($stmt->execute()) {
        $count = $stmt->rowCount();
        echo "<h1>BÜYÜK TEMİZLİK BAŞARILI! 🎉</h1>";
        echo "<h2>$count adet kullanıcının durumu 'Aktif' olarak güncellendi.</h2>";
    } else {
        echo "<h2>Güncelleme başarısız oldu.</h2>";
    }

} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
