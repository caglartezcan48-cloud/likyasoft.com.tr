<?php
// Bu dosya, React projenizde kullanabileceğiniz 'Sirius Döngü Formülü' (CheckAndExecuteCycle) fonksiyonunu içerir.
// Aşağıdaki JavaScript kodunu kopyalayıp projenizdeki ilgili yere (örneğin AdminPanel bileşenine) yapıştırabilirsiniz.
?>
<script>
/**
 * Sirius Döngü Formülü - Kapalı Devre Borç Mahsuplaşma Algoritması
 * 
 * Bu fonksiyon:
 * 1. En az 3 firmadan oluşan borç döngülerini tespit eder.
 * 2. Döngüdeki minimum ortak tutarı ("Hacim") bulur.
 * 3. Hacim üzerinden %2 Hizmet Bedeli hesaplar.
 * 4. Bakiyeleri günceller (Mahsuplaşma).
 * 5. İşlem sonucunu raporlar.
 * 
 * @param {Array} currentUsers - Mevcut kullanıcı listesi
 * @returns {Object} { updatedUsers, cycleDetails }
 */
function checkAndExecuteCycle(currentUsers) {
    // 1. Kullanıcıları ve Borçları Haritalama (Graph Oluşturma)
    // Firmaların ID'lerine göre kolay erişim için bir map oluşturuyoruz.
    const userMap = {};
    currentUsers.forEach(u => {
        userMap[u.id] = { ...u, transactions: [...u.transactions] }; // Deep copy
    });

    let cycleFound = null;
    let cyclePath = []; // [UserA_ID, UserB_ID, UserC_ID, ...]

    // 2. Döngü Tespiti (DFS - Derinlik Öncelikli Arama)
    // Basit bir DFS ile döngü arıyoruz.
    const visited = new Set();
    const recursionStack = new Set();
    const pathStack = [];

    function detectCycle(userId, startNodeId, count) {
        visited.add(userId);
        recursionStack.add(userId);
        pathStack.push(userId);

        const debtor = userMap[userId];
        
        // Bu kişinin borçlu olduğu kişileri gez
        // Borçlu olduğu kişiler, transaction listesinde type: 'debt' olanlar
        // Ancak transaction listesinde 'party' ismi var, ID yoksa eşleştirmemiz lazım.
        // NOT: İdeal durumda transaction içinde partyId tutulmalıdır. 
        // Burada isim üzerinden eşleştirme yapıyoruz (Örnek veri yapısına göre)
        
        for (const trx of debtor.transactions) {
            if (trx.type === 'debt' && trx.amount > 0) {
                // Alacaklı firmanın ID'sini bulalım
                const creditor = Object.values(userMap).find(u => u.name === trx.party);
                if (!creditor) continue;

                const creditorId = creditor.id;

                if (!visited.has(creditorId)) {
                    if (detectCycle(creditorId, startNodeId, count + 1)) return true;
                } else if (recursionStack.has(creditorId)) {
                    // Döngü bulundu!
                    // Ancak en az 3 firma kuralı var.
                    // pathStack şu an döngü yolunu içeriyor.
                    // creditorId tekrar bulundu, yani döngü burada kapanıyor.
                    
                    // Döngünün başladığı yerin indeksini bul
                    const cyclestartIndex = pathStack.indexOf(creditorId);
                    const loop = pathStack.slice(cyclestartIndex);
                    
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

    // Tüm kullanıcılar üzerinde döngü araması başlat
    for (const user of currentUsers) {
        // Her arama için stack temizlenmeli mi? Hayır, visited global tutulabilir ama
        // kopuk grafikler için dış döngü şart.
        if (!visited.has(user.id)) {
             if (detectCycle(user.id, user.id, 0)) {
                 cycleFound = true;
                 break; 
             }
        }
    }

    if (!cycleFound) {
        return { success: false, message: "Uygun döngü bulunamadı." };
    }

    // 3. Minimum Ortak Tutar ("Hacim") Bulma
    // Döngü: A -> B -> C -> A
    // A'nın B'ye borcu, B'nin C'ye borcu, C'nin A'ya borcu...
    // Bu borçların en küçüğünü bulacağız.
    
    let minVolume = Infinity;
    const cycleTransactions = [];

    for (let i = 0; i < cyclePath.length; i++) {
        const debtorId = cyclePath[i];
        const creditorId = cyclePath[(i + 1) % cyclePath.length]; // Döngüsel sonraki
        
        const debtor = userMap[debtorId];
        const creditor = userMap[creditorId];

        // İlgili işlemi bul
        const trx = debtor.transactions.find(t => t.party === creditor.name && t.type === 'debt');
        
        if (trx) {
            if (trx.amount < minVolume) {
                minVolume = trx.amount;
            }
            cycleTransactions.push({ 
                debtorId, 
                creditorId, 
                trxRef: trx // Referans
            });
        }
    }

    // 4. Mahsuplaşma ve Komisyon Hesabı
    const serviceFeeRate = 0.02; // %2 Hizmet Bedeli
    const serviceFee = minVolume * serviceFeeRate;
    const clearedAmount = minVolume - serviceFee; // Firmadan düşülecek net borç aslında minVolume'dur, ama ödeme gibi düşünürsek...
    // MANTIK DÜZELTME:
    // Borç Mahsuplaşmasında:
    // A -> B'ye 5000 ödüyor gibi işlem görür.
    // Ancak sistem aradan %2 alır.
    // Yani A'nın borcundan 5000 düşer.
    // B'nin alacağından 5000 düşer (veya komisyon kimden kesiliyorsa ona göre değişir).
    // Genellikle mahsuplaşma sistemlerinde işlem hacmi kadar borç silinir.
    // Komisyonu sistem dışarıdan fatura eder veya bakiyeden düşer.
    // Burada basitlik adına: Borçlardan 'minVolume' kadar siliyoruz.
    // Komisyonu ayrıca raporluyoruz.

    cycleTransactions.forEach(item => {
        const { debtorId, creditorId, trxRef } = item;
        
        // 1. Borçlunun (Debtor) Borcunu Azalt
        const debtor = userMap[debtorId];
        debtor.totalDebt -= minVolume;
        
        // Transaksiyonu güncelle
        // Burada transaction nesnesi referans olduğu için userMap içindeki de güncellenir
        trxRef.amount -= minVolume;
        if (trxRef.amount <= 0) {
            trxRef.status = "Mahsuplaşıldı";
            trxRef.amount = 0; // Negatif olmasın
        } else {
             trxRef.status = `Kısmi Ödendi (-${minVolume})`;
        }

        // 2. Alacaklının (Creditor) Alacağını Azalt
        const creditor = userMap[creditorId];
        creditor.totalCredit -= minVolume;
        
        // Alacaklının listesinde de karşıt kayıt olabilir, onu da bulup güncellemek gerekebilir
        // Ancak currentUsers yapısında transactionlar sadece "debt" mi yoksa çift taraflı mı? 
        // Veri yapısı örneğinde "Firma A" nın transactionlarında "Firma B" debt olarak var.
        // Muhtemelen Firma B'nin transactionlarında da "Firma A" credit olarak olmayabilir veya olabilir.
        // Prompt sadece "debt" örneği verdiği için, sadece totalCredit'i bakiye olarak düşüyoruz.
    });

    const updatedUsers = Object.values(userMap);

    const cycleReport = {
        success: true,
        date: new Date().toISOString(),
        cycleMembers: cyclePath.map(id => userMap[id].name),
        volume: minVolume,
        serviceFee: serviceFee,
        netCleared: minVolume,
        message: `Döngü başarıyla çalıştırıldı. Hacim: ${minVolume} TL. Komisyon: ${serviceFee} TL.`
    };

    return { updatedUsers, cycleReport };
}
</script>
