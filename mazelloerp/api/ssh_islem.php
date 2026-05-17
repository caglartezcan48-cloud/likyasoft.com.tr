<?php
/**
 * MAZELLO CLEAN-ENGINE
 * Satış Sonrası Hizmetler (SSH) ve Destek Modülü API
 */
require_once 'db.php';
require_once 'auth_check.php';
header("Content-Type: application/json; charset=UTF-8");

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

try {
    if (!$db) throw new Exception("Veritabanı bağlantısı yok.");

    // SELF-HEALING DB: Check for table
    if (!isset($_SESSION['db_checks_done_ssh'])) {
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS ssh_talepler (
                id INT AUTO_INCREMENT PRIMARY KEY,
                musteri_id INT DEFAULT NULL,
                teklif_id INT DEFAULT NULL,
                urun_adi VARCHAR(255) DEFAULT '',
                baslik VARCHAR(255) NOT NULL,
                aciklama TEXT,
                durum VARCHAR(50) DEFAULT 'acik',
                oncelik VARCHAR(50) DEFAULT 'normal',
                personel VARCHAR(100) DEFAULT '',
                maliyet DECIMAL(15,2) DEFAULT 0.00,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            $_SESSION['db_checks_done_ssh'] = true;
        } catch (Exception $e) { /* Ignore */ }
    }

    if ($action === 'get_tickets') {
        $sql = "SELECT s.*, 
                       c.ad_soyad as musteri_adi, 
                       c.telefon as musteri_telefon,
                       t.teklif_no
                FROM ssh_talepler s
                LEFT JOIN cariler c ON s.musteri_id = c.id
                LEFT JOIN teklifler t ON s.teklif_id = t.id
                ORDER BY s.created_at DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $tickets]);

    } else if ($action === 'save_ticket') {
        if (!$data || empty($data['baslik'])) {
            throw new Exception("Başlık alanı zorunludur.");
        }

        if (isset($data['id']) && $data['id'] > 0) {
            // Update
            $stmt = $db->prepare("UPDATE ssh_talepler SET musteri_id=?, teklif_id=?, urun_adi=?, baslik=?, aciklama=?, oncelik=?, personel=?, maliyet=? WHERE id=?");
            $stmt->execute([
                $data['musteri_id'] ?: null,
                $data['teklif_id'] ?: null,
                $data['urun_adi'] ?? '',
                $data['baslik'],
                $data['aciklama'] ?? '',
                $data['oncelik'] ?? 'normal',
                $data['personel'] ?? '',
                (float)($data['maliyet'] ?? 0),
                $data['id']
            ]);
            $id = $data['id'];
        } else {
            // Insert
            $stmt = $db->prepare("INSERT INTO ssh_talepler (musteri_id, teklif_id, urun_adi, baslik, aciklama, oncelik, personel, maliyet, durum) VALUES (?,?,?,?,?,?,?,?,?)");
            $stmt->execute([
                $data['musteri_id'] ?: null,
                $data['teklif_id'] ?: null,
                $data['urun_adi'] ?? '',
                $data['baslik'],
                $data['aciklama'] ?? '',
                $data['oncelik'] ?? 'normal',
                $data['personel'] ?? '',
                (float)($data['maliyet'] ?? 0),
                'acik'
            ]);
            $id = $db->lastInsertId();
        }
        
        echo json_encode(["status" => "success", "id" => $id]);

    } else if ($action === 'update_status') {
        if (!$data || !isset($data['id']) || !isset($data['durum'])) {
            throw new Exception("Eksik veri gönderildi.");
        }
        $stmt = $db->prepare("UPDATE ssh_talepler SET durum=? WHERE id=?");
        $stmt->execute([$data['durum'], $data['id']]);
        
        echo json_encode(["status" => "success"]);

    } else if ($action === 'delete_ticket') {
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID belirtilmedi.");
        
        $db->prepare("DELETE FROM ssh_talepler WHERE id=?")->execute([$id]);
        echo json_encode(["status" => "success"]);
    }

} catch (Exception $e) {
    if (strpos($e->getMessage(), '1146 Table') !== false) {
        unset($_SESSION['db_checks_done_ssh']);
    }
    echo json_encode([
        "status" => "error", 
        "message" => "Sistem Hatası: " . $e->getMessage()
    ]);
}
