// Sirius Loop Algorithm
// Path: views/frontend/sirius/algoritma.js

window.Sirius = {
    checkAndExecuteCycle: function(currentUsers) {
        const userMap = {};
        currentUsers.forEach(u => {
            // Deep copy to avoid reference issues during calculation
            userMap[u.id] = { 
                ...u, 
                transactions: u.transactions.map(t => ({...t})) 
            };
        });

        let cycleFound = null;
        let cyclePath = []; 
        const visited = new Set();
        const recursionStack = new Set();
        const pathStack = [];

        function detectCycle(userId, startNodeId) {
            visited.add(userId);
            recursionStack.add(userId);
            pathStack.push(userId);

            const debtor = userMap[userId];
            // Scan debt relationships
            for (const trx of debtor.transactions) {
                // Only active debts
                if (trx.type === 'debt' && trx.amount > 0) {
                    const creditor = Object.values(userMap).find(u => u.name === trx.party);
                    if (!creditor) continue;

                    const creditorId = creditor.id;

                    if (!visited.has(creditorId)) {
                        if (detectCycle(creditorId, startNodeId)) return true;
                    } else if (recursionStack.has(creditorId)) {
                        // Cycle detected
                        // We found a back-edge to a node in the current recursion stack
                        const cyclestartIndex = pathStack.indexOf(creditorId);
                        const loop = pathStack.slice(cyclestartIndex);
                        
                        // Rule: At least 3 companies
                        if (loop.length >= 3) {
                            cyclePath = loop;
                            return true;
                        }
                    }
                }
            }

            recursionStack.delete(userId);
            pathStack.pop();
            return false;
        }

        // Start Cycle Search
        for (const user of currentUsers) {
            // In a real generic graph search, we check unvisited nodes.
            // For finding *any* cycle in component:
            if (!visited.has(user.id)) {
                if (detectCycle(user.id, user.id)) {
                    cycleFound = true;
                    break; 
                }
            }
        }

        if (!cycleFound) {
            return { success: false, message: "Uygun döngü (en az 3 firma) bulunamadı." };
        }

        // Calculate Volume (Min Common Amount)
        let minVolume = Infinity;
        const cycleTransactions = [];

        for (let i = 0; i < cyclePath.length; i++) {
            const debtorId = cyclePath[i];
            const creditorId = cyclePath[(i + 1) % cyclePath.length];
            
            const debtor = userMap[debtorId];
            const creditor = userMap[creditorId];

            const trx = debtor.transactions.find(t => t.party === creditor.name && t.type === 'debt');
            
            if (trx) {
                if (trx.amount < minVolume) minVolume = trx.amount;
                cycleTransactions.push({ debtorId, creditorId, trxRef: trx });
            }
        }

        // Execution
        const serviceFeeRate = 0.02;
        const serviceFee = minVolume * serviceFeeRate;

        cycleTransactions.forEach(item => {
            const { debtorId, creditorId, trxRef } = item;
            
            // Update Debtor
            const debtor = userMap[debtorId];
            debtor.totalDebt -= minVolume;
            
            // Update Transaction Status
            trxRef.amount -= minVolume;
            if (trxRef.amount <= 0) {
                trxRef.status = "Mahsuplaşıldı";
                trxRef.amount = 0;
            } else {
                trxRef.status = `Kısmi Ödendi (-${minVolume})`;
            }

            // Update Creditor
            const creditor = userMap[creditorId];
            creditor.totalCredit -= minVolume;
        });

        return {
            success: true,
            updatedUsers: Object.values(userMap),
            cycleReport: {
                date: new Date().toLocaleString('tr-TR'),
                cycleMembers: cyclePath.map(id => userMap[id].name),
                volume: minVolume,
                serviceFee: serviceFee,
                netCleared: minVolume
            }
        };
    }
};
