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
        // User: Sign the contract (Mock E-Signature)
        if (!isset($_SESSION['user_id'])) die("Yetkisiz.");
        $data = json_decode(file_get_contents("php://input"));
        
        $userId = $user_id; // Session user
        $cycleId = $data->cycle_id;

        // Load Services
        require_once 'services/ESignService.php';
        require_once 'services/KEPService.php';

        // 1. Fetch User Info for KEP
        $uStmt = $db->prepare("SELECT * FROM users WHERE id = :id");
        $uStmt->execute([':id' => $userId]);
        $userObj = $uStmt->fetch(PDO::FETCH_ASSOC);

        // 2. Fetch Cycle
        $cStmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $cStmt->execute([':id' => $cycleId]);
        $cycle = $cStmt->fetch(PDO::FETCH_ASSOC);

        if (!$cycle) { echo json_encode(["success" => false, "message" => "Döngü bulunamadı."]); exit; }

        if ($cycle['status'] !== 'processing') { echo json_encode(["success" => false, "message" => "İşlem aşamasında değil."]); exit; }

        // 3. Update Status
        $legalStatus = json_decode($cycle['legal_status'] ?? '{}', true);
        $nodes = json_decode($cycle['nodes'], true);
        
        // Identify Tax ID
        $myTaxId = $userObj['tax_id'];
        
        if (!in_array($myTaxId, $nodes)) { echo json_encode(["success" => false, "message" => "Yetkisiz."]); exit; }

        // 4. Simulate E-Sign
        $signResult = ESignService::initSignProcess($userId, $cycle['cycle_hash']);
        $validation = ESignService::validateSignature($signResult['token'], ['name' => $userObj['name']]);

        if ($validation['valid']) {
            $legalStatus[$myTaxId] = 'signed';
            
            // 5. Update DB
            $upd = $db->prepare("UPDATE sirius_cycles SET legal_status = :ls WHERE id = :id");
            $upd->execute([':ls' => json_encode($legalStatus), ':id' => $cycleId]);

            // 6. Send KEP Notification (Simulation)
            if (!empty($userObj['kep_address'])) {
                KEPService::send($userObj['kep_address'], "Sözleşme İmzalandı", "LikyaPay Sirius Döngüsü #{$cycle['id']} için sözleşme imzalandı.");
            }

            echo json_encode(["success" => true, "message" => "Sözleşme E-İmza ile onaylandı.", "debug_esign" => $validation]);
        } else {
            echo json_encode(["success" => false, "message" => "İmza doğrulama başarısız."]);
        }
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
                        ':desc' => "Sirius Döngü #$id Hizmet Bedeli Faturası",
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
    
    elseif ($action === 'list_completed_cycles') {
        // User: List cycles I participated in and are completed
        $stmt = $db->prepare("SELECT id, cycle_code, total_volume, completed_at, nodes FROM sirius_cycles WHERE status = 'completed' AND JSON_CONTAINS(nodes, :tax)");
        $stmt->execute([':tax' => json_encode($myTaxId)]); // JSON_CONTAINS expects quoted string for string array? Or just scalar?
        // Actually for ["123", "456"], JSON_CONTAINS(nodes, '"123"') works.
        // Let's rely on string matching or proper JSON function if available in this MySQL version.
        // Fallback: Fetch all completed and filter in PHP if MySQL < 5.7 (Unlikely).
        // Using LIKE for simplicity and compatibility:
        // nodes is ["123", "456"]
        
        $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Filter in PHP to be safe regarding JSON weirdness
        $myCycles = [];
        foreach ($cycles as $c) {
             if (in_array($myTaxId, json_decode($c['nodes'], true))) {
                 // Determine my Role (Devreden vs Devralan) is per edge, but simplified here.
                 // Just list the cycle.
                 unset($c['nodes']); // Don't expose full graph details unnecessarily
                 $myCycles[] = $c;
             }
        }
        
        echo json_encode(["success" => true, "data" => $myCycles]);
    }

    elseif ($action === 'download_my_contract') {
        // User: Download My Contract
        if (!isset($_GET['cycle_id'])) die("Parametre eksik.");
        
        $cycle_id = $_GET['cycle_id'];
        
        // Verify Participation
        $cStmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id AND status = 'completed'");
        $cStmt->execute([':id' => $cycle_id]);
        $cycle = $cStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$cycle) die("Döngü bulunamadı veya tamamlanmamış.");
        
        $nodes = json_decode($cycle['nodes'], true);
        if (!in_array($myTaxId, $nodes)) die("Bu döngüde yer almıyorsunuz.");
        
        // Redirect to Admin Generator but with my context
        // We reuse the 'admin_download_contract' logic but triggered by user.
        // Since that block checks for admin role, we should extract the logic or allow it if user matches tax_id.
        // Refactoring is cleaner. Let's call a shared function or redirect with a token? 
        // Simplest: Duplicate the generation logic or skip role check if 'internal_call' flag is set.
        // Actually, let's just use the exact same logic here:
        
        $tax_id = $myTaxId; // FORCE to my ID
        $type = 'temlik'; // Default
        // Determine type? Usually it's Temlik unless it's a self-loop (Mahsuplaşma logic is usually implicit).
        // Let's assume Temlik for now or check if A->B->A (Mahsuplaşma).
        // Actually Mahsuplaşma is when A->...->A. Every node is both Debtor and Creditor.
        // The contract text depends on the edge.
        // For a cycle A->B->C->A:
        // A signs "Temlik" assigning A->B debt to C? No.
        // A has Receivable from B? No, Edge A->B means A Odes B.
        // Wait, topology: A->B means A owes B ($volume).
        // A wants to pay B. Use receivable from C? No.
        // Cycle: A->B->C->A.
        // A owes B. B owes C. C owes A. (All same amount)
        // A assigns its receivable from C? (C owes A).
        // A assigns C-debt to B (to pay A->B).
        // So A says to C: "Pay B instead of me."
        // Reference: "Alacağın Devri".
        // A is "Devreden" (Assignor). C is "Muhatap" (Debtor). B is "Devralan" (Assignee).
        // So A assigns C->A receivable to B.
        // So for User A:
        // Me ($tax_id) = A.
        // My Debtor (Muhatap) = C (The one upstream? No, C owes A).
        // In graph A->B->C->A, edges are debts.
        // A->B (A owes B). B->C (B owes C). C->A (C owes A).
        // So C is my Debtor.
        // B is my Creditor (and Assignee).
        // So I need to find who owes Me. In graph, it's the node pointing TO me.
        // X->Me means X owes Me.
        // In `nodes` array [A, B, C], edges are A->B, B->C, C->A.
        // So C points to A.
        // So Muhatap = Prev Node in array.
        // Devralan (Assignee) = Next Node (B) (Wait, I owe B. I pay B with assignment. So B is Assignee).
        // This matches the logic I wrote in admin_download_contract.
        
        // So I just need to invoke that logic.
        // Let's redirect to that block by including or copy-paste?
        // Copy-paste to avoid auth issues in that block.
        
        // ... (Copy of contract generation logic) ...
        // 2. Identify Parties
        $count = count($nodes);
        $myIndex = array_search($myTaxId, $nodes);
        
        $prevIndex = ($myIndex - 1 + $count) % $count; // Muhatap (Borçlu) - Who owes Me?
        // Graph is A->B->C->A (A owes B, B owes C, C owes A).
        // Node sequence in DB: [A, B, C]
        // Edge 0: A->B. Edge 1: B->C. Edge 2: C->A.
        // I am A (Index 0).
        // Who owes me? C (Index 2).
        // prevIndex of 0 is (0-1+3)%3 = 2. C. CORRECT.
        
        $nextIndex = ($myIndex + 1) % $count; // Devralan (Alacaklım/Assignee). B.
        // I owe B. I assign C's debt to B.
        
        $prevTax = $nodes[$prevIndex];
        $nextTax = $nodes[$nextIndex];
        
        // Helper
        function getCompInner($db, $tax) {
            $stmt = $db->prepare("SELECT name, tax_id, address, tax_office FROM users WHERE tax_id = :tax");
            $stmt->execute([':tax' => $tax]);
            $res = $stmt->fetch(PDO::FETCH_ASSOC);
            return $res ? $res : ['name' => "Firma $tax", 'tax_id' => $tax];
        }
        
        $me = getCompInner($db, $myTaxId);
        $debtor = getCompInner($db, $prevTax);
        $assignee = getCompInner($db, $nextTax);
        
        // Generate HTML
        $amount = number_format($cycle['total_volume'], 2, ',', '.');
        $date = date('d.m.Y', strtotime($cycle['completed_at'])); // Use completion date
        
        ob_clean();
        header('Content-Type: text/html; charset=utf-8');
        echo "<!DOCTYPE html><html><head><title>Sözleşme</title>";
        echo "<style>body { font-family: 'Times New Roman'; padding: 40px; line-height: 1.6; } .title { text-align: center; font-weight: bold; margin-bottom: 30px; } table { width: 100%; border-collapse: collapse; margin: 20px 0; } td { border: 1px solid #ccc; padding: 10px; }</style>";
        echo "</head><body>";
        
        echo "<div class='title'>ALACAĞIN DEVRİ (TEMLİK) SÖZLEŞMESİ</div>";
        echo "<p align='center'>Ref: {$cycle['cycle_code']} | Tarih: $date</p>";
        
        echo "<p><strong>DEVREDEN:</strong> {$me['name']} (VN: {$me['tax_id']})</p>";
        echo "<p><strong>MUHATAP (Borçlu):</strong> {$debtor['name']} (VN: {$debtor['tax_id']})</p>";
        echo "<p><strong>DEVRALAN (Yeni Alacaklı):</strong> {$assignee['name']} (VN: {$assignee['tax_id']})</p>";
        
        echo "<br><h3>KONU</h3>";
        echo "<p>İşbu sözleşmenin konusu, <strong>{$me['name']}</strong>'in, <strong>{$debtor['name']}</strong> firmasından olan <strong>$amount TL</strong> tutarındaki alacağını, <strong>{$assignee['name']}</strong> firmasına devir ve temlik etmesidir.</p>";
        
        echo "<p>Bu işlem LikyaPay Sirius Döngü Sistemi (#{$cycle['cycle_code']}) kapsamında otomatik olarak oluşturulmuş ve E-İmza / KEP onayı ile yürürlüğe girmiştir.</p>";
        
        echo "<br><br><br>";
        echo "<table style='border:none'><tr>
                <td style='border:none; text-align:center'>DEVREDEN<br>{$me['name']}</td>
                <td style='border:none; text-align:center'>DEVRALAN<br>{$assignee['name']}</td>
              </tr></table>";
              
        echo "</body></html>";
        exit;
    }
    
    elseif ($action === 'admin_download_contract') {
        // Admin: Download Contract as Printable HTML
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
             die("Yetkisiz erişim.");
        }

        $cycle_id = $_GET['cycle_id'] ?? null;
        $tax_id = $_GET['tax_id'] ?? null; // This is the ASSIGNOR (Devreden)
        $type = $_GET['type'] ?? 'temlik';

        if (!$cycle_id || !$tax_id) die("Eksik parametre.");

        // 1. Fetch Cycle
        $cStmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $cStmt->execute([':id' => $cycle_id]);
        $cycle = $cStmt->fetch(PDO::FETCH_ASSOC);
        if (!$cycle) die("Döngü bulunamadı.");

        // 2. Identify Parties in the Chain
        $nodes = json_decode($cycle['nodes'], true);
        $count = count($nodes);
        $myIndex = array_search($tax_id, $nodes);

        if ($myIndex === false) die("Kullanıcı döngüde bulunamadı.");

        // TOPOLOGY: A (Prev) -> B (Me) -> C (Next)
        // Edge A->B means A owes B (My Receivable)
        // Edge B->C means B owes C (My Debt)
        // Action: I (B) assign my receivable from A to C, to pay my debt to C.

        $prevIndex = ($myIndex - 1 + $count) % $count; // Borçlu (Muhatap) - A
        $nextIndex = ($myIndex + 1) % $count;        // Devralan (Yeni Alacaklı) - C

        $prevTax = $nodes[$prevIndex];
        $nextTax = $nodes[$nextIndex];

        // 3. Fetch Company Details Helper
        function getComp($db, $tax) {
            $stmt = $db->prepare("SELECT name, tax_id, address, tax_office FROM users WHERE tax_id = :tax");
            $stmt->execute([':tax' => $tax]);
            $res = $stmt->fetch(PDO::FETCH_ASSOC);
            return $res ? $res : ['name' => "Firma $tax", 'tax_id' => $tax, 'address' => '', 'tax_office' => ''];
        }

        $me = getComp($db, $tax_id);       // Devreden
        $debtor = getComp($db, $prevTax);  // Muhatap (Borçlu)
        $assignee = getComp($db, $nextTax); // Devralan

        // Generate HTML
        $title = ($type === 'mahsuplasma') ? 'MAHSUPLAŞMA PROTOKOLÜ' : 'ALACAĞIN DEVRİ (TEMLİK) SÖZLEŞMESİ';
        $date = date('d.m.Y');
        $amount = number_format($cycle['total_volume'] ?? 0, 2, ',', '.');

        ob_clean();
        header('Content-Type: text/html; charset=utf-8');
        
        echo "<!DOCTYPE html><html><head>
            <meta charset='utf-8'>
            <title>$title</title>";
        echo "<style>
            body { font-family: 'Times New Roman', serif; padding: 50px; line-height: 1.5; color: #000; font-size: 11pt; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 16pt; text-transform: uppercase; }
            .header span { font-size: 10pt; }
            .section-title { font-weight: bold; margin-top: 20px; text-decoration: underline; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
            td, th { border: 1px solid #999; padding: 8px; vertical-align: top; }
            .party-header { background: #f0f0f0; font-weight: bold; text-align: center; }
            p { margin-bottom: 10px; text-align: justify; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sig-block { width: 30%; text-align: center; font-size: 10pt; }
            .sig-line { margin-top: 40px; border-top: 1px solid #000; }
        </style></head><body>";

        echo "<div class='header'>
                <h1>$title</h1>
                <span>Tarih: $date | Ref: {$cycle['cycle_code']}-{$me['tax_id']}</span>
              </div>";

        echo "<div>İşbu sözleşme aşağıda belirtilen taraflar arasında, <strong>LikyaPay Sirius Döngü Sistemi</strong> (#{$cycle['cycle_code']}) kapsamında tespit edilen ticari alacakların devri/mahsuplaşması amacıyla akdedilmiştir.</div>";

        echo "<div class='section-title'>1. TARAFLAR</div>";
        echo "<table>";
        echo "<tr>
                <td width='33%' class='party-header'>DEVREDEN (Siz)</td>
                <td width='33%' class='party-header'>MUHATAP (Borçlu)</td>
                <td width='33%' class='party-header'>DEVRALAN (Alacaklı)</td>
              </tr>";
        echo "<tr>
                <td><strong>{$me['name']}</strong><br><small>VN: {$me['tax_id']}<br>{$me['tax_office']}</small></td>
                <td><strong>{$debtor['name']}</strong><br><small>VN: {$debtor['tax_id']}<br>{$debtor['tax_office']}</small></td>
                <td><strong>{$assignee['name']}</strong><br><small>VN: {$assignee['tax_id']}<br>{$assignee['tax_office']}</small></td>
              </tr>";
        echo "</table>";

        if ($type === 'mahsuplasma') {
            echo "<div class='section-title'>2. ALACAĞIN TARİHÇESİ (TEMLİK ZİNCİRİ)</div>";
            echo "<p>İşbu mahsuplaşmaya konu olan alacak, ilk doğduğu andan itibaren aşağıdaki silsile ile birbirine devredilerek en son <strong>DEVREDEN</strong> uhdesine geçmiştir:</p>";
            
            echo "<table class='contract-table' style='font-size: 9pt;'>";
            echo "<tr style='background:#f9f9f9'>
                    <th>Sıra</th>
                    <th>Devreden (Eski Alacaklı)</th>
                    <th>Devralan (Yeni Alacaklı)</th>
                    <th>İşlem Türü</th>
                  </tr>";

            // Logic: Iterate from 0 to MyIndex
            for ($i = 0; $i < $count; $i++) {
                $currTax = $nodes[$i];
                $nextTax = $nodes[($i + 1) % $count];
                
                if ($i >= $myIndex) break; // Stop when we reach the current user's step

                $tSrc = getComp($db, $currTax);
                $tDst = getComp($db, $nextTax);

                $step = $i + 1;
                echo "<tr>
                        <td align='center'>{$step}</td>
                        <td>{$tSrc['name']} <br><small>({$tSrc['tax_id']})</small></td>
                        <td>{$tDst['name']} <br><small>({$tDst['tax_id']})</small></td>
                        <td>Alacağın Devri (Temlik)</td>
                      </tr>";
            }
            echo "</table>";

            echo "<div class='section-title'>3. KONU VE HÜKÜM</div>";
            echo "<p>Yukarıdaki zincir sonucunda <strong>{$me['name']}</strong> sıfatını kazanan taraf, <strong>{$debtor['name']}</strong> firmasından olan <strong>{$amount} TL</strong> tutarındaki alacağını, Sirius Döngü Sistemi vasıtasıyla, kendisinin <strong>{$assignee['name']}</strong> firmasına olan aynı tutardaki borcuna karşılık mahsup etmiştir.</p>";
            echo "<p>Taraflar, işbu mahsuplaşma işlemi sonucunda belirtilen tutar kadar borç ve alacağın karşılıklı olarak sona erdiğini beyan ve kabul ederler.</p>";

        } else {
             // Standard Temlik Logic
             echo "<div class='section-title'>2. KONU VE TUTAR</div>";
             echo "<p>İşbu sözleşmenin konusu, <strong>{$me['name']}</strong>'in, <strong>{$debtor['name']}</strong> firmasından olan ve aşağıda dökümü belirtilen toplam <strong>{$amount} TL</strong> tutarındaki doğmuş/doğacak alacağının, Türk Borçlar Kanunu'nun 183. ve devamı maddeleri uyarınca <strong>{$assignee['name']}</strong>'a gayrikabili rücu olarak devir ve temlik edilmesidir.</p>";
             echo "<p><strong>{$me['name']}</strong>, işbu temlik işlemi ile birlikte, alacak üzerinde tasarruf yetkisinin devrolduğunu, alacağın artık <strong>{$assignee['name']}</strong>'a ait olduğunu ve ödemenin <strong>{$assignee['name']}</strong>'a yapılması gerektiğini <strong>{$debtor['name']}</strong>'a ihbar eder.</p>";
        }

        echo "<div class='section-title'>3. BEYAN VE TAAHHÜTLER</div>";
        echo "<ul>
                <li><strong>DEVREDEN:</strong> Söz konusu alacağın işbu devir tarihinde mevcut olduğunu, alacağı daha önce başkasına devretmediğini, alacak üzerinde herhangi bir haciz veya takyidat bulunmadığını beyan eder.</li>
                <li><strong>MUHATAP:</strong> İşbu temlik/mahsup bildirimini aldığını, belirtilen tutarı <strong>DEVRALAN</strong> uhdesine geçmiş sayacağını (veya ödeyeceğini) kabul eder.</li>
                <li><strong>DEVRALAN:</strong> İşbu devir işlemini kabul ettiğini ve söz konusu tutarı, <strong>DEVREDEN</strong>'in kendisine olan cari hesap borcundan düşeceğini (mahsup edeceğini) taahhüt eder.</li>
            </ul>";

        echo "<div class='signatures'>
                <div class='sig-block'><strong>DEVREDEN</strong><br>{$me['name']}<div class='sig-line'>İmza / Kaşe</div></div>
                <div class='sig-block'><strong>DEVRALAN</strong><br>{$assignee['name']}<div class='sig-line'>İmza / Kaşe</div></div>
                <div class='sig-block'><strong>MUHATAP (ONAY)</strong><br>{$debtor['name']}<div class='sig-line'>İmza / Kaşe</div></div>
              </div>";

        echo "<div style='margin-top: 50px; color: #999; font-size: 8pt; text-align: center;'>Bu belge LikyaPay Platformu üzerinde dijital olarak oluşturulmuştur. {$date}</div>";
        
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

    elseif ($action === 'download_my_contract') {
        // User: Download Contract as Printable HTML
        if (!isset($_SESSION['user_id'])) {
             die("Yetkisiz erişim.");
        }

        $cycle_id = $_GET['cycle_id'] ?? null;
        $type = $_GET['type'] ?? 'temlik';

        if (!$cycle_id) die("Döngü ID gerekli.");

        // 1. Fetch Cycle
        $cStmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $cStmt->execute([':id' => $cycle_id]);
        $cycle = $cStmt->fetch(PDO::FETCH_ASSOC);
        if (!$cycle) die("Döngü bulunamadı.");

        // 2. Identify Me in the Chain
        $nodes = json_decode($cycle['nodes'], true);
        
        // Find my Tax ID from session user_id
        $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
        $uStmt->execute([':uid' => $user_id]);
        $rowMe = $uStmt->fetch(PDO::FETCH_ASSOC);
        $myTaxId = $rowMe['tax_id'];

        if (!in_array($myTaxId, $nodes)) die("Bu döngüde yetkiniz yok.");

        // Re-use logic: set tax_id to ME (Assignor)
        $tax_id = $myTaxId; 

         // 2. Identify Parties in the Chain
         $count = count($nodes);
         $myIndex = array_search($tax_id, $nodes);
 
         // TOPOLOGY: A (Prev) -> B (Me) -> C (Next)
         $prevIndex = ($myIndex - 1 + $count) % $count; // Borçlu (Muhatap) - A
         $nextIndex = ($myIndex + 1) % $count;        // Devralan (Yeni Alacaklı) - C
 
         $prevTax = $nodes[$prevIndex];
         $nextTax = $nodes[$nextIndex];
 
         // 3. Fetch Company Details Helper
         if (!function_exists('getComp')) {
             function getComp($db, $tax) {
                 $stmt = $db->prepare("SELECT name, tax_id, address, tax_office FROM users WHERE tax_id = :tax");
                 $stmt->execute([':tax' => $tax]);
                 $res = $stmt->fetch(PDO::FETCH_ASSOC);
                 return $res ? $res : ['name' => "Firma $tax", 'tax_id' => $tax, 'address' => '', 'tax_office' => ''];
             }
         }
 
         $me = getComp($db, $tax_id);       // Devreden
         $debtor = getComp($db, $prevTax);  // Muhatap (Borçlu)
         $assignee = getComp($db, $nextTax); // Devralan
 
         // Generate HTML
         $title = ($type === 'mahsuplasma') ? 'MAHSUPLAŞMA PROTOKOLÜ' : 'ALACAĞIN DEVRİ (TEMLİK) SÖZLEŞMESİ';
         $date = date('d.m.Y');
         $amount = number_format($cycle['total_volume'] ?? 0, 2, ',', '.');
 
         ob_clean();
         header('Content-Type: text/html; charset=utf-8');
         
         echo "<!DOCTYPE html><html><head>
             <meta charset='utf-8'>
             <title>$title</title>";
         echo "<style>
             body { font-family: 'Times New Roman', serif; padding: 50px; line-height: 1.5; color: #000; font-size: 11pt; }
             .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
             .header h1 { margin: 0; font-size: 16pt; text-transform: uppercase; }
             .header span { font-size: 10pt; }
             .section-title { font-weight: bold; margin-top: 20px; text-decoration: underline; }
             table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
             td, th { border: 1px solid #999; padding: 8px; vertical-align: top; }
             .party-header { background: #f0f0f0; font-weight: bold; text-align: center; }
             p { margin-bottom: 10px; text-align: justify; }
             .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
             .sig-block { width: 30%; text-align: center; font-size: 10pt; }
             .sig-line { margin-top: 40px; border-top: 1px solid #000; }
         </style></head><body>";
 
         echo "<div class='header'>
                 <h1>$title</h1>
                 <span>Tarih: $date | Ref: {$cycle['cycle_code']}-{$me['tax_id']}</span>
               </div>";
 
         echo "<div>İşbu sözleşme aşağıda belirtilen taraflar arasında, <strong>LikyaPay Sirius Döngü Sistemi</strong> (#{$cycle['cycle_code']}) kapsamında tespit edilen ticari alacakların devri/mahsuplaşması amacıyla akdedilmiştir.</div>";
 
         echo "<div class='section-title'>1. TARAFLAR</div>";
         echo "<table>";
         echo "<tr>
                 <td width='33%' class='party-header'>DEVREDEN (Siz)</td>
                 <td width='33%' class='party-header'>MUHATAP (Borçlu)</td>
                 <td width='33%' class='party-header'>DEVRALAN (Alacaklı)</td>
               </tr>";
         echo "<tr>
                 <td><strong>{$me['name']}</strong><br><small>VN: {$me['tax_id']}<br>{$me['tax_office']}</small></td>
                 <td><strong>{$debtor['name']}</strong><br><small>VN: {$debtor['tax_id']}<br>{$debtor['tax_office']}</small></td>
                 <td><strong>{$assignee['name']}</strong><br><small>VN: {$assignee['tax_id']}<br>{$assignee['tax_office']}</small></td>
               </tr>";
         echo "</table>";
 
         if ($type === 'mahsuplasma') {
             echo "<div class='section-title'>2. ALACAĞIN TARİHÇESİ (TEMLİK ZİNCİRİ)</div>";
             echo "<p>İşbu mahsuplaşmaya konu olan alacak, ilk doğduğu andan itibaren aşağıdaki silsile ile birbirine devredilerek en son <strong>DEVREDEN</strong> uhdesine geçmiştir:</p>";
             
             echo "<table class='contract-table' style='font-size: 9pt;'>";
             echo "<tr style='background:#f9f9f9'>
                     <th>Sıra</th>
                     <th>Devreden (Eski Alacaklı)</th>
                     <th>Devralan (Yeni Alacaklı)</th>
                     <th>İşlem Türü</th>
                   </tr>";
 
             // Logic: Iterate from 0 to MyIndex
             for ($i = 0; $i < $count; $i++) {
                 $currTax = $nodes[$i];
                 $nextTax = $nodes[($i + 1) % $count];
                 
                 if ($i >= $myIndex) break; // Stop when we reach the current user's step
 
                 $tSrc = getComp($db, $currTax);
                 $tDst = getComp($db, $nextTax);
 
                 $step = $i + 1;
                 echo "<tr>
                         <td align='center'>{$step}</td>
                         <td>{$tSrc['name']} <br><small>({$tSrc['tax_id']})</small></td>
                         <td>{$tDst['name']} <br><small>({$tDst['tax_id']})</small></td>
                         <td>Alacağın Devri (Temlik)</td>
                       </tr>";
             }
             echo "</table>";
 
             echo "<div class='section-title'>3. KONU VE HÜKÜM</div>";
             echo "<p>Yukarıdaki zincir sonucunda <strong>DEVREDEN</strong> sıfatını kazanan taraf, <strong>MUHATAP</strong> firmasından olan <strong>{$amount} TL</strong> tutarındaki alacağını, Sirius Döngü Sistemi vasıtasıyla, kendisinin <strong>DEVRALAN</strong> firmasına olan aynı tutardaki borcuna karşılık mahsup etmiştir.</p>";
             echo "<p>Taraflar, işbu mahsuplaşma işlemi sonucunda belirtilen tutar kadar borç ve alacağın karşılıklı olarak sona erdiğini beyan ve kabul ederler.</p>";
 
         } else {
              // Standard Temlik Logic
              echo "<div class='section-title'>2. KONU VE TUTAR</div>";
              echo "<p>İşbu sözleşmenin konusu, <strong>DEVREDEN</strong>'in, <strong>MUHATAP</strong> firmasından olan ve aşağıda dökümü belirtilen toplam <strong>{$amount} TL</strong> tutarındaki doğmuş/doğacak alacağının, Türk Borçlar Kanunu'nun 183. ve devamı maddeleri uyarınca <strong>DEVRALAN</strong>'a gayrikabili rücu olarak devir ve temlik edilmesidir.</p>";
              echo "<p><strong>DEVREDEN</strong>, işbu temlik işlemi ile birlikte, alacak üzerinde tasarruf yetkisinin devrolduğunu, alacağın artık <strong>DEVRALAN</strong>'a ait olduğunu ve ödemenin <strong>DEVRALAN</strong>'a yapılması gerektiğini <strong>MUHATAP</strong>'a ihbar eder.</p>";
         }
 
         echo "<div class='section-title'>3. BEYAN VE TAAHHÜTLER</div>";
         echo "<ul>
                 <li><strong>DEVREDEN:</strong> Söz konusu alacağın işbu devir tarihinde mevcut olduğunu, alacağı daha önce başkasına devretmediğini, alacak üzerinde herhangi bir haciz veya takyidat bulunmadığını beyan eder.</li>
                 <li><strong>MUHATAP:</strong> İşbu temlik/mahsup bildirimini aldığını, belirtilen tutarı <strong>DEVRALAN</strong> uhdesine geçmiş sayacağını (veya ödeyeceğini) kabul eder.</li>
                 <li><strong>DEVRALAN:</strong> İşbu devir işlemini kabul ettiğini ve söz konusu tutarı, <strong>DEVREDEN</strong>'in kendisine olan cari hesap borcundan düşeceğini (mahsup edeceğini) taahhüt eder.</li>
             </ul>";
 
         echo "<div class='signatures'>
                 <div class='sig-block'><strong>DEVREDEN (SİZ)</strong><br>{$me['name']}<div class='sig-line'>Elektronik İmza / Kaşe</div></div>
                 <div class='sig-block'><strong>DEVRALAN</strong><br>{$assignee['name']}<div class='sig-line'>Elektronik İmza / Kaşe</div></div>
                 <div class='sig-block'><strong>MUHATAP</strong><br>{$debtor['name']}<div class='sig-line'>Elektronik İmza / Kaşe</div></div>
               </div>";
 
         echo "<div style='margin-top: 50px; color: #999; font-size: 8pt; text-align: center;'>Bu belge LikyaPay Platformu üzerinde dijital olarak oluşturulmuştur. {$date}</div>";
         
         echo "<script>window.print();</script>";
         echo "</body></html>";
         exit;
    }

    else {
        throw new Exception("Geçersiz işlem.");
    }

} catch (Exception $e) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
