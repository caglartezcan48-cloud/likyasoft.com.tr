<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==========================================
// GEMINI API ANAHTARINIZI BURAYA YAZIN
$API_KEY = "BURAYA_API_ANAHTARINIZI_YAZIN";
// ==========================================

$data = json_decode(file_get_contents("php://input"), true);
$userMessage = isset($data['message']) ? $data['message'] : '';
$history = isset($data['history']) ? $data['history'] : [];

if (empty($userMessage)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Mesaj boş olamaz."]);
    exit;
}

// API Anahtarı kontrolü
if ($API_KEY === "BURAYA_API_ANAHTARINIZI_YAZIN" || empty($API_KEY)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lütfen api/chat.php dosyasına girerek Gemini API anahtarınızı ekleyin."]);
    exit;
}

// Geçmiş mesajları Gemini formatına çevir
$contents = [];
foreach ($history as $msg) {
    // Gemini roller: 'user' veya 'model'
    $role = $msg['role'] === 'assistant' ? 'model' : 'user';
    $contents[] = [
        "role" => $role,
        "parts" => [["text" => $msg['content']]]
    ];
}

// Yeni gelen mesajı ekle
$contents[] = [
    "role" => "user",
    "parts" => [["text" => $userMessage]]
];

$systemInstruction = "Sen Likyasoft dijital ajansının resmi yapay zeka asistanısın. Adın Likyasoft AI. Müşterilere saygılı, lüks ve profesyonel bir dille hitap et. Likyasoft; yapay zeka destekli web siteleri, mobil uygulamalar, ERP sistemleri ve özel yazılımlar geliştirir. Cevaplarını olabildiğince kısa, net ve samimi tut. Paragraf yerine kısa cümleler kur. Müşteri fiyat sorarsa net fiyat vermek yerine projenin detaylarına göre fiyatların belirlendiğini, detaylı teklif için iletişim bilgilerini ekrandaki butondan bırakmalarını rica et.";

$payload = [
    "systemInstruction" => [
        "parts" => [["text" => $systemInstruction]]
    ],
    "contents" => $contents,
    "generationConfig" => [
        "temperature" => 0.7,
        "maxOutputTokens" => 800
    ]
];

// Gemini 1.5 Pro modelini kullanıyoruz
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" . $API_KEY;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
// XAMPP lokal ortamında SSL hatası almamak için:
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode == 200) {
    $result = json_decode($response, true);
    if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        $text = $result['candidates'][0]['content']['parts'][0]['text'];
        echo json_encode(["status" => "success", "message" => $text]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "API'den beklenen metin gelmedi.", "raw" => $result]);
    }
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Yapay zeka servisine bağlanılamadı.", "details" => $response]);
}
?>
