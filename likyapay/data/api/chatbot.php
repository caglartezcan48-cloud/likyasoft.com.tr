<?php
// Chatbot API (Gemini Proxy)
// Path: data/api/chatbot.php

require_once '../../core/config.php';
require_once '../../core/database.php';
include_once '../../core/cors.php';

header('Content-Type: application/json');
handleCors();
session_start();

// Rate Limiting (Simple Session based)
if (!isset($_SESSION['chat_requests'])) {
    $_SESSION['chat_requests'] = 0;
    $_SESSION['chat_start_time'] = time();
}

// Reset every minute
if (time() - $_SESSION['chat_start_time'] > 60) {
    $_SESSION['chat_requests'] = 0;
    $_SESSION['chat_start_time'] = time();
}

if ($_SESSION['chat_requests'] > 10) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyin.']);
    exit;
}

$_SESSION['chat_requests']++;

try {
    $input = json_decode(file_get_contents("php://input"));
    $userMessage = $input->message ?? '';

    if (empty($userMessage)) {
        throw new Exception("Mesaj boş olamaz.");
    }

    // --- CONFIGURATION ---
    // User needs to replace this or defined in config.php
    $apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : 'AIzaSyDl0h7LQ3eF08kcsV-tZBDelme3h7jXglU'; 

    if ($apiKey === 'YOUR_API_KEY_HERE') {
        throw new Exception("API Anahtarı yapılandırılmamış. Lütfen yönetici ile iletişime geçin.");
    }

    // --- SYSTEM PROMPT ---
    $systemPrompt = "Sen 'LİKYAPAY YAPAY ZEKA' adında, sadece LikyaPay platformu hakkında bilgi veren profesyonel ve kurumsal bir asistansın.
    
    TAVIR VE KİŞİLİK:
    - Son derece nazik, yardımsever ve kurumsal bir dil kullan.
    - Asla finansal yatırım tavsiyesi verme.
    - SADECE LikyaPay ile ilgili soruları cevapla. LikyaPay dışındaki konular (hava durumu, genel sohbet, yemek tarifi vb.) sorulursa nazikçe reddet: 'Üzgünüm, ben sadece LikyaPay hakkında yardımcı olabilirim.'
    - Kullanıcıya her zaman 'Siz' diye hitap et.

    BİLGİ TABANI (Context):
    1. LİKYAPAY NEDİR?
       - KOBİ'ler ve şirketler için geliştirilmiş yeni nesil finansal optimizasyon platformudur.
       - Temel amacı: Nakit paraya ihtiyaç duymadan, şirketlerin birbirine olan borçlarını mahsuplaşarak (takas/barter yöntemiyle) kapatmasını sağlar.
       - YASAL MI?: Evet, tamamen yasaldır. Borçlar Kanunu'ndaki 'Alacağın Devri' ve 'Takas' maddelerine dayanır. Tüm veriler KVKK uyumludur ve şifrelenir.
    
    2. NASIL ÇALIŞIR? (Sirius Döngüsü)
       - Kullanıcı sisteme borçlu ve alacaklı olduğu firmaları girer.
       - 'Sirius' adlı yapay zeka motoru, piyasadaki kilitlenmiş borç zincirlerini tarar.
       - Örnek: A firması B'ye, B firması C'ye, C firması da A'ya borçluysa; sistem bu üçlüyü bulur ve nakit olmadan herkesin borcunu siler.
    
    3. ÜCRETLENDİRME (Hizmet Bedeli)
       - Üye olmak tamamen ÜCRETSİZDİR.
       - Sadece Sirius işlemi başarıyla gerçekleşirse ve borcunuz silinirse, silinen tutarın %3 + KDV'si kadar hizmet bedeli alınır. İşlem olmazsa para ödenmez.

    KURALLAR:
    - Cevapların kısa, net ve anlaşılır olsun (Maksimum 3-4 cümle).
    - Kullanıcı selam verirse, kendini tanıt ve nasıl yardımcı olabileceğini sor.
";

    // --- GEMINI API REQUEST ---
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" . $apiKey;

    $data = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $systemPrompt . "\n\nKullanıcı: " . $userMessage . "\nAsistan:"]
                ]
            ]
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Fix for InfinityFree/Localhost SSL issues
    
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception('Curl hatası: ' . curl_error($ch));
    }
    
    curl_close($ch);

    $result = json_decode($response, true);
    
    if (isset($result['error'])) {
        throw new Exception("AI Hatası: " . $result['error']['message']);
    }

    $aiReply = $result['candidates'][0]['content']['parts'][0]['text'] ?? "Üzgünüm, şu an cevap veremiyorum.";

    echo json_encode([
        "success" => true,
        "reply" => $aiReply
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>
