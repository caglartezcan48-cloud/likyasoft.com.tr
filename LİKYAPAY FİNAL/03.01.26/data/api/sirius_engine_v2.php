<?php
// Sirius Engine V2 - Testing
// Path: data/api/sirius_engine_v2.php

include_once __DIR__ . '/../../core/database.php';

class SiriusEngine {
    private $db;
    private $graph = [];
    private $requests = [];
    private $cycles = [];
    private $blocked_users = [];

    public function __construct() {
        if (!class_exists('Database')) {
            throw new Exception("Database class not found. Path check: " . __DIR__ . '/../../core/database.php');
        }
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function run() {
        $foundCycles = [];
        $this->loadBlockedUsers();
        $this->loadRequests();
        $iteration = 0;
        while ($iteration < 5) {
            $this->graph = [];
            $this->cycles = [];
            $this->buildGraph();
            if (empty($this->graph)) break;
            $this->detectCycles();
            $best_cycle = $this->selectBestCycle();
            if ($best_cycle) {
                $cycleId = $this->saveCycle($best_cycle);
                $foundCycles[] = $best_cycle;
                foreach ($best_cycle['nodes'] as $node) {
                    $this->blocked_users[$node] = true;
                }
            } else {
                break;
            }
            $iteration++;
        }

        if (count($foundCycles) > 0) {
            return [
                "success" => true, 
                "message" => count($foundCycles) . " adet yeni Sirius Grubu oluşturuldu!", 
                "cycles" => $foundCycles
            ];
        }

        return ["success" => false, "message" => "Uygun döngü bulunamadı."];
    }

    private function loadBlockedUsers() {
        $sql = "SELECT nodes FROM sirius_cycles WHERE status IN ('detected', 'approved')";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $nodes = json_decode($row['nodes'], true);
            foreach ($nodes as $tax_id) {
                $this->blocked_users[$tax_id] = true;
            }
        }
    }

    private function loadRequests() {
        // Updated to use JOIN properly
        $sql = "SELECT r.*, u.tax_id as requester_tax_id 
                FROM sirius_requests r 
                JOIN users u ON r.requester_id = u.id 
                WHERE r.status = 'pending'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $this->requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function buildGraph() {
        foreach ($this->requests as $req) {
            $u = $req['requester_tax_id'];
            $v = $req['target_tax_id']; // Target Tax ID is directly in request
            $amount = (float)$req['amount'];

            if (isset($this->blocked_users[$u])) continue;
            if (isset($this->blocked_users[$v])) continue;

            if (!isset($this->graph[$u])) $this->graph[$u] = [];
            $this->graph[$u][] = ['target' => $v, 'amount' => $amount, 'req_id' => $req['id']];
        }
    }

    private function detectCycles() {
        $visited = [];
        $stack = [];
        foreach (array_keys($this->graph) as $node) {
            $this->dfs($node, $visited, $stack, []);
            $visited = [];
        }
    }

    private function dfs($node, &$visited, &$stack, $path) {
        $visited[$node] = true;
        $stack[$node] = true;
        $path[] = $node;

        if (isset($this->graph[$node])) {
            foreach ($this->graph[$node] as $edge) {
                $neighbor = $edge['target'];
                if (in_array($neighbor, $path)) {
                    $cycle_path = [];
                    $record = false;
                    foreach ($path as $p) {
                        if ($p == $neighbor) $record = true;
                        if ($record) $cycle_path[] = $p;
                    }
                    $this->analyzeCycle($cycle_path);
                } elseif (!isset($visited[$neighbor])) {
                    $this->dfs($neighbor, $visited, $stack, $path);
                }
            }
        }
        $stack[$node] = false;
    }

    private function analyzeCycle($nodes) {
        if (count($nodes) < 3) return;
        $min_amount = -1;
        
        // Validation logic
        for ($i = 0; $i < count($nodes); $i++) {
            $u = $nodes[$i];
            $v = $nodes[($i + 1) % count($nodes)];
            $edge = null;
            foreach ($this->graph[$u] as $e) {
                if ($e['target'] == $v) {
                    $edge = $e;
                    break; 
                }
            }
            if (!$edge) return;
            if ($min_amount == -1 || $edge['amount'] < $min_amount) {
                $min_amount = $edge['amount'];
            }
        }

        $cycle_hash = md5(implode("-", $nodes));
        $this->cycles[$cycle_hash] = [
            'nodes' => $nodes,
            'volume' => $min_amount,
            'count' => count($nodes)
        ];
    }

    private function selectBestCycle() {
        if (empty($this->cycles)) return null;
        uasort($this->cycles, function($a, $b) {
            if ($a['volume'] == $b['volume']) {
                return $b['count'] - $a['count'];
            }
            return $b['volume'] <=> $a['volume'];
        });
        return reset($this->cycles);
    }

    private function saveCycle($cycle) {
        $nodes_json = json_encode($cycle['nodes']);
        $hash = md5($nodes_json . time());
        $sql = "INSERT INTO sirius_cycles (cycle_hash, nodes, total_volume, status, created_at) VALUES (:hash, :nodes, :vol, 'detected', NOW())";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(":hash", $hash);
        $stmt->bindParam(":nodes", $nodes_json);
        $stmt->bindParam(":vol", $cycle['volume']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }
}
?>
