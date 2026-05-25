<?php
/**
 * MAZELLO CLEAN-ENGINE v180
 * Focus: No-Nonsense Bulk Insert & High Speed
 */
require_once 'db.php'; // TEKLİF & SİPARİŞ İŞLEMLERİ
require_once 'auth_check.php'; // GÜVENLİK DUVARI
header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

try {
    if (!$db)
        throw new Exception("Veritabanı bağlantısı yok.");

    // SELF-HEALING DB: Check for required columns ONLY ONCE PER SESSION
    if (!isset($_SESSION['db_checks_done_dashboard'])) {
        try {
            // 1. teklifler -> olusturan
            $c = $db->query("SHOW COLUMNS FROM teklifler LIKE 'olusturan'");
            if ($c->rowCount() == 0)
                $db->exec("ALTER TABLE teklifler ADD COLUMN olusturan VARCHAR(50) DEFAULT 'Admin'");

            // 2. teklif_detaylari -> fiyat
            $c = $db->query("SHOW COLUMNS FROM teklif_detaylari LIKE 'fiyat'");
            if ($c->rowCount() == 0) {
                $db->exec("ALTER TABLE teklif_detaylari ADD COLUMN fiyat DECIMAL(15,2) DEFAULT 0.00");
                $db->exec("UPDATE teklif_detaylari SET fiyat = birim_fiyat");
            }

            $_SESSION['db_checks_done_dashboard'] = true;
        } catch (Exception $e) { /* Ignore DB alter errors */
        }
    }

    if ($action === 'save_quote') {
        if (!$data || !isset($data['teklif_no'])) {
            throw new Exception("Veri formatı hatalı.");
        }

        $db->beginTransaction();

        $tno = $data['teklif_no'];
        $check = $db->prepare("SELECT id FROM teklifler WHERE teklif_no = ?");
        $check->execute([$tno]);
        $existing = $check->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $teklifId = $existing['id'];
            $stmt = $db->prepare("UPDATE teklifler SET musteri_id=?, ara_toplam=?, kdv_toplam=?, genel_toplam=?, iskonto_orani=?, pesinat=?, taksit_sayisi=?, notlar=?, teslimat_tarihi=?, para_birimi=?, alinan_tutar=?, bakiye=?, odeme_tarihi=? WHERE id=?");
            $stmt->execute([
                $data['musteri_id'],
                (float) $data['ara_toplam'],
                (float) $data['kdv_toplam'],
                (float) $data['genel_toplam'],
                (float) $data['iskonto_orani'],
                (float) $data['pesinat'],
                (int) $data['taksit_sayisi'],
                $data['notlar'],
                $data['teslimat_tarihi'] ?: null,
                $data['para_birimi'],
                (float) $data['alinan_tutar'],
                (float) $data['bakiye'],
                $data['odeme_tarihi'] ?: null,
                $teklifId
            ]);
            $db->prepare("DELETE FROM teklif_detaylari WHERE teklif_id = ?")->execute([$teklifId]);
        } else {
            $stmt = $db->prepare("INSERT INTO teklifler (teklif_no, musteri_id, ara_toplam, kdv_toplam, genel_toplam, iskonto_orani, pesinat, taksit_sayisi, notlar, created_at, teslimat_tarihi, para_birimi, alinan_tutar, bakiye, odeme_tarihi, olusturan) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
            $stmt->execute([
                $tno,
                $data['musteri_id'],
                (float) $data['ara_toplam'],
                (float) $data['kdv_toplam'],
                (float) $data['genel_toplam'],
                (float) $data['iskonto_orani'],
                (float) $data['pesinat'],
                (int) $data['taksit_sayisi'],
                $data['notlar'],
                date('Y-m-d H:i:s'),
                $data['teslimat_tarihi'] ?: null,
                $data['para_birimi'],
                (float) $data['alinan_tutar'],
                (float) $data['bakiye'],
                $data['odeme_tarihi'] ?: null,
                $_SESSION['full_name'] ?? 'Admin'
            ]);
            $teklifId = $db->lastInsertId();
        }

        if (isset($data['items']) && !empty($data['items'])) {
            $st = $db->prepare("INSERT INTO teklif_detaylari (teklif_id, urun_id, miktar, fiyat, detay_not, en, boy, yukseklik, m3, agirlik, paket_sayisi, urun_gorsel) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
            foreach ($data['items'] as $i) {
                $st->execute([$teklifId, $i['urun_id'], (int) $i['qty'], (float) $i['fiyat'], $i['note'], $i['en'], $i['boy'], $i['yukseklik'], (float) $i['m3'], (float) $i['agirlik'], (int) $i['paket_sayisi'], $i['image']]);
            }
        }

        $db->commit();
        echo json_encode(["status" => "success", "id" => $teklifId]);
    } else if ($action === 'delete_quote') {
        $id = $_GET['id'] ?? null;

        // SOFT DELETE LOGIC
        // 1. Veriyi çek
        $s = $db->prepare("SELECT * FROM teklifler WHERE id = ?");
        $s->execute([$id]);
        $mainData = $s->fetch(PDO::FETCH_ASSOC);

        if ($mainData) {
            // 2. Detayları çek
            $s2 = $db->prepare("SELECT * FROM teklif_detaylari WHERE teklif_id = ?");
            $s2->execute([$id]);
            $details = $s2->fetchAll(PDO::FETCH_ASSOC);

            // 3. Paketle
            $fullData = [
                'main' => $mainData,
                'items' => $details
            ];

            // 4. Çöp Kutusuna At
            // Müşteri adını tekliften doğrudan bulamayabiliriz (join yok), teklif no yeterli.
            $baslik = "Teklif #" . $mainData['teklif_no'] . " (Tutar: " . $mainData['genel_toplam'] . ")";

            $ins = $db->prepare("INSERT INTO recycle_bin (table_name, original_id, deleted_data, deleted_by, baslik) VALUES (?, ?, ?, ?, ?)");
            $ins->execute([
                'teklifler',
                $id,
                json_encode($fullData, JSON_UNESCAPED_UNICODE),
                'Admin', // Şimdilik varsayılan
                $baslik
            ]);

            // 5. Asıl tablodan sil
            $db->prepare("DELETE FROM teklifler WHERE id = ?")->execute([$id]);
        }

        echo json_encode(["status" => "success"]);
    }
} catch (Exception $e) {
    if ($db->inTransaction())
        $db->rollBack();

    // LOG THE ERROR
    file_put_contents('error_log_teklif.txt', date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);

    echo json_encode(["status" => "error", "message" => "Sistem Hatası: " . $e->getMessage() . " (Line: " . $e->getLine() . ")"]);
}
