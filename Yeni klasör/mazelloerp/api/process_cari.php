<?php
// Mazello Mobilya API - Cari / Müşteri Yönetim Motoru v4.0
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents('php://input'), true);

try {
    if (!$data || !isset($data['ad_soyad'])) {
        throw new Exception("Geçersiz veri girişi!");
    }

    $id = $data['id'] ?? null;
    $cari_tipi = $data['cari_tipi'] ?? 'musteri';
    $ad_soyad = $data['ad_soyad'];
    $yetkili_kisi = $data['yetkili_kisi'] ?? '';
    $phone = $data['telefon'] ?? '';
    $email = $data['eposta'] ?? '';
    $address = $data['adres'] ?? '';
    $tax_office = $data['vergi_dairesi'] ?? '';
    $tax_no = $data['vergi_no'] ?? '';
    $tc_no = $data['tc_no'] ?? '';
    $iban = $data['iban'] ?? '';
    $notes = $data['notlar'] ?? '';

    if ($id) {
        // Güncelleme
        $sql = "UPDATE cariler SET 
                cari_tipi = ?, ad_soyad = ?, yetkili_kisi = ?, telefon = ?, eposta = ?, 
                adres = ?, vergi_dairesi = ?, vergi_no = ?, tc_no = ?, iban = ?, notlar = ? 
                WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$cari_tipi, $ad_soyad, $yetkili_kisi, $phone, $email, $address, $tax_office, $tax_no, $tc_no, $iban, $notes, $id]);
        $message = "Cari kart güncellendi.";
    } else {
        // Yeni Kayıt
        $sql = "INSERT INTO cariler 
                (cari_tipi, ad_soyad, yetkili_kisi, telefon, eposta, adres, vergi_dairesi, vergi_no, tc_no, iban, notlar) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        $stmt->execute([$cari_tipi, $ad_soyad, $yetkili_kisi, $phone, $email, $address, $tax_office, $tax_no, $tc_no, $iban, $notes]);
        $id = $db->lastInsertId();
        $message = "Yeni cari kart oluşturuldu.";
    }

    echo json_encode(["status" => "success", "message" => $message, "id" => $id]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "İşlem Başarısız: " . $e->getMessage()]);
}
?>