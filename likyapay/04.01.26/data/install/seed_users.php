<?php
// Force seed users
include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $demos = [
        ['Demo Şirket A.Ş.', 'demo1@likyapay.com', '1234567890', 'verified', 'Ahmet Yılmaz'],
        ['Test Lojistik Ltd.', 'test@likyapay.com', '9876543210', 'pending', 'Mehmet Demir'],
        ['Eski Yazılım A.Ş.', 'old@likyapay.com', '1112223333', 'banned', 'Ayşe Kaya']
    ];

    // Check if handling contact_person column needed? 
    // Currently users table might not have it, let's stick to standard columns or check setup_db
    // I will put contact person in name or separate if I can. 
    // For now, simple insert.

    $insert = $db->prepare("INSERT IGNORE INTO users (name, email, password, tax_id, role, status, created_at) VALUES (:name, :email, :pass, :tax, 'user', :status, NOW())");
    
    foreach ($demos as $d) {
        // Check if email exists
        $check = $db->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$d[1]]);
        if ($check->rowCount() == 0) {
            $pass = password_hash('123456', PASSWORD_BCRYPT);
            $insert->execute([
                ':name' => $d[0],
                ':email' => $d[1],
                ':pass' => $pass,
                ':tax' => $d[2],
                ':status' => $d[3]
            ]);
            echo "Added: " . $d[0] . "\n";
        } else {
            echo "Exists: " . $d[0] . "\n";
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
