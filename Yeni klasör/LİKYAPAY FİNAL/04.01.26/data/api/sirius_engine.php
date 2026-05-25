<?php
// Sirius Engine - Advanced Trade Cycle Detection Algorithm
// Path: data/api/sirius_engine.php

// Ensure database class is available
if (!class_exists('Database')) {
    if (file_exists(__DIR__ . '/../../core/database.php')) {
        include_once __DIR__ . '/../../core/database.php';
    } elseif (file_exists(__DIR__ . '/../core/database.php')) {
        // Fallback for different execution contexts
        include_once __DIR__ . '/../core/database.php';
    }
}

class SiriusEngine {
    private $db;
    private $graph = [];
    private $requests = [];
    private $cycles = [];
    private $blocked_users = [];
    private $user_sectors = []; // Added

    public function __construct() {
        if (!class_exists('Database')) {
             throw new Exception("Database class dependency missing.");
        }
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function run() {
        $foundCycles = [];
        
        $this->loadBlockedUsers();
        
        // CHANGED: Load from Real Transactions now
        $this->loadTransactions();
        $this->loadUserSectors(); // Added

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
            if (is_array($nodes)) {
                foreach ($nodes as $tax_id) {
                    $this->blocked_users[$tax_id] = true;
                }
            }
        }
    }

    private function loadTransactions() {
        // Fetch approved debts AND credits
        // Status can be 'approved' or 'Onaylandı'
        
        $sql = "SELECT 
                    t.id, 
                    t.amount, 
                    t.type,
                    u_source.tax_id as source_tax, 
                    u_target.tax_id as target_tax 
                FROM transactions t
                JOIN users u_source ON t.user_id = u_source.id
                JOIN users u_target ON t.related_user_id = u_target.id
                WHERE t.status IN ('approved', 'Onaylandı')
                  AND t.related_user_id IS NOT NULL";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $this->requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function loadUserSectors() {
        $sql = "SELECT tax_id, sector FROM users WHERE tax_id IS NOT NULL AND tax_id != ''";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $this->user_sectors[$row['tax_id']] = $row['sector'] ?? 'Genel Ticaret';
        }
    }

    private function buildGraph() {
        foreach ($this->requests as $req) {
            $amount = (float)$req['amount'];
            
            // Direction Logic
            if ($req['type'] === 'debt') {
                $u = $req['source_tax'];
                $v = $req['target_tax'];
            } else {
                $u = $req['target_tax']; // Target owes Source
                $v = $req['source_tax'];
            }

            // Skip if missing tax IDs
            if (empty($u) || empty($v)) continue;

            if (isset($this->blocked_users[$u])) continue;
            if (isset($this->blocked_users[$v])) continue;

            if (!isset($this->graph[$u])) $this->graph[$u] = [];
            
            // Check if edge exists and aggregate
            $found = false;
            foreach ($this->graph[$u] as &$edge) {
                if ($edge['target'] == $v) {
                    $edge['amount'] += $amount; // Aggregate Volume
                    $found = true;
                    break;
                }
            }
            // Use & reference to modify array in place, then unset
            unset($edge); 

            if (!$found) {
                $this->graph[$u][] = ['target' => $v, 'amount' => $amount, 'req_id' => $req['id']];
            }
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
        $details = [];
        
        for ($i = 0; $i < count($nodes); $i++) {
            $u = $nodes[$i];
            $v = $nodes[($i + 1) % count($nodes)];

            $edge = null;
            if (isset($this->graph[$u])) {
                foreach ($this->graph[$u] as $e) {
                    if ($e['target'] == $v) {
                        $edge = $e;
                        break; 
                    }
                }
            }

            if (!$edge) return;

            $details[] = [
                'from' => $u,
                'to' => $v,
                'amount' => $edge['amount']
            ];

            if ($min_amount == -1 || $edge['amount'] < $min_amount) {
                $min_amount = $edge['amount'];
            }
        }

        $cycle_hash = md5(implode("-", $nodes));
        $total_cleared = $min_amount * count($nodes);

        $this->cycles[$cycle_hash] = [
            'nodes' => $nodes,
            'details' => $details,
            'volume' => $min_amount,
            'count' => count($nodes),
            'total_cleared' => $total_cleared,
            'sector_synergy' => $this->calculateSynergy($nodes) // Added
        ];
    }

    private function calculateSynergy($nodes) {
        $sectors = [];
        foreach ($nodes as $tax) {
            $s = $this->user_sectors[$tax] ?? 'Bilinmeyen';
            $sectors[] = $s;
        }
        $unique = count(array_unique($sectors));
        // Synergy Rule: Lower diversity (more similar sectors) = Higher synergy score in this implementation
        return count($nodes) - $unique; 
    }

    private function selectBestCycle() {
        if (empty($this->cycles)) return null;

        // User Requirement:
        // 1. Priority: Highest Equal Amount (Volume)
        // 2. Priority: Highest Company Count (To maximize total turnover/ciro)
        uasort($this->cycles, function($a, $b) {
            // 1. Sort by Volume (Descending)
            if ($a['volume'] != $b['volume']) {
                return ($a['volume'] < $b['volume']) ? 1 : -1;
            }
            // 2. Sort by Sector Synergy (Descending)
            if ($a['sector_synergy'] != $b['sector_synergy']) {
                return $b['sector_synergy'] - $a['sector_synergy'];
            }
            // 3. Sort by Count (Descending) - For max turnover
            return $b['count'] - $a['count'];
        });

        return reset($this->cycles);
    }

    private function saveCycle($cycle) {
        // Generate Custom Code
        // Format: payDDMMYY-NN (e.g. pay030126-01)
        $dateStr = date('dmy');
        
        // Count today's cycles to determine sequence
        $countSql = "SELECT COUNT(*) FROM sirius_cycles WHERE DATE(created_at) = CURDATE()";
        $stmtCount = $this->db->prepare($countSql);
        $stmtCount->execute();
        $dailyCount = $stmtCount->fetchColumn();
        
        $sequence = str_pad($dailyCount + 1, 2, "0", STR_PAD_LEFT);
        $cycleCode = "pay" . $dateStr . "-" . $sequence;

        $nodes_json = json_encode($cycle['nodes']);
        $details_json = json_encode($cycle['details']);
        $hash = md5($nodes_json . time());

        $sql = "INSERT INTO sirius_cycles (cycle_code, cycle_hash, nodes, details, total_volume, status, created_at) VALUES (:code, :hash, :nodes, :details, :vol, 'detected', NOW())";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(":code", $cycleCode);
        $stmt->bindParam(":hash", $hash);
        $stmt->bindParam(":nodes", $nodes_json);
        $stmt->bindParam(":details", $details_json);
        $stmt->bindParam(":vol", $cycle['volume']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }
}
?>
