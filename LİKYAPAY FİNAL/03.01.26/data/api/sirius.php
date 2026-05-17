<?php
// Sirius API
// Path: data/api/sirius.php

include_once '../../core/database.php';
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
        // 1. Get User Tax ID
        $taxQuery = "SELECT tax_id FROM users WHERE id = :uid";
        $uStmt = $db->prepare($taxQuery);
        $uStmt->bindParam(":uid", $user_id);
        $uStmt->execute();
        $userRow = $uStmt->fetch(PDO::FETCH_ASSOC);
        $myTaxId = $userRow['tax_id'] ?? null;

        if (!$myTaxId) {
            echo json_encode(["success" => false, "message" => "Vergi no bulunamadı."]);
            exit;
        }

        // 2. Search in Active Cycles
        $sql = "SELECT * FROM sirius_cycles WHERE status IN ('detected', 'approved') ORDER BY id DESC LIMIT 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cycle) {
            $nodes = json_decode($cycle['nodes'], true); // Array of Tax IDs
            
            // Check if I am in this cycle
            if (in_array($myTaxId, $nodes)) {
                
                // Get Names for visualization
                // This is a bit heavy but needed for UI (A -> B -> C)
                // In production, optimize with a single query using IN clauses
                $chainNames = [];
                foreach ($nodes as $tax) {
                    $nStmt = $db->prepare("SELECT name FROM users WHERE tax_id = :tax LIMIT 1");
                    $nStmt->bindParam(":tax", $tax);
                    $nStmt->execute();
                    $nRow = $nStmt->fetch(PDO::FETCH_ASSOC);
                    $chainNames[] = $tax === $myTaxId ? "Siz" : ($nRow['name'] ?? $tax);
                }

                echo json_encode([
                    "success" => true,
                    "in_cycle" => true,
                    "cycle" => [
                        "id" => $cycle['id'],
                        "volume" => $cycle['total_volume'],
                        "status" => $cycle['status'],
                        "nodes" => $nodes,
                        "chain_names" => $chainNames,
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
        // Admin Only
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403);
            exit(json_encode(["success" => false, "message" => "Yetkisiz"]));
        }

        $inputData = json_decode(file_get_contents("php://input"), true);
        $id = $inputData['id'] ?? null;

        if (!$id) throw new Exception("ID gerekli.");

        // 1. Fetch Cycle Details
        $stmt = $db->prepare("SELECT * FROM sirius_cycles WHERE id = :id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cycle) throw new Exception("Döngü bulunamadı.");
        if ($cycle['status'] !== 'detected') throw new Exception("Bu döngü zaten işlenmiş.");

        $details = json_decode($cycle['details'], true);
        $volume = (float)$cycle['total_volume'];

        // 2. Process Settlement (Clearing Debts)
        $db->beginTransaction();
        try {
            foreach ($details as $edge) {
                $from_tax = $edge['from'];
                $to_tax = $edge['to'];
                $amount_to_clear = (float)$edge['amount']; // This is the aggregated amount, but we only clear up to 'Volume'
                
                // CRITICAL: We only clear the 'Volume' amount (the bottleneck), NOT the entire edge amount if it's higher.
                // Actually, the edge amount in 'details' IS the aggregated amount. The Settlement Amount is the Cycle Total Volume.
                // Wait, if A owes B 15k, and Cycle is 5k. We clear 5k.
                // Correct logic: Clear min($edge['amount'], $volume).
                // Since Volume is min(all edges), it is always <= edge['amount'].
                // So we always clear exactly $volume from each edge.
                
                $clear_amount = $volume;

                // Find transactions for this edge
                // Get User IDs first
                $uStmt = $db->prepare("SELECT id FROM users WHERE tax_id = ?");
                $uStmt->execute([$from_tax]);
                $fromUser = $uStmt->fetch(PDO::FETCH_ASSOC);
                
                $uStmt->execute([$to_tax]);
                $toUser = $uStmt->fetch(PDO::FETCH_ASSOC);

                if (!$fromUser || !$toUser) continue; // Should not happen

                $uid = $fromUser['id'];
                $ruid = $toUser['id'];

                // Fetch debts (Oldest first)
                $tStmt = $db->prepare("SELECT id, amount FROM transactions 
                                     WHERE user_id = :uid AND related_user_id = :ruid 
                                     AND type = 'debt' AND status IN ('approved', 'Onaylandı') 
                                     ORDER BY created_at ASC");
                $tStmt->execute([':uid' => $uid, ':ruid' => $ruid]);
                $txs = $tStmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($txs as $tx) {
                    if ($clear_amount <= 0) break;

                    $tx_amount = (float)$tx['amount'];
                    if ($tx_amount <= $clear_amount) {
                        // Fully clear this transaction
                        $upd = $db->prepare("UPDATE transactions SET amount = 0, status = 'Sirius (Tamamlandı)' WHERE id = :id");
                        $upd->execute([':id' => $tx['id']]);
                        $clear_amount -= $tx_amount;
                    } else {
                        // Partially clear
                        $new_amount = $tx_amount - $clear_amount;
                        $upd = $db->prepare("UPDATE transactions SET amount = :new, description = CONCAT(description, ' (Sirius -', :deduct, ')') WHERE id = :id");
                        $upd->execute([':new' => $new_amount, ':deduct' => $clear_amount, ':id' => $tx['id']]);
                        $clear_amount = 0;
                    }
                }
            }

            // 3. Update Cycle Status
            $sql = "UPDATE sirius_cycles SET status = 'approved', updated_at = NOW() WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(":id", $id);
            $stmt->execute();

            $db->commit();
            echo json_encode(["success" => true, "message" => "Döngü onaylandı ve bakiyeler güncellendi."]);

        } catch (Exception $e) {
            $db->rollBack();
            throw new Exception("İşlem başarısız: " . $e->getMessage());
        }
    }

    elseif ($action === 'list_requests') {
        $sql = "SELECT * FROM sirius_requests WHERE requester_id = :uid ORDER BY id DESC";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(":uid", $user_id);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $data]);
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
