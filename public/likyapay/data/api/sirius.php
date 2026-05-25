<?php
// Sirius API - SAFE MODE V4 (FULL ADMIN ACTIONS)
// Path: data/api/sirius.php

// 1. Basic Setup
ini_set('display_errors', 0);
error_reporting(E_ALL);
date_default_timezone_set('Europe/Istanbul');

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS')
    exit(0);

// 2. Mock Classes
if (!class_exists('Logger')) {
    class Logger
    {
        public static function log($a, $b, $c = null)
        {
        }
    }
}
if (!class_exists('MailHelper')) {
    class MailHelper
    {
        public static function send($a, $b, $c)
        {
        }
    }
}

// 3. Database
$dbPaths = [
    __DIR__ . '/../../core/database.php',
    $_SERVER['DOCUMENT_ROOT'] . '/likyasoft/public/likyapay/core/database.php',
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

if (!$dbLoaded)
    die(json_encode(["success" => false, "message" => "DB Missing"]));

session_start();

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    die(json_encode(["success" => false, "message" => "DB Error"]));
}

// 4. ACTION HANDLER
$action = $_GET['action'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['action']))
        $action = $input['action'];
}

try {
    $user_id = $_SESSION['user_id'] ?? null;

    // --- CHECK MY CYCLE ---
    if ($action === 'check_my_cycle') {
        if (!$user_id)
            throw new Exception("Giriş yapınız");

        $uStmt = $db->prepare("SELECT tax_id, name, address, tax_office, mersis_no FROM users WHERE id = :uid");
        $uStmt->bindParam(":uid", $user_id);
        $uStmt->execute();
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || empty($user['tax_id'])) {
            echo json_encode(["success" => true, "in_cycle" => false]);
            exit;
        }

        $myTaxId = $user['tax_id'];
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
                $details = ["tax_id" => $tax, "name" => $name, "address" => $nRow['address'] ?? '', "tax_office" => $nRow['tax_office'] ?? '', "mersis_no" => $nRow['mersis_no'] ?? ''];

                $chainNames[] = $tax === $myTaxId ? "Siz" : $name;
                if ($i === $creditorIndex)
                    $myCreditor = $details;
                if ($i === $debtorIndex)
                    $myDebtor = $details;
            }

            echo json_encode([
                "success" => true,
                "in_cycle" => true,
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
        if (!$id)
            throw new Exception("ID gerekli");
        $stmt = $db->prepare("DELETE FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $id);
        if ($stmt->execute())
            echo json_encode(["success" => true, "message" => "Döngü silindi"]);
        else
            throw new Exception("Silinemedi");
        exit;
    }

    // --- APPROVE PAYMENT (ADMIN) ---
    elseif ($action === 'approve_payment') {
        $cycleId = $input['cycle_id'] ?? null;
        $targetTax = $input['target_tax_id'] ?? null;
        if (!$cycleId || !$targetTax)
            throw new Exception("Eksik veri");

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

        echo json_encode(["success" => true]);
        exit;
    }

    // --- APPROVE CONTRACT (ADMIN) ---
    elseif ($action === 'approve_contract') {
        $cycleId = $input['cycle_id'] ?? null;
        $targetTax = $input['target_tax_id'] ?? null;
        if (!$cycleId || !$targetTax)
            throw new Exception("Eksik veri");

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

        echo json_encode(["success" => true]);
        exit;
    }

    // --- FINALIZE CYCLE (ADMIN) ---
    elseif ($action === 'finalize_cycle') {
        // Admin: Close the cycle
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403);
            exit(json_encode(["success" => false]));
        }

        $inputData = json_decode(file_get_contents("php://input"), true);
        $id = $inputData['id'] ?? null;

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cycle['status'] === 'completed')
            throw new Exception("Zaten tamamlandı.");

        // Check ALL approved
        $ps = json_decode($cycle['payment_status'] ?? '{}', true);
        $ls = json_decode($cycle['legal_status'] ?? '{}', true);

        if (empty($ps) || empty($ls))
            throw new Exception("Durum verisi eksik.");

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

        $volume = (float) $cycle['total_volume'];
        $details = json_decode($cycle['details'], true);

        $db->beginTransaction();
        try {
            foreach ($details as $edge) {
                $from_tax = $edge['from'];
                $to_tax = $edge['to'];

                $uStmt = $db->prepare("SELECT id FROM users WHERE tax_id = ? LIMIT 1");
                $uStmt->execute([$from_tax]);
                $fromUser = $uStmt->fetch(PDO::FETCH_ASSOC);
                $uStmt->execute([$to_tax]);
                $toUser = $uStmt->fetch(PDO::FETCH_ASSOC);

                if (!$fromUser || !$toUser)
                    continue;
                $uid = $fromUser['id'];
                $ruid = $toUser['id'];

                // 1. Clear DEBT
                $tStmt = $db->prepare("SELECT id, amount, description FROM transactions 
                                     WHERE user_id = :uid AND related_user_id = :ruid 
                                     AND type = 'debt' 
                                     AND status NOT IN ('rejected', 'cancelled', 'Reddedildi', 'İptal', 'Sirius (Tamamlandı)')
                                     ORDER BY created_at ASC");
                $tStmt->execute([':uid' => $uid, ':ruid' => $ruid]);
                $txs = $tStmt->fetchAll(PDO::FETCH_ASSOC);

                $debt_clear_amount = $volume;

                foreach ($txs as $tx) {
                    if ($debt_clear_amount <= 0)
                        break;
                    $tx_amount = (float) $tx['amount'];
                    if ($tx_amount <= $debt_clear_amount) {
                        $upd = $db->prepare("UPDATE transactions SET amount = 0, status = 'Sirius (Tamamlandı)', description = CONCAT(description, ' [Sirius Döngü #$id ile ödendi]') WHERE id = :id");
                        $upd->execute([':id' => $tx['id']]);
                        $debt_clear_amount -= $tx_amount;
                    } else {
                        $new_amount = $tx_amount - $debt_clear_amount;
                        $deducted = $debt_clear_amount;
                        $upd = $db->prepare("UPDATE transactions SET amount = :new, description = CONCAT(description, ' [Sirius #$id ile -$deducted TL düşüldü]') WHERE id = :id");
                        $upd->execute([':new' => $new_amount, ':id' => $tx['id']]);
                        $debt_clear_amount = 0;
                    }
                }

                // 2. Clear CREDIT
                $cStmt = $db->prepare("SELECT id, amount, description FROM transactions 
                                     WHERE user_id = :ruid AND related_user_id = :uid 
                                     AND type = 'credit' 
                                     AND status NOT IN ('rejected', 'cancelled', 'Reddedildi', 'İptal', 'Sirius (Tamamlandı)')
                                     ORDER BY created_at ASC");
                $cStmt->execute([':ruid' => $ruid, ':uid' => $uid]);
                $ctxs = $cStmt->fetchAll(PDO::FETCH_ASSOC);

                $credit_clear_amount = $volume;

                foreach ($ctxs as $tx) {
                    if ($credit_clear_amount <= 0)
                        break;
                    $tx_amount = (float) $tx['amount'];
                    if ($tx_amount <= $credit_clear_amount) {
                        $upd = $db->prepare("UPDATE transactions SET amount = 0, status = 'Sirius (Tamamlandı)', description = CONCAT(description, ' [Sirius Döngü #$id ile tahsil edildi]') WHERE id = :id");
                        $upd->execute([':id' => $tx['id']]);
                        $credit_clear_amount -= $tx_amount;
                    } else {
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

            // record service fees
            $nodes = json_decode($cycle['nodes'], true);
            $volume = (float) $cycle['total_volume'];
            $feePerNode = $volume * 0.03 * 1.2;

            foreach ($nodes as $tax_id) {
                $uStmt = $db->prepare("SELECT id, name, email FROM users WHERE tax_id = :tax LIMIT 1");
                $uStmt->execute([':tax' => $tax_id]);
                $uObj = $uStmt->fetch(PDO::FETCH_ASSOC);

                if ($uObj) {
                    $sysQuery = "INSERT INTO system_transactions (type, category, entity_name, description, amount, date, status) 
                                 VALUES ('income', 'Sirius Hizmet Bedeli', :entity, :desc, :amount, CURDATE(), 'draft')";
                    $sysStmt = $db->prepare($sysQuery);
                    $sysStmt->execute([
                        ':entity' => $uObj['name'],
                        ':desc' => "Sirius Döngü #$id Hizmet Bedeli",
                        ':amount' => $feePerNode
                    ]);
                }
            }

            // --- PHYSICAL ARCHIVE SAVING (YYYY-MM) ---
            $ym = date('Y-m');
            $uploadDir = __DIR__ . '/../../uploads/sirius_archive/' . $ym . '/' . $id;
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            foreach ($nodes as $tax_id) {
                // Save Contract
                $contractHtml = generate_contract_html_content($db, $cycle, $tax_id);
                if ($contractHtml) {
                    file_put_contents("$uploadDir/contract_{$tax_id}.html", $contractHtml);
                }
                // Save Invoice
                $uStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
                $uStmt->execute([':tax' => $tax_id]);
                $uObj = $uStmt->fetch(PDO::FETCH_ASSOC);
                if ($uObj) {
                    $invoiceHtml = generate_invoice_html_content($db, $cycle, $uObj);
                    if ($invoiceHtml) {
                        file_put_contents("$uploadDir/invoice_{$tax_id}.html", $invoiceHtml);
                    }
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

    // --- ADMIN DOWNLOAD CONTRACT ---
    elseif ($action === 'admin_download_contract') {
        $cycleId = $_GET['id'] ?? null;
        $taxId = $_GET['tax_id'] ?? null;
        if (!$cycleId || !$taxId)
            die("Eksik veri");

        $user_role = $_SESSION['user_role'] ?? '';
        if ($user_role !== 'admin' && $user_role !== 'accountant')
            die("Yetkisiz işlem");

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $cycleId]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cycle)
            die("Bulunamadı");

        // 1. Try to find physical file
        $fileName = "contract_{$taxId}.html";
        $filePath = find_sirius_file($cycleId, $fileName);

        if ($filePath && file_exists($filePath)) {
            header('Content-Type: text/html; charset=utf-8');
            header('Content-Disposition: inline; filename="' . $fileName . '"');
            readfile($filePath);
            exit;
        }

        // 2. Fallback: Generate on the fly
        $html = generate_contract_html_content($db, $cycle, $taxId);
        if ($html) {
            header('Content-Type: text/html; charset=utf-8');
            header('Content-Disposition: inline; filename="generated_' . $fileName . '"');
            echo $html;
            exit;
        }
        die("Dosya oluşturulamadı.");
    }

    // --- DOWNLOAD INVOICE ---
    elseif ($action === 'download_invoice') {
        $cycleId = $_GET['cycle_id'] ?? null;
        if (!$cycleId)
            die("ID gerekli");

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->execute([':id' => $cycleId]);
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cycle)
            die("Bulunamadı");

        $user_id = $_SESSION['user_id'] ?? null;
        $isAdmin = (isset($_SESSION['user_role']) && ($_SESSION['user_role'] === 'admin' || $_SESSION['user_role'] === 'accountant'));

        if (!$user_id && !$isAdmin)
            die("Giriş yapınız");

        // Determine Target Tax ID
        $targetTaxId = null;
        if ($isAdmin && isset($_GET['target_tax_id'])) {
            $targetTaxId = $_GET['target_tax_id'];
        } elseif ($user_id) {
            $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
            $uStmt->execute([':uid' => $user_id]);
            $targetTaxId = $uStmt->fetchColumn();
        }

        if (!$targetTaxId)
            die("Vergi No tespit edilemedi");

        $nodes = json_decode($cycle['nodes'], true) ?? [];
        if (!$isAdmin && !in_array($targetTaxId, $nodes))
            die("Bu döngüde değilsiniz");

        // 1. Try to find physical file
        $fileName = "invoice_{$targetTaxId}.html";
        $filePath = find_sirius_file($cycleId, $fileName);

        if ($filePath && file_exists($filePath)) {
            header('Content-Type: text/html; charset=utf-8');
            header('Content-Disposition: inline; filename="' . $fileName . '"');
            readfile($filePath);
            exit;
        }

        // 2. Fallback: Generate on the fly
        $tStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
        $tStmt->execute([':tax' => $targetTaxId]);
        $targetUser = $tStmt->fetch(PDO::FETCH_ASSOC);

        if ($targetUser) {
            $html = generate_invoice_html_content($db, $cycle, $targetUser);
            header('Content-Type: text/html; charset=utf-8');
            header('Content-Disposition: inline; filename="generated_' . $fileName . '"');
            echo $html;
            exit;
        } else {
            die("Kullanıcı/Firma bilgisi bulunamadı");
        }
    }

    // --- SUBMIT PAYMENT ---
    elseif ($action === 'submit_payment') {
        if (!$user_id)
            throw new Exception("Giriş gerekli");
        $cycleId = $input['cycle_id'] ?? null;
        if (!$cycleId)
            throw new Exception("ID gerekli");

        $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
        $uStmt->bindParam(":uid", $user_id);
        $uStmt->execute();
        $taxId = trim($uStmt->fetchColumn());

        if (!$taxId)
            throw new Exception("Vergi No bulunamadı");

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

        echo json_encode(["success" => true]);
        exit;
    }

    // --- SIGN CONTRACT ---
    elseif ($action === 'sign_contract') {
        if (!$user_id)
            throw new Exception("Giriş gerekli");
        $cycleId = $input['cycle_id'] ?? null;
        if (!$cycleId)
            throw new Exception("ID gerekli");

        $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
        $uStmt->bindParam(":uid", $user_id);
        $uStmt->execute();
        $taxId = trim($uStmt->fetchColumn());

        if (!$taxId)
            throw new Exception("Vergi No bulunamadı");

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

        echo json_encode(["success" => true]);
        exit;
    }

    // --- LIST COMPLETED ---
    elseif ($action === 'list_completed_cycles') {
        $stmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
        $stmt->execute([':uid' => $user_id]);
        $uInfo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$uInfo || empty($uInfo['tax_id'])) {
            echo json_encode(["success" => true, "data" => []]);
            exit;
        }

        $myTaxId = (string) $uInfo['tax_id'];

        $stmt = $db->query("SELECT * FROM sirius_cycles WHERE status IN ('completed', 'COMPLETED', 'complete', 'COMPLETE') ORDER BY updated_at DESC");
        $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $myCycles = [];
        foreach ($cycles as $c) {
            $nodes = json_decode($c['nodes'], true);
            if (!is_array($nodes))
                continue;
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

    // --- LIST ALL ---
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
        echo json_encode(["success" => false, "message" => "Engine file missing (Safe Mode)"]);
        exit;
    }

    // --- DOWNLOAD CONTRACT ---
    elseif ($action === 'admin_download_contract' || $action === 'download_my_contract') {
        $id = $_GET['id'] ?? ($_GET['cycle_id'] ?? null);
        $myTaxId = null;
        if ($action === 'download_my_contract') {
            if (!$user_id)
                throw new Exception("Giriş Gerekli");
            $uStmt = $db->prepare("SELECT tax_id FROM users WHERE id = :uid");
            $uStmt->bindParam(":uid", $user_id);
            $uStmt->execute();
            $myTaxId = $uStmt->fetchColumn();
        }
        $nodeIndex = isset($_GET['node_index']) ? (int) $_GET['node_index'] : -1;
        if (!$id)
            throw new Exception("ID eksik");

        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cycle)
            throw new Exception("Döngü bulunamadı");

        if (!isset($cycle['volume']) && isset($cycle['total_volume'])) {
            $cycle['volume'] = $cycle['total_volume'];
        }
        if (!isset($cycle['code']) && isset($cycle['cycle_code'])) {
            $cycle['code'] = $cycle['cycle_code'];
        }

        $nodes = json_decode($cycle['nodes'], true);
        if ($nodeIndex === -1 && $myTaxId) {
            $nodeIndex = array_search($myTaxId, $nodes);
        }
        if ($nodeIndex === -1 && isset($_GET['tax_id'])) {
            $nodeIndex = array_search($_GET['tax_id'], $nodes);
        }

        // CHECK PHYSICAL FILE
        if ($nodeIndex !== false && $nodeIndex >= 0) {
            $taxIdForFile = $nodes[$nodeIndex];

            $completedAt = $cycle['updated_at'] ?? $cycle['created_at'];
            $ym = date('Y-m', strtotime($completedAt));
            $filePath = __DIR__ . "/../../uploads/sirius_archive/{$ym}/{$id}/contract_{$taxIdForFile}.html";
            if (file_exists($filePath)) {
                readfile($filePath);
                exit;
            }

            $filePathOld = __DIR__ . "/../../uploads/sirius_archive/{$id}/contract_{$taxIdForFile}.html";
            if (file_exists($filePathOld)) {
                readfile($filePathOld);
                exit;
            }
        }

        // Use helper
        if ($nodeIndex !== false && $nodeIndex >= 0) {
            $html = generate_contract_html_content($db, $cycle, $nodes[$nodeIndex]);
            if ($html) {
                header('Content-Type: text/html; charset=utf-8');
                header('Content-Disposition: inline; filename="sirius_doc_v3.html"');
                echo $html;
                exit;
            }
        }

        throw new Exception("Sözleşme oluşturulamadı");
    }

    // --- APPROVE CYCLE ---
    elseif ($action === 'approve_cycle') {
        $id = $input['id'] ?? null;
        if (!$id)
            throw new Exception("ID Yok");
        $stmt = $db->prepare("UPDATE sirius_cycles SET status='processing' WHERE id=:id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        echo json_encode(["success" => true]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "Action not found"]);

} catch (Exception $e) {
    die(json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]));
}

// --- HELPER FUNCTIONS ---

function generate_invoice_html_content($db, $cycle, $user)
{
    $vol = floatval($cycle['volume'] ?? ($cycle['total_volume'] ?? 0));
    $fee = $vol * 0.03;
    $vat = $fee * 0.20;
    $total = $fee + $vat;

    $html = "<html><head><meta charset='utf-8'><title>Fatura</title>";
    $html .= "<style>body{font-family:sans-serif; padding:40px;} .box{border:1px solid #ddd; padding:20px; margin-bottom:20px;} table{width:100%; border-collapse:collapse;} th,td{padding:10px; border-bottom:1px solid #eee;}</style>";
    $html .= "</head><body>";

    $html .= "<div style='text-align:center;'><h2>LİKYAPAY ELEKTRONİK HİZMET FATURASI</h2></div>";
    $html .= "<div class='box'><strong>Sayın:</strong> {$user['name']}<br>VN: {$user['tax_id']}<br>Adres: {$user['address']}</div>";
    $html .= "<div class='box'><strong>Tarih:</strong> " . date('d.m.Y') . "<br><strong>Fatura No:</strong> S-" . rand(10000, 99999) . "</div>";

    $html .= "<table><thead><tr><th>Hizmet</th><th>Tutar</th></tr></thead><tbody>";
    $html .= "<tr><td>Sirius Döngü Komisyon Bedeli (#{$cycle['id']})</td><td>" . number_format($fee, 2) . " TL</td></tr>";
    $html .= "<tr><td>KDV (%20)</td><td>" . number_format($vat, 2) . " TL</td></tr>";
    $html .= "<tr><td><strong>TOPLAM</strong></td><td><strong>" . number_format($total, 2) . " TL</strong></td></tr>";
    $html .= "</tbody></table>";

    $html .= "<p style='margin-top:50px; font-size:12px; color:#777;'>Bu belge elektronik ortamda yasal geçerliliğe uygun olarak oluşturulmuş ve saklanmıştır.</p>";
    $html .= "</body></html>";
    return $html;
}

function generate_contract_html_content($db, $cycle, $taxId)
{
    $nodes = json_decode($cycle['nodes'], true);
    $count = count($nodes);
    $nodeIndex = array_search($taxId, $nodes);

    if ($nodeIndex === false)
        return null;

    $vol = floatval($cycle['volume'] ?? ($cycle['total_volume'] ?? 0));
    $volFmt = number_format($vol, 2, ',', '.');
    $code = $cycle['code'] ?? ($cycle['cycle_code'] ?? $cycle['id']);
    $date = date("d.m.Y");

    $anchorIndex = $count - 1;
    $firstIndex = 0;
    $isAnchor = ($nodeIndex === $anchorIndex);

    $myTax = $nodes[$nodeIndex];
    $mStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
    $mStmt->execute([':tax' => $myTax]);
    $myUser = $mStmt->fetch(PDO::FETCH_ASSOC);
    $myName = mb_strtoupper($myUser['name'] ?? $myTax, 'UTF-8');
    $myAddress = $myUser['address'] ?? '';
    $myMersis = $myUser['mersis_no'] ?? '';

    $anchorTax = $nodes[$anchorIndex];
    $aStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
    $aStmt->execute([':tax' => $anchorTax]);
    $anchorUser = $aStmt->fetch(PDO::FETCH_ASSOC);
    $anchorName = mb_strtoupper($anchorUser['name'] ?? $anchorTax, 'UTF-8');
    $targetTaxInfo = ($anchorUser['tax_id'] ?? '') . ' / ' . ($anchorUser['tax_office'] ?? '');

    $firstName = "";
    $firstUser = null;
    if ($isAnchor) {
        // Need First Node (A) for Anchor Logic
        $firstTax = $nodes[0];
        $fStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
        $fStmt->execute([':tax' => $firstTax]);
        $firstUser = $fStmt->fetch(PDO::FETCH_ASSOC);
        $firstName = mb_strtoupper($firstUser['name'] ?? $firstTax, 'UTF-8');
    }

    if (!$isAnchor) {
        $nextIndex = ($nodeIndex + 1) % $count;
        $nextTax = $nodes[$nextIndex];
        $nStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
        $nStmt->execute([':tax' => $nextTax]);
        $nextUser = $nStmt->fetch(PDO::FETCH_ASSOC);
        $nextName = mb_strtoupper($nextUser['name'] ?? $nextTax, 'UTF-8');
        $nextTaxInfo = ($nextUser['tax_id'] ?? '') . ' / ' . ($nextUser['tax_office'] ?? '');
    } else {
        $prevIndex = ($nodeIndex - 1 + $count) % $count;
        $prevTax = $nodes[$prevIndex];
        $pStmt = $db->prepare("SELECT * FROM users WHERE tax_id = :tax LIMIT 1");
        $pStmt->execute([':tax' => $prevTax]);
        $prevUser = $pStmt->fetch(PDO::FETCH_ASSOC);
        $prevName = mb_strtoupper($prevUser['name'] ?? $prevTax, 'UTF-8');

        $nextName = ""; // Not used for anchor contract in same way
    }

    $allNames = [];
    foreach ($nodes as $nt) {
        $stmtn = $db->prepare("SELECT name FROM users WHERE tax_id = :t");
        $stmtn->execute([':t' => $nt]);
        $allNames[$nt] = mb_strtoupper($stmtn->fetchColumn() ?: $nt, 'UTF-8');
    }

    $html = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Sözleşme</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        body { font-family: 'Crimson Text', 'Times New Roman', serif; font-size: 14px; line-height: 1.6; color: #0f172a; background-color: white; margin: 0; padding: 40px; }
        .protocol-no { text-align: right; font-family: monospace; font-size: 12px; color: #64748b; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .amount-banner { background-color: #f1f5f9; border: 2px solid #cbd5e1; text-align: center; font-size: 24px; font-weight: bold; padding: 15px; margin-bottom: 30px; border-radius: 8px; color: #0f172a; }
        h2 { text-align: center; font-weight: 700; font-size: 18px; text-transform: uppercase; text-decoration: underline; margin-bottom: 30px; color: #1e293b; }
        h3 { font-weight: 700; text-decoration: underline; font-size: 14px; margin-top: 25px; margin-bottom: 15px; text-align: center; color: #334155; }
        p { margin-bottom: 12px; text-align: justify; font-size:13px; }
        .box { border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: #f9f9f9; position: relative; font-size: 13px; }
        .party-title { font-weight: 700; font-size: 11px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 5px; text-transform: uppercase; color: #555; }
        .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; gap: 10px; }
        .sig { width: 32%; text-align: center; font-size: 11px; }
        .sig-line { border-top: 1px solid #000; margin-top: 40px; }
        .sig-title { font-weight: bold; margin-bottom: 5px; text-decoration:underline; }
        .page-break { page-break-before: always; border-top: 2px dashed #ccc; margin-top: 50px; padding-top: 50px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; text-align: center; font-style: italic; color: #64748b; font-size: 10px; }
    </style></head><body>
    
    <div class='protocol-no'>PROTOKOL NO: $code</div>
    <div class='amount-banner'>TEMLİK TUTARI: $volFmt TL</div>";

    if (!$isAnchor) {
        $html .= "<h2>ALACAĞIN DEVRİ (TEMLİK) SÖZLEŞMESİ</h2>";
        $html .= "<p><strong>Tarih:</strong> $date</p>";
        $html .= "<div class='box'><div class='party-title'>DEVREDEN (SİZ)</div><strong>$myName</strong><br>VN: $myTax<br>Adres: $myAddress<br>Mersis: $myMersis</div>";
        $html .= "<div class='box'><div class='party-title'>DEVRALAN (ALACAKLI)</div><strong>$nextName</strong><br>VN: $nextTaxInfo<br>Adres: {$nextUser['address']}<br>Mersis: {$nextUser['mersis_no']}</div>";
        $html .= "<div class='box'><div class='party-title'>MUHATAP (ASIL BORÇLU)</div><strong>$anchorName</strong><br>VN: $targetTaxInfo<br>Adres: {$anchorUser['address']}<br>Mersis: {$anchorUser['mersis_no']}</div>";

        $html .= "<h3>1. SÖZLEŞMENİN KONUSU</h3><p>Devreden, Muhatap ($anchorName) nezdinde doğmuş ve doğacak olan <strong>$volFmt TL</strong> tutarındaki alacağını, tüm fer'ileri ve teminatları ile birlikte Devralan'a ($nextName) gayrikabili rücu olarak devir ve temlik etmiştir.</p>";
        $html .= "<h3>2. BEYAN VE TAAHHÜTLER</h3><p>Devreden, işbu alacağın var olduğunu, daha önce başkasına devretmediğini, üzerinde herhangi bir haciz veya takyidat bulunmadığını beyan ve taahhüt eder.</p>";

        $html .= "<div class='signatures'>
            <div class='sig'><div class='sig-title'>DEVREDEN</div>$myName<div class='sig-line'>İmza / Kaşe</div></div>
            <div class='sig'><div class='sig-title'>DEVRALAN</div>$nextName<div class='sig-line'>İmza / Kaşe</div></div>
            <div class='sig'><div class='sig-title'>MUHATAP (BORÇLU)</div>$anchorName<div class='sig-line'>İmza / Kaşe</div></div>
        </div>";

        $html .= "<div class='page-break'></div>";
        $html .= "<h2>BORÇ KAPAMA PROTOKOLÜ (MAHSUPLAŞMA)</h2>";
        $html .= "<p>İşbu belge ile, <strong>$myName</strong> (Borçlu) ile <strong>$nextName</strong> (Alacaklı) arasındaki ticari ilişkiden kaynaklanan borç, yukarıdaki temlik işlemi ile ödenmiş sayılmaktadır.</p>";
        $html .= "<p><strong>Kapanan Borç Tutarı:</strong> $volFmt TL</p>";
        $html .= "<div class='signatures'>
            <div class='sig'><div class='sig-title'>BORÇLU (DEVREDEN)</div>$myName<div class='sig-line'>İmza / Kaşe</div></div>
            <div class='sig'><div class='sig-title'>ALACAKLI (DEVRALAN)</div>$nextName<div class='sig-line'>İmza / Kaşe</div></div>
        </div>";

    } else {
        $html .= "<h2>TEMLİK KABUL VE MAHSUPLAŞMA BELGESİ</h2>";
        $html .= "<p><strong>Tarih:</strong> $date</p>";
        $html .= "<div class='box'><div class='party-title'>MUHATAP (D - SİZ)</div><strong>$anchorName</strong><br>VN: $anchorTax<br>Adres: {$anchorUser['address']}</div>";
        $html .= "<div class='box'><div class='party-title'>ALACAKLI (C - ÖNCEKİ)</div><strong>$prevName</strong><br>VN: $prevTax<br>Adres: {$prevUser['address']}</div>";

        $html .= "<h3>ALACAK ZİNCİRİ GEÇMİŞİ</h3>";
        $html .= "<div style='background:#eee; padding:10px; font-size:12px; font-family:monospace;'>";
        $chainStr = "";
        foreach ($nodes as $i => $n) {
            if ($i > 0)
                $chainStr .= " -> ";
            $chainStr .= $allNames[$n];
        }
        $html .= $chainStr;
        $html .= "</div>";

        $html .= "<h3>BEYAN VE KABUL</h3>";
        $html .= "<p><strong>$anchorName</strong> (Muhatap), kendisine karşı olan <strong>$volFmt TL</strong>'lik borcun, zincirleme temlik işlemleri sonucunda nihai olarak kendisine döndüğünü kabul eder.</p>";

        $html .= "<div class='signatures'>
             <div class='sig' style='width:100%'><div class='sig-title'>MUHATAP (BORÇLU & NİHAİ ALACAKLI)</div>$anchorName<div class='sig-line'>İmza / Kaşe</div></div>
        </div>";
    }

    $html .= "<div class='footer'>LikyaPay Elektronik Arşiv Sistemi - " . date("d.m.Y H:i:s") . "</div>";
    $html .= "</body></html>";

    return $html;
}

// --- HELPER TO FIND FILE RECURSIVELY ---
function find_sirius_file($cycleId, $fileName)
{
    // Determine base path relative to this file
    // This file is in: /data/api/sirius.php
    // Uploads is in: /uploads/sirius_archive
    $baseDir = dirname(__DIR__, 2) . '/uploads/sirius_archive';

    if (!is_dir($baseDir)) {
        // Try alternate path for local dev variations
        $baseDir = $_SERVER['DOCUMENT_ROOT'] . '/uploads/sirius_archive';
        if (!is_dir($baseDir))
            return null;
    }

    try {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($baseDir));
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getFilename() === $fileName) {
                // Check if it belongs to the correct cycle folder (parent folder name == cycleId)
                // We check if path contains "/$cycleId/" or "\$cycleId\"
                if (strpos($file->getPathname(), DIRECTORY_SEPARATOR . $cycleId . DIRECTORY_SEPARATOR) !== false) {
                    return $file->getPathname();
                }
            }
        }
    } catch (Exception $e) {
        return null;
    }
    return null;
}
?>