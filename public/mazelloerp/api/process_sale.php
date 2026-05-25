<?php
// Mazello Mobilya API - Satış İşleme// PROCESS SALE
require_once 'auth_check.php'; // GÜVENLİK DUVARI
require_once 'db.php';
header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit(json_encode(["status" => "error", "message" => "POST Gerekli"]));
}

try {
    if (!$data || empty($data['musteri_id']))
        throw new Exception("Müşteri Seçilmedi");

    $db->beginTransaction();

    $fis = $data['fis_no'] ?? "SAT-" . time();
    $mid = $data['musteri_id'];
    // Sayılar
    $ara = $data['ara_toplam'] ?? 0;
    $kdv = $data['kdv_toplam'] ?? 0;
    $genel = $data['genel_toplam'] ?? 0;
    $pesinat = $data['pesinat'] ?? 0;
    $taksit = $data['taksit_sayisi'] ?? 1;

    // Tarihler ve Notlar
    $tarih = ($data['tarih'] ?? date('Y-m-d')) . ' ' . date('H:i:s');
    $teslimat = $data['teslimat_tarihi'] ?? null;
    $notlar = $data['notlar'] ?? '';

    // 1. SATIŞ EKLE
    // Not: force_update.php ile sütunların eklendiğinden eminiz.
    $sql = "INSERT INTO satislar (fis_no, musteri_id, ara_toplam, kdv_toplam, toplam_tutar, pesinat, taksit_sayisi, teslimat_tarihi, notlar, teslimat_durumu, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'hazirlik', ?)";
    $stmt = $db->prepare($sql);
    $stmt->execute([$fis, $mid, $ara, $kdv, $genel, $pesinat, $taksit, $teslimat, $notlar, $tarih]);
    $sid = $db->lastInsertId();

    // 2. DETAYLAR
    // DEPO v3: Stok hemen düşmez! 'bekliyor' olarak işaretlenir.
    $stmtD = $db->prepare("INSERT INTO satis_detaylari (satis_id, urun_id, miktar, fiyat, varyant_bilgisi, urun_durumu) VALUES (?,?,?,?,?, 'bekliyor')");
    // $stmtS = $db->prepare("UPDATE urunler SET stok_miktari = stok_miktari - ? WHERE id = ?"); // REMOVED FOR v3 SMART RESERVATION

    foreach ($data['items'] as $i) {
        $note = isset($i['note']) ? json_encode(['not' => $i['note']], JSON_UNESCAPED_UNICODE) : null;
        $stmtD->execute([$sid, $i['urun_id'], $i['qty'], $i['fiyat'], $note]);
        // $stmtS->execute([$i['qty'], $i['urun_id']]); // DISABLED
    }

    // 3. CARİ (Borç - Peşinat)
    $stmtC = $db->prepare("INSERT INTO cari_hareketleri (cari_id, islem_turu, fis_no, tutar, aciklama, tarih) VALUES (?,?,?,?,?,?)");

    // Satış Tutarı Kadar Borç
    $stmtC->execute([$mid, $fis, $genel, "Satış: $fis", $tarih]);
    $db->prepare("UPDATE cariler SET bakiye = bakiye + ? WHERE id = ?")->execute([$genel, $mid]);

    // Peşinat Varsa Düş (Tahsilat)
    if ($pesinat > 0) {
        $stmtC->execute([$mid, $fis, $pesinat, "Pesinat: $fis", $tarih]);
        $db->prepare("UPDATE cariler SET bakiye = bakiye - ? WHERE id = ?")->execute([$pesinat, $mid]);
    }

    // 4. ÇEK KULLANIMI (Varsa)
    if (!empty($data['used_checks']) && is_array($data['used_checks'])) {
        $stmtCheckUpd = $db->prepare("UPDATE musteri_cekleri SET durum = 'kullanildi', referans_iade_id = ? WHERE cek_kodu = ? AND durum = 'aktif'");
        $stmtCheckGet = $db->prepare("SELECT tutar FROM musteri_cekleri WHERE cek_kodu = ?"); // Tutar için sorgu (Frontend'e güvenme)

        foreach ($data['used_checks'] as $code) {
            // Önce tutarı al
            $stmtCheckGet->execute([$code]);
            $cRow = $stmtCheckGet->fetch(PDO::FETCH_ASSOC);

            if ($cRow) {
                $checkAmt = $cRow['tutar'];

                // Çeki 'kullanildi' yap
                // Not: referans_iade_id yerine burada kullanılan satış ID'sini (sid) saklamak daha mantıklı ama tablo yapısında 'referans_iade_id' var. 
                // Belki yeni sütun gerekirdi ama şimdilik referans alanını kullanalım veya boşverelim. 
                // Doğrusu: kullanilan_satis_id sütunu eklemek.
                // Hızlı çözüm: Çeki güncelle.
                $stmtCheckUpd->execute([$sid, $code]);

                if ($stmtCheckUpd->rowCount() > 0) {
                    // Cari'den Düş
                    $stmtC->execute([$mid, $fis, $checkAmt, "Çek Tahsilatı: $code", $tarih]);
                    $db->prepare("UPDATE cariler SET bakiye = bakiye - ? WHERE id = ?")->execute([$checkAmt, $mid]);
                }
            }
        }
    }

    $db->commit();
    echo json_encode(["status" => "success", "message" => "Satış ve Finans Kaydı Tamamlandı."]);

} catch (Exception $e) {
    if ($db->inTransaction())
        $db->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>