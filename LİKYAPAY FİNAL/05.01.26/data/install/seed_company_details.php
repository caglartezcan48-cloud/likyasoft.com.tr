<?php
// Seed Company Details
// Path: data/install/seed_company_details.php

include_once '../../core/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "Sirket detaylari guncelleniyor...\n";

    // 1. Get all users
    $stmt = $db->query("SELECT id, name, tax_id FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $taxOffices = ['Beşiktaş', 'Kadıköy', 'Şişli', 'Beyoğlu', 'Maslak', 'Zincirlikuyu', 'Levent'];
    $streets = ['Büyükdere Cad.', 'Bağdat Cad.', 'İstiklal Cad.', 'Barbaros Bulvarı', 'Nispetiye Cad.'];

    foreach ($users as $user) {
        // Generate random details if empty
        $taxOffice = $taxOffices[array_rand($taxOffices)] . " Vergi Dairesi";
        $mersis = '0' . $user['tax_id'] . '00015'; // Mock Mersis
        $registry = rand(100000, 999999);
        
        $street = $streets[array_rand($streets)];
        $no = rand(1, 150);
        $address = "Merkez Mah. $street No: $no D: " . rand(1, 20) . " İstanbul";

        // Update User
        $update = $db->prepare("UPDATE users SET 
            address = :address,
            tax_office = :tax_office,
            mersis_no = :mersis_no,
            trade_registry_no = :trade_registry_no
            WHERE id = :id AND (address IS NULL OR address = '')
        ");

        $update->execute([
            ':address' => $address,
            ':tax_office' => $taxOffice,
            ':mersis_no' => $mersis,
            ':trade_registry_no' => $registry,
            ':id' => $user['id']
        ]);

        echo "Guncellendi: " . $user['name'] . "\n";
    }

    echo "\n--- ISLEM TAMAMLANDI ---\n";
    echo "Tum kullanicilara ornek sirket bilgileri eklendi.\n";

} catch (Exception $e) {
    echo "Hata: " . $e->getMessage();
}
?>
