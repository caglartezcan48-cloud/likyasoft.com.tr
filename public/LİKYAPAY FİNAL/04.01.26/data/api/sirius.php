<?php
// Sirius API
// Path: data/api/sirius.php

include_once '../../core/database.php';
require_once '../../core/logger.php';
require_once '../../core/mail_helper.php';
include_once '../../core/cors.php';

handleCors();
session_start();
header('Content-Type: application/json');

// Auth Check
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Oturum açmanız gerekiyor."]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get Input
    $input = json_decode(file_get_contents("php://input"), true);
    $action = $input['action'] ?? $_GET['action'] ?? '';

    // --- ACTIONS ---

    if ($action === 'create_request') {
        // Validation
        if (empty($input['target_tax_id']) || empty($input['amount'])) {
            throw new Exception("Eksik bilgi.");
        }

        // Insert
        $sql = "INSERT INTO sirius_requests (requester_id, target_tax_id, target_name, amount, document_type, description) 
                VALUES (:uid, :tax, :name, :amount, :type, :desc)";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(":uid", $user_id);
        $stmt->bindParam(":tax", $input['target_tax_id']);
        $stmt->bindParam(":name", $input['target_name']);
        $stmt->bindParam(":amount", $input['amount']);
        $stmt->bindParam(":type", $input['document_type']);
        $stmt->bindParam(":desc", $input['description']);

        if ($stmt->execute()) {
            // Trigger Sirius Engine to check for new cycles
            try {
                include_once 'sirius_engine.php';
                $engine = new SiriusEngine();
                $engineResult = $engine->run();
                // Optional: We could return the result if a cycle was found immediately
            } catch (Exception $err) {
                // Log error but don't fail the request creation
                error_log("Sirius Engine Error: " . $err->getMessage());
            }

            echo json_encode(["success" => true, "message" => "Talep oluşturuldu."]);
        } else {
            throw new Exception("Kayıt hatası.");
        }
    }

    elseif ($action === 'check_my_cycle') {
        // 1. Get User Tax ID & Company Name
        // 1. Get User Tax ID & Company Details
        $taxQuery = "SELECT tax_id, name, address, tax_office, mersis_no, trade_registry_no FROM users WHERE id = :uid";
        $uStmt = $db->prepare($taxQuery);
        $uStmt->bindParam(":uid", $user_id);
        $uStmt->execute();
        $userRow = $uStmt->fetch(PDO::FETCH_ASSOC);
        $myTaxId = $userRow['tax_id'] ?? null;
        $myCompanyName = $userRow['name'] ?? 'Bilinmiyor';
        $myCompanyDetails = [
            "name" => $myCompanyName,
            "tax_id" => $myTaxId,
            "address" => $userRow['address'] ?? '',
            "tax_office" => $userRow['tax_office'] ?? '',
            "mersis_no" => $userRow['mersis_no'] ?? '',
            "trade_registry_no" => $userRow['trade_registry_no'] ?? ''
        ];

        if (!$myTaxId) {
            echo json_encode(["success" => false, "message" => "Vergi no bulunamadı."]);
            exit;
        }

        // 2. Search in Active Cycles
        $sql = "SELECT * FROM sirius_cycles WHERE status IN ('detected', 'approved', 'processing', 'payment_stage', 'legal_stage', 'completed') ORDER BY id DESC LIMIT 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cycle) {
            $nodes = json_decode($cycle['nodes'], true); // Array of Tax IDs
            
            // Check if I am in this cycle
            if (in_array($myTaxId, $nodes)) {
                
                // Get Names and Identify Creditor/Debtor
                $chainNames = [];
                $myCreditor = null;
                $myDebtor = null;
                $myIndex = array_search($myTaxId, $nodes);
                $count = count($nodes);
                
                $creditorIndex = ($myIndex + 1) % $count;        // I owe money to (Next)
                $debtorIndex = ($myIndex - 1 + $count) % $count; // Owes money to me (Prev)

                // Check if user is among the last 2 nodes in the cycle sequence
                // Rule: Only the last 2 companies perform "Mahsuplaşma". Others only do "Temlik".
                $showMahsup = ($myIndex >= ($count - 2));

                foreach ($nodes as $i => $tax) {
                    $nStmt = $db->prepare("SELECT name, address, tax_office, mersis_no, trade_registry_no FROM users WHERE tax_id = :tax LIMIT 1");
                    $nStmt->bindParam(":tax", $tax);
                    $nStmt->execute();
                    $nRow = $nStmt->fetch(PDO::FETCH_ASSOC);
                    $name = $nRow['name'] ?? $tax;
                    
                    $details = [
                        "tax_id" => $tax,
                        "name" => $name,
                        "address" => $nRow['address'] ?? '',
                        "tax_office" => $nRow['tax_office'] ?? '',
                        "mersis_no" => $nRow['mersis_no'] ?? '',
                        "trade_registry_no" => $nRow['trade_registry_no'] ?? ''
                    ];

                    $chainNames[] = $tax === $myTaxId ? "Siz" : $name;

                    if ($i === $creditorIndex) {
                         $myCreditor = $details;
                    }
                    if ($i === $debtorIndex) {
                         $myDebtor = $details;
                    }
                }

                echo json_encode([
                    "success" => true,
                    "in_cycle" => true,
                    "my_tax_id" => $myTaxId,
                    "my_company_name" => $myCompanyName,
                    "my_details" => $myCompanyDetails,
                    "my_debtor" => $myDebtor,
                    "my_creditor" => $myCreditor,
                    "show_mahsup" => $showMahsup,
                    "cycle" => [
                        "id" => $cycle['id'],
                        "code" => $cycle['cycle_code'] ?? '---',
                        "volume" => $cycle['total_volume'],
                        "status" => $cycle['status'],
                        "nodes" => $nodes,
                        "chain_names" => $chainNames,
                        "chain_names" => $chainNames,
                        "payment_status" => json_decode($cycle['payment_status'] ?? '{}', true),
                        "legal_status" => json_decode($cycle['legal_status'] ?? '{}', true),
                        "date" => date("d.m.Y", strtotime($cycle['created_at']))
                    ]
                ]);
                exit;
            }
        }

        echo json_encode(["success" => true, "in_cycle" => false]);
    }

    elseif ($action === 'list_all_cycles') {
        // Admin Only
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403);
            exit(json_encode(["success" => false, "message" => "Yetkisiz"]));
        }

        $sql = "SELECT * FROM sirius_cycles ORDER BY status ASC, total_volume DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Enhance with Company Names
        foreach ($cycles as &$cycle) {
            $nodes = json_decode($cycle['nodes'], true);
            $names = [];
            foreach ($nodes as $tax) {
                // Determine name (User or External)
                $nStmt = $db->prepare("SELECT name FROM users WHERE tax_id = :tax LIMIT 1");
                $nStmt->bindParam(":tax", $tax);
                $nStmt->execute();
                $res = $nStmt->fetch(PDO::FETCH_ASSOC);
                $names[] = $res['name'] ?? $tax;
            }
            $cycle['node_names'] = $names;
            $cycle['count'] = count($nodes);
        }

        echo json_encode(["success" => true, "data" => $cycles]);
    }

    elseif ($action === 'run_engine') {
        // Admin Only
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403);
            exit(json_encode(["success" => false, "message" => "Yetkisiz"]));
        }

        try {
            include_once 'sirius_engine.php';
            $engine = new SiriusEngine();
            $result = $engine->run();
            echo json_encode($result);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    elseif ($action === 'approve_cycle') {
        // Admin: Start the cycle (Status: processing)
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403); exit(json_encode(["success"=>false, "message" => "Yetkisiz"]));
        }

        $inputData = json_decode(file_get_contents("php://input"), true);
        $id = $inputData['id'] ?? null;

        if (!$id) throw new Exception("ID gerekli.");

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cycle) throw new Exception("Döngü bulunamadı.");
        if ($cycle['status'] !== 'detected') throw new Exception("Döngü zaten işlemde.");

        // Initialize BOTH Payment and Legal Status for all nodes
        $nodes = json_decode($cycle['nodes'], true);
        $payment_status = [];
        $legal_status = []; // Parallel track
        
        foreach ($nodes as $tax_id) {
            $payment_status[$tax_id] = 'pending';
            $legal_status[$tax_id] = 'pending';
        }

        $sql = "UPDATE sirius_cycles SET status = 'processing', payment_status = :ps, legal_status = :ls, updated_at = NOW() WHERE id = :id";
        $stmt = $db->prepare($sql);
        $json_ps = json_encode($payment_status);
        $json_ls = json_encode($legal_status);
        $stmt->bindParam(":ps", $json_ps);
        $stmt->bindParam(":ls", $json_ls);
        $stmt->bindParam(":id", $id);
        
        if ($stmt->execute()) {
            Logger::log('SIRIUS_START', "Döngü süreci başlatıldı (ID: $id)");
            echo json_encode(["success" => true, "message" => "Süreç başlatıldı. Ödemeler ve sözleşmeler bekleniyor."]);
        } else {
            throw new Exception("Güncelleme hatası.");
        }
    }

    elseif ($action === 'submit_payment') {
        // User: I paid the fee
        $inputData = json_decode(file_get_contents("php://input"), true);
        $cycle_id = $inputData['cycle_id'] ?? null;

        if (!$cycle_id) throw new Exception("ID gerekli.");

        // Identify User
        $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
        $uStmt->execute([':uid' => $user_id]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);
        $tax_id = $user['tax_id'] ?? null;

        if (!$tax_id) throw new Exception("Vergi numarası bulunamadı.");

        // Fetch Cycle
        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $cycle_id]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cycle['status'] !== 'processing') throw new Exception("İşlem aşamasında değil.");

        $ps = json_decode($cycle['payment_status'], true);
        if (!isset($ps[$tax_id])) throw new Exception("Bu döngüde değilsiniz.");

        $ps[$tax_id] = 'submitted';

        // Update
        $upd = $db->prepare("UPDATE sirius_cycles SET payment_status = :ps WHERE id = :id");
        $upd->execute([':ps' => json_encode($ps), ':id' => $cycle_id]);

        echo json_encode(["success" => true, "message" => "Ödeme bildirimi alındı."]);
    }

    elseif ($action === 'approve_payment') {
        // Admin: Approve a specific user's payment
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
             http_response_code(403); exit(json_encode(["success"=>false]));
        }

        $inputData = json_decode(file_get_contents("php://input"), true);
        $cycle_id = $inputData['cycle_id'];
        $target_tax_id = $inputData['target_tax_id'];

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $cycle_id]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        $ps = json_decode($cycle['payment_status'], true);
        $ps[$target_tax_id] = 'approved';

        $upd = $db->prepare("UPDATE sirius_cycles SET payment_status = :ps WHERE id = :id");
        $upd->execute([':ps' => json_encode($ps), ':id' => $cycle_id]);
        
        echo json_encode(["success" => true, "message" => "Ödeme onaylandı."]);
    }

    elseif ($action === 'sign_contract') {
        // User: Sign the contract
        $inputData = json_decode(file_get_contents("php://input"), true);
        $cycle_id = $inputData['cycle_id'] ?? null;

        // Identify User
        $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
        $uStmt->execute([':uid' => $user_id]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);
        $tax_id = $user['tax_id'] ?? null;

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $cycle_id]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cycle['status'] !== 'processing') throw new Exception("İşlem aşamasında değil.");

        $ls = json_decode($cycle['legal_status'], true);
        if (!isset($ls[$tax_id])) throw new Exception("Bu döngüde değilsiniz.");

        $ls[$tax_id] = 'signed'; // User Signed

        $upd = $db->prepare("UPDATE sirius_cycles SET legal_status = :ls WHERE id = :id");
        $upd->execute([':ls' => json_encode($ls), ':id' => $cycle_id]);

        echo json_encode(["success" => true, "message" => "Sözleşme imzalandı. Onay bekleniyor."]);
    }

    elseif ($action === 'approve_contract') {
        // Admin: Approve a specific user's contract
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
             http_response_code(403); exit(json_encode(["success"=>false]));
        }

        $inputData = json_decode(file_get_contents("php://input"), true);
        $cycle_id = $inputData['cycle_id'];
        $target_tax_id = $inputData['target_tax_id'];

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $cycle_id]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        $ls = json_decode($cycle['legal_status'], true);
        $ls[$target_tax_id] = 'approved';

        $upd = $db->prepare("UPDATE sirius_cycles SET legal_status = :ls WHERE id = :id");
        $upd->execute([':ls' => json_encode($ls), ':id' => $cycle_id]);
        
        echo json_encode(["success" => true, "message" => "Sözleşme onaylandı."]);
    }

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

                $uStmt = $db->prepare("SELECT id FROM users WHERE tax_id = ?");
                $uStmt->execute([$from_tax]); $fromUser = $uStmt->fetch(PDO::FETCH_ASSOC);
                $uStmt->execute([$to_tax]); $toUser = $uStmt->fetch(PDO::FETCH_ASSOC);

                if (!$fromUser || !$toUser) continue;
                $uid = $fromUser['id'];
                $ruid = $toUser['id'];

                $tStmt = $db->prepare("SELECT id, amount FROM transactions 
                                     WHERE user_id = :uid AND related_user_id = :ruid 
                                     AND type = 'debt' 
                                     AND status NOT IN ('rejected', 'cancelled', 'Reddedildi', 'İptal', 'Sirius (Tamamlandı)')
                                     ORDER BY created_at ASC");
                $tStmt->execute([':uid' => $uid, ':ruid' => $ruid]);
                $txs = $tStmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($txs as $tx) {
                    if ($clear_amount <= 0) break;
                    $tx_amount = (float)$tx['amount'];
                    if ($tx_amount <= $clear_amount) {
                         // Fully cleared
                         $upd = $db->prepare("UPDATE transactions SET amount = 0, status = 'Sirius (Tamamlandı)', description = CONCAT(description, ' [Sirius Döngü #$id ile ödendi]') WHERE id = :id");
                         $upd->execute([':id' => $tx['id']]);
                         $clear_amount -= $tx_amount;
                    } else {
                         // Partially cleared
                         $new_amount = $tx_amount - $clear_amount;
                         $deducted = $clear_amount;
                         $upd = $db->prepare("UPDATE transactions SET amount = :new, description = CONCAT(description, ' [Sirius #$id ile -$deducted TL düşüldü]') WHERE id = :id");
                         $upd->execute([':new' => $new_amount, ':id' => $tx['id']]);
                         $clear_amount = 0;
                    }
                }
            }

            $sql = "UPDATE sirius_cycles SET status = 'completed', updated_at = NOW() WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $id]);

            // record service fees in system_transactions (kasa defteri)
            // ... (keep previous fee recording logic)
            $nodes = json_decode($cycle['nodes'], true);
            $nodeCount = count($nodes);
            $volume = (float)$cycle['total_volume'];
            $feePerNode = $volume * 0.03 * 1.2; // 3% fee + 20% VAT
            $totalServiceFee = $nodeCount * $feePerNode;

            $sysAccountingQuery = "INSERT INTO system_transactions (type, category, entity_name, description, amount, date) 
                                   VALUES ('income', 'Sirius Hizmet Bedeli', :entity, :desc, :amount, CURDATE())";
            $sysStmt = $db->prepare($sysAccountingQuery);
            $sysStmt->execute([
                ':entity' => "Sirius Döngü #$id (" . ($cycle['cycle_code'] ?? '') . ")",
                ':desc' => "$nodeCount katılımcıdan tahsil edilen toplam Sirius hizmet bedeli.",
                ':amount' => $totalServiceFee
            ]);

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
            echo json_encode(["success" => true, "message" => "Döngü başarıyla kapatıldı!"]);

        } catch (Exception $e) {
            $db->rollBack();
            throw new Exception("Hata: " . $e->getMessage());
        }
    }

    elseif ($action === 'send_reminders') {
        // Admin: Send reminders to pending participants
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403); exit(json_encode(["success"=>false]));
        }

        $inputData = json_decode(file_get_contents("php://input"), true);
        $id = $inputData['id'] ?? null;
        if (!$id) throw new Exception("ID gerekli.");

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cycle['status'] === 'completed') throw new Exception("İşlem zaten tamamlandı.");

        $ps = json_decode($cycle['payment_status'] ?? '{}', true);
        $ls = json_decode($cycle['legal_status'] ?? '{}', true);
        $nodes = json_decode($cycle['nodes'] ?? '[]', true);

        $sentCount = 0;
        foreach ($nodes as $tax_id) {
            $isPendingPay = ($ps[$tax_id] ?? 'pending') === 'pending';
            $isPendingLegal = ($ls[$tax_id] ?? 'pending') === 'pending';

            if ($isPendingPay || $isPendingLegal) {
                $uStmt = $db->prepare("SELECT email, name FROM users WHERE tax_id = ?");
                $uStmt->execute([$tax_id]);
                $user = $uStmt->fetch(PDO::FETCH_ASSOC);

                if ($user && !empty($user['email'])) {
                    $subject = "Hatırlatma: Sirius Döngü Onayı Bekleniyor (#$id)";
                    $missingItems = [];
                    if ($isPendingPay) $missingItems[] = "Hizmet Bedeli Ödemesi";
                    if ($isPendingLegal) $missingItems[] = "Sözleşme İmzası";
                    
                    $msg = implode(" ve ", $missingItems);
                    $body = "<h2>Merhaba " . $user['name'] . ",</h2>
                             <p>Katıldığınız Sirius Döngüsü için <strong>$msg</strong> henüz tamamlanmamış görünüyor.</p>
                             <p>Döngünün tamamlanabilmesi için lütfen panelinize giriş yaparak gerekli onayları veriniz.</p>";
                    MailHelper::send($user['email'], $subject, $body);
                    $sentCount++;
                }
            }
        }

        Logger::log('SIRIUS_REMINDERS', "Döngü hatılatmaları gönderildi (ID: $id, Adet: $sentCount)");
        echo json_encode(["success" => true, "message" => "$sentCount adet hatırlatma gönderildi."]);
    }

    elseif ($action === 'list_requests') {
        $sql = "SELECT * FROM sirius_requests WHERE requester_id = :uid ORDER BY id DESC";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(":uid", $user_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $data]);
    }
    
    elseif ($action === 'admin_download_contract') {
        // Admin: Download Contract as Printable HTML
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
             die("Yetkisiz erişim.");
        }

        $cycle_id = $_GET['cycle_id'] ?? null;
        $tax_id = $_GET['tax_id'] ?? null;
        $type = $_GET['type'] ?? 'temlik';

        if (!$cycle_id || !$tax_id) die("Eksik parametre.");

        // Fetch User
        $uStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax");
        $uStmt->execute([':tax' => $tax_id]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) die("Kullanıcı bulunamadı.");

        // Fetch Cycle
        $cStmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $cStmt->execute([':id' => $cycle_id]);
        $cycle = $cStmt->fetch(PDO::FETCH_ASSOC);

        // Generate HTML
        $title = ($type === 'mahsuplasma') ? 'MAHSUPLAŞMA SÖZLEŞMESİ' : 'ALACAĞIN DEVRİ (TEMLİK) SÖZLEŞMESİ';
        $date = date('d.m.Y');

        echo "<!DOCTYPE html><html><head><title>$title</title>";
        echo "<style>
            body { font-family: 'Times New Roman', serif; padding: 60px; line-height: 1.6; color: #1e293b; position: relative; }
            .official-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 30px; }
            .logo-placeholder { font-weight: bold; font-size: 24pt; color: #0c4a6e; }
            .logo-placeholder span { color: #6366f1; }
            .doc-info { text-align: right; font-size: 9pt; color: #64748b; }
            h1 { text-align: center; font-size: 18pt; margin: 30px 0; font-weight: bold; text-transform: uppercase; }
            p { margin-bottom: 15px; text-align: justify; font-size: 11pt; }
            .contract-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .contract-table td { border: 1px solid #e2e8f0; padding: 10px; font-size: 10pt; }
            .signature-box { margin-top: 60px; display: flex; justify-content: space-between; }
            .party { width: 45%; border-top: 1px solid #334155; padding-top: 10px; text-align: center; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80pt; color: rgba(0,0,0,0.03); z-index: -1; white-space: nowrap; pointer-events: none; }
            .footer-info { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 8pt; color: #94a3b8; }
            @media print { .no-print { display: none; } body { padding: 0; } }
        </style></head><body>";

        echo "<div class='watermark'>LİKYAPAY SİRİUS</div>";
        echo "<div class='no-print' style='background: #fff3cd; padding: 10px; text-align: center; border-bottom: 1px solid #ffeeba;'>Yazdırılabilir Görünüm - Lütfen Yazdırmak için CTRL+P kullanın.</div>";
        
        echo "<div class='official-header'>";
        echo "<div class='logo-placeholder'>Likya<span>Pay</span></div>";
        echo "<div class='doc-info'>Belge No: SIR-{$cycle_id}<br>Tarih: {$date}</div>";
        echo "</div>";

        echo "<h1>$title</h1>";
        
        echo "<p><strong>TARAFLAR:</strong></p>";
        echo "<table class='contract-table'>";
        echo "<tr><td width='20%'><strong>ŞİRKET:</strong></td><td>{$user['name']}</td></tr>";
        echo "<tr><td><strong>VERGİ NO:</strong></td><td>{$user['tax_id']}</td></tr>";
        echo "<tr><td><strong>ADRES:</strong></td><td>" . ($user['address'] ?? 'Sistem Kayıtlı Adresi') . "</td></tr>";
        echo "</table>";

        echo "<p>İşbu sözleşme, Sirius Döngü Sistemi (Cycle ID: #{$cycle_id}) çerçevesinde tespit edilen finansal mahsuplaşma süreçlerini resmiyete dökmek amacı ile tanzim edilmiştir.</p>";
        
        if ($type === 'mahsuplasma') {
            echo "<p><strong>HÜKÜM:</strong> Katılımcı, sistem tarafından belirlenen <strong>" . number_format($cycle['total_volume'] ?? 0, 2, ',', '.') . " TL</strong> tutarındaki borcunun, diğer grup üyeleri ile gerçekleştirilecek karşılıklı takas (mahsuplaşma) yoluyla tasfiye edilmesini gayrikabili rücu kabul ve taahhüt eder.</p>";
        } else {
            echo "<p><strong>HÜKÜM:</strong> Katılımcı, Sirius Döngüsü kapsamında belirlenen alacağını, sistemdeki diğer borçlusuna devrederek (temlik ederek) borç/alacak dengesini sıfırlamayı kabul eder.</p>";
        }

        echo "<p>Katılımcı, bu işlemin yasal mevzuata uygunluğunu ve sistem kayıtlarının kesin delil teşkil edeceğini beyan eder.</p>";

        echo "<div class='signature-box'>";
        echo "<div class='party'><strong>KATILIMCI / ŞİRKET</strong><br><br><br><small>{$user['name']}</small></div>";
        echo "<div class='party'><strong>LİKYA PAY SİSTEM ONAYI</strong><br><br><br><small>Elektronik Mühür (E-Onaylı)</small></div>";
        echo "</div>";

        echo "<div class='footer-info'>Bu belge LikyaPay Sirius Algoritması tarafından otomatik olarak oluşturulmuştur. Bilgilerin doğruluğu sistem veri tabanından teyit edilebilir.</div>";

        echo "<script>window.print();</script>";
        echo "</body></html>";
        exit;
    }

    elseif ($action === 'delete_cycle') {
        // Admin: Delete a cycle that is not yet started (status=detected)
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403); exit(json_encode(["success"=>false, "message" => "Yetkisiz"]));
        }

        $inputData = json_decode(file_get_contents("php://input"), true);
        $id = $inputData['id'] ?? null;

        if (!$id) throw new Exception("ID gerekli.");

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cycle) throw new Exception("Döngü bulunamadı.");
        if ($cycle['status'] === 'completed') throw new Exception("Tamamlanmış döngüler silinemez (Muhasebe kaydı oluştu).");

        $del = $db->prepare("DELETE FROM sirius_cycles WHERE id = :id");
        $del->execute([':id' => $id]);

        echo json_encode(["success" => true, "message" => "Döngü silindi."]);
    }

    elseif ($action === 'check_cycles') {
        // Placeholder for manually triggering cycle check
        // Would normally call sirius_engine logic
        echo json_encode(["success" => true, "message" => "Engine tetiklendi (Demo)."]);
    }

    else {
        throw new Exception("Geçersiz işlem.");
    }

} catch (Exception $e) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
