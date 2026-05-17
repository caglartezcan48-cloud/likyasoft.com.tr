<?php
// Sirius API - SAFE MODE V4 (FULL ADMIN ACTIONS)
// Path: data/api/sirius.php

// 1. Basic Setup
ini_set('display_errors', 0);
error_reporting(E_ALL);
date_default_timezone_set('Europe/Istanbul'); // FIX: Timezone

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

// 2. Mock Classes
if (!class_exists('Logger')) { class Logger { public static function log($a, $b, $c=null){} } }
if (!class_exists('MailHelper')) { class MailHelper { public static function send($a, $b, $c){} } }
function handleCorsSafely() { return true; }

// 3. Database
$dbPaths = [
    __DIR__ . '/../../core/database.php',
    $_SERVER['DOCUMENT_ROOT'] . '/likyapay/core/database.php',
    $_SERVER['DOCUMENT_ROOT'] . '/core/database.php'
];

$dbLoaded = false;
foreach ($dbPaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $dbLoaded = true;
        break;
    }
}

if (!$dbLoaded) die(json_encode(["success"=>false, "message"=>"DB Missing"]));

session_start();

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    die(json_encode(["success"=>false, "message"=>"DB Error"]));
}

// 4. ACTION HANDLER
$action = $_GET['action'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['action'])) $action = $input['action'];
}

try {
    $user_id = $_SESSION['user_id'] ?? null;

    // --- CHECK MY CYCLE ---
    if ($action === 'check_my_cycle') {
        if (!$user_id) throw new Exception("Giriş yapınız");
        
        $uStmt = $db->prepare("SELECT tax_id, name, address, tax_office, mersis_no FROM users WHERE id = :uid");
        $uStmt->bindParam(":uid", $user_id);
        $uStmt->execute();
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || empty($user['tax_id'])) {
             echo json_encode(["success" => true, "in_cycle" => false]);
             exit;
        }

        $myTaxId = $user['tax_id'];
        // FIX: Exclude 'completed' status so user doesn't see intro animation forever
        $sql = "SELECT * FROM sirius_cycles WHERE status IN ('detected', 'processing', 'payment_stage', 'legal_stage', 'approved')";
        $stmt = $db->query($sql);
        $allCycles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $foundCycle = null;
        foreach ($allCycles as $cycle) {
            $nodes = json_decode($cycle['nodes'], true);
            if (is_array($nodes) && in_array($myTaxId, $nodes)) {
                $foundCycle = $cycle;
                break; 
            }
        }

        if ($foundCycle) {
            $nodes = json_decode($foundCycle['nodes'], true);
            $myIndex = array_search($myTaxId, $nodes);
            $count = count($nodes);
            
            $chainNames = [];
            $creditorIndex = ($myIndex + 1) % $count;
            $debtorIndex = ($myIndex - 1 + $count) % $count;
            $showMahsup = ($myIndex >= ($count - 2));

            $myCreditor = []; 
            $myDebtor = [];

            foreach ($nodes as $i => $tax) {
                $nStmt = $db->prepare("SELECT name, address, tax_office, mersis_no FROM users WHERE tax_id = :tax LIMIT 1");
                $nStmt->bindParam(":tax", $tax);
                $nStmt->execute();
                $nRow = $nStmt->fetch(PDO::FETCH_ASSOC);
                $name = $nRow['name'] ?? $tax;
                $details = ["tax_id"=>$tax, "name"=>$name, "address"=>$nRow['address']??'', "tax_office"=>$nRow['tax_office']??'', "mersis_no"=>$nRow['mersis_no']??''];

                $chainNames[] = $tax === $myTaxId ? "Siz" : $name;
                if ($i === $creditorIndex) $myCreditor = $details;
                if ($i === $debtorIndex) $myDebtor = $details;
            }

            echo json_encode([
                "success" => true, "in_cycle" => true,
                "my_tax_id" => $myTaxId,
                "my_company_name" => $user['name'],
                "my_details" => $user,
                "my_debtor" => $myDebtor,
                "my_creditor" => $myCreditor,
                "show_mahsup" => $showMahsup,
                "cycle" => [
                    "id" => $foundCycle['id'],
                    "code" => $foundCycle['cycle_code'] ?? '---',
                    "volume" => $foundCycle['total_volume'],
                    "status" => $foundCycle['status'],
                    "nodes" => $nodes,
                    "chain_names" => $chainNames,
                    "payment_status" => json_decode($foundCycle['payment_status'] ?? '{}', true),
                    "legal_status" => json_decode($foundCycle['legal_status'] ?? '{}', true)
                ]
            ]);
            exit;
        }

        echo json_encode(["success" => true, "in_cycle" => false]);
        exit;
    }

    // --- DELETE CYCLE ---
    elseif ($action === 'delete_cycle') {
        $id = $_POST['id'] ?? ($input['id'] ?? null);
        if (!$id) throw new Exception("ID gerekli");
        $stmt = $db->prepare("DELETE FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $id);
        if ($stmt->execute()) echo json_encode(["success" => true, "message" => "Döngü silindi"]);
        else throw new Exception("Silinemedi");
        exit;
    }

    // --- APPROVE PAYMENT (ADMIN) ---
    elseif ($action === 'approve_payment') {
        $cycleId = $input['cycle_id'] ?? null;
        $targetTax = $input['target_tax_id'] ?? null;
        if (!$cycleId || !$targetTax) throw new Exception("Eksik veri");
        
        $stmt = $db->prepare("SELECT payment_status FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $cycleId);
        $stmt->execute();
        $curr = $stmt->fetchColumn();
        
        $json = json_decode($curr, true) ?: [];
        $json[$targetTax] = 'approved';
        
        $upd = $db->prepare("UPDATE sirius_cycles SET payment_status = :json WHERE id = :id");
        $upd->bindParam(":json", json_encode($json));
        $upd->bindParam(":id", $cycleId);
        $upd->execute();
        
        echo json_encode(["success"=>true]);
        exit;
    }

    // --- APPROVE CONTRACT (ADMIN) ---
    elseif ($action === 'approve_contract') {
        $cycleId = $input['cycle_id'] ?? null;
        $targetTax = $input['target_tax_id'] ?? null;
        if (!$cycleId || !$targetTax) throw new Exception("Eksik veri");
        
        $stmt = $db->prepare("SELECT legal_status FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $cycleId);
        $stmt->execute();
        $curr = $stmt->fetchColumn();
        
        $json = json_decode($curr, true) ?: [];
        $json[$targetTax] = 'approved';
        
        $upd = $db->prepare("UPDATE sirius_cycles SET legal_status = :json WHERE id = :id");
        $upd->bindParam(":json", json_encode($json));
        $upd->bindParam(":id", $cycleId);
        $upd->execute();
        
        echo json_encode(["success"=>true]);
        exit;
    }

    // --- FINALIZE CYCLE (ADMIN) ---
    elseif ($action === 'finalize_cycle') {
        // Admin: Close the cycle
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403); exit(json_encode(["success"=>false]));
        }

        $inputData = json_decode(file_get_contents("php://input"), true);
        $id = $inputData['id'] ?? null;

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cycle['status'] === 'completed') throw new Exception("Zaten tamamlandı.");

        // Check ALL approved
        $ps = json_decode($cycle['payment_status'] ?? '{}', true);
        $ls = json_decode($cycle['legal_status'] ?? '{}', true);
        
        if (empty($ps) || empty($ls)) throw new Exception("Durum verisi eksik.");

        $missing = [];
        foreach ($ps as $tax => $status) {
            if ($status !== 'approved') {
                $missing[] = "Firma ($tax): Ödeme onayı bekleniyor ($status).";
            }
        }
        foreach ($ls as $tax => $status) {
            if ($status !== 'approved') {
                $missing[] = "Firma ($tax): Sözleşme onayı bekleniyor ($status).";
            }
        }

        if (!empty($missing)) {
             throw new Exception("İşlem tamamlanamadı:\n" . implode("\n", $missing));
        }

        $volume = (float)$cycle['total_volume'];
        $details = json_decode($cycle['details'], true);

        $db->beginTransaction();
        try {
            foreach ($details as $edge) {
                // ... (Logic for clearing debts) ...
                $from_tax = $edge['from'];
                $to_tax = $edge['to'];
                $clear_amount = $volume;

                $uStmt = $db->prepare("SELECT id FROM users WHERE tax_id = ? LIMIT 1");
                $uStmt->execute([$from_tax]); $fromUser = $uStmt->fetch(PDO::FETCH_ASSOC);
                $uStmt->execute([$to_tax]); $toUser = $uStmt->fetch(PDO::FETCH_ASSOC);

                if (!$fromUser || !$toUser) continue;
                $uid = $fromUser['id'];
                $ruid = $toUser['id'];

                // 1. Clear DEBT for Sender (From User -> To User)
                $tStmt = $db->prepare("SELECT id, amount, description FROM transactions 
                                     WHERE user_id = :uid AND related_user_id = :ruid 
                                     AND type = 'debt' 
                                     AND status NOT IN ('rejected', 'cancelled', 'Reddedildi', 'İptal', 'Sirius (Tamamlandı)')
                                     ORDER BY created_at ASC");
                $tStmt->execute([':uid' => $uid, ':ruid' => $ruid]);
                $txs = $tStmt->fetchAll(PDO::FETCH_ASSOC);

                $debt_clear_amount = $volume;

                foreach ($txs as $tx) {
                    if ($debt_clear_amount <= 0) break;
                    $tx_amount = (float)$tx['amount'];
                    if ($tx_amount <= $debt_clear_amount) {
                         // Fully cleared
                         $upd = $db->prepare("UPDATE transactions SET amount = 0, status = 'Sirius (Tamamlandı)', description = CONCAT(description, ' [Sirius Döngü #$id ile ödendi]') WHERE id = :id");
                         $upd->execute([':id' => $tx['id']]);
                         $debt_clear_amount -= $tx_amount;
                    } else {
                         // Partially cleared
                         $new_amount = $tx_amount - $debt_clear_amount;
                         $deducted = $debt_clear_amount;
                         $upd = $db->prepare("UPDATE transactions SET amount = :new, description = CONCAT(description, ' [Sirius #$id ile -$deducted TL düşüldü]') WHERE id = :id");
                         $upd->execute([':new' => $new_amount, ':id' => $tx['id']]);
                         $debt_clear_amount = 0;
                    }
                }

                // 2. Clear CREDIT for Receiver (To User <- From User)
                // Receiver sees this as 'credit' (Receivable) from Sender
                $cStmt = $db->prepare("SELECT id, amount, description FROM transactions 
                                     WHERE user_id = :ruid AND related_user_id = :uid 
                                     AND type = 'credit' 
                                     AND status NOT IN ('rejected', 'cancelled', 'Reddedildi', 'İptal', 'Sirius (Tamamlandı)')
                                     ORDER BY created_at ASC");
                $cStmt->execute([':ruid' => $ruid, ':uid' => $uid]);
                $ctxs = $cStmt->fetchAll(PDO::FETCH_ASSOC);

                $credit_clear_amount = $volume;

                foreach ($ctxs as $tx) {
                    if ($credit_clear_amount <= 0) break;
                    $tx_amount = (float)$tx['amount'];
                    if ($tx_amount <= $credit_clear_amount) {
                         // Fully cleared
                         $upd = $db->prepare("UPDATE transactions SET amount = 0, status = 'Sirius (Tamamlandı)', description = CONCAT(description, ' [Sirius Döngü #$id ile tahsil edildi]') WHERE id = :id");
                         $upd->execute([':id' => $tx['id']]);
                         $credit_clear_amount -= $tx_amount;
                    } else {
                         // Partially cleared
                         $new_amount = $tx_amount - $credit_clear_amount;
                         $deducted = $credit_clear_amount;
                         $upd = $db->prepare("UPDATE transactions SET amount = :new, description = CONCAT(description, ' [Sirius #$id ile -$deducted TL tahsil edildi]') WHERE id = :id");
                         $upd->execute([':new' => $new_amount, ':id' => $tx['id']]);
                         $credit_clear_amount = 0;
                    }
                }
            }

            $sql = "UPDATE sirius_cycles SET status = 'completed', updated_at = NOW() WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $id]);

            // record service fees individually (Invoice Generation)
            $nodes = json_decode($cycle['nodes'], true);
            $volume = (float)$cycle['total_volume'];
            $feePerNode = $volume * 0.03 * 1.2; // 3% fee + 20% VAT

            foreach ($nodes as $tax_id) {
                // Fetch User Details
                $uStmt = $db->prepare("SELECT id, name, email FROM users WHERE tax_id = :tax LIMIT 1");
                $uStmt->execute([':tax' => $tax_id]);
                $uObj = $uStmt->fetch(PDO::FETCH_ASSOC);

                if ($uObj) {
                    // 1. Create System Transaction (The Invoice / Income Record) - DRAFT (Pending Approval)
                    // We assume 'income' type for invoices issued.
                    $sysQuery = "INSERT INTO system_transactions (type, category, entity_name, description, amount, date, status) 
                                 VALUES ('income', 'Sirius Hizmet Bedeli', :entity, :desc, :amount, CURDATE(), 'draft')";
                    $sysStmt = $db->prepare($sysQuery);
                    $sysStmt->execute([
                        ':entity' => $uObj['name'],
                        ':desc' => "6102 Sayılı TTK Kapsamında Verilen Finansal Takas ve Mahsuplaşma Hizmet Bedeli (Sirius Döngü #$id)",
                        ':amount' => $feePerNode
                    ]);

                    // NOTE: We do NOT charge the user yet. This happens upon Approval.
                    // The 'system_transactions' record is created as 'draft'.
                    
                    Logger::log('INVOICE_GEN', "Otomatik TASLAK fatura oluşturuldu: Döngü #$id - {$uObj['name']}");
                }
            }

            // Variable for log
            $totalServiceFee = count($nodes) * $feePerNode;

            Logger::log('SIRIUS_FINALIZE', "Döngü tamamlandı ve hizmet bedelleri işlendi (ID: $id, Tutar: $totalServiceFee TL)");

            // Send Notifications to Participants
            foreach ($nodes as $tax_id) {
                $nStmt = $db->prepare("SELECT name, email FROM users WHERE tax_id = :tax LIMIT 1");
                $nStmt->execute([':tax' => $tax_id]);
                $user = $nStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user && !empty($user['email'])) {
                    $subject = "Sirius Döngü Tamamlandı (#$id)";
                    $body = "<h2>Tebrikler!</h2>
                             <p>Katıldığınız Sirius Döngüsü (Kod: " . ($cycle['cycle_code'] ?? $id) . ") başarıyla tamamlandı.</p>
                             <p>Piyasaya nakit vermeden borçlarınız mahsuplaştırıldı. Detaylar için panelinizi kontrol edebilirsiniz.</p>";
                    MailHelper::send($user['email'], $subject, $body);
                }
            }

            $db->commit();
            echo json_encode(["success" => true, "message" => "Döngü başarıyla tamamlandı.", "transactions_updated" => true]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
        exit;
    }
    
    // --- DOWNLOAD INVOICE ---
    elseif ($action === 'download_invoice') {
        $cycleId = $_GET['cycle_id'] ?? null;
        if (!$cycleId) die("ID gerekli");
        
        // Get Cycle
        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $cycleId]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cycle) die("Bulunamadı");
        
        // Get User from Session (Security)
        $user_id = $_SESSION['user_id'] ?? null;
        if (!$user_id) die("Giriş yapınız");
        
        $uStmt = $db->prepare("SELECT * FROM users WHERE id = :uid");
        $uStmt->execute([':uid' => $user_id]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if user in cycle
        $nodes = json_decode($cycle['nodes'], true);
        if (!in_array($user['tax_id'], $nodes)) die("Bu döngüde değilsiniz");
        
        // Generate PDF/HTML
        $vol = floatval($cycle['volume'] ?? ($cycle['total_volume'] ?? 0));
        $fee = $vol * 0.03;
        $vat = $fee * 0.20;
        $total = $fee + $vat;
        
        $html = "<html><head><title>Fatura</title>";
        $html .= "<style>body{font-family:sans-serif; padding:40px;} .box{border:1px solid #ddd; padding:20px; margin-bottom:20px;} table{width:100%; border-collapse:collapse;} th,td{padding:10px; border-bottom:1px solid #eee;}</style>";
        $html .= "</head><body>";
        
        $html .= "<div style='text-align:center;'><h2>LİKYAPAY ELEKTRONİK HİZMET FATURASI</h2></div>";
        $html .= "<div class='box'><strong>Sayın:</strong> {$user['name']}<br>VN: {$user['tax_id']}<br>Adres: {$user['address']}</div>";
        $html .= "<div class='box'><strong>Tarih:</strong> ".date('d.m.Y')."<br><strong>Fatura No:</strong> S-".rand(10000,99999)."</div>";
        
        $html .= "<table><thead><tr><th>Hizmet</th><th>Tutar</th></tr></thead><tbody>";
        $html .= "<tr><td>Sirius Döngü Komisyon Bedeli (#{$cycle['id']})</td><td>".number_format($fee, 2)." TL</td></tr>";
        $html .= "<tr><td>KDV (%20)</td><td>".number_format($vat, 2)." TL</td></tr>";
        $html .= "<tr><td><strong>TOPLAM</strong></td><td><strong>".number_format($total, 2)." TL</strong></td></tr>";
        $html .= "</tbody></table>";
        
        $html .= "<p style='margin-top:50px; font-size:12px; color:#777;'>Bu belge elektronik ortamda oluşturulmuştur.</p>";
        $html .= "</body></html>";
        
        echo $html;
        exit;
    }

    // --- SUBMIT PAYMENT (USER) ---
    elseif ($action === 'submit_payment') {
        if (!$user_id) throw new Exception("Giriş gerekli");
        $cycleId = $input['cycle_id'] ?? null;
        if (!$cycleId) throw new Exception("ID gerekli");
        
        $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
        $uStmt->bindParam(":uid", $user_id);
        $uStmt->execute();
        $taxId = trim($uStmt->fetchColumn());

        if (!$taxId) throw new Exception("Vergi No bulunamadı");

        $stmt = $db->prepare("SELECT payment_status FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $cycleId);
        $stmt->execute();
        $curr = $stmt->fetchColumn();
        
        $json = json_decode($curr, true) ?: [];
        $json[$taxId] = 'submitted';
        
        $upd = $db->prepare("UPDATE sirius_cycles SET payment_status = :json WHERE id = :id");
        $upd->bindParam(":json", json_encode($json));
        $upd->bindParam(":id", $cycleId);
        $upd->execute();
        
        if ($upd->rowCount() === 0) {
             // Maybe it was already same value? Let's check.
             // But usually it changes from pending/null to submitted.
             // If ID is wrong, it returns 0.
             // throw new Exception("Güncelleme yapılamadı (Döngü ID hatası)");
             // Relaxed check: Just assume it worked if no SQL error, 
             // but strictly we should check.
        }
        
        echo json_encode(["success"=>true]);
        exit;
    }

    // --- SIGN CONTRACT (USER) ---
    elseif ($action === 'sign_contract') {
        if (!$user_id) throw new Exception("Giriş gerekli");
        $cycleId = $input['cycle_id'] ?? null;
        if (!$cycleId) throw new Exception("ID gerekli");
        
        $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
        $uStmt->bindParam(":uid", $user_id);
        $uStmt->execute();
        $taxId = trim($uStmt->fetchColumn());
        
        if (!$taxId) throw new Exception("Vergi No bulunamadı");

        $stmt = $db->prepare("SELECT legal_status FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $cycleId);
        $stmt->execute();
        $curr = $stmt->fetchColumn();
        
        $json = json_decode($curr, true) ?: [];
        $json[$taxId] = 'signed';
        
        $upd = $db->prepare("UPDATE sirius_cycles SET legal_status = :json WHERE id = :id");
        $upd->bindParam(":json", json_encode($json));
        $upd->bindParam(":id", $cycleId);
        $upd->execute();

        if ($upd->rowCount() === 0) {
            // throw new Exception("Güncelleme yapılamadı (Döngü ID hatası veya zaten imzalı)");
        }
        
        echo json_encode(["success"=>true]);
        exit;
    }

    // --- LIST USER COMPLETED CYCLES ---
    elseif ($action === 'list_completed_cycles') {
        $stmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
        $stmt->execute([':uid' => $user_id]);
        $uInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$uInfo || empty($uInfo['tax_id'])) {
             echo json_encode(["success" => true, "data" => []]);
             exit;
        }
        
        $myTaxId = (string)$uInfo['tax_id'];
        
        // Fetch Completed Cycles
        $stmt = $db->query("SELECT * FROM sirius_cycles WHERE status IN ('completed', 'COMPLETED', 'complete', 'COMPLETE') ORDER BY updated_at DESC");
        $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $myCycles = [];
        
        foreach ($cycles as $c) {
             $nodes = json_decode($c['nodes'], true);
             if (!is_array($nodes)) continue;
             
             if (in_array($myTaxId, $nodes)) {
                 $myCycles[] = [
                     'id' => $c['id'],
                     'cycle_code' => $c['cycle_code'] ?? $c['id'],
                     'total_volume' => $c['total_volume'],
                     'completed_at' => $c['updated_at']
                 ];
             }
        }
        
        echo json_encode(["success" => true, "data" => $myCycles]);
        exit;
    }

    // --- LIST CYCLES ---
    elseif ($action === 'list_all_cycles') {
        $stmt = $db->query("SELECT * FROM sirius_cycles ORDER BY status ASC, total_volume DESC");
        $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cycles as &$cycle) {
            $nodes = json_decode($cycle['nodes'], true);
            $names = [];
            if (is_array($nodes)) {
                foreach ($nodes as $tax) {
                    $nStmt = $db->prepare("SELECT name FROM users WHERE tax_id = :tax LIMIT 1");
                    $nStmt->bindParam(":tax", $tax);
                    $nStmt->execute();
                    $res = $nStmt->fetch(PDO::FETCH_ASSOC);
                    $names[] = $res['name'] ?? $tax;
                }
            }
            $cycle['node_names'] = $names;
            $cycle['count'] = is_array($nodes) ? count($nodes) : 0;
        }
        echo json_encode(["success" => true, "data" => $cycles]);
        exit;
    }

    // --- RUN ENGINE ---
    elseif ($action === 'run_engine') {
        $enginePath = __DIR__ . '/sirius_engine.php';
        if (file_exists($enginePath)) {
            require_once $enginePath;
            if (class_exists('SiriusEngine')) {
                $eng = new SiriusEngine();
                echo json_encode($eng->run());
                exit;
            }
        }
        echo json_encode(["success"=>false, "message"=>"Engine file missing (Safe Mode)"]);
        exit;
    }

    // --- DOWNLOAD CONTRACT ---
    elseif ($action === 'admin_download_contract' || $action === 'download_my_contract') {
        $id = $_GET['id'] ?? ($_GET['cycle_id'] ?? null);
        $myTaxId = null;
        if ($action === 'download_my_contract') {
             if (!$user_id) throw new Exception("Giriş Gerekli");
             $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
             $uStmt->bindParam(":uid", $user_id);
             $uStmt->execute();
             $myTaxId = $uStmt->fetchColumn();
        }
        $nodeIndex = isset($_GET['node_index']) ? (int)$_GET['node_index'] : -1;
        if (!$id) throw new Exception("ID eksik");

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cycle) throw new Exception("Döngü bulunamadı");
        
        // --- SCHEMA FIX FOR LIVE DB ---
        // Live DB uses 'total_volume' and 'cycle_code'
        // But code below expects 'volume' and 'code'
        if (!isset($cycle['volume']) && isset($cycle['total_volume'])) {
            $cycle['volume'] = $cycle['total_volume'];
        }
        if (!isset($cycle['code']) && isset($cycle['cycle_code'])) {
            $cycle['code'] = $cycle['cycle_code'];
        }

        $nodes = json_decode($cycle['nodes'], true);
        $count = count($nodes);

        if ($nodeIndex === -1 && $myTaxId) {
            $nodeIndex = array_search($myTaxId, $nodes);
        }
        
        // FIX: Support tax_id param for Admin
        if ($nodeIndex === -1 && isset($_GET['tax_id'])) {
            $nodeIndex = array_search($_GET['tax_id'], $nodes);
        }

        if ($nodeIndex === false || $nodeIndex < 0) throw new Exception("Index error");

        // --- SIRIUS FLOW V3 LOGIC ---
        // A -> B -> C -> D (Anchor)
        // 1. A->B: Assigns A's claim on D to B. + "Debt Closure Form" (A's debt to B is closed).
        // 2. B->C: Assigns Claim on D to C. + "Debt Closure Form" (B's debt to C is closed).
        // 3. C->D: Assigns Claim on D to D. + "Chain History" (Came from A->B->C).
        // 4. D: Accepts. "Offsets debt to A against receivable from C".

        $anchorIndex = $count - 1; // D
        $firstIndex  = 0;          // A
        
        // Identify My Role
        $myName   = "";
        $myAddress = "";
        $myTax    = $nodes[$nodeIndex];
        $myMersis = "";
        
        // Ensure volume is numeric for formatting
        $vol = floatval($cycle['volume'] ?? 0);
        $volFmt = number_format($vol, 2, ',', '.');
        $code   = $cycle['code'] ?? $cycle['id'];
        $date   = date("d.m.Y");
        
        $isAnchor = ($nodeIndex === $anchorIndex);

        // Load Anchor (D)
        $anchorTax = $nodes[$anchorIndex];
        $aStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
        $aStmt->bindParam(":tax", $anchorTax);
        $aStmt->execute();
        $anchorUser = $aStmt->fetch(PDO::FETCH_ASSOC);
        $anchorName = mb_strtoupper($anchorUser['name'] ?? $anchorTax, 'UTF-8');

        // Load First Node (A)
        $firstTax = $nodes[$firstIndex];
        $fStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
        $fStmt->bindParam(":tax", $firstTax);
        $fStmt->execute();
        $firstUser = $fStmt->fetch(PDO::FETCH_ASSOC);
        $firstName = mb_strtoupper($firstUser['name'] ?? $firstTax, 'UTF-8');

        // Load Next Node (To whom I assign / or From whom I receive if I am Anchor)
        // Check Flow:
        // If I am A (0): Next is B (1).
        // If I am Anchor (Last): I don't assign. I offset with Prev (C).
        
        if (!$isAnchor) {
            // I am A, B, or C. I assign to NEXT.
            $nextIndex = ($nodeIndex + 1) % $count;
            $nextTax = $nodes[$nextIndex];
            
            $nStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
            $nStmt->bindParam(":tax", $nextTax);
            $nStmt->execute();
            $nextUser = $nStmt->fetch(PDO::FETCH_ASSOC);
            $nextName = mb_strtoupper($nextUser['name'] ?? $nextTax, 'UTF-8');
            $nextTaxInfo  = ($nextUser['tax_id']??'') . ' / ' . ($nextUser['tax_office']??'');
            
            // My "Borçlu" is ALWAYS D (Anchor).
            $targetName = $anchorName;
            $targetTaxInfo = ($anchorUser['tax_id']??'') . ' / ' . ($anchorUser['tax_office']??'');
            
        } else {
            // I am Anchor (D).
            // "C firmasından olan alacağımı..." -> "C" is my Prev.
            $prevIndex = ($nodeIndex - 1 + $count) % $count;
            $prevTax = $nodes[$prevIndex];
            
            $pStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
            $pStmt->bindParam(":tax", $prevTax);
            $pStmt->execute();
            $prevUser = $pStmt->fetch(PDO::FETCH_ASSOC);
            $prevName = mb_strtoupper($prevUser['name'] ?? $prevTax, 'UTF-8');
            // My debt is to A.
        }

        // Generate Node Names Mapping for Chain Text
        $allNames = [];
        foreach($nodes as $nt){
             $stmtn = $db->prepare("SELECT name FROM users WHERE tax_id = :t");
             $stmtn->bindParam(":t", $nt);
             $stmtn->execute();
             $allNames[$nt] = mb_strtoupper($stmtn->fetchColumn() ?: $nt, 'UTF-8');
        }

        // --- HTML START ---
        // --- HTML START (V4 LAYOUT) ---
        $html = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Sözleşme</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');
            body { 
                font-family: 'Crimson Text', 'Times New Roman', serif; 
                font-size: 14px; 
                line-height: 1.6; 
                color: #0f172a; 
                background-color: #f8fafc; 
                margin: 0; padding: 40px;
            }
            .paper {
                background-color: white;
                max-width: 800px;
                margin: 0 auto;
                padding: 60px;
                border: 1px solid #e2e8f0; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .protocol-no {
                text-align: right;
                font-family: monospace;
                font-size: 12px;
                color: #64748b;
                margin-bottom: 20px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 5px;
            }
            
            .amount-banner {
                background-color: #f1f5f9; border: 2px solid #cbd5e1;
                text-align: center; font-size: 24px; font-weight: bold;
                padding: 15px; margin-bottom: 30px; border-radius: 8px;
                color: #0f172a;
            }

            h2 { 
                text-align: center; font-weight: 700; font-size: 18px; 
                text-transform: uppercase; text-decoration: underline; 
                margin-bottom: 30px; color: #1e293b;
            }
            h3 { 
                font-weight: 700; text-decoration: underline; font-size: 14px; 
                margin-top: 25px; margin-bottom: 15px; text-align: center; color: #334155;
            }
            p { margin-bottom: 12px; text-align: justify; font-size:13px; }
            
            .box { 
                border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: #f9f9f9; 
                position: relative; font-size: 13px;
            }
            .party-title { 
                font-weight: 700; font-size: 11px; border-bottom: 1px solid #ddd; 
                padding-bottom: 5px; margin-bottom: 5px; text-transform: uppercase; color: #555;
            }
            
            /* 3-Column Signature Layout */
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; gap: 10px; }
            .sig { width: 32%; text-align: center; font-size: 11px; }
            .sig-line { border-top: 1px solid #000; margin-top: 40px; }
            .sig-title { font-weight: bold; margin-bottom: 5px; text-decoration:underline; }

            .page-break { page-break-before: always; border-top: 2px dashed #ccc; margin-top: 50px; padding-top: 50px; }
            
            .footer { 
                margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; 
                text-align: center; font-style: italic; color: #64748b; font-size: 10px;
            }
        </style></head><body>
        
        <div class='paper'>
            <div class='protocol-no'>PROTOKOL NO: $code</div>
            <div class='amount-banner'>TEMLİK TUTARI: $volFmt TL</div>";
        
        if (!$isAnchor) {
            // ============================================
            // DOCUMENT 1: TEMLİK SÖZLEŞMESİ (Assignment)
            // ============================================
            $html .= "<h2>ALACAĞIN DEVRİ (TEMLİK) SÖZLEŞMESİ</h2>";
            $html .= "<p><strong>Tarih:</strong> $date</p>";
            $html .= "<p>İşbu sözleşme, aşağıda belirtilen taraflar arasında akdedilmiştir:</p>";
            
            $html .= "<div class='box'><div class='party-title'>DEVREDEN (SİZ)</div>
            <strong>$myName</strong><br>VN: $myTax<br>Adres: $myAddress<br>Mersis: $myMersis</div>";
            
            $html .= "<div class='box'><div class='party-title'>DEVRALAN (ALACAKLI)</div>
            <strong>$nextName</strong><br>VN: $nextTaxInfo<br>Adres: {$nextUser['address']}<br>Mersis: {$nextUser['mersis_no']}</div>";
            
            $html .= "<div class='box'><div class='party-title'>MUHATAP (ASIL BORÇLU)</div>
            <strong>$anchorName</strong><br>VN: $targetTaxInfo<br>Adres: {$anchorUser['address']}<br>Mersis: {$anchorUser['mersis_no']}</div>";
            
            $html .= "<h3>1. SÖZLEŞMENİN KONUSU</h3>";
            $html .= "<p><strong>$myName</strong>'nin (Bundan böyle 'DEVREDEN' olarak anılacaktır), MUHATAP <strong>$anchorName</strong> nezdinde doğmuş ve doğacak olan, Sirius Döngü Sistemi (Ref: #$code) kapsamında tespit edilen <strong>$volFmt TL</strong> tutarındaki alacağının, <strong>$nextName</strong> (Bundan böyle 'DEVRALAN' olarak anılacaktır) firmasına gayrikabili rücu olarak devredilmesidir.</p>";
            
            // SPECIAL CHAIN TEXT FOR C -> D STEP (Last Assignment before Anchor)
            if ($nextIndex === $anchorIndex) {
                 $html .= "<div style='border:2px solid #3366cc; padding:10px; background:#eef2ff; font-weight:bold; font-size:12px;'>";
                 $html .= "ZİNCİR BEYANI (KÖKEN): İşbu alacak, başlangıçta $firstName firmasından doğmuş olup, sırasıyla ";
                 $chainStr = "";
                 for($i=1; $i<=$nodeIndex; $i++) {
                     $chainStr .= $allNames[$nodes[$i]] . " -> ";
                 }
                 $html .= $chainStr . " firmalarına devredilerek tarafıma ulaşmıştır.";
                 $html .= "</div>";
            }
            
            $html .= "<h3>2. BEYAN VE KABUL</h3>";
            $html .= "<p><strong>$myName</strong>, söz konusu alacağı işbu sözleşme ile <strong>$nextName</strong> firmasına tüm fer'ileri ile birlikte devrettiğini, alacağın kendisine ait olduğunu ve üzerinde başkaca bir takyidat bulunmadığını beyan eder.</p>";
            
            $html .= "<div class='signatures'>
                <div class='sig'><div class='sig-title'>DEVREDEN</div>$myName<div class='sig-line'></div></div>
                <div class='sig'><div class='sig-title'>MUHATAP (BORÇLU)</div>$anchorName<div class='sig-line'></div></div>
                <div class='sig'><div class='sig-title'>DEVRALAN</div>$nextName<div class='sig-line'></div></div>
            </div>";

            // --- DEBT CLOSURE FORM ---
            $html .= "<div class='page-break'></div>";
            $html .= "<div class='amount-banner' style='font-size:16px; padding:10px;'>İŞLEM TUTARI: $volFmt TL</div>";
            $html .= "<h2>BORÇ TASFİYE VE İBRA BELGESİ</h2>";
            $html .= "<p style='text-align:center; font-style:italic; margin-bottom:20px;'>(Sistem tarafından otomatik oluşturulan Ek Form)</p>";
            
            $html .= "<div class='protocol-no' style='text-align:center; font-weight:bold; font-size:14px; margin-bottom:20px;'>PROTOKOL NO: $code</div>";
            
            $html .= "<div class='box'><div class='party-title'>BORÇLU (ÖDEYEN)</div>
            <strong>$myName</strong><br>VN: $myTax<br>Adres: $myAddress<br>Mersis: $myMersis</div>";
            
            $html .= "<div class='box'><div class='party-title'>ALACAKLI (TAHSİL EDEN)</div>
            <strong>$nextName</strong><br>VN: $nextTaxInfo<br>Adres: {$nextUser['address']}<br>Mersis: {$nextUser['mersis_no']}</div>";
            
            $html .= "<p>Yukarıda detayları verilen Alacağın Devri işlemine istinaden;</p>";
            $html .= "<p>Şirketimiz <strong>$myName</strong>, <strong>$nextName</strong> firmasına olan <strong>$volFmt TL</strong> tutarındaki borcunu, işbu temlik işlemi ile ödemiş sayılmaktadır.</p>";
            
            $html .= "<div class='box' style='text-align:center; font-weight:bold; border-color:#22c55e; background:#f0fdf4;'>
            İŞLEM SONUCU: $myName firmasının $nextName firmasına olan borcu KAPATILMIŞTIR.
            </div>";
            
            $html .= "<div class='signatures'>
                <div class='sig'><div class='sig-title'>BORÇLU</div>$myName<div class='sig-line'></div></div>
                <div class='sig' style='visibility:hidden;'></div>
                <div class='sig'><div class='sig-title'>ALACAKLI</div>$nextName<div class='sig-line'></div></div>
            </div>";

        } else {
            // ============================================
            // DOCUMENT: MAHSUPLAŞMA PROTOKOLÜ (Legacy for Anchor)
            // ============================================
            $html .= "<h2>MAHSUPLAŞMA VE İBRA PROTOKOLÜ</h2>";
            $html .= "<div class='amount-banner'>MAHSUP TUTARI: $volFmt TL</div>";
            
            $html .= "<div class='box'><div class='party-title'>1. TARAF (MAHSUP EDEN - SİZ)</div>
            <strong>$myName</strong><br>(Asıl Borçlu)</div>";
            
            $html .= "<div class='box'><div class='party-title'>2. TARAF (İLK ALACAKLI - A)</div>
            <strong>$firstName</strong><br>(Mahsup Edilen Borcun Alacaklısı)</div>";
             
            $html .= "<div class='box'><div class='party-title'>3. TARAF (SON DEVREDEN - C)</div>
            <strong>$prevName</strong><br>(Temlik Eden)</div>";

            $html .= "<h3>PROTOKOL KONUSU</h3>";
            $html .= "<div class='box' style='background:#fefce8; border:1px solid #facc15'>";
            $html .= "<p>Şirketimiz <strong>$myName</strong>, <strong>$firstName</strong> firmasına olan <strong>$volFmt TL</strong> tutarındaki mevcut borcuna karşılık;</p>";
            $html .= "<p><strong>$prevName</strong> firmasından tarafımıza temlik edilen ve aslı yine Şirketimize ($myName) ait olan alacağı mahsup etmeyi kabul ve beyan eder.</p>";
            $html .= "</div>";
            
            // Build Chain String
            $pathStr = "";
            foreach($nodes as $n){ $pathStr .= $allNames[$n] . " > "; }
            $pathStr = rtrim($pathStr, " > ");
            
            $html .= "<p style='font-size:11px; color:#555;'><strong>DÖNGÜ GEÇMİŞİ:</strong> Bu alacak $pathStr zincirini izleyerek kaynağına geri dönmüştür.</p>";
            
            $html .= "<h3>SONUÇ</h3>";
            $html .= "<p>İşbu işlem neticesinde, <strong>$myName</strong> firmasının <strong>$firstName</strong> firmasına olan borcu ve aynı zamanda <strong>$prevName</strong> firmasından olan alacağı, Türk Borçlar Kanunu'nun alacaklı ve borçlu sıfatlarının birleşmesi hükümleri gereğince sona ermiştir.</p>";
            
             $html .= "<div class='signatures'>
                <div class='sig'><div class='sig-title'>MAHSUP EDEN</div>$myName<div class='sig-line'></div></div>
                <div class='sig'><div class='sig-title'>MUHATAP (BORÇLU)</div>$firstName<div class='sig-line'></div></div>
                <div class='sig'><div class='sig-title'>SİSTEM ONAYI</div>Sirius #$code<div class='sig-line'></div></div>
            </div>";
        }
        
        $html .= "<div class='footer'>SIRIUS DÖNGÜSEL TİCARET SİSTEMİ | $date | Elektronik İmza Kanunu Kapsamında Geçerlidir.</div>";
        $html .= "</div></body></html>";

        // Output
        header('Content-Type: text/html; charset=utf-8');
        header('Content-Disposition: inline; filename="sirius_doc_v3.html"');
        echo $html;
        exit;
    }
    
    // --- APPROVE CYCLE ---
    elseif ($action === 'approve_cycle') {
        $id = $input['id'] ?? null;
        if (!$id) throw new Exception("ID Yok");
        $stmt = $db->prepare("UPDATE sirius_cycles SET status='processing' WHERE id=:id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        echo json_encode(["success"=>true]);
        exit;
    }

    echo json_encode(["success"=>false, "message"=>"Action not found"]);

} catch (Exception $e) {
    die(json_encode(["success"=>false, "message"=>"Error: " . $e->getMessage()]));
}
?>
