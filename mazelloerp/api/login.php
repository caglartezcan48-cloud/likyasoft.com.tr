<?php
// MAZELLO SECURE LOGIN API
// v1.2 - JSON SAFE (Prevents HTML error output)

// Hataları ekrana basma, JSON formatını bozar
error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json; charset=UTF-8");

try {
    require_once 'db.php';

    // Veritabanı bağlantısı kontrolü
    if (!isset($db)) {
        throw new Exception("Veritabanı bağlantısı kurulamadı.");
    }

    $action = $_GET['action'] ?? '';

    // checkUsersTable helper kaldırıldı. Kurulum için install.php kullanın.

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // --- RATE LIMITING (Basit Otomasyon Engeli) ---
        $now = time();
        if (!isset($_SESSION['login_attempts'])) {
            $_SESSION['login_attempts'] = 0;
            $_SESSION['last_attempt_time'] = $now;
        }

        // 15 dakika içinde 5 hatalı deneme yapıldıysa engelle
        if ($_SESSION['login_attempts'] >= 5 && ($now - $_SESSION['last_attempt_time']) < 900) {
            $remaining = ceil((900 - ($now - $_SESSION['last_attempt_time'])) / 60);
            echo json_encode(["status" => "error", "message" => "Çok fazla hatalı deneme. Lütfen $remaining dakika bekleyin."]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $role = $input['role'] ?? '';
        $pass = $input['password'] ?? '';

        if (!$role || !$pass) {
            echo json_encode(["status" => "error", "message" => "Eksik bilgi."]);
            exit;
        }

        // 1. Kullanıcıyı Bul (Rollere göre değil, direkt username ve Aktif duruma göre arayalım)
        $stmt = $db->prepare("SELECT id, ad_soyad, kullanici_adi, sifre, rol FROM cariler WHERE tip = 'personel' AND kullanici_adi = ? AND durum = 'aktif' LIMIT 1");
        $stmt->execute([$role]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // 2. Şifre Doğrulama (Secure Hash Verification)
            $dbPass = $user['sifre'];
            $isHashed = (strlen($dbPass) == 60 && substr($dbPass, 0, 4) == '$2y$');

            $loginSuccess = false;

            if ($isHashed) {
                // Yeni güvenli sistem
                if (password_verify($pass, $dbPass)) {
                    $loginSuccess = true;
                }
            } else {
                // Eğer eski yapı varsa (Düz Şifre), güncelle ve login ol
                if ($pass === $dbPass) {
                    $loginSuccess = true;
                    $newHash = password_hash($pass, PASSWORD_BCRYPT);
                    $upd = $db->prepare("UPDATE cariler SET sifre = ? WHERE id = ?");
                    $upd->execute([$newHash, $user['id']]);
                }
            }

            if ($loginSuccess) {
                // Başarılı girişte sayacı sıfırla
                $_SESSION['login_attempts'] = 0;

                // Session'a kaydet
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['kullanici_adi'];
                $_SESSION['user_role'] = $user['rol'];
                $_SESSION['full_name'] = $user['ad_soyad'];

                echo json_encode([
                    "status" => "success",
                    "user" => [
                        "id" => $user['id'],
                        "rol" => $user['rol'],
                        "ad" => $user['ad_soyad']
                    ]
                ]);
            } else {
                $_SESSION['login_attempts']++;
                $_SESSION['last_attempt_time'] = time();
                echo json_encode(["status" => "error", "message" => "Hatalı şifre."]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Kullanıcı bulunamadı."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Geçersiz istek."]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Sistem Hatası: " . $e->getMessage()]);
}
?>