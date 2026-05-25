<?php
// MAZELLO SETTINGS API
// v1.0 - Dynamic Configuration// SETTINGS HANDLER
require_once 'auth_check.php'; // GÜVENLİK DUVARI
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

$action = $_GET['action'] ?? '';

// Helper: Tabloyu kontrol et ve yoksa oluştur
function checkTable($db)
{
    $db->exec("CREATE TABLE IF NOT EXISTS ayarlar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        anahtar VARCHAR(50) UNIQUE,
        deger TEXT,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Varsayılanları ekle (Eğer yoksa)
    $stmt = $db->query("SELECT COUNT(*) FROM ayarlar");
    if ($stmt->fetchColumn() == 0) {
        $defaults = [
            'company_name' => 'MAZELLO MOBİLYA',
            'company_title' => 'MAZELLO MOBİLYA TASARIM LTD. ŞTİ.',
            'address' => 'Modoko Mobilyacılar Sitesi 4. Cadde',
            'phone' => '0216 555 44 33'
        ];
        $ins = $db->prepare("INSERT INTO ayarlar (anahtar, deger) VALUES (?, ?)");
        foreach ($defaults as $k => $v) {
            $ins->execute([$k, $v]);
        }
    }

    // YENİ YETKİLENDİRME GÜNCELLEMESİ (CARİLER TABLOSUNA LOGIN SÜTUNLARI)
    try {
        $db->exec("ALTER TABLE cariler ADD COLUMN kullanici_adi VARCHAR(50) NULL");
    } catch (PDOException $e) {
    }
    try {
        $db->exec("ALTER TABLE cariler ADD COLUMN sifre VARCHAR(255) NULL");
    } catch (PDOException $e) {
    }
    try {
        $db->exec("ALTER TABLE cariler ADD COLUMN rol VARCHAR(50) DEFAULT 'PLASIYER'");
    } catch (PDOException $e) {
    }
}

try {
    checkTable($db);

    if ($action === 'get_settings') {
        $stmt = $db->query("SELECT anahtar, deger FROM ayarlar");
        $settings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['anahtar']] = $row['deger'];
        }
        echo json_encode(["status" => "success", "data" => $settings]);

    } elseif ($action === 'save_settings') {
        $input = json_decode(file_get_contents('php://input'), true);

        $upd = $db->prepare("INSERT INTO ayarlar (anahtar, deger) VALUES (?, ?) ON DUPLICATE KEY UPDATE deger = VALUES(deger)");

        foreach ($input as $key => $val) {
            // Sadece izin verilen anahtarlar (Güvenlik)
            $allowed = ['company_name', 'company_title', 'address', 'phone', 'web', 'tax_rate', 'iban', 'bank_name', 'terms_offer', 'tax_office', 'tax_number', 'mersis_no', 'ticaret_sicil_no', 'barcode_config', 'smtp_host', 'smtp_port', 'smtp_email', 'smtp_pass', 'notification_whatsapp'];
            if (in_array($key, $allowed)) {
                $upd->execute([$key, is_array($val) ? json_encode($val) : $val]);
            }
        }
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'get_available_employees') {
        // Yeni bir özellik, Sadece Sistem yetkisi OLMAYAN (kullanici_adi boş olan) personelleri getir
        $stmt = $db->query("SELECT id, ad_soyad FROM cariler WHERE tip='personel' AND durum='aktif' AND (kullanici_adi IS NULL OR kullanici_adi = '') ORDER BY ad_soyad ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'assign_employee_role') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['id']) || empty($input['username']) || empty($input['pin']) || empty($input['role'])) {
            echo json_encode(["status" => "error", "message" => "Lütfen tüm güvenlik bilgilerini eksiksiz doldurun."]);
            exit;
        }

        // Kullanıcı adının benzersiz olması gerekiyor, önce onu kontrol et (Kendi hariç)
        $check = $db->prepare("SELECT COUNT(*) FROM cariler WHERE kullanici_adi = ? AND id != ?");
        $check->execute([$input['username'], $input['id']]);
        if ($check->fetchColumn() > 0) {
            echo json_encode(["status" => "error", "message" => "Bu kullanıcı adı ({$input['username']}) zaten başka bir personel tarafından kullanılıyor. Lütfen farklı bir tane belirleyin."]);
            exit;
        }

        // Güvenli Şifreleme Logiği (Mevcut yapı ile aynı model BCRYPT)
        $hash = password_hash($input['pin'], PASSWORD_BCRYPT);

        $stmt = $db->prepare("UPDATE cariler SET kullanici_adi = ?, sifre = ?, rol = ? WHERE id = ? AND tip = 'personel'");
        $stmt->execute([
            $input['username'],
            $hash,
            $input['role'],
            $input['id']
        ]);

        echo json_encode(["status" => "success"]);

    } elseif ($action === 'update_employee_password') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['id']) || empty($input['new_pin'])) {
            echo json_encode(["status" => "error", "message" => "Lütfen yeni şifreyi giriniz."]);
            exit;
        }
        
        $hash = password_hash($input['new_pin'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE cariler SET sifre = ? WHERE id = ? AND tip = 'personel'");
        $stmt->execute([$hash, $input['id']]);
        
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'revoke_employee_role') {
        $id = (int) $_GET['id'];
        // Yetki silindiğinde sadece login erişimi kopacak, isim kalacak.
        $stmt = $db->prepare("UPDATE cariler SET kullanici_adi = NULL, sifre = NULL, rol = NULL WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'get_employees_with_roles') {
        // Zaten Yetkilendirilmiş (Kullanıcı Adı olan) Yalnızca Aktif veya Pasif Tüm Yetkililer
        $stmt = $db->query("SELECT id, ad_soyad, kullanici_adi, rol, durum FROM cariler WHERE tip='personel' AND kullanici_adi IS NOT NULL AND kullanici_adi != '' ORDER BY ad_soyad ASC");
        echo json_encode(["status" => "success", "employees" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'get_employees') {
        // Personel Listesi (Yetkilerle Birlikte)
        $stmt = $db->query("SELECT id, ad_soyad, telefon, eposta, yetki_json, dogum_tarihi, sgk_no, ise_giris_tarihi FROM cariler WHERE tip='personel' ORDER BY ad_soyad ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'save_employee') {
        // Personel Ekle/Güncelle
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['ad_soyad']))
            throw new Exception("İsim zorunludur.");

        if (!empty($input['id'])) {
            // Update
            $stmt = $db->prepare("UPDATE cariler SET ad_soyad=?, telefon=?, eposta=?, yetki_json=?, dogum_tarihi=?, sgk_no=?, ise_giris_tarihi=? WHERE id=? AND tip='personel'");
            $stmt->execute([
                $input['ad_soyad'],
                $input['telefon'],
                $input['eposta'],
                $input['yetki_json'] ?? null,
                empty($input['dogum_tarihi']) ? null : $input['dogum_tarihi'],
                $input['sgk_no'] ?? null,
                empty($input['ise_giris_tarihi']) ? null : $input['ise_giris_tarihi'],
                $input['id']
            ]);
        } else {
            // Insert
            $count = $db->query("SELECT COUNT(*) FROM cariler WHERE tip='personel'")->fetchColumn() + 1;
            $code = "P-" . str_pad($count, 4, '0', STR_PAD_LEFT);

            $stmt = $db->prepare("INSERT INTO cariler (cari_kodu, tip, ad_soyad, telefon, eposta, yetki_json, dogum_tarihi, sgk_no, ise_giris_tarihi) VALUES (?, 'personel', ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $code,
                $input['ad_soyad'],
                $input['telefon'],
                $input['eposta'],
                $input['yetki_json'] ?? null,
                empty($input['dogum_tarihi']) ? null : $input['dogum_tarihi'],
                $input['sgk_no'] ?? null,
                empty($input['ise_giris_tarihi']) ? null : $input['ise_giris_tarihi']
            ]);
        }
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'delete_employee') {
        // Personel Sil
        $id = (int) $_GET['id'];
        // Bağlı işlem var mı kontrol et
        $check = $db->prepare("SELECT COUNT(*) FROM teklifler WHERE plasiyer_id = ?");
        $check->execute([$id]);
        if ($check->fetchColumn() > 0) {
            throw new Exception("Bu personelin geçmiş satış işlemleri var, silinemez. İsim değişikliği yapabilirsiniz.");
        }

        $db->prepare("DELETE FROM cariler WHERE id=? AND tip='personel'")->execute([$id]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'search_candidates') {
        // Personel olmayan carileri ara (Plasiyer yapmak için)
        $term = $_GET['q'] ?? '';
        $sql = "SELECT id, ad_soyad, tip, telefon FROM cariler WHERE tip = 'personel'";
        $params = [];
        if ($term) {
            $sql .= " AND (ad_soyad LIKE ? OR telefon LIKE ?)";
            $params[] = "%$term%";
            $params[] = "%$term%";
        }
        $sql .= " ORDER BY ad_soyad LIMIT 20";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'make_employee') {
        // Mevcut bir cariyi personele çevir
        $id = (int) $_GET['id'];
        $db->prepare("UPDATE cariler SET tip='personel' WHERE id=?")->execute([$id]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'get_bank_accounts') {
        // Banka Hesap Listesi
        $stmt = $db->query("SELECT * FROM banka_hesaplari WHERE aktif=1 ORDER BY banka_adi ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'save_bank_account') {
        // Banka Hesabı Ekle/Güncelle
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['banka_adi']))
            throw new Exception("Banka Adı zorunludur.");

        $fields = [
            $input['banka_adi'],
            $input['sube_adi'] ?? '',
            $input['hesap_no'] ?? '',
            $input['iban'] ?? '',
            $input['doviz_cinsi'] ?? 'TL',
            $input['aciklama'] ?? ''
        ];

        if (!empty($input['id'])) {
            // Update
            $sql = "UPDATE banka_hesaplari SET banka_adi=?, sube_adi=?, hesap_no=?, iban=?, doviz_cinsi=?, aciklama=? WHERE id=?";
            $fields[] = $input['id'];
            $db->prepare($sql)->execute($fields);
        } else {
            // Insert
            $sql = "INSERT INTO banka_hesaplari (banka_adi, sube_adi, hesap_no, iban, doviz_cinsi, aciklama, acilis_bakiyesi, guncel_bakiye) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $fields[] = $input['acilis_bakiyesi'] ?? 0;
            $fields[] = $input['acilis_bakiyesi'] ?? 0;
            $db->prepare($sql)->execute($fields);
        }
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'delete_bank_account') {
        // Banka Hesabı Sil (Soft Delete)
        $id = (int) $_GET['id'];
        $db->prepare("UPDATE banka_hesaplari SET aktif=0 WHERE id=?")->execute([$id]);
        echo json_encode(["status" => "success"]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>