hp
// MAZELLO NOTIFICATION API
// Handles Email & Logging for Production Requests

header("Content-Type: application/json; charset=UTF-8");
error_reporting(0);
ini_set('display_errors', 0);

try {
$input = json_decode(file_get_contents('php://input'), true);

$action = $_GET['action'] ?? '';

if ($action === 'send_production_order') {
$supplierEmail = $input['email'];
$supplierPhone = $input['phone'];
$productName = $input['product'];
$details = $input['details'] ?? []; // New Details Array

$orderNo = $input['order_no'];
$qty = $input['qty'] ?? 1;
$note = $input['note'] ?? '';

if (!$supplierEmail) {
echo json_encode(["status" => "error", "message" => "Tedarikçi e-posta adresi bulunamadı."]);
exit;
}

$subject = "YENİ ÜRETİM SİPARİŞİ: $productName (Sipariş #$orderNo)";

// HTML Template
$message = "
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #eee;
            padding: 20px;
            border-radius: 10px;
        }

        .header {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .title {
            font-size: 18px;
            font-weight: bold;
            color: #d32f2f;
            margin: 0;
        }

        .product-box {
            background: #fff;
            border: 2px solid #333;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .label {
            font-size: 11px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        .value {
            font-size: 16px;
            font-weight: bold;
            color: #000;
            margin-bottom: 12px;
            display: block;
        }

        .footer {
            font-size: 12px;
            color: #999;
            margin-top: 30px;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #000;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class='container'>
        <div class='header'>
            <h2 class='title'>YENİ ÜRETİM EMRİ</h2>
            <p style='margin: 5px 0 0 0; font-size: 14px;'>Sipariş No: <strong>#$orderNo</strong> | Tarih: " .
                date('d.m.Y H:i') . "</p>
        </div>

        <p>Sayın Tedarikçi,</p>
        <p>Aşağıdaki ürün için üretim onayı verilmiştir. Lütfen termin süresine dikkat ederek üretime başlayınız.</p>

        <div class='product-box'>
            <div class='label'>ÜRÜN ADI</div>
            <div class='value' style='font-size: 20px; color: #d32f2f;'>$productName</div>

            <div class='label'>ADET</div>
            <div class='value'>$qty ADET</div>

            " . ($details['category'] ? "<div class='label'>CİNSİ</div>
            <div class='value'>{$details['category']}</div>" : "") . "
            " . ($details['fabric'] ? "<div class='label'>KUMAŞ BİLGİSİ</div>
            <div class='value'>{$details['fabric']}</div>" : "") . "
            " . ($details['color'] ? "<div class='label'>RENK / CİLA</div>
            <div class='value'>{$details['color']}</div>" : "") . "
            " . ($details['dimensions'] ? "<div class='label'>ÖLÇÜLER</div>
            <div class='value'>{$details['dimensions']}</div>" : "") . "
            " . ($details['desc'] ? "<div class='label'>ÖZEL AÇIKLAMA</div>
            <div class='value' style='color: #d32f2f;'>{$details['desc']}</div>" : "") . "
            " . ($note ? "<div class='label'>SİPARİŞ NOTU</div>
            <div class='value'>$note</div>" : "") . "
        </div>

        <p style='font-size: 14px; font-weight: bold;'>
            ⚠️ Termin Tarihi: " . ($details['deadline'] ? $details['deadline'] : "ACİL") . "
        </p>

        <div class='footer'>
            <p>Bu e-posta Mazello Otomasyon Sistemi tarafından otomatik gönderilmiştir.</p>
            <p>MAZELLO MOBİLYA TASARIM</p>
        </div>
    </div>
</body>

</html>
";

$headers = "From: noreply@mazello.com\r\n";
$headers .= "Reply-To: info@mazello.com\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// 5. Send Email via Gmail SMTP (Dynamic Settings from DB)
require_once 'SmtpMailer.php';
require_once 'db.php'; // Ensure DB connection

// Fetch Settings
$stmt = $db->query("SELECT anahtar, deger FROM ayarlar WHERE anahtar IN ('smtp_host', 'smtp_port', 'smtp_email',
'smtp_pass')");
$settings = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
$settings[$row['anahtar']] = $row['deger'];
}

// Use settings from DB. If empty, it will fail (as requested).
$host = $settings['smtp_host'] ?: '';
$port = $settings['smtp_port'] ?: 587;
$email = $settings['smtp_email'] ?: '';
$pass = $settings['smtp_pass'] ?: '';

if (empty($host) || empty($email) || empty($pass)) {
echo json_encode(["status" => "error", "message" => "SMTP Ayarları yapılmamış! Lütfen Sistem Ayarları > Bildirim
Ayarları kısmından mail bilgilerinizi giriniz."]);
exit;
}

$smtp = new SmtpMailer($host, $port, $email, $pass);

try {
// Note: Gmail requires specific settings. For simple PHP without composer, this basic socket class
// might struggle with modern TLS. If it fails, we guide user to App Passwords.
$result = $smtp->send($supplierEmail, $subject, $message, "Mazello Sipariş Sistemi");

if ($result === true) {
echo json_encode(["status" => "success", "message" => "E-posta başarıyla gönderildi."]);
} else {
echo json_encode(["status" => "error", "message" => "Mail hatası: " . $result]);
}
} catch (Exception $ex) {
echo json_encode(["status" => "error", "message" => "Kritik Hata: " . $ex->getMessage()]);
}

} else {
echo json_encode(["status" => "error", "message" => "Geçersiz işlem."]);
}

} catch (Exception $e) {
echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>