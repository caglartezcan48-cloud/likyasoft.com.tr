<?php
/**
 * MAZELLO CLEAN-ENGINE
 * Ajanda ve GörevHatırlatıcı API
 */
require_once 'db.php';
require_once 'auth_check.php';
header("Content-Type: application/json; charset=UTF-8");

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

try {
    if (!$db) throw new Exception("Veritabanı bağlantısı yok.");

    // SELF-HEALING DB: Check for table
    if (!isset($_SESSION['db_checks_done_ajanda'])) {
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS ajanda (
                id INT AUTO_INCREMENT PRIMARY KEY,
                musteri_id INT DEFAULT NULL,
                baslik VARCHAR(255) NOT NULL,
                aciklama TEXT,
                gorev_tarihi DATE,
                saat VARCHAR(10) DEFAULT '',
                durum VARCHAR(50) DEFAULT 'bekliyor',
                oncelik VARCHAR(50) DEFAULT 'normal',
                personel VARCHAR(100) DEFAULT '',
                olusturan VARCHAR(100) DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            $_SESSION['db_checks_done_ajanda'] = true;
        } catch (Exception $e) { /* Ignore */ }
    }

    if ($action === 'get_tasks') {
        $sql = "SELECT a.*, c.ad_soyad as musteri_adi, c.telefon as musteri_telefon
                FROM ajanda a
                LEFT JOIN cariler c ON a.musteri_id = c.id
                ORDER BY a.gorev_tarihi ASC, a.saat ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $tasks]);

    } else if ($action === 'save_task') {
        if (!$data || empty($data['baslik'])) {
            throw new Exception("Başlık alanı zorunludur.");
        }

        if (isset($data['id']) && $data['id'] > 0) {
            // Update
            $stmt = $db->prepare("UPDATE ajanda SET musteri_id=?, baslik=?, aciklama=?, gorev_tarihi=?, saat=?, oncelik=?, personel=? WHERE id=?");
            $stmt->execute([
                $data['musteri_id'] ?: null,
                $data['baslik'],
                $data['aciklama'] ?? '',
                $data['gorev_tarihi'] ?: date('Y-m-d'),
                $data['saat'] ?? '',
                $data['oncelik'] ?? 'normal',
                $data['personel'] ?? '',
                $data['id']
            ]);
            $id = $data['id'];
        } else {
            // Insert
            $stmt = $db->prepare("INSERT INTO ajanda (musteri_id, baslik, aciklama, gorev_tarihi, saat, oncelik, personel, olusturan) VALUES (?,?,?,?,?,?,?,?)");
            $stmt->execute([
                $data['musteri_id'] ?: null,
                $data['baslik'],
                $data['aciklama'] ?? '',
                $data['gorev_tarihi'] ?: date('Y-m-d'),
                $data['saat'] ?? '',
                $data['oncelik'] ?? 'normal',
                $data['personel'] ?? '',
                $_SESSION['full_name'] ?? 'Admin'
            ]);
            $id = $db->lastInsertId();
        }
        
        echo json_encode(["status" => "success", "id" => $id]);

    } else if ($action === 'update_status') {
        if (!$data || !isset($data['id']) || !isset($data['durum'])) {
            throw new Exception("Eksik veri.");
        }
        $stmt = $db->prepare("UPDATE ajanda SET durum=? WHERE id=?");
        $stmt->execute([$data['durum'], $data['id']]);
        echo json_encode(["status" => "success"]);

    } else if ($action === 'delete_task') {
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID belirtilmedi.");
        $db->prepare("DELETE FROM ajanda WHERE id=?")->execute([$id]);
        echo json_encode(["status" => "success"]);
    }

} catch (Exception $e) {
    if (strpos($e->getMessage(), '1146 Table') !== false) {
        unset($_SESSION['db_checks_done_ajanda']);
    }
    echo json_encode(["status" => "error", "message" => "Sistem Hatası: " . $e->getMessage()]);
}
