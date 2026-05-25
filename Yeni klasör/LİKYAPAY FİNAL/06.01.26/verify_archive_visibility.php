<?php
// verify_archive_visibility.php
// A standalone script to diagnose why the Archive list is empty.

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'core/database.php';
$database = new Database();
$db = $database->getConnection();

echo "<!DOCTYPE html><html><head><title>Archive Diagnostic</title>";
echo "<style>body{font-family:sans-serif; padding:20px;} table{border-collapse:collapse; width:100%;} th,td{border:1px solid #ccc; padding:8px;} .match{background:#dcfce7;} .fail{background:#fee2e2;}</style>";
echo "</head><body>";
echo "<h1>Arşiv Görünürlük Testi</h1>";

// 1. Check User
if (!isset($_SESSION['user_id'])) {
    echo "<div style='background:orange; padding:10px;'>Oturum açık değil. Lütfen önce panele giriş yapın, sonra bu sayfayı yenileyin.</div>";
    die();
}

$user_id = $_SESSION['user_id'];
echo "<p><strong>Giriş Yapan User ID:</strong> $user_id</p>";

$stmt = $db->prepare("SELECT * FROM users WHERE id = :id");
$stmt->execute([':id' => $user_id]);
$me = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$me) {
    die("Kullanıcı veritabanında bulunamadı!");
}

$myTaxId = trim($me['tax_id']);
echo "<p><strong>Benim Vergi Numaram:</strong> [{$myTaxId}] (Uzunluk: ".strlen($myTaxId).")</p>";

// 2. Fetch Completed Cycles
echo "<h2>Tamamlanan İşlemler ve Eşleşme Kontrolü</h2>";
echo "<table>";
echo "<tr><th>ID</th><th>Kod</th><th>Durum</th><th>Katılımcılar (Nodes)</th><th>Ben Var mıyım?</th><th>Sebep</th></tr>";

// Case insensitive status check
$sql = "SELECT * FROM sirius_cycles WHERE status IN ('completed', 'COMPLETED', 'complete', 'COMPLETE')";
$query = $db->query($sql);
$cycles = $query->fetchAll(PDO::FETCH_ASSOC);

if (count($cycles) == 0) {
    echo "<tr><td colspan='6'>Veritabanında 'completed' statüsünde hiç işlem YOK.</td></tr>";
}

foreach ($cycles as $c) {
    $nodesRaw = $c['nodes'];
    $nodes = json_decode($nodesRaw, true);
    
    $nodesStr = implode(", ", $nodes);
    
    $match = false;
    $reason = "Listede yok";
    
    // Manual Check
    foreach ($nodes as $n) {
        $nStr = trim((string)$n);
        if ($nStr === $myTaxId) {
            $match = true;
            $reason = "Eşleşti! ($nStr === $myTaxId)";
            break;
        }
    }
    
    $class = $match ? 'match' : 'fail';
    
    echo "<tr class='$class'>";
    echo "<td>{$c['id']}</td>";
    echo "<td>".($c['cycle_code'] ?? $c['code'] ?? '-')."</td>";
    echo "<td>{$c['status']}</td>";
    echo "<td><small>$nodesRaw</small></td>";
    echo "<td>".($match ? "EVET" : "HAYIR")."</td>";
    echo "<td>$reason</td>";
    echo "</tr>";
}

echo "</table>";

echo "<div style='margin-top:20px; padding:15px; background:#f0f9ff; border:1px solid #bae6fd;'>";
echo "<h3>Sonuç Analizi:</h3>";
echo "<ul>";
echo "<li>Eğer tabloda <strong>EVET (Yeşil)</strong> satır görüyorsanız: Sorun Arşiv sayfasının (Frontend) kodundadır.</li>";
echo "<li>Eğer tabloda sadece <strong>HAYIR (Kırmızı)</strong> görüyorsanız: Vergi numaranız, döngüdeki numaralarla birebir tutmuyor demektir (Boşluk farkı vs. olabilir).</li>";
echo "<li>Eğer tablo <strong>BOŞ</strong> ise: Veritabanında 'completed' işlem yoktur.</li>";
echo "</ul>";
echo "</div>";

echo "</body></html>";
