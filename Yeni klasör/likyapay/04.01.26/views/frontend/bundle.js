
// --- FILE: frontend/sirius/algoritma.js ---
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


// --- FILE: frontend/anasayfa/ErrorBoundary.js ---

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CRITICAL APP ERROR:", error, errorInfo);
        this.setState({ error: error, errorInfo: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-red-100">
                        <div className="bg-red-600 p-6 text-white">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <i className="fas fa-exclamation-triangle"></i>
                                Sistem Hatası (System Error)
                            </h2>
                        </div>
                        <div className="p-8">
                            <p className="text-gray-700 text-lg mb-6">
                                Beklenmedik teknik bir sorun oluştu. Yazılımcı ekibi bilgilendirildi.
                                (An unexpected technical issue occurred.)
                            </p>
                            
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left overflow-auto max-h-60">
                                <p className="font-mono text-sm text-red-800 break-words font-bold mb-2">
                                    {this.state.error && this.state.error.toString()}
                                </p>
                                <pre className="text-xs text-red-700 whitespace-pre-wrap">
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </div>

                            <div className="flex gap-4 justify-end">
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow-lg font-medium"
                                >
                                    <i className="fas fa-sync-alt mr-2"></i>
                                    Sayfayı Yenile (Refresh)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

window.ErrorBoundary = ErrorBoundary;


// --- FILE: frontend/anasayfa/Intro.js ---
// Intro Component
// Path: views/frontend/anasayfa/Intro.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Intro = ({ onComplete }) => {
    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
        // Check if intro has already been shown in this session
        const hasShown = sessionStorage.getItem('introShown');

        if (hasShown) {
            setVisible(false);
            if (onComplete) onComplete();
            return;
        }

        // Using a longer timeout to ensure the animation plays out fully for the first time
        const timer = setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem('introShown', 'true');
            if (onComplete) onComplete();
        }, 3500); // Slightly increased to 3.5s to match animation + buffer

        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-white animate-fade-out-delay">
            <div className="text-center animate-bounce-in">
                {/* Logo or Icon */}
                <div className="w-32 h-32 md:w-48 md:h-48 mb-8 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 border-4 border-blue-400 p-2">
                    <img src="frontend/gorsel/logo.png" alt="Logo" className="w-16 h-16 md:w-24 md:h-24 mb-6 drop-shadow-2xl animate-pulse" />
                </div>

                {/* Brand Name */}
                <h1 className="text-4xl md:text-5xl font-bold tracking-wider mb-2 animate-slide-up">
                    LİKYA PAY
                </h1>

                {/* Slogan */}
                <p className="text-blue-300 text-sm md:text-lg tracking-[0.2em] uppercase animate-pulse">
                    FİNANSAL OPTİMİZASYON HİZMETLERİ
                </p>
            </div>

            {/* Loading Bar */}
            <div className="absolute bottom-20 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-loading-bar"></div>
            </div>

            <style>{`
                @keyframes fade-out-delay {
                    0% { opacity: 1; pointer-events: all; }
                    80% { opacity: 1; pointer-events: all; }
                    100% { opacity: 0; pointer-events: none; }
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes loading-bar {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-fade-out-delay { animation: fade-out-delay 3s forwards; }
                .animate-slide-up { animation: slide-up 1s ease-out forwards; }
                .animate-bounce-in { animation: bounce-in 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
                .animate-loading-bar { animation: loading-bar 2.5s ease-in-out forwards; }
            `}</style>
        </div>
    );
};


// --- FILE: frontend/anasayfa/Dictionary.js ---
// Dictionary.js
// Path: views/frontend/anasayfa/Dictionary.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Dictionary = {
    tr: {
        nav: {
            login: "Giriş Yap",
            language: "English"
        },
        hero: {
            badge: "Yeni Nesil Finans Yönetimi",
            title_prefix: "Likya Pay Optimizasyon Hizmetleri",
            title_highlight: "Tüm Tahsilat Sürecinizi",
            title_suffix: "Kolaylıkla Yönetebilirsiniz.",
            description: "Likya Pay, şirketler arası borç/alacak döngülerini tespit eder ve nakit akışına ihtiyaç duymadan mahsuplaşma sağlar.",
            btn_how: "Nasıl Çalışır?",
            btn_how_desc: "Sistemin işleyişini inceleyin.",
            btn_vision: "Vizyon",
            btn_vision_desc: "Gelecek hedeflerimiz.",
            btn_mission: "Misyon",
            btn_mission_desc: "Görevimiz ve amacımız.",
            btn_about: "Hakkımızda",
            btn_about_desc: "Likya Pay kimdir?",
            cta_join: "Şimdi Ücretsiz Katıl",
            cta_join_sub: "Ödeme döngünüzü başlatın",

            cycle_anim: {
                title: "Sirius Sistemi",
                company: "Firma",
                debt: "Borç",
                cleared: "Mahsuplaşıldı"
            }
        },
        vizyon: {
            what_is_title: "Likya Pay Nedir?",
            card_1_title: "Borç/Alacak Devri Sistemi",
            card_1_desc: "Likya Pay, KOBİ'ler ve ticari kuruluşlar için geliştirilen, nakit akışını rahatlatan gelişmiş bir borç ve alacak devri sistemidir.",
            card_2_title: "Yasal Mutabakat",
            card_2_desc: "KOBİ'ler (alacaklılar ve borçlular), sistem üzerindeki yasal mutabakat alt yapısı ile sorumluluklarını güvenle yerine getirir.",
            card_3_title: "Özgün Teknoloji",
            card_3_desc: "Sistem yapay zeka tabanlı (Sirius), izlenebilir ve değiştirilemez kayıt mekanizmasına (Blockchain benzeri) sahiptir.",
            how_works_title: "Sistem Nasıl Çalışır ve Kazandırır?",
            step_1_title: "Ücretsiz Kayıt",
            step_1_desc: "KOBİ'ler ve ticari kuruluşlar sisteme kayıt olur. Üyelik daima ücretsizdir ve ücretsiz kalacaktır.",
            step_2_title: "Veri Yükleme",
            step_2_desc: "Borçlu ve alacaklı şirketler, borç/alacak detaylarını resmi evrakları (fatura vb.) ile sisteme yükler.",
            step_3_title: "Sirius Eşleşmesi",
            step_3_desc: "Eşit tutardaki borçlu ve alacaklı KOBİ'ler, sistem havuzunda SİRİUS adını verdiğimiz formül ile otomatik eşleştirilir.",
            step_4_title: "Onay ve Tamamlama",
            step_4_desc: "Şirketiniz bir Sirius döngüsünde yer aldığında size ön onay bilgilendirmesi gelir. Onaylarınız dahilinde süreç resmen tamamlanır.",
            profit_model_title: "Kazanç Modeli",
            profit_model_desc: "Sistem, mahsuplaşma işlemi başarıyla tamamlandığında, işlem gören borç/alacak tutarının %3 + KDV'si oranında hizmet bedeli alır. Bu sayede hem sistem sürdürülebilir olur hem de KOBİ'ler büyük nakit yükünden kurtulur."
        },
        footer: {
            slogan: "Güçlü Finans, Güçlü Gelecek.",
            corporate: "Kurumsal",
            who_we_are: "Biz Kimiz? (Kurumsal Kimlik)",
            vision_mission: "Vizyon & Misyon",
            contact: "İletişim",
            legal: "Yasal",
            framework: "Yasal Çerçeve",
            terms: "Kullanım Koşulları",
            privacy: "Gizlilik Politikası",
            kvkk: "KVKK Aydınlatma Metni",
            rights: "© 2025 LİKYA PAY FİNANSAL OPTİMİZASYON HİZMETLERİ LTD.ŞTİ. Tüm hakları saklıdır.",
            manager: "Likya Pay Ulusal Yönetici"
        },
        modals: {
            how_title: "Sistem Nasıl Çalışır ve Kazandırır?",
            how_c1: "<strong>1. Ücretsiz Kayıt:</strong> KOBİ'ler ve ticari kuruluşlar sisteme kayıt olur. Üyelik daima ücretsizdir ve ücretsiz kalacaktır.",
            how_c2: "<strong>2. Veri Yükleme:</strong> Borçlu ve alacaklı şirketler, borç/alacak detaylarını resmi evrakları (fatura vb.) ile sisteme yükler.",
            how_c3: "<strong>3. Sirius Eşleşmesi:</strong> Eşit tutardaki borçlu ve alacaklı KOBİ'ler, sistem havuzunda SİRİUS adını verdiğimiz formül ile otomatik eşleştirilir.",
            how_c4: "<strong>4. Onay ve Tamamlama:</strong> Şirketiniz bir Sirius döngüsünde yer aldığında size ön onay bilgilendirmesi gelir. Onaylarınız dahilinde süreç resmen tamamlanır.",
            how_c5: "<strong>Kazanç Modeli:</strong> Sistem, mahsuplaşma işlemi başarıyla tamamlandığında, işlem gören borç/alacak tutarının %3 + KDV'si oranında hizmet bedeli alır. Bu sayede hem sistem sürdürülebilir olur hem de KOBİ'ler büyük nakit yükünden kurtulur.",

            // 7 Footer Modals

            // 1. Biz Kimiz?
            footer_modal_about_title: "Hakkımızda & Kurumsal",
            footer_modal_about: `
                <p>Likya Pay, geleneksel finans yöntemlerinin tıkandığı noktada, teknoloji ve hukuku birleştirerek reel sektöre can suyu olmak amacıyla kurulmuş yeni nesil bir finansal teknoloji şirketidir.</p>
                <br>
                <p>Temel uzmanlığımız; tedarik zincirleri içerisinde sıkışan ticari alacakların, nakit akışına ihtiyaç duyulmadan, çok taraflı mahsuplaşma (netting) algoritmalarıyla likide edilmesidir. Biz bir banka veya faktoring şirketi değiliz; biz şirketlerin bilançolarını optimize eden, ticari borçları 'akıllı takas' yöntemiyle kapatan stratejik bir çözüm ortağıyız.</p>
                <br>
                <p>Yazılım mühendisleri, finans uzmanları ve hukukçulardan oluşan kadromuzla, Türkiye'nin ticaret hacmini artırmak ve KOBİ'lerin finansal sağlığını korumak için çalışıyoruz.</p>
            `,

            // 2. Vizyon & Misyon
            footer_modal_vision_title: "Vizyonumuz ve Misyonumuz",
            footer_modal_vision: `
                <strong>Vizyonumuz:</strong>
                <p>"Tedarik zinciri finansmanında küresel bir standart oluşturarak; ticari borçların nakit dışı yöntemlerle, şeffaf, hızlı ve güvenli bir şekilde kapatıldığı, likidite sorununun teknoloji ile aşıldığı lider platform olmak."</p>
                <br>
                <strong>Misyonumuz:</strong>
                <p>"Şirketler arası karmaşık borç ilişkilerini yapay zeka destekli algoritmalarımızla çözmek, 6098 sayılı Türk Borçlar Kanunu çerçevesinde güvenli bir mahsuplaşma altyapısı sunmak ve üyelerimizin öz kaynaklarını koruyarak ticari sürdürülebilirliklerine katkıda bulunmak."</p>
            `,

            // 3. İletişim
            footer_modal_contact_title: "Bize Ulaşın",
            footer_modal_contact: `
                <p>"Sorularınız, iş birlikleriniz ve teknik destek talepleriniz için 7/24 yanınızdayız."</p>
                <br>
                <p><strong>Adres:</strong> Likya Pay Optimizasyon Hiz. Ltd. Şti. Büyükdere Cad. Maslak Plaza No:145, Kat:12 Sarıyer / İSTANBUL</p>
                <br>
                <p><strong>İletişim Kanalları:</strong></p>
                <ul>
                    <li>Telefon: 0850 123 45 67</li>
                    <li>E-Posta: info@likyapay.com</li>
                    <li>KEP Adresi: likyapay@hs01.kep.tr</li>
                    <li>Mersis No: 012345678900001</li>
                </ul>
                <br>
                <p><strong>Çalışma Saatleri:</strong> Pazartesi - Cuma: 09:00 - 18:00</p>
            `,

            // 4. Yasal Çerçeve (New)
            footer_modal_legal_title: "Yasal Çerçeve ve Faaliyet Alanı",
            footer_modal_legal: `
                <p>"Likya Pay Platformu, 6493 sayılı kanun kapsamında faaliyet gösteren bir Ödeme Kuruluşu veya Banka değildir. Platformumuz, kullanıcılarına finansal aracılık hizmeti vermez, mevduat toplamaz veya kredi kullandırmaz.</p>
                <br>
                <p><strong>Hukuki Dayanak:</strong> Platform üzerinde gerçekleşen tüm işlemler; 6098 Sayılı Türk Borçlar Kanunu'nun;</p>
                <ul class="list-disc pl-5 mt-2">
                    <li>183. ve devamı maddeleri (Alacağın Devri / Temlik)</li>
                    <li>139. ve devamı maddeleri (Takas / Mahsup)</li>
                </ul>
                <p class="mt-2">hükümlerine tam uyumlu olarak gerçekleştirilmektedir. Sistemde oluşan 'Döngü' ve 'Mahsuplaşma' işlemleri, tarafların ıslak veya güvenli elektronik imzaları (E-İmza) ile hukuki geçerlilik kazanan sözleşmeler bütünüdür."</p>
            `,

            // 5. Kullanım Koşulları
            footer_modal_terms_title: "Kullanıcı Sözleşmesi ve Şartlar",
            footer_modal_terms: `
                <p><strong>Tüzel Kişilik Şartı:</strong> Likya Pay sistemine yalnızca Vergi Mükellefi olan tüzel kişiler (Şirketler) ve şahıs şirketleri üye olabilir. Bireysel tüketici kullanımı için uygun değildir.</p>
                <br>
                <p><strong>Doğru Beyan:</strong> Kullanıcılar, sisteme yükledikleri fatura, borç ve alacak bilgilerinin doğruluğundan hukuken sorumludur. Yanıltıcı belge yüklenmesi durumunda üyelik derhal askıya alınır.</p>
                <br>
                <p><strong>Hizmet Bedeli:</strong> Mahsuplaşma işlemi başarıyla tamamlandığında, platform işlem hacmi üzerinden önceden belirtilen oranda 'Hizmet Bedeli' (Komisyon) tahsil eder. İşlem gerçekleşmezse ücret alınmaz.</p>
                <br>
                <p><strong>Sorumluluk Reddi:</strong> Likya Pay, taraflar arasındaki ticari anlaşmazlıkların tarafı değildir; sadece teknik altyapı sağlayıcısıdır.</p>
            `,

            // 6. Gizlilik Politikası
            footer_modal_privacy_title: "Gizlilik ve Veri Güvenliği Politikası",
            footer_modal_privacy: `
                <p>"Likya Pay olarak, ticari sırlarınızın ve finansal verilerinizin mahremiyetine en üst düzeyde önem veriyoruz.</p>
                <br>
                <p><strong>Veri Şifreleme:</strong> Tüm verileriniz 256-bit SSL sertifikası ile şifrelenmekte ve uluslararası güvenlik standartlarına sahip sunucularda saklanmaktadır.</p>
                <br>
                <p><strong>Ticari Sır:</strong> Sisteme girdiğiniz borç/alacak verileri, sadece 'Eşleşme (Döngü)' tespiti amacıyla algoritmalar tarafından işlenir. Onayınız olmadan 3. şahıslarla, diğer firmalarla veya kurumlarla kesinlikle paylaşılmaz.</p>
                <br>
                <p><strong>Denetim:</strong> Sistemimiz düzenli olarak bağımsız siber güvenlik firmaları tarafından penetrasyon testlerine tabi tutulmaktadır."</p>
            `,

            // 7. KVKK
            footer_modal_kvkk_title: "Kişisel Verilerin Korunması (KVKK)",
            footer_modal_kvkk: `
                <p><strong>Veri Sorumlusu:</strong> Likya Pay Optimizasyon Hiz. Ltd. Şti.</p>
                <br>
                <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ('KVKK') uyarınca; platformumuza üyelik aşamasında paylaştığınız Yetkili Adı, Soyadı, Telefon, E-posta ve İmza Sirküleri gibi kişisel verileriniz;</p>
                <ul class="list-disc pl-5 mt-2">
                    <li>Üyelik işlemlerinin teyidi,</li>
                    <li>Yasal sözleşmelerin oluşturulması,</li>
                    <li>Hizmet süreçlerinin yürütülmesi amacıyla işlenmektedir.</li>
                </ul>
                <br>
                <p>Verileriniz, yasal zorunluluklar (Maliye, Yargı vb.) haricinde açık rızanız olmaksızın üçüncü kişilere aktarılmaz. KVKK 11. madde kapsamındaki haklarınızı kullanmak için kvkk@likyapay.com adresine başvurabilirsiniz."</p>
            `
        }
    }
};


// --- FILE: frontend/anasayfa/InfoModal.js ---
// InfoModal Component
// Path: views/frontend/anasayfa/InfoModal.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.InfoModal = ({ title, content, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-fade-in-up">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 text-slate-600 leading-relaxed text-lg">
                    {content}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition">
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- FILE: frontend/anasayfa/Navbar.js ---
// Navbar Component
// Path: views/frontend/anasayfa/Navbar.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Navbar = ({ setView, toggleLoginModal, openModal, t }) => (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                <div className="flex items-center cursor-pointer gap-3" onClick={() => setView('home')}>
                    <div className="bg-white p-1 rounded-full shadow-lg border-2 border-gray-100 flex items-center justify-center w-16 h-16 md:w-24 md:h-24 hover:scale-105 transition-transform duration-300 relative z-10">
                        <img src="frontend/gorsel/logo.png" alt="Likya Pay" className="h-10 w-10 object-contain drop-shadow-sm hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="font-bold text-xl md:text-4xl tracking-tight text-brand-900 drop-shadow-sm hidden sm:block">likyapay</span>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    {/* Language toggle removed for now */}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openModal('nasil_calisir')}
                        className="hidden md:flex text-gray-600 hover:text-brand-600 font-medium transition items-center"
                    >
                        <i className="far fa-play-circle mr-2"></i> Sistem Nasıl Çalışır?
                    </button>
                    <button
                        onClick={toggleLoginModal}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full font-medium transition shadow-lg shadow-brand-500/30 flex items-center"
                    >
                        <i className="fas fa-sign-in-alt mr-2"></i> {t.login}
                    </button>
                </div>
            </div>
        </div>
    </nav>
);


// --- FILE: frontend/anasayfa/CycleAnimation.js ---

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.CycleAnimation = ({ t }) => {
    // 4 Companies: Top, Right, Bottom, Left positions in a square/circle
    // A -> B -> C -> D -> A

    // Step represents who is "paying" essentially, or where the active transfer focus is
    const [step, setStep] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => (s + 1) % 4);
        }, 1500); // Change step every 1.5 seconds
        return () => clearInterval(interval);
    }, []);

    // Positions for 4 nodes in a 300x300 box
    // Center is 150, 150. Radius 100.
    // 0: Top (150, 50)
    // 1: Right (250, 150)
    // 2: Bottom (150, 250)
    // 3: Left (50, 150)

    const nodes = [
        { id: 1, name: "A", x: 150, y: 50 },
        { id: 2, name: "B", x: 250, y: 150 },
        { id: 3, name: "C", x: 150, y: 250 },
        { id: 4, name: "D", x: 50, y: 150 }
    ];

    // SVG ViewBox is 0 0 300 300

    return (
        <div className="relative w-full max-w-sm mx-auto aspect-square">
            {/* Title Badge - Moved Outside to prevent clipping */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur z-30 shadow-lg">
                <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase whitespace-nowrap">{t.title}</span>
            </div>

            <div className="w-full h-full relative bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent pointer-events-none"></div>

                <div className="relative w-full h-full p-8 md:p-12">
                    <svg className="w-full h-full" viewBox="0 0 300 300">
                        <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="15" refY="3" orient="auto" fill="#60a5fa">
                                <path d="M0,0 L0,6 L6,3 z" />
                            </marker>
                            <linearGradient id="linkGradient" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>

                        {/* Inner Diamond Path for Pulse */}
                        <path
                            id="cyclePath"
                            d="M150,50 L250,150 L150,250 L50,150 L150,50"
                            fill="none"
                            stroke="url(#linkGradient)"
                            strokeWidth="2"
                        />

                        {/* Outer Orbit Path (Circle) */}
                        <circle cx="150" cy="150" r="135" fill="none" stroke="url(#linkGradient)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

                        {/* Outer Orbit Particles */}
                        <circle r="3" fill="#60a5fa">
                            <animateMotion
                                dur="8s"
                                repeatCount="indefinite"
                                path="M150,15 m0,0 a135,135 0 1,1 0,270 a135,135 0 1,1 0,-270"
                            />
                        </circle>
                        <circle r="3" fill="#8b5cf6">
                            <animateMotion
                                dur="8s"
                                begin="4s"
                                repeatCount="indefinite"
                                path="M150,15 m0,0 a135,135 0 1,1 0,270 a135,135 0 1,1 0,-270"
                            />
                        </circle>

                        {/* Active Link Highlight based on step */}
                        {/* 0: 0->1, 1: 1->2 ... */}
                        {/* We can just draw the lines manually */}
                        <line x1="150" y1="50" x2="250" y2="150" stroke={step === 0 ? "#60a5fa" : "#ffffff20"} strokeWidth={step === 0 ? "4" : "1"} markerEnd="url(#arrowhead)" className="transition-all duration-300" />
                        <line x1="250" y1="150" x2="150" y2="250" stroke={step === 1 ? "#60a5fa" : "#ffffff20"} strokeWidth={step === 1 ? "4" : "1"} markerEnd="url(#arrowhead)" className="transition-all duration-300" />
                        <line x1="150" y1="250" x2="50" y2="150" stroke={step === 2 ? "#60a5fa" : "#ffffff20"} strokeWidth={step === 2 ? "4" : "1"} markerEnd="url(#arrowhead)" className="transition-all duration-300" />
                        <line x1="50" y1="150" x2="150" y2="50" stroke={step === 3 ? "#60a5fa" : "#ffffff20"} strokeWidth={step === 3 ? "4" : "1"} markerEnd="url(#arrowhead)" className="transition-all duration-300" />

                    </svg>

                    {/* Nodes HTML Overlay */}
                    {nodes.map((node, i) => {
                        const isActive = step === i; // Being processed
                        // Calculate status text

                        // Positioning absolute based on %
                        const left = (node.x / 300) * 100;
                        const top = (node.y / 300) * 100;

                        return (
                            <div
                                key={node.id}
                                className={`absolute w-14 h-14 transform -translate-x-1/2 -translate-y-1/2 rounded-xl flex flex-col items-center justify-center border transition-all duration-500 shadow-lg
                                ${isActive ? 'bg-blue-600 border-blue-400 scale-110 ring-4 ring-blue-500/30 z-20' : 'bg-slate-800/80 border-slate-700 grayscale z-10'}
                            `}
                                style={{ left: `${left}%`, top: `${top}%` }}
                            >
                                <span className="text-white font-bold text-base">{node.name}</span>
                            </div>
                        );
                    })}

                    {/* Center Status */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-xl font-bold text-white mb-0 drop-shadow-lg tabular-nums tracking-tighter">
                            Sirius
                        </div>
                        <div className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold bg-blue-900/30 px-2 py-0.5 rounded">
                            {t.cleared}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- FILE: frontend/anasayfa/LoginModal.js ---
// LoginModal Component
// Path: views/frontend/anasayfa/LoginModal.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.LoginModal = ({ isOpen, onClose, onLogin, onRegisterClick }) => {
    if (!isOpen) return null;
    const [showPass, setShowPass] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Simulate network delay for UX
            await new Promise(r => setTimeout(r, 800));

            const response = await fetch('../data/api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("Invalid JSON Response:", text);
                throw new Error("Sunucu hatası: " + text.substring(0, 100));
            }

            if (data.success) {
                if (onLogin) {
                    onLogin(data.user.role, data.user);
                } else {
                    // Fallback if no handler provided
                    window.location.reload();
                }
            } else {
                alert("Giriş Başarısız: " + data.message);
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Bağlantı hatası oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all scale-100 hover:scale-[1.01] duration-300 border border-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white z-20 transition-colors"
                >
                    <i className="fas fa-times text-2xl drop-shadow-md"></i>
                </button>

                {/* Premium Header */}
                <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-blue-900 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 shadow-inner">
                            <i className="fas fa-user-lock text-3xl text-white"></i>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-1">Hoş Geldiniz</h2>
                        <p className="text-brand-100 text-sm font-medium">Likya Pay Güvenli Giriş Portalı</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">E-Posta Adresi</label>
                        <div className="relative group">
                            <i className="fas fa-envelope absolute left-4 top-4 text-gray-400 group-focus-within:text-brand-600 transition-colors"></i>
                            <input
                                type="email"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium text-gray-800 placeholder-gray-400"
                                placeholder="ornek@sirket.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Şifre</label>
                        <div className="relative group">
                            <i className="fas fa-lock absolute left-4 top-4 text-gray-400 group-focus-within:text-brand-600 transition-colors"></i>
                            <input
                                type={showPass ? "text" : "password"}
                                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium text-gray-800 placeholder-gray-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-brand-600 transition-colors"
                            >
                                <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>

                        <div className="flex justify-between items-center mt-3 px-1">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 transition cursor-pointer" />
                                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition">Beni Hatırla</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-800 transition">Şifremi Unuttum?</a>
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-800 hover:to-brand-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-circle-notch fa-spin"></i> Giriş Yapılıyor...
                            </>
                        ) : (
                            <>
                                Giriş Yap <i className="fas fa-arrow-right"></i>
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-gray-500 text-sm">
                            Hesabınız yok mu?
                            <button
                                type="button"
                                onClick={() => {
                                    if (onRegisterClick) onRegisterClick();
                                    else onClose();
                                }}
                                className="ml-1 font-bold text-brand-600 hover:text-brand-800 underline"
                            >
                                Hemen Başvurun
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- FILE: frontend/anasayfa/RegisterModal.js ---
// RegisterModal Component
// Path: views/frontend/anasayfa/RegisterModal.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.RegisterModal = ({ isOpen, onClose, onRegister, onLogin }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = React.useState({
        companyName: "",
        taxNumber: "",
        authorizedPerson: "",
        phone: "",
        email: "",
        password: ""
    });

    const [isLoading, setIsLoading] = React.useState(false);

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Input Masking
        if (name === 'phone') {
            value = value.replace(/\D/g, '');
            if (value.length > 0) value = '(' + value;
            if (value.length > 3) value = value.slice(0, 4) + ') ' + value.slice(4);
            if (value.length > 8) value = value.slice(0, 9) + ' ' + value.slice(9);
            if (value.length > 11) value = value.slice(0, 12) + ' ' + value.slice(12);
            value = value.slice(0, 15);
        }
        if (name === 'taxNumber') {
            value = value.replace(/\D/g, '');
            value = value.slice(0, 11);
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            alert("Şifreniz en az 6 karakter olmalıdır.");
            return;
        }
        if (formData.phone.length < 14) {
            alert("Lütfen geçerli bir telefon numarası giriniz.");
            return;
        }
        if (formData.taxNumber.length < 10) {
            alert("Geçerli bir Vergi Numarası veya T.C. Kimlik Numarası giriniz.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Register Request
            const response = await fetch('../data/api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, status: 'pending' })
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("Invalid JSON:", text);
                throw new Error("Sunucu yanıtı geçersiz.");
            }

            if (data.success) {
                // Auto Login Removed - User must wait for approval
                // Show success message
                // window.showToast logic or alert
                alert("Başvurunuz başarıyla alındı! Yönetici onayından sonra giriş yapabilirsiniz.");
                onClose();
            } else {
                alert("Kayıt Başarısız: " + data.message);
            }
        } catch (error) {
            console.error("Register Error:", error);
            alert("Kayıt sırasında bir hata oluştu: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-md animate-fade-in p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto relative transform transition-all border border-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-white/70 hover:text-white z-20 transition-colors bg-black/10 hover:bg-black/20 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm"
                >
                    <i className="fas fa-times text-lg"></i>
                </button>

                <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-blue-900 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    <h2 className="text-3xl font-bold relative z-10 mb-2">Likya Pay Dünyasına Katılın</h2>
                    <p className="text-brand-100 text-sm relative z-10 font-medium">Finansal operasyonlarınızı modernleştirmek için ilk adımı atın.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sol Kolon: Firma Bilgileri */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Firma Bilgileri</h3>

                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Firma Ünvanı</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                    required
                                    placeholder="Şirketinizin tam adı"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Vergi / T.C. No</label>
                                <input
                                    type="text"
                                    name="taxNumber"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium tracking-wide"
                                    required
                                    placeholder="1234567890"
                                    value={formData.taxNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Sağ Kolon: İletişim & Güvenlik */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Yetkili & Güvenlik</h3>

                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Ad Soyad</label>
                                <div className="relative">
                                    <i className="fas fa-user absolute left-4 top-3.5 text-gray-400 text-sm"></i>
                                    <input
                                        type="text"
                                        name="authorizedPerson"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                        required
                                        placeholder="Yetkili Kişi"
                                        value={formData.authorizedPerson}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Telefon</label>
                                <div className="relative">
                                    <i className="fas fa-phone absolute left-4 top-3.5 text-gray-400 text-sm"></i>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                        required
                                        placeholder="(5XX) XXX XX XX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Alt Kısım: Giriş Bilgileri (Full Width) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">E-Posta</label>
                            <div className="relative">
                                <i className="fas fa-envelope absolute left-4 top-3.5 text-gray-400 text-sm"></i>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                    required
                                    placeholder="kurumsal@eposta.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 group-focus-within:text-brand-600 transition-colors">Şifre Belirleyin</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-3.5 text-gray-400 text-sm"></i>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none font-medium"
                                    required
                                    placeholder="En az 6 karakter"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <i className="fas fa-circle-notch fa-spin"></i>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                            {isLoading ? 'İşleniyor...' : 'Başvuruyu Tamamla'}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                            Bu formu doldurarak <a href="#" className="font-bold text-brand-600 hover:text-brand-800 underline decoration-brand-200 underline-offset-2">Kullanıcı Sözleşmesi</a>'ni ve <br className="hidden md:block" />
                            <a href="#" className="font-bold text-brand-600 hover:text-brand-800 underline decoration-brand-200 underline-offset-2">KVKK Aydınlatma Metni</a>'ni okuduğunuzu ve kabul ettiğinizi beyan edersiniz.
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
};


// --- FILE: frontend/anasayfa/HeroSection.js ---
// HeroSection Component
// Path: views/frontend/anasayfa/HeroSection.js

window.Anasayfa = window.Anasayfa || {};


window.Anasayfa.HeroSection = ({ openModal, toggleRegisterModal, t }) => {
    const CycleAnimation = window.Anasayfa.CycleAnimation;



    // Generate Sirius Stars
    const stars = React.useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            size: Math.random() * 2 + 1 + 'px',
            duration: Math.random() * 3 + 2 + 's',
            delay: Math.random() * 5 + 's'
        }));
    }, []);

    return (
        <header className="hero-pattern pt-8 pb-40 relative overflow-hidden">
            {/* Background Gradient Blend */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-900/95 via-brand-800/90 to-brand-900/95"></div>

            {/* Sirius Stars */}
            {stars.map(star => (
                <div
                    key={star.id}
                    className="sirius-star"
                    style={{
                        left: star.left,
                        top: star.top,
                        width: star.size,
                        height: star.size,
                        '--duration': star.duration,
                        '--delay': star.delay
                    }}
                ></div>
            ))}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:items-start">

                    {/* Left Column: Text & CTA */}
                    <div className="text-center lg:text-left pt-0 lg:pt-0">
                        <div className="inline-flex items-center space-x-2 py-1 px-3 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold mb-6 backdrop-blur">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                            </span>
                            <span>{t.badge}</span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
                            {t.title_prefix} <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500 drop-shadow-md">{t.title_highlight}</span>
                            <br className="hidden lg:block" /> {t.title_suffix}
                        </h1>

                        <p className="text-lg lg:text-xl text-brand-100/80 mb-8 font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            {t.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                            <button
                                onClick={toggleRegisterModal}
                                className="group relative px-8 py-4 bg-white text-brand-900 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                <span className="flex items-center gap-3">
                                    {t.cta_join}
                                    <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                                </span>
                                <span className="absolute bottom-1 left-0 right-0 text-[10px] text-brand-900/60 font-medium uppercase tracking-wider text-center">{t.cta_join_sub}</span>
                            </button>

                            <button onClick={() => openModal('nasil_calisir')} className="px-8 py-4 bg-brand-800/50 hover:bg-brand-700/50 text-white rounded-xl font-medium border border-white/10 hover:border-white/30 backdrop-blur transition-all flex items-center justify-center gap-2">
                                <i className="fas fa-play-circle text-brand-300"></i>
                                {t.btn_how}
                            </button>
                        </div>


                    </div>

                    {/* Right Column: Animation & Visuals */}
                    <div className="relative pt-10 lg:pt-0">
                        {/* Blob Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[100px] animate-pulse"></div>

                        <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
                            <CycleAnimation t={t.cycle_anim} />
                        </div>


                    </div>

                </div>
            </div>
        </header>
    );
};



// --- FILE: frontend/anasayfa/Vizyon.js ---
// Vizyon Component
// Path: views/frontend/anasayfa/Vizyon.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Vizyon = ({ t }) => (
    <section id="vizyon" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

            {/* LİKYA PAY NEDİR? */}
            <div className="mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t.what_is_title}</h2>
                    <div className="w-24 h-1 bg-brand-500 mx-auto rounded-full"></div>
                </div>
                <div className="bg-blue-50 rounded-3xl p-8 md:p-12 border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl text-blue-900 -mr-10 -mt-10">
                        <i className="fas fa-question"></i>
                    </div>
                    <ul className="space-y-6 relative z-10">
                        <li className="flex items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30">
                                <i className="fas fa-network-wired"></i>
                            </div>
                            <div className="ml-6">
                                <h4 className="text-xl font-bold text-slate-800 mb-2">{t.card_1_title}</h4>
                                <p className="text-slate-600">{t.card_1_desc}</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30">
                                <i className="fas fa-handshake"></i>
                            </div>
                            <div className="ml-6">
                                <h4 className="text-xl font-bold text-slate-800 mb-2">{t.card_2_title}</h4>
                                <p className="text-slate-600">{t.card_2_desc}</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30">
                                <i className="fas fa-robot"></i>
                            </div>
                            <div className="ml-6">
                                <h4 className="text-xl font-bold text-slate-800 mb-2">{t.card_3_title}</h4>
                                <p className="text-slate-600">{t.card_3_desc}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* SİSTEM NASIL KAR EDER / ÇALIŞIR */}
            <div id="nasil-calisir" className="mb-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t.how_works_title}</h2>
                    <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6">1</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{t.step_1_title}</h3>
                        <p className="text-slate-600">{t.step_1_desc}</p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6">2</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{t.step_2_title}</h3>
                        <p className="text-slate-600">{t.step_2_desc}</p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6">3</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{t.step_3_title}</h3>
                        <p className="text-slate-600">{t.step_3_desc}</p>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6">4</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{t.step_4_title}</h3>
                        <p className="text-slate-600">{t.step_4_desc}</p>
                    </div>

                    {/* Step 5 */}
                    <div className="bg-green-600 p-8 rounded-2xl shadow-lg text-white hover:-translate-y-2 transition duration-300 lg:col-span-2">
                        <div className="flex items-center mb-6">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-bold text-2xl mr-4"><i className="fas fa-coins"></i></div>
                            <h3 className="text-2xl font-bold">{t.profit_model_title}</h3>
                        </div>
                        <p className="text-green-50 text-lg">
                            {t.profit_model_desc}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </section>
);


// --- FILE: frontend/anasayfa/Footer.js ---
// Footer Component
// Path: views/frontend/anasayfa/Footer.js

window.Anasayfa = window.Anasayfa || {};


window.Anasayfa.Footer = ({ t, openModal }) => (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-4 text-center md:text-left mb-8 md:mb-0">
                <h4 className="text-white font-bold text-xl tracking-wider mb-2">LİKYA PAY FİNANSAL OPTİMİZASYON HİZMETLERİ LTD.ŞTİ.</h4>
                <p className="text-sm text-slate-500">{t.slogan}</p>
            </div>

            <div className="border-t border-slate-800 col-span-1 md:col-span-4 pt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h4 className="text-white font-bold mb-4">{t.corporate}</h4>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => openModal('hakkimizda')} className="hover:text-white text-left">{t.who_we_are}</button></li>
                        <li><button onClick={() => openModal('vizyon')} className="hover:text-white text-left">{t.vision_mission}</button></li>
                        <li><button onClick={() => openModal('iletisim')} className="hover:text-white text-left">{t.contact}</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">{t.legal}</h4>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => openModal('framework')} className="hover:text-white text-left">{t.framework}</button></li>
                        <li><button onClick={() => openModal('terms')} className="hover:text-white text-left">{t.terms}</button></li>
                        <li><button onClick={() => openModal('privacy')} className="hover:text-white text-left">{t.privacy}</button></li>
                        <li><button onClick={() => openModal('kvkk')} className="hover:text-white text-left">{t.kvkk}</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">{t.contact}</h4>
                    <p className="text-sm font-semibold text-white mb-1">Çağlar TEZCAN</p>
                    <p className="text-xs text-slate-500 mb-2">{t.manager}</p>
                    <p className="text-sm mb-2"><i className="fas fa-phone-alt mr-2 text-brand-500"></i>0543 823 15 56</p>
                    <p className="text-sm">info@likyapay.com</p>
                </div>
                <div>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-brand-600 transition"><i className="fab fa-linkedin-in"></i></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-brand-600 transition"><i className="fab fa-twitter"></i></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-brand-600 transition"><i className="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        </div>
        <div className="text-center text-xs pt-8 border-t border-slate-800">
            {t.rights}
        </div>
    </footer>
);


// --- FILE: frontend/anasayfa/HomePage.js ---
// HomePage Aggregator Component
// Path: views/frontend/anasayfa/HomePage.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.LandingPage = ({ setView, toggleLoginModal, toggleRegisterModal }) => {
    const Navbar = window.Anasayfa.Navbar;
    const HeroSection = window.Anasayfa.HeroSection;
    const Vizyon = window.Anasayfa.Vizyon;
    const Footer = window.Anasayfa.Footer;
    const Intro = window.Anasayfa.Intro;
    const InfoModal = window.Anasayfa.InfoModal;
    // RegisterModal moved to App.js
    const Dictionary = window.Anasayfa.Dictionary;

    const [modal, setModal] = React.useState(null); // 'nasil_calisir', 'vizyon', ...

    // Default to TR, removing language selection logic
    const t = Dictionary.tr;
    const m = t.modals;

    const contents = {
        nasil_calisir: {
            title: m.how_title,
            content: (
                <div className="space-y-8">
                    {/* Visual Flow Steps */}
                    <div className="hidden md:flex justify-between items-start relative px-4">
                        {/* Connecting Line */}
                        <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 -z-10 transform translate-y-1/2"></div>

                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2">
                            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-lg">
                                <i className="fas fa-user-plus"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Ücretsiz Kayıt</h4>
                            <p className="text-xs text-gray-500">KOBİ'ler sisteme ücretsiz üye olur.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2">
                            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-lg">
                                <i className="fas fa-file-invoice"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Veri Yükleme</h4>
                            <p className="text-xs text-gray-500">Fatura ve borç bilgileri yüklenir.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2">
                            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-lg">
                                <i className="fas fa-project-diagram"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Sirius Eşleşmesi</h4>
                            <p className="text-xs text-gray-500">Yapay zeka döngüleri tespit eder.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center text-center w-1/4 px-2">
                            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mb-4 border-4 border-white shadow-lg">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Onay & Tamamlama</h4>
                            <p className="text-xs text-gray-500">Onayınızla borçlar silinir.</p>
                        </div>
                    </div>

                    {/* Detailed Text List (Mobile Friendly) */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 md:hidden">
                        <div className="flex gap-4 items-start">
                            <div className="min-w-[32px] h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                            <div>
                                <h4 className="font-bold text-brand-900 mb-1">Ücretsiz Kayıt</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">KOBİ'ler ve ticari kuruluşlar sisteme kayıt olur. Üyelik daima ücretsizdir ve ücretsiz kalacaktır.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="min-w-[32px] h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Veri Yükleme</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">Borçlu ve alacaklı şirketler, borç/alacak detaylarını resmi evrakları (fatura vb.) ile sisteme yükler.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="min-w-[32px] h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                            <div className="">
                                <h4 className="font-bold text-gray-900 mb-1">Sirius Eşleşmesi</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">Eşit tutardaki borçlu ve alacaklı KOBİ'ler, sistem havuzunda SİRİUS adını verdiğimiz formül ile otomatik eşleştirilir.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="min-w-[32px] h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">4</div>
                            <div className="">
                                <h4 className="font-bold text-gray-900 mb-1">Onay ve Tamamlama</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">Şirketiniz bir Sirius döngüsünde yer aldığında size ön onay bilgilendirmesi gelir. Onaylarınız dahilinde süreç resmen tamamlanır.</p>
                            </div>
                        </div>
                    </div>

                    {/* Profit Model Box */}
                    <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-xl p-6 text-white shadow-xl mt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <i className="fas fa-coins text-2xl text-yellow-400"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2 text-yellow-400">Kazanç Modeli</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    Sistem, mahsuplaşma işlemi başarıyla tamamlandığında, işlem gören borç/alacak tutarının <span className="text-white font-bold">%3 + KDV</span>'si oranında hizmet bedeli alır. Bu sayede hem sistem sürdürülebilir olur hem de KOBİ'ler büyük nakit yükünden kurtulur.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        vizyon: {
            title: m.footer_modal_vision_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_vision }}></div>
        },
        misyon: {
            title: m.footer_modal_vision_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_vision }}></div>
        },
        hakkimizda: {
            title: m.footer_modal_about_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_about }}></div>
        },
        iletisim: {
            title: m.footer_modal_contact_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_contact }}></div>
        },
        framework: {
            title: m.footer_modal_legal_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_legal }}></div>
        },
        terms: {
            title: m.footer_modal_terms_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_terms }}></div>
        },
        privacy: {
            title: m.footer_modal_privacy_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_privacy }}></div>
        },
        kvkk: {
            title: m.footer_modal_kvkk_title,
            content: <div dangerouslySetInnerHTML={{ __html: m.footer_modal_kvkk }}></div>
        }
    };

    return (
        <div className="animate-fade-in relative">
            <Navbar
                setView={setView}
                toggleLoginModal={toggleLoginModal}
                openModal={setModal}
                t={t.nav}
            />
            <Intro />
            <HeroSection openModal={setModal} toggleRegisterModal={toggleRegisterModal} t={t.hero} />
            <Vizyon t={t.vizyon} />
            <Footer t={t.footer} openModal={setModal} />


            {modal && contents[modal] && (
                <InfoModal
                    title={contents[modal].title}
                    content={contents[modal].content}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};


// --- FILE: frontend/admin/layout/Sidebar.js ---
// Sidebar Component
// Path: views/frontend/admin/layout/Sidebar.js

window.Admin = window.Admin || {};
window.Admin.Layout = window.Admin.Layout || {};

window.Admin.Layout.Sidebar = ({ view, setView, isOpen, setIsOpen, onLogout }) => {
    const companyMenu = [
        { id: 'dashboard', icon: 'fa-home', label: 'Panel Özeti' },
        { id: 'approvals', icon: 'fa-check-circle', label: 'Onay Bekleyenler', badge: '!' },
        { id: 'users', icon: 'fa-users', label: 'Üye İşlemleri' },
        { id: 'accounting', icon: 'fa-calculator', label: 'Muhasebe' },
        { id: 'sirius', icon: 'fa-infinity', label: 'Sirius Döngüleri', badge: 'YENİ' },
        { id: 'reports', icon: 'fa-chart-pie', label: 'Finansal Raporlar' }
    ];

    const settingsMenu = [
        { id: 'site_settings', icon: 'fa-sliders-h', label: 'Genel Ayarlar' },
        { id: 'content_manager', icon: 'fa-edit', label: 'İçerik Yönetimi' },
        { id: 'admin_users', icon: 'fa-user-shield', label: 'Yöneticiler' },
        { id: 'system_logs', icon: 'fa-terminal', label: 'Sistem Logları' }
    ];

    const MenuItem = ({ item }) => (
        <button
            onClick={() => setView(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${view === item.id
                ? 'bg-brand-800 text-white shadow-lg shadow-brand-900/50'
                : 'text-brand-300 hover:bg-white/5 hover:text-white'
                }`}
        >
            <div className={`w-8 flex justify-center mr-2 ${view === item.id ? 'text-emerald-400' : 'text-brand-400 group-hover:text-emerald-300'}`}>
                <i className={`fas ${item.icon} text-lg transition-transform group-hover:scale-110`}></i>
            </div>
            <span className="font-medium text-sm tracking-wide">{item.label}</span>
            {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    {item.badge}
                </span>
            )}
        </button>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`w-64 bg-brand-900 min-h-screen fixed left-0 top-0 text-white shadow-xl flex flex-col z-30 border-r border-brand-800 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-brand-800/50 bg-brand-900/50 backdrop-blur-sm">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-emerald-500/20">
                        <i className="fas fa-star text-white text-sm"></i>
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block leading-none">Likya Yönetim</span>
                        <span className="text-[10px] text-brand-400 font-medium tracking-widest uppercase">Admin v1.0</span>
                    </div>
                    {/* Close Button (Mobile Only) */}
                    <button onClick={() => setIsOpen(false)} className="md:hidden ml-auto text-white/50 hover:text-white">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Menu Container */}
                <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar">

                    {/* Group 1: Company Management */}
                    <div>
                        <h3 className="px-4 text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-3 flex items-center">
                            <i className="fas fa-building mr-2"></i>
                            Şirket Yönetimi
                        </h3>
                        {companyMenu.map(item => <MenuItem key={item.id} item={item} />)}
                    </div>

                    <div className="border-t border-brand-800/50 mx-2"></div>

                    {/* Group 2: Site Settings */}
                    <div>
                        <h3 className="px-4 text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-3 flex items-center">
                            <i className="fas fa-cogs mr-2"></i>
                            Site Ayarları
                        </h3>
                        {settingsMenu.map(item => <MenuItem key={item.id} item={item} />)}
                    </div>

                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center px-4 py-2 text-red-300 hover:text-red-100 transition group"
                    >
                        <i className="fas fa-sign-out-alt w-6 group-hover:animate-pulse"></i>
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </div>
        </>
    );
};


// --- FILE: frontend/admin/layout/Topbar.js ---
// Topbar Component
// Path: views/frontend/admin/layout/Topbar.js

window.Admin = window.Admin || {};
window.Admin.Layout = window.Admin.Layout || {};

window.Admin.Layout.Topbar = ({ isOpen, setIsOpen, onLogout }) => {
    return (

        <header className="h-12 bg-white border-b border-gray-200 w-full flex-shrink-0 z-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
            {/* Left: Hamburger & Breadcrumb */}
            <div className="flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden mr-4 text-gray-500 hover:text-brand-600 focus:outline-none"
                >
                    <i className="fas fa-bars text-lg"></i>
                </button>

                <div className="flex items-center text-gray-400 text-xs">
                    <span className="mr-2 hidden md:inline">Yönetim Paneli</span>
                    <i className="fas fa-chevron-right text-[10px] mx-2 hidden md:inline"></i>
                    <span className="text-gray-800 font-medium">Genel Bakış</span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-5">
                <button className="relative text-gray-400 hover:text-brand-600 transition">
                    <i className="fas fa-bell text-lg"></i>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-2 pl-3 md:pl-5 border-l border-gray-100">
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-gray-800">Admin User</div>
                        <div className="text-[10px] text-gray-500">Süper Yönetici</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-white shadow-sm">
                        AD
                    </div>
                    <button
                        onClick={onLogout}
                        className="ml-2 w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                        title="Güvenli Çıkış"
                    >
                        <i className="fas fa-power-off text-xs"></i>
                    </button>
                </div>
            </div>
        </header>
    );
};


// --- FILE: frontend/admin/layout/AdminLayout.js ---
// Admin Layout Wrapper
// Path: views/frontend/admin/layout/AdminLayout.js

window.Admin = window.Admin || {};
window.Admin.Layout = window.Admin.Layout || {};

window.Admin.Layout.Main = ({ children, view, setView, onLogout }) => {
    const Sidebar = window.Admin.Layout.Sidebar;
    const Topbar = window.Admin.Layout.Topbar;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Flex layout: Sidebar (fixed/static) + Main Content Area (flex-1)
    // Main Content Area: Topbar (sticky) + Page Content
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
            {/* Sidebar */}
            <Sidebar view={view} setView={setView} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} onLogout={onLogout} />

            {/* Main Wrapper */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'md:ml-64' : 'md:ml-64'}`}>
                {/* Header - No longer fixed, but sticky or part of flow */}
                <Topbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} onLogout={onLogout} />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-slate-50">
                    <div className="max-w-7xl mx-auto pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};


// --- FILE: frontend/admin/pages/DashboardHome.js ---
// Dashboard Home Page
// Path: views/frontend/admin/pages/DashboardHome.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.DashboardHome = ({ users, pendings, transactions, systemTransactions = [] }) => {
    // Dynamic Stats from Props
    // Calculate totals for reuse
    // Include PENDING transactions as requested ("Tüm kayıtlı borç/alacak")
    // Exclude only rejected or cancelled
    // Prepare Chart Data (Last 6 Months)
    const Recharts = window.Recharts;
    const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts || {};

    if (!Recharts) {
        console.warn("Recharts library is not loaded.");
    }

    // Calculate missing totals for summary stats
    const totalCredit = (transactions || []).filter(t => t.type === 'credit' && t.status !== 'pending').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    const totalDebt = (transactions || []).filter(t => t.type === 'debt' && t.status !== 'pending').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    const siriusIncome = (systemTransactions || []).filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

    const chartData = React.useMemo(() => {
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = date.toLocaleString('tr-TR', { month: 'short' });
            const monthKey = date.toISOString().slice(0, 7);

            const monthTotal = transactions
                .filter(t => t.date && t.date.slice(0, 7) === monthKey && t.status !== 'rejected')
                .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

            last6Months.push({ name: monthName, value: monthTotal });
        }
        return last6Months;
    }, [transactions]);

    const stats = [
        { id: 1, label: 'Toplam Şirket', value: users.length, icon: 'fa-building', color: 'bg-blue-500', trend: '+' },
        { id: 2, label: 'Bekleyen Onay', value: pendings.length, icon: 'fa-clock', color: 'bg-orange-500', trend: pendings.length > 0 ? '!' : '-' },
        { id: 5, label: 'Toplam Alacaklar', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalCredit), icon: 'fa-arrow-down', color: 'bg-teal-500', trend: '' },
        { id: 6, label: 'Toplam Borçlar', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalDebt), icon: 'fa-arrow-up', color: 'bg-rose-500', trend: '' },
        { id: 3, label: 'Aylık İşlem Hacmi', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(transactions.reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)), icon: 'fa-chart-line', color: 'bg-indigo-500', trend: '+' },
        { id: 4, label: 'Sirius Geliri', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(siriusIncome), icon: 'fa-coins', color: 'bg-amber-500', trend: '+' }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Panel Özeti</h1>
                    <p className="text-gray-500 text-sm mt-1">Sistemin genel durumunu buradan takip edebilirsiniz.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                        <i className="fas fa-calendar-alt mr-2"></i> Son 30 Gün
                    </button>
                    <button
                        onClick={() => window.open('../data/api/export.php?type=transactions&all=1', '_blank')}
                        className="bg-brand-900 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg"
                    >
                        <i className="fas fa-file-excel mr-2"></i> Rapor İndir (Excel)
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map(stat => (
                    <div key={stat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center text-xl ${stat.color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform`}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Chart & Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800">İşlem Hacmi Trendi (TL)</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Toplam Hacim
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        {Recharts ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value), 'Hacim']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400 border border-dashed rounded-lg">
                                <p>Grafik kütüphanesi yüklenemedi.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Hızlı Erişim</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <i className="fas fa-plus"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700">Yeni İşlem</div>
                                    <div className="text-xs text-slate-400">Muasebe kaydı oluştur</div>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <i className="fas fa-atom"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700">Sirius Başlat</div>
                                    <div className="text-xs text-slate-400">Takas motorunu çalıştır</div>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <i className="fas fa-file-pdf"></i>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700">Dışa Aktar</div>
                                    <div className="text-xs text-slate-400">Tüm verileri Excel'e al</div>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Financial Pool Summary */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Sistem Finansal Havuzu</h2>
                        <p className="text-gray-400 text-sm max-w-md">Kullanıcıların sisteme yüklediği toplam borç ve alacak tutarlarının anlık durumu.</p>
                    </div>

                    <div className="flex gap-8 w-full md:w-auto">
                        {/* Total Receivables (Approved Credits) */}
                        <div className="flex-1 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 min-w-[150px]">
                            <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <i className="fas fa-arrow-down mr-2"></i> Toplam Alacak
                            </div>
                            <div className="text-2xl font-mono font-bold">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
                                    transactions
                                        .filter(t => t.type === 'credit' && t.status !== 'pending')
                                        .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)
                                )}
                            </div>
                        </div>

                        {/* Total Debts (Approved Debts) */}
                        <div className="flex-1 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 min-w-[150px]">
                            <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <i className="fas fa-arrow-up mr-2"></i> Toplam Borç
                            </div>
                            <div className="text-2xl font-mono font-bold">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
                                    transactions
                                        .filter(t => t.type === 'debt' && t.status !== 'pending')
                                        .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-6">İşlem Hacmi Grafiği</h3>
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                        <div className="text-center">
                            <i className="fas fa-chart-area text-4xl mb-3"></i>
                            <p>Grafik Bileşeni Buraya Gelecek</p>
                        </div>
                    </div>
                </div>

                {/* Pending Tasks */}
                {/* Pending Tasks -> Converted to Recent Transactions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Son İşlemler (Canlı Akış)</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {transactions.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">Henüz işlem yok.</p>
                            </div>
                        ) : (
                            transactions.slice(0, 10).map(tx => (
                                <div key={tx.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${tx.type === 'debt' ? 'bg-red-500' : 'bg-green-500'
                                        }`}>
                                        <i className={`fas ${tx.type === 'debt' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            {/* Logic: Who is the actor? Usually UserID is creator. */}
                                            {/* API returns debter_name (u1) and creditor_name (u2) based on JOINs, need to respect transaction direction */}
                                            {/* If Debt: User(u1) Owes Related(u2). Display: u1 -> u2 */}
                                            {/* If Credit: User(u1) is Owed by Related(u2). Display: u2 -> u1 ? Or User -> Related (Credit) */}
                                            {/* Let's simlpify: Always Source -> Target based on flow */}
                                            {tx.type === 'debt'
                                                ? `${tx.debter_name || 'Bilinmeyen'} -> ${tx.creditor_name || '...'}`
                                                : `${tx.creditor_name || 'Bilinmeyen'} -> ${tx.debter_name || '...'}`
                                            }
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(tx.created_at).toLocaleDateString('tr-TR')} • {tx.type === 'debt' ? 'Borç' : 'Alacak'}
                                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${tx.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {tx.status === 'approved' || tx.status === 'verified' ? 'Onaylı' : 'Bekliyor'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className={`font-bold text-sm ${tx.type === 'debt' ? 'text-red-600' : 'text-green-600'}`}>
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tx.amount)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button className="w-full mt-6 text-brand-600 text-sm font-medium hover:text-brand-800 transition">
                        Tümünü Gör <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- FILE: frontend/admin/pages/Approvals.js ---
// Approvals Management Page
// Path: views/frontend/admin/pages/Approvals.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Approvals = ({ pendings, setPendings, users, setUsers }) => {
    // Mock Pending Users (Managed by Parent)

    const handleApprove = async (id) => {
        if (confirm('Bu şirketi onaylamak istediğinize emin misiniz?')) {
            try {
                // Determine new status (usually 'verified')
                const updatedUser = { id: id, status: 'verified' };

                // Call API Update (Using existing company.php with POST or specific endpoint? 
                // Currently companies.php doesn't support UPDATE nicely via POST without tweaks or we reuse create logic? 
                // Actually usually PUT or special endpoint. Let's assume we create a simple update script or use companies.php DELETE/POST combination? 
                // No, let's create a quick status update action in companies.php or new endpoint)

                // Better: Use a dedicated 'approve_user.php'
                const res = await fetch('../data/api/approve_user.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id, status: 'verified' })
                });

                const data = await res.json();

                if (data.success) {
                    // Update Local State in Parent (Ideally parent should handle this via callback, but we have setUsers)
                    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'verified' } : u));
                    window.showToast?.('Şirket onaylandı!', 'success');
                } else {
                    alert("Onay hatası: " + data.message);
                }

            } catch (err) {
                console.error(err);
                alert("Bir hata oluştu.");
            }
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Reddetme sebebini giriniz:");
        if (reason) {
            // API call to delete or ban
            try {
                const res = await fetch('../data/api/approve_user.php', {
                    method: 'POST', // Or DELETE
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id, status: 'rejected', reason: reason })
                });
                const data = await res.json();
                if (data.success) {
                    setUsers(prev => prev.filter(u => u.id !== id)); // Remove from list
                    window.showToast?.('Başvuru reddedildi.', 'info');
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Onay Bekleyen İşlemler</h1>
                    <p className="text-gray-500 text-sm">Yeni üyelik başvurularını inceleyin ve karara bağlayın.</p>
                </div>
                <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold text-sm">
                    Bekleyen: {pendings.length}
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {pendings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <i className="fas fa-check-circle text-4xl text-emerald-400 mb-3"></i>
                        <p className="text-gray-500">Bekleyen başvuru bulunmuyor. Harika!</p>
                    </div>
                ) : (
                    pendings.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 text-xl">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-gray-500 mt-1">
                                        <span><i className="fas fa-id-card mr-1"></i> {item.taxNo}</span>
                                        <span className="hidden md:inline">•</span>
                                        <span><i className="get fa-calendar-alt mr-1"></i> {item.date}</span>
                                    </div>
                                    <div className="mt-3">
                                        <a href="#" className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition">
                                            <i className="fas fa-file-pdf mr-2"></i>
                                            {item.doc} (Görüntüle)
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <button
                                    onClick={() => handleReject(item.id)}
                                    className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition"
                                >
                                    Reddet
                                </button>
                                <button
                                    onClick={() => handleApprove(item.id)}
                                    className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-500/20 transition"
                                >
                                    <i className="fas fa-check mr-2"></i> Onayla
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


// --- FILE: frontend/admin/pages/Users.js ---

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Users = () => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState("all");
    const [filterType, setFilterType] = React.useState("all"); // 'all', 'company', 'supplier', 'employee'

    // Modal & Selection States
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
    const [userTransactions, setUserTransactions] = React.useState([]);

    // Edit Mode State
    const [isEditing, setIsEditing] = React.useState(false);
    const [editingId, setEditingId] = React.useState(null);

    // Form State (New User / Edit User)
    const initialFormState = {
        title: '',
        taxNo: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        status: 'verified',
        password: '',
        account_type: 'company',
        permissions: { can_approve: false, can_accounting: false, can_settings: false }
    };
    const [newUser, setNewUser] = React.useState(initialFormState);

    // --- FETCH DATA ---
    const fetchUsers = async () => {
        setLoading(true);
        const apiUrl = '../data/api/companies.php?t=' + Date.now();

        try {
            const res = await fetch(apiUrl);
            const data = await res.json();

            if (data.records) {
                const formatted = data.records.map(u => ({
                    id: u.id,
                    title: u.name,
                    email: u.email,
                    taxNo: u.tax_id,
                    phone: u.phone || '-',
                    status: 'verified', // Backend mapping issue logic handled here or api
                    role: u.role,
                    account_type: u.account_type || 'company',
                    // Parse permissions safely
                    permissions: u.permissions
                        ? (typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions)
                        : {},
                    debt: 0, receivable: 0
                }));
                setUsers(formatted);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            // Optional: window.showToast('Hata: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    // --- ACTIONS ---

    const handlePermissionChange = (key) => {
        setNewUser(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
        }));
    };

    const resetForm = () => {
        setNewUser(initialFormState);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEditClick = (user) => {
        setNewUser({
            title: user.title,
            taxNo: user.taxNo,
            email: user.email,
            phone: user.phone,
            status: 'verified', // or user.status
            password: '', // Don't show password
            account_type: user.account_type || 'company',
            permissions: user.permissions || { can_approve: false, can_accounting: false, can_settings: false }
        });
        setIsEditing(true);
        setEditingId(user.id);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!confirm('Bu üyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            const response = await fetch('../data/api/delete_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (data.success) {
                // Remove from local state immediately
                setUsers(prev => prev.filter(u => u.id !== id));
                // Optional: window.showToast('Kullanıcı silindi.', 'success');
                alert('✅ Kullanıcı silindi.');
            } else {
                alert('❌ Silinemedi: ' + data.message);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert('Sunucu hatası oluştu.');
        }
    };

    const handleSaveUser = async () => {
        // Validation
        if (!newUser.title?.trim()) { alert("Lütfen Firma Ünvanını giriniz."); return; }
        if (!newUser.taxNo?.trim()) { alert("Lütfen Vergi Numarasını giriniz."); return; }
        if (!newUser.email?.trim()) { alert("Lütfen E-Posta adresini giriniz."); return; }
        if (!isEditing && (!newUser.password || newUser.password.length < 5)) {
            alert('Şifre en az 5 karakter olmalıdır.');
            return;
        }

        const payload = {
            companyName: newUser.title,
            taxNumber: newUser.taxNo,
            email: newUser.email,
            phone: newUser.phone,
            status: newUser.status,
            role: newUser.account_type === 'employee' ? 'admin' : 'user', // Basic role logic
            account_type: newUser.account_type,
            permissions: newUser.permissions,
            password: newUser.password
        };

        try {
            let url = '../data/api/register.php';
            if (isEditing) {
                url = '../data/api/update_user.php';
                payload.id = editingId;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Handle possible JSON parse error from PHP
            const text = await response.text();
            let resData;
            try {
                resData = JSON.parse(text);
            } catch (e) {
                console.error("Server Response Error:", text);
                alert("Sunucu hatası. Konsolu kontrol edin.");
                return;
            }

            if (resData.success) {
                alert(isEditing ? '✅ Kullanıcı güncellendi!' : '✅ Yeni üye eklendi!');
                setIsAddModalOpen(false);
                resetForm();
                fetchUsers();
            } else {
                alert('❌ İşlem Başarısız: ' + (resData.message || 'Bilinmeyen hata'));
            }

        } catch (err) {
            console.error("Save Error:", err);
            alert('Bir hata oluştu: ' + err.message);
        }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
        setUserTransactions([]);

        try {
            const res = await fetch(`../data/api/admin_transactions.php?user_id=${user.id}`);
            const data = await res.json();

            if (data.success && data.data) {
                const relevant = data.data.filter(t =>
                    t.user_id == user.id || t.related_user_id == user.id
                ).map(t => ({
                    id: t.id,
                    category: t.description || 'İşlem',
                    date: t.date,
                    amount: parseFloat(t.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺',
                    type: t.user_id == user.id ? (t.type === 'debt' ? 'outcome' : 'income') : (t.type === 'debt' ? 'income' : 'outcome')
                }));
                setUserTransactions(relevant);
            }
        } catch (err) {
            console.error("Tx load error", err);
        }
    };

    // --- HELPERS ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Onaylı</span>;
            case 'pending': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Onay Bekliyor</span>;
            case 'pre_approved': return <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">Ön Onaylı</span>;
            case 'banned': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Engelli</span>;
            default: return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Bilinmiyor</span>;
        }
    };

    const getFilterLabel = (type) => {
        switch (type) {
            case 'all': return 'Tüm Tipler';
            case 'company': return 'Firma';
            case 'supplier': return 'Tedarikçi';
            case 'employee': return 'Personel';
            default: return '';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'all': return 'Tüm Durumlar';
            case 'verified': return 'Onaylı';
            case 'pending': return 'Başvuru';
            case 'pre_approved': return 'Ön Onaylı';
            case 'banned': return 'Engelli';
            default: return '';
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.taxNo || '').includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        // Robust Type Checking
        const userType = (user.account_type || 'company').trim().toLowerCase();
        const matchesType = filterType === 'all' || userType === filterType;

        return matchesSearch && matchesStatus && matchesType;
    });

    // --- RENDER ---
    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Üye İşlemleri</h1>
                    <p className="text-gray-500 text-sm">Kayıtlı şirketleri listeleyin ve yönetin.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                    className="bg-brand-600 hover:bg-brand-700 text-gray-900 px-4 py-2 rounded-lg shadow-lg transition flex items-center"
                >
                    <i className="fas fa-plus mr-2"></i> Yeni Üye Ekle
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
                {/* Search & Top Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <i className="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="İsim, e-posta veya vergi no ara..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Tabs Group */}
                <div className="flex flex-col md:flex-row justify-between gap-4 border-t pt-4">
                    {/* Status Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'verified', 'pending', 'pre_approved', 'banned'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${filterStatus === status
                                    ? 'bg-gray-800 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'Tüm Durumlar' :
                                    status === 'verified' ? 'Onaylılar' :
                                        status === 'pending' ? 'Başvurular' :
                                            status === 'pre_approved' ? 'Ön Onay' : 'Engelliler'}
                            </button>
                        ))}
                    </div>

                    {/* Type Filters (NEW) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {[
                            { id: 'all', label: 'Tüm Tipler', icon: 'fas fa-layer-group' },
                            { id: 'company', label: 'Firmalar', icon: 'fas fa-briefcase' },
                            { id: 'supplier', label: 'Tedarikçiler', icon: 'fas fa-truck' },
                            { id: 'employee', label: 'Personeller', icon: 'fas fa-user-shield' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setFilterType(type.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-2 ${filterType === type.id
                                    ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-100'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <i className={type.icon}></i> {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Firma Bilgileri</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">İletişim</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tür / Durum</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center p-4">
                                            <i className="fas fa-search text-4xl text-gray-200 mb-4"></i>
                                            <p className="font-medium text-gray-600">Kayıt Bulunamadı</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {filterType !== 'all' ? getFilterLabel(filterType) + ' kategorisinde ' : ''}
                                                {filterStatus !== 'all' ? getStatusLabel(filterStatus) + ' durumunda ' : ''}
                                                herhangi bir veri eşleşmedi.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-blue-50/30 transition group">
                                        <td className="p-4 text-sm text-gray-400 font-mono">#{user.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{user.title}</div>
                                            <div className="text-xs text-gray-500">Vergi No: {user.taxNo}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-600">{user.email}</div>
                                            <div className="text-xs text-gray-400">{user.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                {getStatusBadge(user.status)}
                                                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${user.account_type === 'employee' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                    {user.account_type === 'company' ? 'Firma' :
                                                        user.account_type === 'supplier' ? 'Tedarikçi' : 'Personel'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition">
                                                <button onClick={() => handleViewUser(user)} className="w-8 h-8 rounded bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition" title="Detay"><i className="fas fa-eye"></i></button>
                                                <button onClick={() => handleEditClick(user)} className="w-8 h-8 rounded bg-gray-100 hover:bg-amber-500 hover:text-white flex items-center justify-center transition" title="Düzenle"><i className="fas fa-pen"></i></button>
                                                <button onClick={() => handleDeleteClick(user.id)} className="w-8 h-8 rounded bg-gray-100 hover:bg-red-500 hover:text-white flex items-center justify-center transition" title="Sil"><i className="fas fa-trash-alt"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Üye Düzenle' : 'Yeni Üye Ekle'}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 border-b pb-2">Firma Bilgileri</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Firma Ünvanı <span className="text-red-500">*</span></label>
                                            <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={newUser.title} onChange={e => setNewUser({ ...newUser, title: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Vergi No <span className="text-red-500">*</span></label>
                                            <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={newUser.taxNo} onChange={e => setNewUser({ ...newUser, taxNo: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 border-b pb-2">Güvenlik & İletişim</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta <span className="text-red-500">*</span></label>
                                            <input type="email" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre {!isEditing && <span className="text-red-500">*</span>}</label>
                                            <input type="password" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-red-50 text-red-700 font-mono" placeholder="*****" value={newUser.password || ''} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                            <input type="tel" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 border-b pb-2">Hesap Ayarları & Yetkiler (RBAC)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Türü</label>
                                            <select
                                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                                value={newUser.account_type}
                                                onChange={e => setNewUser({ ...newUser, account_type: e.target.value })}
                                            >
                                                <option value="company">Firma (Standart)</option>
                                                <option value="supplier">Tedarikçi</option>
                                                <option value="employee">Personel / Yetkili</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Durumu</label>
                                            <select
                                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                                value={newUser.status}
                                                onChange={e => setNewUser({ ...newUser, status: e.target.value })}
                                            >
                                                <option value="verified">Onaylı (Aktif)</option>
                                                <option value="pending">Onay Bekliyor</option>
                                                <option value="banned">Engelli / Pasif</option>
                                            </select>
                                        </div>
                                    </div>

                                    {newUser.account_type === 'employee' && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fade-in-up">
                                            <h4 className="font-bold text-blue-800 mb-3 text-sm flex items-center gap-2">
                                                <i className="fas fa-user-shield"></i> Personel Erişim Yetkileri
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <label className="flex items-center space-x-3 p-2 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                                                    <input type="checkbox" checked={newUser.permissions?.can_approve} onChange={() => handlePermissionChange('can_approve')} className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                                                    <span className="text-sm text-gray-700 font-medium">Üye Onaylayabilir</span>
                                                </label>
                                                <label className="flex items-center space-x-3 p-2 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                                                    <input type="checkbox" checked={newUser.permissions?.can_accounting} onChange={() => handlePermissionChange('can_accounting')} className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                                                    <span className="text-sm text-gray-700 font-medium">Muhasebe / Kasa Erişimi</span>
                                                </label>
                                                <label className="flex items-center space-x-3 p-2 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                                                    <input type="checkbox" checked={newUser.permissions?.can_settings} onChange={() => handlePermissionChange('can_settings')} className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                                                    <span className="text-sm text-gray-700 font-medium">Sistem Ayarlarını Yönetebilir</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-medium">İptal</button>
                                    <button type="submit" className="px-6 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 font-medium shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 active:scale-95">
                                        <i className="fas fa-save mr-2"></i> Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {isDetailModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Cari İşlem Detayı</h2>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                {selectedUser.title}
                                <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded text-gray-500">{selectedUser.account_type}</span>
                            </h3>

                            {userTransactions.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 text-left">Tarih</th>
                                            <th className="p-2 text-left">Açıklama</th>
                                            <th className="p-2 text-right">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userTransactions.map(t => (
                                            <tr key={t.id} className="border-b">
                                                <td className="p-2">{t.date}</td>
                                                <td className="p-2">
                                                    <span className={`block font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {t.type === 'income' ? 'ALACAK' : 'BORÇ'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{t.category}</span>
                                                </td>
                                                <td className="p-2 text-right font-bold">{t.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center text-gray-400 py-8 border-2 border-dashed rounded-xl">
                                    Bu cariye ait işlem kaydı bulunamadı.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- FILE: frontend/admin/pages/Accounting.js ---

// --- TRANSACTION MODAL ---
const TransactionModal = ({ isOpen, onClose, onSave, systemEntities }) => {
    if (!isOpen) return null;

    const [newTransaction, setNewTransaction] = React.useState({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: '',
        entityId: '', // Opsiyonel: Kayıtlı kullanıcılardan seçim
        customEntityName: '', // Opsiyonel: Manuel isim girişi
        desc: '',
        amount: ''
    });

    const [isEntityDropdownOpen, setIsEntityDropdownOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    const themeColor = newTransaction.type === 'income' ? 'emerald' : 'rose';
    const ThemeIcon = newTransaction.type === 'income' ? 'fas fa-arrow-down' : 'fas fa-arrow-up';

    const filteredEntities = (systemEntities || []).filter(entity =>
        (entity.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectEntity = (entity) => {
        setNewTransaction({ ...newTransaction, entityId: entity.id, customEntityName: entity.name });
        setIsEntityDropdownOpen(false);
        setSearchTerm('');
    };

    const validateAndSave = () => {
        if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
            alert('Lütfen geçerli bir tutar giriniz.');
            return;
        }
        if (!newTransaction.category) {
            alert('Lütfen bir kategori seçiniz.');
            return;
        }

        const entityName = newTransaction.customEntityName || (newTransaction.entityId ? systemEntities.find(e => e.id === newTransaction.entityId)?.name : '-') || '-';

        onSave({ ...newTransaction, entity_name: entityName });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 border-t-8 border-${themeColor}-500`}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                                {newTransaction.type === 'income' ? 'Para Girişi' : 'Para Çıkışı'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Muhasebe kaydı oluşturun.</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* İşlem Tipi Seçimi */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${newTransaction.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <i className="fas fa-arrow-down"></i> Gelir / Tahsilat
                            </button>
                            <button
                                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${newTransaction.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <i className="fas fa-arrow-up"></i> Gider / Ödeme
                            </button>
                        </div>

                        {/* Tutar ve Tarih */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tutar (₺)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className={`w-full pl-8 pr-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-${themeColor}-500 font-mono text-lg font-bold text-gray-800 transition`}
                                        value={newTransaction.amount}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        step="0.01"
                                    />
                                    <span className="absolute left-3 top-3.5 text-gray-400 font-bold">₺</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tarih</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-gray-400 font-medium text-gray-700"
                                    value={newTransaction.date}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kategori</label>
                            <select
                                className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-gray-400 bg-white"
                                value={newTransaction.category}
                                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                            >
                                <option value="">Seçiniz...</option>
                                {newTransaction.type === 'income' ? (
                                    <>
                                        <option value="Satış Geliri">Satış Geliri</option>
                                        <option value="Komisyon Geliri">Komisyon Geliri</option>
                                        <option value="Yatırım">Yatırım / Sermaye</option>
                                        <option value="Diğer Gelir">Diğer Gelir</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Personel Maaşı">Personel Maaşı</option>
                                        <option value="Kira">Kira / Ofis</option>
                                        <option value="Vergi">Vergi / Stopaj</option>
                                        <option value="Yazılım Gideri">Yazılım / Sunucu</option>
                                        <option value="Pazarlama">Reklam / Pazarlama</option>
                                        <option value="Diğer Gider">Diğer Gider</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Kaynak / Alıcı (Dropdown + Manuel Giriş) */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kaynak / Alıcı (Opsiyonel)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Kişi veya Kurum Adı"
                                    className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-gray-400 text-sm"
                                    value={newTransaction.customEntityName}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, customEntityName: e.target.value, entityId: '' })}
                                />
                                {systemEntities && systemEntities.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEntityDropdownOpen(!isEntityDropdownOpen)}
                                        className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-gray-600 transition"
                                        title="Listeden Seç"
                                    >
                                        <i className="fas fa-list"></i>
                                    </button>
                                )}
                            </div>

                            {isEntityDropdownOpen && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                                    <div className="p-2 sticky top-0 bg-white border-b">
                                        <input
                                            type="text"
                                            placeholder="Ara..."
                                            className="w-full px-2 py-1 bg-gray-50 border rounded text-sm"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {filteredEntities.map(entity => (
                                        <div
                                            key={entity.id}
                                            onClick={() => handleSelectEntity(entity)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                                        >
                                            <div className="font-bold text-gray-800">{entity.name}</div>
                                            <div className="text-xs text-gray-500">{entity.type === 'company' ? 'Firma' : 'Tedarikçi'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Açıklama */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Açıklama (Opsiyonel)</label>
                            <textarea
                                className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-gray-400 text-sm resize-none h-20"
                                placeholder="İşlem detayı..."
                                value={newTransaction.desc}
                                onChange={(e) => setNewTransaction({ ...newTransaction, desc: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">İptal</button>
                    <button
                        onClick={validateAndSave}
                        className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition bg-${themeColor}-600 hover:bg-${themeColor}-700 hover:shadow-${themeColor}-500/30`}
                    >
                        {newTransaction.type === 'income' ? 'Tahsilat Al' : 'Ödeme Yap'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- INVOICE MODAL ---
const InvoiceModal = ({ isOpen, onClose, onSave, systemEntities }) => {
    if (!isOpen) return null;

    const [invoice, setInvoice] = React.useState({
        recipient_name: '',
        tax_id: '',
        address: '',
        service: 'Yazılım Geliştirme Hizmeti',
        amount: '',
        vat_rate: 20
    });

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredEntities = (systemEntities || []).filter(e =>
        (e.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectEntity = (entity) => {
        setInvoice({
            ...invoice,
            recipient_name: entity.name,
            tax_id: entity.tax_id || '',
            address: entity.address || ''
        });
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const calculateTotal = () => {
        const amt = parseFloat(invoice.amount) || 0;
        const tax = amt * (invoice.vat_rate / 100);
        return { subtotal: amt, tax: tax, total: amt + tax };
    };

    const totals = calculateTotal();

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold">Resmi Fatura Oluştur</h2>
                        <p className="text-slate-400 text-sm">Fatura detaylarını giriniz.</p>
                    </div>
                    <button onClick={onClose}><i className="fas fa-times text-xl"></i></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b pb-2">Alicı Bilgileri</h3>

                        {/* Recipient Selection */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Müşteri / Kurum Adı</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={invoice.recipient_name}
                                    onChange={e => setInvoice({ ...invoice, recipient_name: e.target.value })}
                                    placeholder="Manuel giriş veya listeden seçin"
                                />
                                {systemEntities && systemEntities.length > 0 && (
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-slate-600"
                                        title="Listeden Seç"
                                    >
                                        <i className="fas fa-list"></i>
                                    </button>
                                )}
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                                    <div className="p-2 sticky top-0 bg-white border-b">
                                        <input
                                            type="text"
                                            placeholder="Ara..."
                                            className="w-full px-2 py-1 bg-slate-50 border rounded text-sm"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {filteredEntities.map(entity => (
                                        <div
                                            key={entity.id}
                                            onClick={() => handleSelectEntity(entity)}
                                            className="p-3 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-0"
                                        >
                                            <div className="font-bold text-slate-800">{entity.name}</div>
                                            <div className="text-xs text-slate-500">
                                                {entity.tax_id ? `VKN: ${entity.tax_id}` : 'VKN Yok'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vergi Numarası / T.C.</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2"
                                value={invoice.tax_id}
                                onChange={e => setInvoice({ ...invoice, tax_id: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Adres</label>
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
                                value={invoice.address}
                                onChange={e => setInvoice({ ...invoice, address: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b pb-2">Hizmet Detayları</h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hizmet Adı</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2"
                                value={invoice.service}
                                onChange={e => setInvoice({ ...invoice, service: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tutar (KDV Hariç)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-400">₺</span>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg pl-8 pr-3 py-2 font-bold text-lg"
                                    value={invoice.amount}
                                    onChange={e => setInvoice({ ...invoice, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">KDV Oranı (%)</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2"
                                value={invoice.vat_rate}
                                onChange={e => setInvoice({ ...invoice, vat_rate: parseInt(e.target.value) })}
                            >
                                <option value="0">0%</option>
                                <option value="1">1%</option>
                                <option value="10">10%</option>
                                <option value="20">20%</option>
                            </select>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Ara Toplam:</span>
                                <span className="font-bold">{totals.subtotal.toFixed(2)} ₺</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>KDV ({invoice.vat_rate}%):</span>
                                <span className="font-bold">{totals.tax.toFixed(2)} ₺</span>
                            </div>
                            <div className="flex justify-between text-lg font-black text-slate-800 border-t pt-2 mt-2">
                                <span>GENEL TOPLAM:</span>
                                <span>{totals.total.toFixed(2)} ₺</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-200">İptal</button>
                    <button
                        onClick={() => onSave(invoice)}
                        className="px-8 py-2 rounded-lg font-bold text-white bg-slate-900 hover:bg-black shadow-lg"
                    >
                        Faturayı Oluştur
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- PRINTABLE INVOICE TEMPLATE ---
const PrintableInvoice = ({ data, onClose }) => {
    if (!data) return null;
    const details = data.details ? JSON.parse(data.details) : {};

    // Auto-print
    React.useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <div className="fixed inset-0 bg-white z-[1000] overflow-auto">
            <div className="max-w-[210mm] mx-auto p-12 bg-white min-h-screen relative">
                {/* Close Button for Screen */}
                <button onClick={onClose} className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded no-print font-bold shadow-lg">
                    <i className="fas fa-times mr-2"></i> Kapat
                </button>

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">LikyaPay</h1>
                        <p className="text-sm font-bold text-slate-500">TEKNOLOJİ A.Ş.</p>
                        <div className="mt-4 text-xs text-slate-600">
                            Maslak Mah. Büyükdere Cad.<br />
                            No: 123, Sarıyer / İSTANBUL<br />
                            V.D: Maslak / 1234567890<br />
                            Mersis: 012345678900001
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-light text-slate-300 uppercase">E-Arşiv Fatura</h2>
                        <div className="mt-4 space-y-1">
                            <div className="flex justify-end gap-4"><span className="font-bold text-slate-500">Fatura No:</span> <span className="font-mono font-bold">LKY2026-{data.id.toString().padStart(6, '0')}</span></div>
                            <div className="flex justify-end gap-4"><span className="font-bold text-slate-500">Tarih:</span> <span>{data.date}</span></div>
                        </div>
                    </div>
                </div>

                {/* Recipient */}
                <div className="mb-12 p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">SAYIN:</h3>
                    <div className="text-xl font-bold text-slate-900 mb-1">{details.recipient_name || data.entity_name}</div>
                    <div className="text-sm text-slate-600 mb-4 whitespace-pre-line">{details.address || 'Adres bilgisi girilmedi.'}</div>
                    <div className="text-sm">
                        <span className="font-bold text-slate-500">Vergi No / T.C.:</span> {details.tax_id || '---'}
                    </div>
                </div>

                {/* Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left py-3 font-bold uppercase text-xs">Hizmet / Açıklama</th>
                            <th className="text-right py-3 font-bold uppercase text-xs w-32">Adet</th>
                            <th className="text-right py-3 font-bold uppercase text-xs w-32">Birim Fiyat</th>
                            <th className="text-right py-3 font-bold uppercase text-xs w-32">Toplam</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-4 border-b border-slate-100">
                                <div className="font-bold text-slate-900">{details.service || data.category}</div>
                                <div className="text-xs text-slate-500">{data.description}</div>
                            </td>
                            <td className="py-4 border-b border-slate-100 text-right">1</td>
                            <td className="py-4 border-b border-slate-100 text-right">{parseFloat(data.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                            <td className="py-4 border-b border-slate-100 text-right font-bold">{parseFloat(data.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-1/3 space-y-3">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Ara Toplam</span>
                            <span>{parseFloat(data.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>KDV (%{details.vat_rate || 20})</span>
                            <span>{(parseFloat(data.amount) * ((details.vat_rate || 20) / 100)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t-2 border-slate-900">
                            <span>GENEL TOPLAM</span>
                            <span>{(parseFloat(data.amount) * (1 + ((details.vat_rate || 20) / 100))).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-slate-400 mt-20 border-t pt-8">
                    <p>LikyaPay Teknoloji A.Ş. - Mersis: 012345678900001 - Ticaret Sicil: 123456</p>
                    <p>Bu belge 5070 sayılı Elektronik İmza Kanunu kapsamında elektronik olarak imzalanmıştır.</p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};

// --- MAIN ACCOUNTING PAGE ---
window.Admin.Pages.Accounting = ({ users }) => {
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('cash'); // 'cash' | 'invoices'

    const [cashTransactions, setCashTransactions] = React.useState([]);
    const [invoiceTransactions, setInvoiceTransactions] = React.useState([]);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);
    const [printInvoiceData, setPrintInvoiceData] = React.useState(null);

    const [stats, setStats] = React.useState({ income: 0, expense: 0, balance: 0 });

    const systemEntities = React.useMemo(() => {
        if (!users) return [];
        return users.map(u => ({
            id: u.id,
            name: u.title || u.name,
            type: u.user_type || 'company',
            tax_id: u.tax_id || '',
            address: u.address || ''
        }));
    }, [users]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch System Transactions (Accountant Records)
            const resCash = await fetch('../data/api/system_accounting.php?t=' + Date.now()).then(r => r.json());

            if (resCash.success && Array.isArray(resCash.data)) {
                setCashTransactions(resCash.data);
                calculateStats(resCash.data);

                // Filter for "Official Invoices" (Income from Sales/Commission)
                setInvoiceTransactions(resCash.data.filter(t =>
                    t.type === 'income' &&
                    ['Satış Geliri', 'Komisyon Geliri', 'Yazılım', 'Hizmet Bedeli'].includes(t.category)
                ));
            }

        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (txList) => {
        let inc = 0, exp = 0;
        txList.forEach(t => { const val = parseFloat(t.amount); if (t.type === 'income') inc += val; else exp += val; });
        setStats({ income: inc, expense: exp, balance: inc - exp });
    };

    React.useEffect(() => { fetchData(); }, []);

    const handleSaveTransaction = async (transaction) => {
        // ... (Existing Save Logic)
        try {
            const payload = {
                type: transaction.type, category: transaction.category,
                entity_name: transaction.entity_name, entity_id: transaction.entityId,
                description: transaction.desc, amount: transaction.amount, date: transaction.date
            };
            const response = await fetch('../data/api/system_accounting.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (data.success) { alert('✅ İşlem başarıyla kaydedildi.'); setIsModalOpen(false); fetchData(); }
            else { alert('❌ Kayıt Başarısız: ' + data.message); }
        } catch (err) { alert('Bir hata oluştu.'); }
    };

    const handleSaveInvoice = async (inv) => {
        try {
            const payload = {
                type: 'income',
                category: 'Satış Geliri', // Default for invoice
                entity_name: inv.recipient_name,
                description: inv.service,
                amount: inv.amount,
                date: new Date().toISOString().split('T')[0],
                details: JSON.stringify(inv) // Store full details
            };

            const response = await fetch('../data/api/system_accounting.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Fatura başarıyla oluşturuldu.');
                setIsInvoiceModalOpen(false);
                fetchData();
            }
            else { alert('❌ Kayıt Başarısız: ' + data.message); }
        } catch (err) { alert('Bir hata oluştu.'); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        try {
            await fetch('../data/api/system_accounting.php', { method: 'DELETE', body: JSON.stringify({ id }) });
            fetchData();
        } catch (e) { }
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Muhasebe Paneli</h1>
                    <p className="text-gray-500 font-medium">Finansal hareketleri ve faturaları yönetin.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('cash')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'cash' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Kasa Hareketleri</button>
                    <button onClick={() => setActiveTab('invoices')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'invoices' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Faturalar</button>
                </div>
            </div>

            {activeTab === 'cash' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-emerald-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
                            <div className="text-sm opacity-80 mb-1">Toplam Gelir</div>
                            <div className="text-3xl font-black">{stats.income.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                        </div>
                        <div className="bg-rose-500 rounded-2xl p-6 text-white shadow-lg shadow-rose-200">
                            <div className="text-sm opacity-80 mb-1">Toplam Gider</div>
                            <div className="text-3xl font-black">{stats.expense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                            <div className="text-sm text-gray-400 mb-1">Net Kasa</div>
                            <div className={`text-3xl font-black ${stats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {stats.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={() => setIsModalOpen(true)} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition flex items-center gap-2"><i className="fas fa-plus"></i> Kasa Giriş/Çıkış</button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase w-12 text-center">Yön</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tarih</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Kategori</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Açıklama</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Tutar</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {cashTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-center">
                                            <i className={`fas ${t.type === 'income' ? 'fa-arrow-down text-emerald-500' : 'fa-arrow-up text-rose-500'}`}></i>
                                        </td>
                                        <td className="p-4 font-bold text-gray-700 text-sm">{t.date}</td>
                                        <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{t.category}</span></td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {t.description}
                                            {t.entity_name && <div className="text-xs text-gray-400 mt-0.5"><i className="fas fa-user-tag"></i> {t.entity_name}</div>}
                                        </td>
                                        <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{parseFloat(t.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                        <td className="p-4 text-right"><button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500"><i className="fas fa-trash"></i></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <div className="font-bold text-gray-700">Resmi Fatura Listesi</div>
                        <button
                            onClick={() => setIsInvoiceModalOpen(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <i className="fas fa-file-invoice"></i> Yeni Fatura Kes
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Belge No</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Müşteri / Kurum</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tutar (KDV Hariç)</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tarih</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Kategori</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoiceTransactions.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-gray-400">Kesilen fatura bulunamadı.</td></tr> :
                                invoiceTransactions.map(inv => (
                                    <tr key={inv.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono text-xs text-gray-500">LKY-{inv.id}</td>
                                        <td className="p-4 font-bold text-gray-700">{inv.entity_name || 'Bilinmiyor'}</td>
                                        <td className="p-4 font-bold text-emerald-600">{parseFloat(inv.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                        <td className="p-4 text-sm text-gray-500">{inv.date}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-blue-50 text-blue-700">
                                                {inv.category}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2 justify-end">
                                            <button onClick={() => window.open(`../data/api/system_accounting.php?action=print_invoice&id=${inv.id}`, '_blank')} className="text-slate-400 hover:text-indigo-600 transition" title="Yazdır">
                                                <i className="fas fa-print"></i>
                                            </button>
                                            <button onClick={() => handleDelete(inv.id)} className="text-slate-400 hover:text-rose-600 transition" title="Sil">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTransaction} systemEntities={systemEntities} />
            <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} onSave={handleSaveInvoice} systemEntities={systemEntities} />

            {/* Printable Invoice Overlay */}
            {printInvoiceData && <PrintableInvoice data={printInvoiceData} onClose={() => setPrintInvoiceData(null)} />}
        </div>
    );
};


// --- FILE: frontend/admin/pages/AdminUsers.js ---
// Admin User Management Page
// Path: views/frontend/admin/pages/AdminUsers.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};


window.Admin.Pages.AdminUsers = ({ showToast }) => {
    // State
    const [admins, setAdmins] = React.useState([
        { id: 1, name: 'Admin User', email: 'admin@likyapay.com', role: 'super_admin', status: 'active', lastLogin: 'Şimdi' },
        { id: 2, name: 'Merve Yılmaz', email: 'merve@likyapay.com', role: 'sales_marketing', status: 'active', lastLogin: '2 gün önce' },
        { id: 3, name: 'Ahmet Demir', email: 'ahmet@likyapay.com', role: 'it_support', status: 'active', lastLogin: '1 saat önce' },
        { id: 4, name: 'Zeynep Kara', email: 'zeynep@likyapay.com', role: 'finance', status: 'active', lastLogin: 'Dün' }
    ]);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalMode, setModalMode] = React.useState('add'); // 'add' or 'edit'
    const [currentAdmin, setCurrentAdmin] = React.useState({ name: '', email: '', role: 'sales_marketing', status: 'active', permissions: [] });

    // Role Logic - Corporate Standards
    const roles = {
        super_admin: { label: 'Genel Müdür / CEO (Süper Admin)', color: 'bg-purple-100 text-purple-700', desc: 'Tam Yetkili Erişim' },
        finance: { label: 'Finansman ve Muhasebe', color: 'bg-green-100 text-green-700', desc: 'Bütçe ve Raporlama Yetkisi' },
        operations: { label: 'Operasyon Sorumlusu', color: 'bg-blue-100 text-blue-700', desc: 'Günlük İşleyiş ve Denetim' },
        it_support: { label: 'Bilgi Teknolojileri (IT)', color: 'bg-indigo-100 text-indigo-700', desc: 'Sistem ve Teknik Destek' },
        sales_marketing: { label: 'Satış ve Pazarlama', color: 'bg-orange-100 text-orange-700', desc: 'Müşteri ve Kampanya Yönetimi' },
        hr: { label: 'İnsan Kaynakları', color: 'bg-pink-100 text-pink-700', desc: 'Personel Yönetimi' },
        customer_relations: { label: 'Müşteri İlişkileri', color: 'bg-teal-100 text-teal-700', desc: 'Destek ve İletişim' },
        legal: { label: 'Hukuk Departmanı', color: 'bg-red-100 text-red-700', desc: 'Yasal Süreçler' },
        intern: { label: 'Stajyer', color: 'bg-gray-100 text-gray-700', desc: 'Kısıtlı Görüntüleme' }
    };

    const allPermissions = [
        { id: 'manage_users', label: 'Üye Yönetimi (Ekle/Sil/Düzenle)' },
        { id: 'view_reports', label: 'Finansal Raporları Görüntüle' },
        { id: 'manage_settings', label: 'Site Ayarlarını Değiştir' },
        { id: 'manage_content', label: 'İçerik Yönetimi' },
        { id: 'system_logs', label: 'Sistem Loglarını İncele' }
    ];

    const handleDelete = (id) => {
        if (confirm('Bu yöneticiyi silmek istediğinize emin misiniz?')) {
            setAdmins(admins.filter(admin => admin.id !== id));
            window.showToast('Yönetici başarıyla silindi.', 'success');
        }
    };

    const handleEdit = (admin) => {
        setModalMode('edit');
        setCurrentAdmin({ ...admin, permissions: ['manage_users', 'view_reports'] }); // Mock permissions
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setModalMode('add');
        setCurrentAdmin({ name: '', email: '', role: 'editor', status: 'active', permissions: [] });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!currentAdmin.name || !currentAdmin.email) {
            window.showToast('Lütfen isim ve e-posta alanlarını doldurun.', 'error');
            return;
        }

        if (modalMode === 'add') {
            const newId = admins.length + 1;
            setAdmins([...admins, { ...currentAdmin, id: newId, lastLogin: '-' }]);
            window.showToast('Yeni yönetici eklendi.', 'success');
        } else {
            setAdmins(admins.map(a => a.id === currentAdmin.id ? { ...currentAdmin, lastLogin: a.lastLogin } : a));
            window.showToast('Yönetici bilgileri güncellendi.', 'success');
        }
        setIsModalOpen(false);
    };

    const togglePermission = (permId) => {
        if (currentAdmin.permissions.includes(permId)) {
            setCurrentAdmin({ ...currentAdmin, permissions: currentAdmin.permissions.filter(p => p !== permId) });
        } else {
            setCurrentAdmin({ ...currentAdmin, permissions: [...currentAdmin.permissions, permId] });
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Yöneticiler & Personel</h1>
                    <p className="text-gray-500 text-sm">Panel erişimi olan şirket çalışanlarını yönetin ve yetkilendirin.</p>
                </div>
                <button onClick={handleAdd} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-brand-700 transition">
                    <i className="fas fa-user-shield mr-2"></i> Yeni Yönetici Ekle
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-3">Kullanıcı</th>
                            <th className="px-6 py-3">Rol / Yetki</th>
                            <th className="px-6 py-3">E-Posta</th>
                            <th className="px-6 py-3">Son Giriş</th>
                            <th className="px-6 py-3">Durum</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {admins.map(admin => (
                            <tr key={admin.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {admin.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-800">{admin.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded w-fit mb-1 ${roles[admin.role]?.color || 'bg-gray-100'}`}>
                                            {roles[admin.role]?.label}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{roles[admin.role]?.desc}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{admin.lastLogin}</td>
                                <td className="px-6 py-4">
                                    {admin.status === 'active'
                                        ? <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded border border-green-100">Aktif</span>
                                        : <span className="text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded border border-gray-200">Pasif</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(admin)} className="text-gray-400 hover:text-brand-600 transition"><i className="fas fa-edit"></i></button>
                                        {admin.role !== 'super_admin' && (
                                            <button onClick={() => handleDelete(admin.id)} className="text-gray-400 hover:text-red-500 transition"><i className="fas fa-trash-alt"></i></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{modalMode === 'add' ? 'Yeni Yönetici Ekle' : 'Yönetici Düzenle'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={currentAdmin.name}
                                    onChange={e => setCurrentAdmin({ ...currentAdmin, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="Örn: Ahmet Yılmaz"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresi</label>
                                <input
                                    type="email"
                                    value={currentAdmin.email}
                                    onChange={e => setCurrentAdmin({ ...currentAdmin, email: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="ornek@likyapay.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol Seçimi</label>
                                    <select
                                        value={currentAdmin.role}
                                        onChange={e => setCurrentAdmin({ ...currentAdmin, role: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                    >
                                        {Object.entries(roles).map(([key, role]) => (
                                            <option key={key} value={key}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Durumu</label>
                                    <select
                                        value={currentAdmin.status}
                                        onChange={e => setCurrentAdmin({ ...currentAdmin, status: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Pasif / Askıda</option>
                                    </select>
                                </div>
                            </div>

                            {/* Permission Checkboxes */}
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Özel Yetkilendirme (Kısıtlamalar)</label>
                                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 h-40 overflow-y-auto">
                                    {allPermissions.map(perm => (
                                        <label key={perm.id} className="flex items-center cursor-pointer hover:bg-white p-1 rounded transition">
                                            <input
                                                type="checkbox"
                                                checked={currentAdmin.permissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">* Süper Admin rolü tüm yetkilere sahiptir.</p>
                            </div>

                            <button onClick={handleSave} className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg mt-2">
                                {modalMode === 'add' ? 'Yöneticiyi Kaydet' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- FILE: frontend/admin/pages/Reports.js ---
// Financial Reports Page
// Path: views/frontend/admin/pages/Reports.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Reports = ({ transactions, setTransactions }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <style>{`
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    body { background: white !important; }
                    button, .sidebar, header, .no-print { display: none !important; }
                    .min-h-screen { height: auto !important; }
                    /* Expand content */
                    .flex-1 { margin: 0 !important; padding: 0 !important; }
                    
                    table { width: 100% !important; border-collapse: collapse; font-size: 10pt; color: black !important; }
                    th, td { border: 1px solid #ddd !important; padding: 8px !important; }
                    /* Cards */
                    .grid { display: flex !important; gap: 20px; margin-bottom: 20px; }
                    .grid > div { flex: 1; border: 1px solid #ccc; box-shadow: none; }
                }
            `}</style>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Finansal Raporlar</h1>
                    <p className="text-gray-500 text-sm">Gerçekleşen mahsuplaşma işlemleri ve komisyon gelirleri.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                        <i className="fas fa-filter mr-2"></i> Filtrele
                    </button>
                    <button onClick={() => window.print()} className="bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-800 transition shadow">
                        <i className="fas fa-print mr-2"></i> Yazdır / PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase">Toplam İşlem Hacmi</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
                            transactions.reduce((acc, t) => acc + t.amount, 0)
                        )}
                    </h3>
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                        <i className="fas fa-minus mr-1"></i> Veri Yok
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase">Toplam Komisyon Geliri</p>
                    <h3 className="text-2xl font-bold text-brand-600 mt-2">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(
                            transactions.reduce((acc, t) => acc + t.commission, 0)
                        )}
                    </h3>
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                        <i className="fas fa-minus mr-1"></i> Veri Yok
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase">Başarılı Döngü</p>
                    <h3 className="text-2xl font-bold text-purple-600 mt-2">{transactions.length}</h3>
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                        <i className="fas fa-minus mr-1"></i> Veri Yok
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-700">Son İşlem Hareketleri</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-3">İşlem ID</th>
                                <th className="px-6 py-3">Tarih</th>
                                <th className="px-6 py-3">Taraflar (Borçlu &rarr; Alacaklı)</th>
                                <th className="px-6 py-3">Tutar</th>
                                <th className="px-6 py-3">Komisyon</th>
                                <th className="px-6 py-3">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((t, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{t.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-800">{t.firmA}</span>
                                            <i className="fas fa-arrow-right text-xs text-gray-400"></i>
                                            <span className="font-medium text-gray-800">{t.firmB}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                                        +{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.commission)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {t.status === 'completed' ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Tamamlandı</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">İşleniyor</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- FILE: frontend/admin/pages/GeneralSettings.js ---
// General Site Settings Page
// Path: views/frontend/admin/pages/GeneralSettings.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.GeneralSettings = ({ showToast }) => {
    // Initial State
    const [settings, setSettings] = React.useState({
        siteTitle: 'Likya Pay | Yeni Nesil Finansal Optimizasyon',
        contactEmail: 'destek@likyapay.com',
        maintenanceMode: false,
        logoPreview: null
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, logoPreview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();

        // Validation
        if (!settings.siteTitle || !settings.contactEmail) {
            window.showToast('Lütfen zorunlu alanları doldurunuz.', 'error');
            return;
        }

        // Simulate API delay
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Kaydediliyor...';

        setTimeout(() => {
            window.showToast('Site ayarları başarıyla güncellendi.', 'success');
            if (btn) btn.innerHTML = originalText;

            // Console log to verify data
            console.log('Saved Settings:', settings);
        }, 800);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Genel Site Ayarları</h1>
            <p className="text-gray-500 text-sm">Sitenin temel konfigürasyonunu buradan yönetebilirsiniz.</p>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Site Başlığı <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="siteTitle"
                            value={settings.siteTitle}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo Yükle</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden relative group">
                                {settings.logoPreview ? (
                                    <img src={settings.logoPreview} alt="Logo Önizleme" className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fas fa-image text-gray-300 text-2xl"></i>
                                )}
                            </div>
                            <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                                <i className="fas fa-upload mr-2"></i> Dosya Seç
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                            </label>
                            {settings.logoPreview && (
                                <button type="button" onClick={() => setSettings(p => ({ ...p, logoPreview: null }))} className="text-red-500 hover:text-red-700 text-sm">Orjinale Dön</button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">İletişim E-posta Adresi <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={settings.contactEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bakım Modu</label>
                        <label className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`block w-10 h-6 rounded-full transition ${settings.maintenanceMode ? 'bg-brand-600' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${settings.maintenanceMode ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-600 font-medium">Siteyi bakıma al (Ziyaretçilere 'Bakımdayız' sayfası gösterilir)</span>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button type="submit" className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition shadow-lg flex items-center">
                            <i className="fas fa-save mr-2"></i> Ayarları Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- FILE: frontend/admin/pages/ContentManager.js ---
// Content Management Page
// Path: views/frontend/admin/pages/ContentManager.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.ContentManager = ({ showToast }) => {
    const [activeTab, setActiveTab] = React.useState('hero');
    const [isLoading, setIsLoading] = React.useState(false);

    // Initial Content State matching Homepage
    const [content, setContent] = React.useState({
        hero: {
            title: "Tüm Tahsilat Sürecinizi Kolaylıkla Yönetebilirsiniz.",
            subtitle: "Likya Pay, şirketler arası borç/alacak döngülerini tespit eder ve nakit akışına ihtiyaç duymadan mahsuplaşma sağlar. Finansal süreçlerinizi optimize edin.",
            ctaButton: "Hemen Başvur"
        },
        features: {
            title: "Likya Pay Nasıl Çalışır?",
            subtitle: "Karmaşık borç zincirlerini basitleştiren yenilikçi teknoloji.",
            card1Title: "Ağ Analizi",
            card1Desc: "Yapay zeka destekli algoritmamız, şirketler arasındaki karmaşık borç ağlarını anlık olarak analiz eder.",
            card2Title: "Döngü Tespiti",
            card2Desc: "Sistem, nakit akışı gerektirmeyen kapalı borç döngülerini otomatik olarak tespit eder (A -> B -> C -> A)."
        },
        vision: {
            title: "Vizyonumuz",
            description: "Likya Pay olarak hedefimiz, işletmelerin nakit akışı problemlerini en aza indirerek finansal sürdürülebilirliği artırmaktır."
        },
        footer: {
            address: "Maslak Mah. Büyükdere Cad. No:123, Sarıyer/İstanbul",
            email: "info@likyapay.com",
            phone: "+90 (212) 555 00 00"
        }
    });

    const handleChange = (section, field, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            window.showToast('İçerik güncellemeleri başarıyla kaydedildi.', 'success');
            console.log("Saved Content:", content);
        }, 1000);
    };

    const tabs = [
        { id: 'hero', label: 'Hero (Giriş)', icon: 'fa-home' },
        { id: 'features', label: 'Özellikler', icon: 'fa-star' },
        { id: 'vision', label: 'Vizyon & Hakkımızda', icon: 'fa-eye' },
        { id: 'footer', label: 'Footer & İletişim', icon: 'fa-info-circle' }
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">İçerik Yönetimi</h1>
                    <p className="text-gray-500 text-sm">Web sitesinin görünen yüzünü buradan yönetin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 transition shadow-lg flex items-center"
                >
                    {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                    {isLoading ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition ${activeTab === tab.id
                                    ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600'
                                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                                    }`}
                            >
                                <i className={`fas ${tab.icon} w-6 text-center mr-2 ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-400'}`}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">

                    {/* Hero Tab */}
                    {activeTab === 'hero' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Hero (Giriş) Bölümü</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ana Başlık (H1)</label>
                                <input
                                    type="text"
                                    value={content.hero.title}
                                    onChange={(e) => handleChange('hero', 'title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Açıklama</label>
                                <textarea
                                    rows="3"
                                    value={content.hero.subtitle}
                                    onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Buton Metni</label>
                                <input
                                    type="text"
                                    value={content.hero.ctaButton}
                                    onChange={(e) => handleChange('hero', 'ctaButton', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Features Tab */}
                    {activeTab === 'features' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Özellikler Bölümü</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bölüm Başlığı</label>
                                    <input
                                        type="text"
                                        value={content.features.title}
                                        onChange={(e) => handleChange('features', 'title', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bölüm Alt Başlığı</label>
                                    <input
                                        type="text"
                                        value={content.features.subtitle}
                                        onChange={(e) => handleChange('features', 'subtitle', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-600 mb-3">Kart 1</h4>
                                    <input
                                        type="text"
                                        placeholder="Başlık"
                                        value={content.features.card1Title}
                                        onChange={(e) => handleChange('features', 'card1Title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                                    />
                                    <textarea
                                        rows="2"
                                        placeholder="Açıklama"
                                        value={content.features.card1Desc}
                                        onChange={(e) => handleChange('features', 'card1Desc', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    ></textarea>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-600 mb-3">Kart 2</h4>
                                    <input
                                        type="text"
                                        placeholder="Başlık"
                                        value={content.features.card2Title}
                                        onChange={(e) => handleChange('features', 'card2Title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                                    />
                                    <textarea
                                        rows="2"
                                        placeholder="Açıklama"
                                        value={content.features.card2Desc}
                                        onChange={(e) => handleChange('features', 'card2Desc', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vision Tab */}
                    {activeTab === 'vision' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Vizyon & Misyon</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                                <input
                                    type="text"
                                    value={content.vision.title}
                                    onChange={(e) => handleChange('vision', 'title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vizyon Metni</label>
                                <textarea
                                    rows="5"
                                    value={content.vision.description}
                                    onChange={(e) => handleChange('vision', 'description', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* Footer Tab */}
                    {activeTab === 'footer' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Footer & İletişim</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                                <input
                                    type="text"
                                    value={content.footer.address}
                                    onChange={(e) => handleChange('footer', 'address', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">E-Posta</label>
                                    <input
                                        type="email"
                                        value={content.footer.email}
                                        onChange={(e) => handleChange('footer', 'email', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                                    <input
                                        type="tel"
                                        value={content.footer.phone}
                                        onChange={(e) => handleChange('footer', 'phone', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};


// --- FILE: frontend/admin/pages/SystemLogs.js ---
// System Logs Page
// Path: views/frontend/admin/pages/SystemLogs.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.SystemLogs = () => {
    return (
        <div className="animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Sistem Logları</h1>
            <p className="text-gray-500 text-sm">Sistemsel hareketler ve güvenlik kayıtları.</p>

            <div className="bg-black text-green-400 p-6 rounded-xl shadow-lg font-mono text-sm h-96 overflow-y-auto">
                <p><span className="text-gray-500">[2024-12-31 13:05:00]</span> SYSTEM STARTUP: Admin panel initialized.</p>
                <p><span className="text-gray-500">[2024-12-31 13:05:02]</span> AUTH: Admin user logged in from IP 192.168.1.1</p>
                <p><span className="text-gray-500">[2024-12-31 12:45:10]</span> CRON: Daily backup completed successfully.</p>
                <p><span className="text-gray-500">[2024-12-31 11:30:22]</span> USER: New registration request (ID: 204) received.</p>
                <p><span className="text-gray-500">[2024-12-31 10:15:00]</span> ERROR: Failed to connect to mail server (Retrying...)</p>
                <p><span className="text-gray-500">[2024-12-31 10:15:05]</span> INFO: Mail server connected.</p>
                <p className="animate-pulse mt-2">_ Waiting for new logs...</p>
            </div>
        </div>
    );
};


// --- FILE: frontend/admin/pages/Sirius.js ---
// Sirius Admin Management Page
// Path: views/frontend/admin/pages/Sirius.js

window.Admin = window.Admin || {};
window.Admin.Pages = window.Admin.Pages || {};

window.Admin.Pages.Sirius = () => {
    const [stats, setStats] = React.useState({ active_groups: 0, total_volume: 0, pending_requests: 0 });
    const [groups, setGroups] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedGroup, setSelectedGroup] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('active');

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('../data/api/sirius.php?action=list_all_cycles');
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                setGroups(data.data);

                // Calculate Stats from Real Data
                const active = data.data.filter(g => g.status === 'detected' || g.status === 'approved').length;
                const vol = data.data.reduce((acc, g) => acc + parseFloat(g.total_volume), 0);

                // Pending requests cannot be fetched easily from cycles API, set as placeholder or separate fetch
                setStats({ active_groups: active, total_volume: vol, pending_requests: '-' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleRunEngine = async () => {
        try {
            const res = await fetch('../data/api/sirius.php?action=run_engine', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                alert("✅ " + data.message);
                fetchData();
            } else {
                alert("Bilgi: " + data.message);
            }
        } catch (e) {
            alert("Sunucu hatası veya yetki sorunu.");
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Bu Sirius grubunu onaylamak ve vergi numaralarına göre ödeme sürecini başlatmak istiyor musunuz?')) return;

        try {
            const res = await fetch('../data/api/sirius.php?action=approve_cycle', {
                method: 'POST',
                body: JSON.stringify({ id: id })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ " + data.message);
                fetchData();
                setSelectedGroup(null);
            } else {
                alert("Hata: " + data.message);
            }
        } catch (e) {
            alert("İşlem hatası.");
        }
    };

    const handleFinalize = async (id) => {
        if (!confirm('Tüm yasal süreç tamamlandı. Döngüyü kapatıp borçları silmek istiyor musunuz?')) return;
        setLoading(true);
        try {
            const res = await fetch('../data/api/sirius.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'finalize_cycle', id: id })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ " + data.message);
                // Refresh data
                fetchData();
                setSelectedGroup(null);
            } else {
                alert("Hata: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Sunucu hatası.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayment = async (cycle_id, target_tax_id) => {
        if (!confirm('Ödemeyi onaylıyor musunuz?')) return;
        try {
            const res = await fetch('../data/api/sirius.php?action=approve_payment', {
                method: 'POST',
                body: JSON.stringify({ cycle_id, target_tax_id })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                const updatedGroup = { ...selectedGroup };
                // Basic Optimistic Update or just refetch
                fetchData();
                setSelectedGroup(null); // Close to force refresh logic simplistically
            }
        } catch (e) { alert("Hata"); }
    };

    const handleApproveContract = async (cycleId, targetTaxId) => {
        try {
            const res = await fetch('../data/api/sirius.php?action=approve_contract', {
                method: 'POST',
                body: JSON.stringify({ cycle_id: cycleId, target_tax_id: targetTaxId })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Sözleşme Onaylandı");
                fetchData();
                setSelectedGroup(null);
            }
        } catch (e) { alert("Hata"); }
    };



    const handleSendReminders = async (id) => {
        try {
            const res = await fetch('../data/api/sirius.php?action=send_reminders', {
                method: 'POST',
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            alert(data.message);
        } catch (e) { alert("Hatırlatma gönderilemedi"); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu döngüyü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
        try {
            const res = await fetch('../data/api/sirius.php?action=delete_cycle', {
                method: 'POST',
                body: JSON.stringify({ id: id })
            });
            const data = await res.json();
            if (data.success) {
                alert("🗑️ " + data.message);
                fetchData();
                setSelectedGroup(null);
            } else { alert("Hata: " + data.message); }
        } catch (e) { alert("Hata"); }
    };

    const handleDownloadDoc = async (userId, type) => {
        // userId here is actually tax_id based on current usage
        // But user side usually uses 'download_contract' action with type 'temlik' or 'mahsuplasma'.
        // Admin needs to specify WHICH user's contract.
        // We'll trust the User Side API 'download_contract' but need to pass specific params or create a new Admin Action.
        // Let's create a NEW Admin action: 'admin_download_contract' in sirius.php

        window.open(`../data/api/sirius.php?action=admin_download_contract&cycle_id=${selectedGroup.id}&tax_id=${userId}&type=${type}`, '_blank');
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <i className="fas fa-atom text-indigo-600 animate-spin-slow"></i>
                        Sirius Döngü Yönetimi
                    </h1>
                    <p className="text-slate-500 font-medium">Sistemdeki ticari takas döngülerini izleyin ve onaylayın.</p>
                </div>
                <button
                    onClick={handleRunEngine}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <i className="fas fa-play"></i> Motoru Çalıştır
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Aktif Gruplar</div>
                    <div className="text-3xl font-black text-slate-800">{stats.active_groups}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Toplam İşlem Hacmi</div>
                    <div className="text-3xl font-black text-indigo-600">₺{stats.total_volume.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-400 text-sm font-bold uppercase mb-1">Bekleyen Talepler</div>
                    <div className="text-3xl font-black text-orange-500">{stats.pending_requests}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 font-bold border-b-2 transition ${activeTab === 'active' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Aktif Döngüler ({groups.filter(g => g.status !== 'completed').length})
                </button>
                <button
                    onClick={() => setActiveTab('archive')}
                    className={`px-6 py-3 font-bold border-b-2 transition ${activeTab === 'archive' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Arşiv ({groups.filter(g => g.status === 'completed').length})
                </button>
            </div>

            {/* Groups List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[300px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {activeTab === 'active' ? 'Devam Eden Süreçler' : 'Tamamlanmış Döngüler (Arşiv)'}
                    </h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Sıralama: Hacim (Yüksek &rarr; Düşük)</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400">
                        <i className="fas fa-circle-notch fa-spin text-3xl mb-4"></i>
                        <p>Analiz ediliyor...</p>
                    </div>
                ) : groups.filter(g => activeTab === 'active' ? g.status !== 'completed' : g.status === 'completed').length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-4xl">
                            <i className="fas fa-cubes"></i>
                        </div>
                        <p className="font-medium">
                            {activeTab === 'active' ? 'Henüz aktif bir döngü yok.' : 'Arşivde kayıtlı döngü bulunmuyor.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {groups.filter(g => activeTab === 'active' ? g.status !== 'completed' : g.status === 'completed').map(group => (
                            <div key={group.id} className="p-6 hover:bg-slate-50 transition group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                            {group.cycle_code ? group.cycle_code.split('-')[1] : group.id}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">Sirius Grubu #{group.cycle_code || group.id}</h4>
                                            <div className="text-xs text-slate-400 font-mono">HASH: {group.cycle_hash ? group.cycle_hash.green : 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-800">₺{parseFloat(group.total_volume).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                                        <div className="text-xs font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded inline-block mt-1">
                                            {group.status === 'detected' ? 'Onay Bekliyor' : group.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Chain Visualization */}
                                <div className="bg-slate-100 rounded-xl p-4 overflow-x-auto">
                                    <div className="flex items-center gap-3">
                                        {group.node_names && group.node_names.map((name, i) => {
                                            // Find edge detail amount
                                            // details is array [ {from, to, amount}, ... ] ordered same as path
                                            // The amount for arrow after node i is usually at index i
                                            let amountLabel = null;
                                            if (group.details && group.details[i]) {
                                                amountLabel = "₺" + parseFloat(group.details[i].amount).toLocaleString('tr-TR');
                                            } else if (group.total_volume) {
                                                // Fallback if details missing (for old records)
                                                amountLabel = "₺" + parseFloat(group.total_volume).toLocaleString('tr-TR');
                                            }

                                            return (
                                                <React.Fragment key={i}>
                                                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-sm font-bold text-slate-700 whitespace-nowrap">
                                                        {name}
                                                    </div>
                                                    {i < group.node_names.length - 1 && (
                                                        <div className="flex flex-col items-center px-2">
                                                            <span className="text-[10px] font-bold text-slate-400 mb-0.5">{amountLabel}</span>
                                                            <i className="fas fa-arrow-right text-slate-300"></i>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setSelectedGroup(group)}
                                        className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-200 font-bold text-sm"
                                    >
                                        İncele
                                    </button>
                                    {group.status === 'detected' && (
                                        <button
                                            onClick={() => handleApprove(group.id)}
                                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-200"
                                        >
                                            Grubu Onayla & Başlat
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {/* INSPECT MODAL */}
            {
                selectedGroup && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800">Sirius Grubu Detayları</h3>
                                    <p className="text-sm text-slate-500">#{selectedGroup.cycle_code || selectedGroup.id} - {selectedGroup.status === 'detected' ? 'Onay Bekliyor' : 'İşleme Alındı'}</p>
                                </div>
                                <button onClick={() => setSelectedGroup(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Summary Card */}
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-center justify-between">
                                    <div>
                                        <div className="text-indigo-600 font-bold text-sm uppercase mb-1">Mahsuplaşılacak Tutar</div>
                                        <div className="text-3xl font-black text-indigo-900">₺{parseFloat(selectedGroup.total_volume).toLocaleString('tr-TR')}</div>
                                        <p className="text-xs text-indigo-600/70 mt-1">Bu gruptaki tüm üyeler bu tutar kadar borçtan kurtulacak.</p>
                                    </div>
                                    <div className="text-4xl text-indigo-200">
                                        <i className="fas fa-handshake"></i>
                                    </div>
                                </div>

                                {/* Node List Table */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <i className="fas fa-users text-slate-400"></i>
                                        Döngü Katılımcıları & İşlemler
                                    </h4>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-3 pl-4">Borçlu (Kimden)</th>
                                                    <th className="p-3 text-center"><i className="fas fa-arrow-right"></i></th>
                                                    <th className="p-3">Alacaklı (Kime)</th>
                                                    <th className="p-3 text-right">Mevcut Borç</th>
                                                    <th className="p-3 text-right text-green-600">Simule Edilen</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedGroup.node_names && selectedGroup.node_names.map((name, i) => {
                                                    const nextIndex = (i + 1) % selectedGroup.node_names.length;
                                                    const nextName = selectedGroup.node_names[nextIndex];
                                                    // Adjust detail access logic if details are not perfectly aligned with nodes
                                                    // Assuming details[i] corresponds to edge (nodes[i] -> nodes[i+1])
                                                    const currentDetail = selectedGroup.details ? selectedGroup.details[i] : null;
                                                    const originalDebt = currentDetail ? parseFloat(currentDetail.amount) : 0;
                                                    const clearedAmount = parseFloat(selectedGroup.total_volume);

                                                    return (
                                                        <tr key={i} className="hover:bg-slate-50">
                                                            <td className="p-3 pl-4 font-bold text-slate-700">{name}</td>
                                                            <td className="p-3 text-center text-slate-300"><i className="fas fa-angle-right"></i></td>
                                                            <td className="p-3 font-medium text-slate-600">{nextName}</td>
                                                            <td className="p-3 text-right font-mono text-slate-500">
                                                                {originalDebt > 0 ? "₺" + originalDebt.toLocaleString('tr-TR') : "-"}
                                                            </td>
                                                            <td className="p-3 text-right font-bold text-green-600 font-mono">
                                                                -₺{clearedAmount.toLocaleString('tr-TR')}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-slate-50 text-slate-500 text-xs p-4 rounded-xl leading-relaxed">
                                    <strong className="text-slate-700 block mb-1">Nasıl Çalışır?</strong>
                                    Bu döngüdeki her bir üye, bir sonraki üyeye borçludur. En düşük borç tutarı ({parseFloat(selectedGroup.total_volume).toLocaleString('tr-TR')} TL) baz alınarak, zincirdeki herkesin borcundan bu tutar düşülür. Böylece nakit kullanmadan borçlar temizlenir.
                                </div>

                                {/* STATUS TRACKING DOMAIN */}
                                {selectedGroup.status !== 'detected' && selectedGroup.status !== 'completed' && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <h4 className="font-bold text-slate-800 mb-2">Süreç Takibi: {selectedGroup.status === 'payment_stage' ? 'Ödeme Bekleniyor' : 'Yasal Onay'}</h4>
                                        <div className="space-y-2">
                                            {selectedGroup.node_names.map((name, i) => {
                                                const nodes = JSON.parse(selectedGroup.nodes || '[]');
                                                const tax_id = nodes[i];

                                                const ps = JSON.parse(selectedGroup.payment_status || '{}');
                                                const ls = JSON.parse(selectedGroup.legal_status || '{}');

                                                const payStatus = ps[tax_id] || 'pending';
                                                const legalStatus = ls[tax_id] || 'pending';

                                                return (
                                                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 hover:shadow-sm transition">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-slate-700">{name}</div>
                                                            <div className="text-xs text-slate-400 font-mono">{tax_id}</div>
                                                        </div>

                                                        <div className="flex gap-4">
                                                            {/* Service Fee Status */}
                                                            <div className="flex flex-col items-end w-32">
                                                                <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Hizmet Bedeli</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${payStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                                        payStatus === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                        {payStatus === 'pending' && 'Bekliyor'}
                                                                        {payStatus === 'submitted' && 'Ödeme Yaptı'}
                                                                        {payStatus === 'approved' && 'Onaylandı'}
                                                                    </span>
                                                                    {(payStatus === 'submitted' && selectedGroup.status === 'processing') && (
                                                                        <button onClick={() => handleApprovePayment(selectedGroup.id, tax_id)} className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700" title="Ödemeyi Onayla">
                                                                            <i className="fas fa-check text-xs"></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Contract Status */}
                                                            <div className="flex flex-col items-end w-32 border-l pl-4 border-slate-100">
                                                                <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Sözleşme</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${legalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                                        legalStatus === 'signed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                        {legalStatus === 'pending' && 'Bekliyor'}
                                                                        {legalStatus === 'signed' && 'İmzaladı'}
                                                                        {legalStatus === 'approved' && 'Onaylandı'}
                                                                    </span>
                                                                    {(legalStatus === 'signed' && selectedGroup.status === 'processing') && (
                                                                        <button onClick={() => handleApproveContract(selectedGroup.id, tax_id)} className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700" title="Sözleşmeyi Onayla">
                                                                            <i className="fas fa-check text-xs"></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    onClick={() => setSelectedGroup(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition"
                                >
                                    Kapat
                                </button>

                                {/* Delete Button - Available for all active cycles */}
                                {selectedGroup.status !== 'completed' && (
                                    <button
                                        onClick={() => handleDelete(selectedGroup.id)}
                                        className="px-5 py-2.5 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 transition flex items-center gap-2"
                                    >
                                        <i className="fas fa-trash-alt"></i> Sil
                                    </button>
                                )}

                                {/* Start Process - Detected Only */}
                                {selectedGroup.status === 'detected' && (
                                    <button
                                        onClick={() => handleApprove(selectedGroup.id)}
                                        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
                                    >
                                        <i className="fas fa-play"></i> Süreci Başlat
                                    </button>
                                )}

                                {/* Finalize - Legal Stage Only */}
                                {/* Finalize - Processing Stage */}
                                {selectedGroup.status === 'processing' && (
                                    <button
                                        onClick={() => handleFinalize(selectedGroup.id)}
                                        className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition flex items-center gap-2"
                                    >
                                        <i className="fas fa-check-circle"></i> Döngüyü Tamamla
                                    </button>
                                )}

                                {/* ARCHIVE DOCUMENTS */}
                                {(selectedGroup.status === 'completed' || activeTab === 'archive') && (
                                    <div className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <i className="fas fa-file-contract text-slate-400"></i>
                                            Arşivlenmiş Belgeler
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedGroup.node_names.map((name, i) => {
                                                const nodes = JSON.parse(selectedGroup.nodes || '[]');
                                                const tax_id = nodes[i];
                                                return (
                                                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                                                        <div>
                                                            <div className="font-bold text-slate-700 text-sm">{name}</div>
                                                            <div className="text-xs text-slate-400">{tax_id}</div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleDownloadDoc(tax_id, 'temlik')}
                                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded flex items-center gap-2 transition"
                                                            >
                                                                <i className="fas fa-file-pdf text-red-500"></i> Temlik
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadDoc(tax_id, 'mahsuplasma')}
                                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded flex items-center gap-2 transition"
                                                            >
                                                                <i className="fas fa-file-pdf text-red-500"></i> Mahsuplaşma
                                                            </button>
                                                            <button
                                                                onClick={() => alert("E-posta gönderme özelliği yakında eklenecektir.")}
                                                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded flex items-center gap-2 transition"
                                                            >
                                                                <i className="fas fa-envelope"></i> Gönder
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};


// --- FILE: frontend/admin/dashboard.js ---
// Admin Dashboard Entry Point (Glue Code)
// Path: views/frontend/admin/dashboard.js

window.Admin = window.Admin || {};

window.Admin.Dashboard = ({ onLogout }) => {
    const Layout = window.Admin.Layout.Main;
    const [view, setView] = React.useState('dashboard');
    const [users, setUsers] = React.useState([]);
    const [transactions, setTransactions] = React.useState([]);
    const [systemTransactions, setSystemTransactions] = React.useState([]); // Added
    const [loading, setLoading] = React.useState(true);

    // Initial Data Fetch
    React.useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch All in Parallel
                const [userRes, txRes, sysRes] = await Promise.all([
                    fetch('../data/api/companies.php'),
                    fetch('../data/api/admin_transactions.php'),
                    fetch('../data/api/system_accounting.php?t=' + Date.now())
                ]);

                const [userData, txData, sysData] = await Promise.all([
                    userRes.json(),
                    txRes.json(),
                    sysRes.json()
                ]);

                // Update Users
                if (userData.records) {
                    const formattedUsers = userData.records.map(u => ({
                        id: u.id,
                        title: u.name,
                        email: u.email,
                        taxNo: u.tax_id,
                        phone: u.phone || '',
                        status: u.status || 'pending',
                        contactPerson: u.contact_person || '',
                        role: u.role
                    }));
                    setUsers(formattedUsers);
                }

                // Update Transactions
                if (txData.success && txData.data) {
                    setTransactions(txData.data);
                } else {
                    setTransactions([]);
                }

                // Update System Transactions
                if (sysData.success && Array.isArray(sysData.data)) {
                    setSystemTransactions(sysData.data);
                } else {
                    setSystemTransactions([]);
                }

            } catch (err) {
                console.error("Data load error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Page Routing
    const renderPage = () => {
        const commonProps = { users, setUsers, transactions, setTransactions, systemTransactions };

        switch (view) {
            case 'dashboard':
                return <window.Admin.Pages.DashboardHome
                    users={users}
                    pendings={users.filter(u => u.status === 'pending' || u.status === 'pre_approved')}
                    transactions={transactions}
                    systemTransactions={systemTransactions}
                />;
            case 'approvals':
                return <window.Admin.Pages.Approvals
                    pendings={users.filter(u => u.status === 'pending' || u.status === 'pre_approved')}
                    setPendings={(newPendings) => {
                        // Optimistic update of local users state
                        // Logic to remove approved/rejected user from local state 'users' pending list
                        // This complex update usually requires re-fetching or better state management, 
                        // but for now we rely on the component to handle its own API calls and maybe parent re-fetch.
                        // Actually, setPendings prop in Approvals.js updates its local prop? No, it expects a setter.
                        // Ideally we pass a callback "onApprove"
                    }}
                    users={users} // Pass all users so we can find full obj
                    setUsers={setUsers}
                />;
            case 'users':
                return <window.Admin.Pages.Users {...commonProps} />;
            case 'accounting':
                // Check if Accounting page exists, else fallback
                return window.Admin.Pages.Accounting ?
                    <window.Admin.Pages.Accounting {...commonProps} /> : <div>Muhasebe Modülü Yüklenemedi</div>;
            case 'sirius':
                return window.Admin.Pages.Sirius ? <window.Admin.Pages.Sirius /> : <div>Sirius Modülü Yüklenemedi</div>;
            case 'admin_users':
                return window.Admin.Pages.AdminUsers ? <window.Admin.Pages.AdminUsers {...commonProps} /> : <div>Yönetici Modülü Yüklenemedi</div>;
            case 'reports':
                return window.Admin.Pages.Reports ? <window.Admin.Pages.Reports {...commonProps} /> : <div>Raporlar Hazırlanıyor...</div>;
            case 'site_settings':
                return window.Admin.Pages.GeneralSettings ? <window.Admin.Pages.GeneralSettings /> : <div>Ayarlar Yüklenemedi</div>;
            case 'content_manager':
                return window.Admin.Pages.ContentManager ? <window.Admin.Pages.ContentManager /> : <div>İçerik Yöneticisi Yüklenemedi</div>;
            case 'system_logs':
                return window.Admin.Pages.SystemLogs ? <window.Admin.Pages.SystemLogs /> : <div>Loglar Yüklenemedi</div>;
            // Add other pages as needed
            default:
                return <window.Admin.Pages.DashboardHome {...commonProps} />;
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400">Yükleniyor...</div>;

    return (
        <Layout view={view} setView={setView} onLogout={onLogout}>
            {renderPage()}
        </Layout>
    );
};


// --- FILE: frontend/kullanicilar/Sidebar.js ---
// Sidebar Component
// Path: views/frontend/kullanicilar/Sidebar.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Sidebar = ({ activePage, setPage, isMobileOpen, toggleMobile, user }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Genel Bakış', icon: 'fas fa-home' },
        { id: 'invoices', label: 'Borç / Alacak Yönetimi', icon: 'fas fa-file-invoice-dollar' },
        { id: 'sirius', label: 'Sirius Döngülerim', icon: 'fas fa-project-diagram' },
        { id: 'profile', label: 'Profil & Ayarlar', icon: 'fas fa-user-cog' },
    ];

    return (
        <React.Fragment>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={toggleMobile}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 z-50 overflow-y-auto
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
                            <span className="font-bold text-lg">L</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-wide">Likya Pay</span>
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Kurumsal</span>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setPage(item.id);
                                if (window.innerWidth < 1024) toggleMobile();
                            }}
                            className={`
                                w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                                ${activePage === item.id
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }
                            `}
                        >
                            <i className={`${item.icon} w-6 text-center text-lg ${activePage === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}></i>
                            <span className="font-medium">{item.label}</span>
                            {activePage === item.id && (
                                <i className="fas fa-chevron-right ml-auto text-xs opacity-70"></i>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-200 truncate">{user?.name || 'Misafir'}</h4>
                            <p className="text-xs text-slate-500 truncate">{user?.role === 'user' ? 'Kurumsal Üye' : 'Ziyaretçi'}</p>
                        </div>
                        <button onClick={() => window.location.replace('../index.php')} className="text-slate-500 hover:text-red-400 transition" title="Çıkış Yap">
                            <i className="fas fa-power-off"></i>
                        </button>
                    </div>
                </div>
            </aside>
        </React.Fragment>
    );
};


// --- FILE: frontend/kullanicilar/DashboardHome.js ---
// Dashboard Home Component
// Path: views/frontend/kullanicilar/DashboardHome.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.DashboardHome = ({ setPage, summary, transactions, user }) => {
    // Notification Logic
    const [incomingTxs, setIncomingTxs] = React.useState([]);
    const [showNotification, setShowNotification] = React.useState(false);

    React.useEffect(() => {
        if (transactions && user) {
            // Find transactions where:
            // 1. I am NOT the creator (someone else created it for me)
            // 2. Status is 'pending'
            const incoming = transactions.filter(t => t.user_id != user.id && t.status === 'pending');

            if (incoming.length > 0) {
                setIncomingTxs(incoming);
                setShowNotification(true);
            }
        }
    }, [transactions, user]);

    const handleDecision = async (id, decision) => {
        try {
            const res = await fetch('../data/api/approve_transaction.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: decision })
            });
            const data = await res.json();

            if (data.success) {
                // Remove from list
                const remaining = incomingTxs.filter(t => t.id !== id);
                setIncomingTxs(remaining);

                // If no more items, auto close
                if (remaining.length === 0) {
                    setShowNotification(false);
                    // Reload to reflect approved/rejected status in main table
                    if (window.location.reload) setTimeout(() => window.location.reload(), 500);
                }

                window.showToast?.(`İşlem ${decision === 'approved' ? 'onaylandı' : 'reddedildi'}.`, 'success');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Debt */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div>
                        <h4 className="text-slate-500 font-medium mb-1">Toplam Borcunuz</h4>
                        <div className="text-3xl font-bold text-slate-800">₺{summary.debt.toLocaleString()}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 w-fit px-3 py-1 rounded-full text-xs font-bold">
                        <i className="fas fa-arrow-up"></i>
                        <span>Aktif</span>
                    </div>
                </div>

                {/* Total Credit */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div>
                        <h4 className="text-slate-500 font-medium mb-1">Toplam Alacağınız</h4>
                        <div className="text-3xl font-bold text-slate-800">₺{summary.credit.toLocaleString()}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full text-xs font-bold">
                        <i className="fas fa-arrow-down"></i>
                        <span>Tahsil Edilecek</span>
                    </div>
                </div>

                {/* Net Balance -> Sirius Potential */}
                <div
                    onClick={() => setPage('sirius')}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-md transition-all"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div>
                        <h4 className="text-slate-500 font-medium mb-1">Sirius Potansiyeli</h4>
                        <div className="text-3xl font-bold text-brand-600">{summary.cycleCount} Döngü</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-brand-600 hover:text-brand-800 text-sm font-medium transition">
                        <span>Döngüleri İncele</span>
                        <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Yeni Borç veya Alacak Ekleyin</h3>
                        <p className="text-slate-300 max-w-lg">Sisteme fatura veya sözleşmelerinizi yükleyerek Sirius döngülerine katılın ve nakitsiz mahsuplaşmaya başlayın.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setPage('invoices')} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition shadow-lg flex items-center gap-2 whitespace-nowrap">
                            <i className="fas fa-plus"></i>
                            Veri Yükle
                        </button>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Son Hareketler</h3>
                    <button className="text-sm text-brand-600 hover:underline">Tümünü Gör</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {transactions && transactions.length > 0 ? (
                        transactions.slice(0, 5).map(t => (
                            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <i className={`fas ${t.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800">{t.party}</h4>
                                        <p className="text-xs text-slate-500">{t.status}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`block font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        ₺{t.amount.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-slate-400">{t.date}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <i className="fas fa-inbox text-3xl mb-2 opacity-50"></i>
                            <p>Henüz işlem kaydı yok.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Incoming Transaction Notification Modal */}
            {showNotification && incomingTxs.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                        {/* Header */}
                        <div className="bg-brand-600 p-6 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                                <i className="fas fa-bell text-3xl shake-animation"></i>
                            </div>
                            <h3 className="text-xl font-bold">Yeni İşlem Bildirimi</h3>
                            <p className="text-brand-100 text-sm mt-1">Lütfen aşağıdaki işlemleri inceleyip onaylayınız.</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                            {incomingTxs.map((tx, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            <i className={`fas ${tx.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-800 text-sm">
                                                <span className="font-bold">{tx.party}</span> firması, size <span className="font-bold">₺{parseFloat(tx.amount).toLocaleString()}</span> tutarında bir <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'credit' ? 'Alacak' : 'Borç'}</span> işlemiştir.
                                            </p>
                                            <div className="mt-2 text-xs text-slate-500 flex gap-3">
                                                <span><i className="far fa-calendar-alt mr-1"></i> {tx.date}</span>
                                                {tx.description && <span><i className="far fa-comment-alt mr-1"></i> {tx.description}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-1 pt-3 border-t border-slate-200">
                                        <button
                                            onClick={() => handleDecision(tx.id, 'rejected')}
                                            className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold transition">
                                            İtiraz Et
                                        </button>
                                        <button
                                            onClick={() => handleDecision(tx.id, 'approved')}
                                            className="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-bold transition shadow-md shadow-green-200">
                                            Onayla
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <button
                                onClick={() => setShowNotification(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                            >
                                Şimdilik Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- FILE: frontend/kullanicilar/Invoices.js ---
// Invoices Component
// Path: views/frontend/kullanicilar/Invoices.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Invoices = ({ transactions, onAddTransaction }) => {
    const [activeTab, setActiveTab] = React.useState('debt'); // 'debt' or 'credit'

    // Transactions from Props

    // Modal State
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newInvoice, setNewInvoice] = React.useState({ party: '', amount: '', type: 'debt', date: '' });

    // Autocomplete State
    const [suggestions, setSuggestions] = React.useState([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    // Search existing companies
    const handleSearch = async (val) => {
        setNewInvoice(prev => ({ ...prev, party: val }));

        if (val.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const res = await fetch(`../data/api/search_companies.php?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            if (data.success && data.data) {
                setSuggestions(data.data);
                setShowSuggestions(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const selectCompany = (company) => {
        setNewInvoice(prev => ({ ...prev, party: company.name, tax_id: company.tax_id })); // Store tax_id to link later if needed
        setShowSuggestions(false);
    };

    const handleSave = async () => {
        if (!newInvoice.party || !newInvoice.amount) return alert("Lütfen alanları doldurun.");

        // Validation: Tax ID Required for accurate mapping
        // Logic: Either selected from list (tax_id) OR newly entered (new_tax_id) must exist
        if (!newInvoice.id && !newInvoice.tax_id && !newInvoice.new_tax_id) {
            alert("Lütfen karşı firmanın/kişinin Vergi veya T.C. Kimlik numarasını giriniz.\n(Sistemde kayıtlı değilse manuel olarak ekleyebilirsiniz.)");
            return;
        }

        try {
            const method = newInvoice.id ? 'PUT' : 'POST';

            let body;
            let headers = {};

            if (method === 'PUT') {
                // Backend expects JSON for PUT
                body = JSON.stringify({
                    id: newInvoice.id,
                    party: newInvoice.party,
                    amount: parseFloat(newInvoice.amount),
                    type: newInvoice.type,
                    date: newInvoice.date,
                    description: newInvoice.description || ''
                });
                headers['Content-Type'] = 'application/json';
            } else {
                // POST allows File Upload (FormData)
                const formData = new FormData();
                formData.append('party', newInvoice.party);
                formData.append('amount', parseFloat(newInvoice.amount));
                formData.append('type', newInvoice.type);
                formData.append('date', newInvoice.date);
                formData.append('description', newInvoice.description || '');

                if (newInvoice.tax_id) formData.append('tax_id', newInvoice.tax_id);
                if (newInvoice.new_tax_id) formData.append('new_tax_id', newInvoice.new_tax_id);
                if (newInvoice.new_email) formData.append('new_email', newInvoice.new_email);
                if (newInvoice.id) formData.append('id', newInvoice.id);

                if (newInvoice.file) {
                    formData.append('file', newInvoice.file);
                }
                body = formData;
            }

            const res = await fetch('../data/api/transactions.php', {
                method: method,
                headers: headers,
                body: body
            });
            const data = await res.json();

            if (data.success) {
                window.showToast?.('Kayıt başarıyla eklendi!', 'success') || alert('Kayıt Eklendi!');
                setIsModalOpen(false);
                setNewInvoice({ party: '', amount: '', type: 'debt', date: '' });
                // Trigger refresh in parent if possible, or reload
                if (window.location.reload) setTimeout(() => window.location.reload(), 1000);
            } else {
                alert("Hata: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        }
    };

    // Filter transactions from props
    const filteredData = transactions.filter(item => item.type === activeTab);

    return (
        <div className="animate-fade-in space-y-6">
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    body { background: white !important; }
                    .no-print, button, input, select, .hidden-print { display: none !important; }
                    .min-h-screen { height: auto !important; }
                    .sidebar, header, .z-50 { display: none !important; }
                    /* Make table text black */
                    table { color: black !important; font-size: 10pt; }
                    th, td { padding: 4px 8px !important; border: 1px solid #ddd; }
                    /* Show status nicely */
                    .rounded-full { border: 1px solid #ccc; padding: 2px 6px; }
                }
            `}</style>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Borç ve Alacak Yönetimi</h2>
                    <p className="text-slate-500 text-sm">Finansal kayıtlarınızı buradan yönetebilirsiniz.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold flex items-center gap-2 transition"
                    >
                        <i className="fas fa-print"></i> Yazdır / PDF
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-lg shadow-brand-500/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
                    >
                        <i className="fas fa-plus"></i>
                        Yeni Kayıt Ekle
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex">
                <button
                    onClick={() => setActiveTab('debt')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'debt' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Borçlarım
                </button>
                <button
                    onClick={() => setActiveTab('credit')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'credit' ? 'bg-green-50 text-green-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Alacaklarım
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Firma / Kişi</th>
                                <th className="px-6 py-4">Tutar</th>
                                <th className="px-6 py-4">Vade Tarihi</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">Belge</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.party}</td>
                                    <td className={`px-6 py-4 font-bold ${item.type === 'debt' ? 'text-red-500' : 'text-green-500'}`}>
                                        ₺{item.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`
                                                px-2.5 py-1 rounded-full text-xs font-bold w-fit
                                                ${item.status.includes('Sirius') ? 'bg-purple-100 text-purple-700' :
                                                    item.status === 'Onaylandı' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                                            `}>
                                                {item.status}
                                            </span>
                                            {item.description && (
                                                <span className="text-xs text-slate-400 mt-1 max-w-[150px] truncate" title={item.description}>
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400 hover:text-brand-600 cursor-pointer transition">
                                            <i className="fas fa-file-pdf"></i>
                                            {item.doc_path && (
                                                <a href={`uploads/documents/${item.doc_path}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline">
                                                    Görüntüle
                                                </a>
                                            )}
                                            {!item.doc_path && <span className="text-xs">Yok</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setNewInvoice({
                                                        id: item.id,
                                                        party: item.party,
                                                        amount: item.amount,
                                                        type: item.type, // Map effective type to original type if needed, or keep as is
                                                        date: item.date,
                                                        description: item.description
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-brand-600 hover:text-brand-800 p-2 text-xs font-bold"
                                                title="Düzenle">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                                                        try {
                                                            const res = await fetch('../data/api/transactions.php', {
                                                                method: 'DELETE',
                                                                body: JSON.stringify({ id: item.id })
                                                            });
                                                            const data = await res.json();
                                                            if (data.success) {
                                                                // Reload or callback
                                                                if (window.location.reload) window.location.reload();
                                                            } else {
                                                                alert(data.message || 'Silinemedi');
                                                            }
                                                        } catch (e) { console.error(e); }
                                                    }
                                                }}
                                                className="text-red-400 hover:text-red-600 p-2 text-xs"
                                                title="Sil">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Empty State */}
                {filteredData.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <i className="far fa-folder-open text-4xl mb-3 opacity-50"></i>
                        <p>Henüz bu kategoride bir kayıt bulunmuyor.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Yeni Finansal Kayıt</h3>
                            <button onClick={() => setIsModalOpen(false)}><i className="fas fa-times text-slate-400"></i></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">İşlem Tipi</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 bg-slate-50"
                                    value={newInvoice.type}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, type: e.target.value })}
                                >
                                    <option value="debt">Borç Ekle (Ben Borçluyum)</option>
                                    <option value="credit">Alacak Ekle (Ben Alacaklıyım)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Firma / Kişi Adı</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                                        placeholder="Firma adı veya Vergi No ile arayın"
                                        value={newInvoice.party}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {suggestions.map(s => (
                                                <div
                                                    key={s.id}
                                                    onClick={() => selectCompany(s)}
                                                    className="px-4 py-2 hover:bg-brand-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                >
                                                    <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                                                    <div className="text-xs text-slate-500">Vergi No: {s.tax_id || '---'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* New Company Details (Shown only if not selecting existing) */}
                            {!newInvoice.tax_id && newInvoice.party.length > 2 && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-3 animate-fade-in">
                                    <p className="text-xs text-brand-600 font-bold mb-2 flex items-center">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Yeni Firma/Kişi Detayları
                                    </p>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Vergi Numarası / T.C.</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                            placeholder="Zorunlu Alan"
                                            value={newInvoice.new_tax_id || ''}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, new_tax_id: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">E-Posta</label>
                                            <input
                                                type="email"
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                                value={newInvoice.new_email || ''}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, new_email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Telefon</label>
                                            <input
                                                type="tel"
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                                value={newInvoice.new_phone || ''}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, new_phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tutar (TL)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="0.00"
                                    value={newInvoice.amount}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama / Fatura No</label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 text-sm h-20 resize-none"
                                    placeholder="İşlem ile ilgili açıklama veya belge numarası..."
                                    value={newInvoice.description || ''}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Vade Tarihi</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={newInvoice.date}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Belge Yükle (PDF / Resim)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full border rounded-lg px-3 py-2 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                    onChange={(e) => setNewInvoice({ ...newInvoice, file: e.target.files[0] })}
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition shadow-lg mt-2">
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- FILE: frontend/kullanicilar/Profile.js ---
// Profile Settings Component
// Path: views/frontend/kullanicilar/Profile.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Profile = ({ user }) => {
    // Form State
    const [formData, setFormData] = React.useState({
        email: user?.email || '',
        phone: user?.phone || '',
        authorized_person: user?.authorized_person || '',
        invoice_address: user?.invoice_address || '',
        address: user?.address || '',
        tax_office: user?.tax_office || '',
        mersis_no: user?.mersis_no || '',
        trade_registry_no: user?.trade_registry_no || ''
    });

    const [passData, setPassData] = React.useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [activeTab, setActiveTab] = React.useState('company');

    // Update state when user prop changes (initial load)
    React.useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                phone: user.phone || '',
                authorized_person: user.authorized_person || '',
                invoice_address: user.invoice_address || '',
                address: user.address || '',
                tax_office: user.tax_office || '',
                mersis_no: user.mersis_no || '',
                trade_registry_no: user.trade_registry_no || ''
            });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        try {
            const res = await fetch('../data/api/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                window.showToast?.('Profil başarıyla güncellendi.', 'success') || alert('Güncellendi!');
            } else {
                alert('Hata: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası.');
        }
    };

    const handleChangePassword = async () => {
        if (passData.new !== passData.confirm) {
            return alert("Yeni şifreler uyuşmuyor.");
        }
        if (passData.new.length < 6) {
            return alert("Yeni şifre en az 6 karakter olmalı.");
        }

        try {
            const res = await fetch('../data/api/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: passData.current,
                    new_password: passData.new
                })
            });
            const data = await res.json();
            if (data.success) {
                window.showToast?.('Şifreniz değiştirildi.', 'success') || alert('Şifre Değiştirildi!');
                setPassData({ current: '', new: '', confirm: '' });
            } else {
                alert('Hata: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası.');
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Profil ve Ayarlar</h2>
                    <p className="text-slate-500 text-sm">Firma bilgilerinizi ve hesap tercihlerinizi yönetin.</p>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-white">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'M'}
                </div>
                <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl font-bold text-slate-800">{user?.name || 'Firma Ünvanı'}</h3>
                    <p className="text-slate-500">Vergi No: {user?.tax_id || user?.taxNo || '---'}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <i className="fas fa-check-circle"></i> Onaylı Üye
                        </span>
                        <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <i className="fas fa-cube"></i> Sirius Paketi
                        </span>
                    </div>
                </div>
                <button className="px-5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition text-sm">
                    <i className="fas fa-camera mr-2"></i> Fot. Değiştir
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'company' ? 'bg-slate-50 text-brand-600 border-b-2 border-brand-600 md:border-b-0' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-building"></i> Firma Bilgileri
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'security' ? 'bg-slate-50 text-brand-600 border-b-2 border-brand-600 md:border-b-0' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-shield-alt"></i> Güvenlik
                </button>
                <button
                    onClick={() => setActiveTab('preferences')}
                    className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === 'preferences' ? 'bg-slate-50 text-brand-600 border-b-2 border-brand-600 md:border-b-0' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <i className="fas fa-bell"></i> Tercihler
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

                {/* Company Content */}
                {activeTab === 'company' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Read-only Fields */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Firma Ünvanı</label>
                                <input type="text" defaultValue={user?.name || ''} className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed uppercase" disabled />
                                <p className="text-xs text-slate-400">Ünvan değişikliği için destek talebi oluşturun.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Vergi No / T.C.</label>
                                <input type="text" defaultValue={user?.taxNo || user?.tax_id || ''} className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed uppercase" disabled />
                            </div>

                            {/* Editable Official Fields */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Vergi Dairesi</label>
                                <input
                                    type="text"
                                    value={formData.tax_office}
                                    onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition uppercase"
                                    placeholder="Örn: BEŞİKTAŞ"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Mersis No</label>
                                <input
                                    type="text"
                                    value={formData.mersis_no}
                                    onChange={(e) => setFormData({ ...formData, mersis_no: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                                    placeholder="16 Haneli Mersis No"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Ticaret Sicil No</label>
                                <input
                                    type="text"
                                    value={formData.trade_registry_no}
                                    onChange={(e) => setFormData({ ...formData, trade_registry_no: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                                    placeholder="Sicil No"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Yetkili Ad Soyad</label>
                                <input
                                    type="text"
                                    value={formData.authorized_person}
                                    onChange={(e) => setFormData({ ...formData, authorized_person: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                                />
                            </div>

                            {/* Address Fields */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Şirket Merkezi (Tam Resmi Adres)</label>
                                <textarea
                                    rows="2"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                                    placeholder="Vergi levhasında yer alan tam adresiniz..."
                                ></textarea>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Fatura Adresi (Farklıysa)</label>
                                <textarea
                                    rows="2"
                                    value={formData.invoice_address}
                                    onChange={(e) => setFormData({ ...formData, invoice_address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                                ></textarea>
                            </div>

                            {/* Contact */}
                            <div>
                                <label className="text-sm font-bold text-slate-700">E-Posta Adresi</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Telefon</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none transition"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20">
                                Değişiklikleri Kaydet
                            </button>
                        </div>
                    </div>
                )}

                {/* Security Content */}
                {
                    activeTab === 'security' && (
                        <div className="space-y-6 max-w-lg animate-fade-in">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Mevcut Şifre</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passData.current}
                                        onChange={(e) => setPassData({ ...passData, current: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 transition"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Yeni Şifre</label>
                                    <input
                                        type="password"
                                        value={passData.new}
                                        onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 transition"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Yeni Şifre (Tekrar)</label>
                                    <input
                                        type="password"
                                        value={passData.confirm}
                                        onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 transition"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={handleChangePassword} className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition">
                                    Şifreyi Güncelle
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* Preferences - unchanged... */}


                {/* Preferences Content */}
                {
                    activeTab === 'preferences' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-4 divide-y divide-slate-100">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800">E-Posta Bildirimleri</h4>
                                        <p className="text-sm text-slate-500">Yeni fatura ve onaylar hakkında mail al.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <h4 className="font-bold text-slate-800">SMS Bildirimleri</h4>
                                        <p className="text-sm text-slate-500">Acil durumlar ve güvenlik kodları için SMS al.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <h4 className="font-bold text-slate-800">Sirius Eşleşme Uyarıları</h4>
                                        <p className="text-sm text-slate-500">Şirketimle eşleşen döngü olduğunda anında bildir.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};


// --- FILE: frontend/kullanicilar/Sirius.js ---
// Sirius Cycles Component - Advanced Trade Engine Interface
// Path: views/frontend/kullanicilar/Sirius.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Sirius = () => {
    const [activeTab, setActiveTab] = React.useState('dashboard'); // 'dashboard', 'create_request', 'my_requests'
    const [requests, setRequests] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Create Request State
    const [newRequest, setNewRequest] = React.useState({
        target_tax_id: '',
        target_name: '', // Fetched from tax ID
        amount: '',
        document_type: 'invoice', // invoice, check, bond
        description: ''
    });

    // Check for Active Cycle
    const [activeCycle, setActiveCycle] = React.useState(null);
    const [showIntro, setShowIntro] = React.useState(false); // Modal State

    const [searchLoading, setSearchLoading] = React.useState(false);

    // Fetch existing requests
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('../data/api/sirius.php?action=list_requests');
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const refreshCycleStatus = () => {
        fetch('../data/api/sirius.php?action=check_my_cycle')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.in_cycle) {
                    setActiveCycle({
                        ...data.cycle,
                        my_tax_id: data.my_tax_id,
                        my_company_name: data.my_company_name,
                        my_details: data.my_details,
                        my_debtor: data.my_debtor,
                        my_creditor: data.my_creditor,
                        show_mahsup: data.show_mahsup
                    });

                    // Auto-show intro if new and not completed
                    // Only show intro if we haven't seen it in this session?
                    // For now, let's just rely on the existing logic or keep it simple.
                    if (data.cycle.status === 'detected' && !activeCycle) {
                        setShowIntro(true);
                    }
                }
            })
            .catch(err => console.error("Cycle Check Error:", err));
    };

    React.useEffect(() => {
        fetchRequests();
        refreshCycleStatus();
    }, []);

    const handleSearchFirm = async () => {
        if (newRequest.target_tax_id.length < 10) return alert("Lütfen geçerli bir Vergi No girin.");
        setSearchLoading(true);
        try {
            // Mock Search or API Call to search_companies.php
            const res = await fetch(`../data/api/search_companies.php?tax_id=${newRequest.target_tax_id}`);
            const data = await res.json();

            if (data.success && data.company) {
                setNewRequest(prev => ({ ...prev, target_name: data.company.name }));
            } else {
                alert("Firma bulunamadı. Lütfen sisteme kayıtlı bir vergi numarası giriniz.");
                setNewRequest(prev => ({ ...prev, target_name: '' }));
            }
        } catch (e) {
            console.error(e);
            alert("Arama hatası.");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newRequest.target_name || !newRequest.amount) return alert("Lütfen tüm alanları doldurun.");

        setLoading(true);
        try {
            const res = await fetch('../data/api/sirius.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_request',
                    ...newRequest
                })
            });
            const data = await res.json();

            if (data.success) {
                alert("✅ Sirius Talebiniz Oluşturuldu! Eşleşme aranıyor...");
                setActiveTab('my_requests');
                setNewRequest({ target_tax_id: '', target_name: '', amount: '', document_type: 'invoice', description: '' });
                fetchRequests(); // Refresh list
            } else {
                alert("Hata: " + data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Old handlers removed to prevent conflict with updated workflow logic defined in sub-components.
    // The actual handlers should be defined where they are used or hoist correctly if needed.
    // However, looking at the code, DashboardView is defined INSIDE Sirius component, so it can access variables.
    // But the handlers handlePayFee and handleSignContract were defined at top level (lines 206-258 in previous steps?)
    // Let's consolidated them.

    // Redefining them here CORRECTLY for the scope:

    const [showBankModal, setShowBankModal] = React.useState(false);
    const [showContractModal, setShowContractModal] = React.useState(false);

    const handlePayFeeClick = () => setShowBankModal(true);
    const handleSignContractClick = () => setShowContractModal(true);

    const submitPayment = async () => {
        try {
            const res = await fetch('../data/api/sirius.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'submit_payment', cycle_id: activeCycle.id })
            });
            const data = await res.json();
            if (data.success) {
                alert("Ödeme bildirimi başarıyla alındı. Yönetici onaylayacaktır.");
                setShowBankModal(false);
                refreshCycleStatus();
            } else alert(data.message);
        } catch (e) { alert("Hata"); }
    };

    const submitContract = async () => {
        try {
            const res = await fetch('../data/api/sirius.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'sign_contract', cycle_id: activeCycle.id })
            });
            const data = await res.json();
            if (data.success) {
                alert("Sözleşme başarıyla imzalandı.");
                setShowContractModal(false);
                refreshCycleStatus();
            } else alert(data.message);
        } catch (e) { alert("Hata"); }
    };
    // --- SUB-COMPONENTS ---

    // --- MODALS ---

    // --- MODALS ---

    const BankModal = () => (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="bg-slate-900 p-6 text-white text-center">
                    <h3 className="text-xl font-bold">Hizmet Bedeli Ödemesi</h3>
                    <p className="text-slate-400 text-sm">Lütfen aşağıda belirtilen hesaba ödemeyi yapınız.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Banka / Şube</div>
                        <div className="text-slate-800 font-bold">Ziraat Bankası / Genel Merkez</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">IBAN</div>
                        <div className="text-slate-800 font-mono font-bold text-lg select-all">TR12 0001 0002 0003 0004 0005 00</div>
                        <div className="text-xs text-indigo-600 mt-1 cursor-pointer hover:underline" onClick={() => navigator.clipboard.writeText("TR120001000200030004000500")}>Kopyala</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Alıcı Adı</div>
                        <div className="text-slate-800 font-bold">LikyaPay Teknoloji A.Ş.</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800 text-sm">
                        <i className="fas fa-info-circle mr-2"></i>
                        Açıklama kısmına mutlaka <strong>SIRIUS-{activeCycle?.id}</strong> yazınız.
                    </div>
                    <button
                        onClick={() => { setShowBankModal(false); submitPayment(); }}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition"
                    >
                        Ödemeyi Yaptım, Onayla
                    </button>
                    <button
                        onClick={() => setShowBankModal(false)}
                        className="w-full text-slate-500 font-bold py-3 hover:text-slate-700 transition"
                    >
                        Vazgeç
                    </button>
                </div>
            </div>
        </div>
    );

    const ContractModal = () => {
        const [activeDocTab, setActiveDocTab] = React.useState('temlik');

        return (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="bg-slate-50 border-b p-4 flex justify-between items-center z-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Sözleşme Onayı</h3>
                            <p className="text-xs text-slate-500">
                                {activeCycle?.show_mahsup
                                    ? 'İşlemin tamamlanması için her iki belgeyi de onaylamanız gerekmektedir.'
                                    : 'Lütfen Alacağın Devri (Temlik) formunu inceleyip onaylayınız.'}
                            </p>
                        </div>
                        <button onClick={() => setShowContractModal(false)} className="text-slate-400 hover:text-slate-600">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b bg-slate-100/50">
                        <button
                            onClick={() => setActiveDocTab('temlik')}
                            className={`flex-1 py-4 text-sm font-bold transition flex items-center justify-center gap-2 ${activeDocTab === 'temlik' ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm z-10' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <i className="fas fa-file-contract"></i> 1. Alacağın Devri (Temlik) Formu
                        </button>

                        {activeCycle?.show_mahsup && (
                            <button
                                onClick={() => setActiveDocTab('mahsup')}
                                className={`flex-1 py-4 text-sm font-bold transition flex items-center justify-center gap-2 ${activeDocTab === 'mahsup' ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm z-10' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <i className="fas fa-balance-scale"></i> 2. Mahsuplaşma Formu
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-serif text-slate-900 leading-relaxed text-sm">
                        {activeDocTab === 'temlik' && (
                            <div className="max-w-3xl mx-auto bg-white p-8 shadow-sm border border-slate-200">
                                <h4 className="text-center font-bold text-lg mb-8 uppercase underline">Alacağın Devri (Temlik) Sözleşmesi</h4>
                                <div className="space-y-6 text-justify">
                                    <p>
                                        İşbu Aleğain Devri (Temlik) Sözleşmesi ("Sözleşme"), aşağıda imzası bulunan taraflar arasında, <strong>{new Date().toLocaleDateString('tr-TR')}</strong> tarihinde akdedilmiştir.
                                    </p>


                                    <div className="space-y-4">
                                        <h5 className="font-bold underline text-center mb-4">1. TARAFLAR VE İLGİLİ ŞİRKETLER</h5>

                                        <div className="space-y-4">
                                            {/* Devreden */}
                                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg relative overflow-hidden">
                                                <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] uppercase font-bold px-2 py-1 rounded-bl">Devir Eden Şirket (Siz)</div>
                                                <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
                                                    {activeCycle?.my_details?.name?.toLocaleUpperCase('tr-TR')}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                                                    <div><span className="font-semibold">Vergi No:</span> {activeCycle?.my_details?.tax_id}</div>
                                                    <div><span className="font-semibold">V. Dairesi:</span> {activeCycle?.my_details?.tax_office || '---'}</div>
                                                    <div><span className="font-semibold">Mersis No:</span> {activeCycle?.my_details?.mersis_no || '---'}</div>
                                                    <div><span className="font-semibold">Ticaret Sicil:</span> {activeCycle?.my_details?.trade_registry_no || '---'}</div>
                                                    <div className="col-span-1 sm:col-span-2"><span className="font-semibold">Adres:</span> {activeCycle?.my_details?.address || 'Adres bilgisi bulunamadı'}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Borçlu */}
                                                <div className="bg-red-50/50 border border-red-100 p-4 rounded-lg relative">
                                                    <div className="text-[10px] uppercase font-bold text-red-500 mb-2 border-b border-red-100 pb-1">Borçlu Şirket (Muhatap)</div>
                                                    <div className="font-bold text-slate-900 text-sm mb-2">{activeCycle?.my_debtor?.name?.toLocaleUpperCase('tr-TR') || 'BİLİNMİYOR'}</div>
                                                    <div className="space-y-1 text-xs text-slate-600">
                                                        <div><span className="font-semibold">VN:</span> {activeCycle?.my_debtor?.tax_id || '---'} / {activeCycle?.my_debtor?.tax_office}</div>
                                                        <div><span className="font-semibold">Mersis:</span> {activeCycle?.my_debtor?.mersis_no || '---'}</div>
                                                        <div className="truncate" title={activeCycle?.my_debtor?.address}><span className="font-semibold">Adres:</span> {activeCycle?.my_debtor?.address || '---'}</div>
                                                    </div>
                                                </div>

                                                {/* Devralan */}
                                                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg relative">
                                                    <div className="text-[10px] uppercase font-bold text-indigo-600 mb-2 border-b border-indigo-100 pb-1">Devir Alan Şirket (Yeni Alacaklı)</div>
                                                    <div className="font-bold text-slate-900 text-sm mb-2">{activeCycle?.my_creditor?.name?.toLocaleUpperCase('tr-TR') || 'BİLİNMİYOR'}</div>
                                                    <div className="space-y-1 text-xs text-slate-600">
                                                        <div><span className="font-semibold">VN:</span> {activeCycle?.my_creditor?.tax_id || '---'} / {activeCycle?.my_creditor?.tax_office}</div>
                                                        <div><span className="font-semibold">Mersis:</span> {activeCycle?.my_creditor?.mersis_no || '---'}</div>
                                                        <div className="truncate" title={activeCycle?.my_creditor?.address}><span className="font-semibold">Adres:</span> {activeCycle?.my_creditor?.address || '---'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-6">
                                        <h5 className="font-bold underline">2. KONU</h5>
                                        <p className="bg-yellow-50 p-3 border border-yellow-200 rounded text-slate-900 font-medium leading-relaxed text-justify">
                                            <strong>{activeCycle?.my_company_name?.toLocaleUpperCase('tr-TR')}</strong> şirketi,
                                            <strong>{activeCycle?.my_debtor?.name?.toLocaleUpperCase('tr-TR')}</strong> şirketinden alacağı olan
                                            <strong> {parseFloat(activeCycle?.volume).toLocaleString('tr-TR')} TL</strong>'yi,
                                            kendi borcuna karşılık olmak üzere işbu sözleşme ile
                                            <strong> {activeCycle?.my_creditor?.name?.toLocaleUpperCase('tr-TR')}</strong> şirketine devir etmiştir.
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Bu devir işlemi, Sirius Döngü Sistemi (Döngü No: <strong>#{activeCycle?.code}</strong>) altyapısı kullanılarak,
                                            Türk Borçlar Kanunu'nun 183. maddesi uyarınca taraflar arasında elektronik ortamda gerçekleştirilmiştir.
                                        </p>
                                    </div>

                                    <div className="bg-slate-100 p-4 border border-slate-300">
                                        <h5 className="font-bold mb-2">Temlike Konu Alacak Tutarı:</h5>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span>Toplam Tutar:</span> <span className="font-bold font-mono">₺{parseFloat(activeCycle?.volume).toLocaleString('tr-TR')}</span>
                                            <span>Döngü Referansı:</span> <span className="font-bold font-mono">#{activeCycle?.code}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="font-bold underline">3. BEYAN VE TAAHHÜTLER</h5>
                                        <p>
                                            DEVREDEN, işbu Sözleşme konusu alacağın var olduğunu, işbu alacak üzerinde herhangi bir rehin, haciz veya başkaca bir takyidat bulunmadığını,
                                            alacağı daha önce başka bir kişiye devretmediğini beyan ve taahhüt eder.
                                        </p>
                                    </div>

                                    <p className="mt-8 pt-8 border-t border-slate-300 text-center italic">
                                        (İşbu belge elektronik ortamda zaman damgası ile imzalanmıştır.)
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeDocTab === 'mahsup' && (
                            <div className="max-w-3xl mx-auto bg-white p-8 shadow-sm border border-slate-200">
                                <h4 className="text-center font-bold text-lg mb-8 uppercase underline">Mahsuplaşma Protokolü</h4>
                                <div className="space-y-6 text-justify">
                                    <p>
                                        İşbu Mahsuplaşma Protokolü ("Protokol"), Sirius Döngü Sistemi kapsamında tarafların karşılıklı borç ve alacaklarının takas ve mahsup edilmesi amacıyla düzenlenmiştir.
                                    </p>

                                    <div className="space-y-2">
                                        <h5 className="font-bold underline">1. TARAFLAR VE KONU</h5>
                                        <p>
                                            <strong>{activeCycle?.my_details?.name?.toLocaleUpperCase('tr-TR')}</strong> (Vergi No: {activeCycle?.my_details?.tax_id}), Sirius Döngü Sistemi'nde (Cycle #{activeCycle?.code}) oluşan alacağını temlik ederek elde ettiği alacak hakkını,
                                            yine aynı sistem içerisinde tespit edilen <strong>{activeCycle?.my_creditor?.name?.toLocaleUpperCase('tr-TR')}</strong> firmasına olan borcuna karşılık mahsup etmeyi kabul ve beyan eder.
                                        </p>
                                    </div>

                                    <div className="bg-slate-100 p-4 border border-slate-300 my-4">
                                        <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
                                            <span>Mahsup Edilecek Borç Tutarı:</span>
                                            <span className="font-bold font-mono text-red-600">- ₺{parseFloat(activeCycle?.volume).toLocaleString('tr-TR')}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
                                            <span>Temlik Edilen Alacak Tutarı:</span>
                                            <span className="font-bold font-mono text-green-600">+ ₺{parseFloat(activeCycle?.volume).toLocaleString('tr-TR')}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                            <span>KALAN BORÇ:</span>
                                            <span className="font-mono text-slate-800">₺0,00</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="font-bold underline">2. SONUÇ</h5>
                                        <p>
                                            Taraflar, yukarıda belirtilen tutarların karşılıklı olarak mahsup edildiğini, bu işlem sonucunda kullanıcı nezdinde ilgili borç ilişkisinin sona erdiğini,
                                            borcun ifa edilmiş sayıldığını ve birbirlerini bu tutar nispetinde gayrikabili rücu ibra ettiklerini kabul ederler.
                                        </p>
                                    </div>

                                    <p className="mt-8 pt-8 border-t border-slate-300 text-center italic">
                                        (İşbu belge elektronik ortamda zaman damgası ile imzalanmıştır.)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t bg-white z-10 flex gap-4 items-center flex-col sm:flex-row">
                        <div className="text-xs text-slate-500 flex-1">
                            <i className="fas fa-lock mr-1"></i>
                            Bu işlem <strong>5070 Sayılı Elektronik İmza Kanunu</strong> kapsamında yasal geçerliliğe sahiptir.
                            <br />
                            IP: {window.myIp || 'Kaydediliyor...'} | TS: {new Date().toISOString()}
                        </div>
                        <button
                            onClick={() => { setShowContractModal(false); submitContract(); }}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition w-full sm:w-auto shadow-lg shadow-indigo-200"
                        >
                            <i className="fas fa-file-signature mr-2"></i>
                            {activeCycle?.show_mahsup ? 'Temlik ve Mahsuplaşma Belgelerini Onaylıyorum' : 'Alacağın Devri (Temlik) Sözleşmesini Onaylıyorum'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const DashboardView = () => (
        <div className="space-y-8 animate-fade-in relative z-10">
            {/* Active Cycle Notification - If User is in a Loop */}
            {activeCycle && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden animate-pulse-slow border-2 border-emerald-400">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center text-2xl shadow-lg animate-bounce">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">Tebrikler! Sirius Grubundasınız 🚀</h2>
                                <p className="text-emerald-100 font-medium">Sistem sizi karlı bir takas döngüsüne dahil etti. <span className="inline-block bg-white/20 px-2 py-0.5 rounded text-white font-mono text-sm ml-2">#{activeCycle.code || activeCycle.id}</span></p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                {/* Chain Visual */}
                                <div className="flex-1 flex items-center gap-3 overflow-x-auto w-full pb-2 md:pb-0">
                                    {activeCycle.chain_names.map((name, i) => (
                                        <React.Fragment key={i}>
                                            <div className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap shadow-sm ${name === 'Siz' ? 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-400/30' : 'bg-white text-emerald-900'
                                                }`}>
                                                {name}
                                            </div>
                                            {/* Last Arrow goes back to start implicitly, or we show it */}
                                            {i < activeCycle.chain_names.length - 1 && (
                                                <i className="fas fa-arrow-right text-emerald-200 text-lg"></i>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <i className="fas fa-arrow-right text-emerald-200 text-lg"></i>
                                    <div className="px-4 py-2 rounded-lg font-bold text-sm bg-yellow-400 text-yellow-900 opacity-50">...</div>
                                </div>

                                {/* Volume Info */}
                                <div className="text-right shrink-0">
                                    <div className="text-emerald-100 text-xs font-bold uppercase mb-1">Mahsuplaşma Tutarı</div>
                                    <div className="text-3xl font-black tracking-tight">{parseFloat(activeCycle.volume).toLocaleString('tr-TR')} ₺</div>
                                    <div className="text-xs text-emerald-200 mt-1">Onay Bekleniyor</div>
                                </div>
                            </div>
                        </div>

                        {/* WORKFLOW ACTIONS */}
                        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            {/* PROCESSING STAGE (Payment + Contract) */}
                            {(activeCycle.status === 'processing' || activeCycle.status === 'payment_stage' || activeCycle.status === 'legal_stage') && (
                                <div className="space-y-6">
                                    {/* Payment Section */}
                                    {/* Payment Section */}
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                            <i className="fas fa-credit-card"></i> Hizmet Bedeli Ödemesi
                                        </h3>
                                        <div className="flex items-center justify-between mb-4 text-sm">
                                            <span>Hizmet Bedeli (%3 + KDV)</span>
                                            <span className="font-bold">₺{(parseFloat(activeCycle.volume) * 0.03 * 1.2).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                                        </div>
                                        {(() => {
                                            const myPayStatus = activeCycle.payment_status[activeCycle.my_tax_id] || 'pending';
                                            if (myPayStatus === 'pending') {
                                                return (
                                                    <button onClick={handlePayFeeClick} className="w-full bg-white text-emerald-600 font-bold py-2 rounded-lg hover:bg-emerald-50 transition text-sm">
                                                        💳 Hizmet Bedelini Öde
                                                    </button>
                                                );
                                            } else if (myPayStatus === 'submitted') {
                                                return (
                                                    <button disabled className="w-full bg-yellow-500/20 text-yellow-200 font-bold py-2 rounded-lg cursor-not-allowed text-sm">
                                                        <i className="fas fa-clock"></i> Ödeme Bildirildi - Onay Bekliyor
                                                    </button>
                                                );
                                            } else if (myPayStatus === 'approved') {
                                                return (
                                                    <div className="w-full bg-green-500/20 text-green-300 font-bold py-2 rounded-lg text-center text-sm">
                                                        <i className="fas fa-check-circle"></i> Ödeme Onaylandı
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>

                                    {/* Contract Section */}
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                            <i className="fas fa-file-contract"></i> Sözleşme Onayı
                                        </h3>
                                        <div className="bg-white/90 text-slate-800 p-3 rounded mb-3 text-xs h-24 overflow-y-auto leading-relaxed">
                                            <strong>TEMLİK VE MAHSUPLAŞMA SÖZLEŞMESİ</strong><br />
                                            İşbu sözleşme, Sirius Döngü Sistemi aracılığıyla tespit edilen borç/alacak ilişkilerinin...
                                        </div>
                                        {(() => {
                                            const myLegalStatus = activeCycle.legal_status[activeCycle.my_tax_id] || 'pending';
                                            if (myLegalStatus === 'pending') {
                                                return (
                                                    <button onClick={handleSignContractClick} className="w-full bg-emerald-500/20 border border-emerald-400/30 text-white font-bold py-2 rounded-lg hover:bg-emerald-500/30 transition text-sm flex items-center justify-center gap-2">
                                                        <i className="fas fa-pen-nib"></i> Sözleşmeyi İmzala
                                                    </button>
                                                );
                                            } else if (myLegalStatus === 'signed') {
                                                return (
                                                    <button disabled className="w-full bg-yellow-500/20 text-yellow-200 font-bold py-2 rounded-lg cursor-not-allowed text-sm">
                                                        <i className="fas fa-clock"></i> İmzalandı - Yönetici Onayı Bekliyor
                                                    </button>
                                                );
                                            } else if (myLegalStatus === 'approved') {
                                                return (
                                                    <div className="w-full bg-green-500/20 text-green-300 font-bold py-2 rounded-lg text-center text-sm">
                                                        <i className="fas fa-check-circle"></i> Sözleşme Onaylandı
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* COMPLETED */}
                            {activeCycle.status === 'completed' && (
                                <div className="text-center py-4">
                                    <div className="text-5xl mb-2">🎉</div>
                                    <h3 className="font-bold text-2xl">İşlem Başarıyla Tamamlandı!</h3>
                                    <p className="text-emerald-100">Borçlarınız silindi ve muhasebe kayıtları güncellendi.</p>
                                </div>
                            )}

                            {activeCycle.status === 'detected' && (
                                <div className="text-center py-2 opacity-80">
                                    <i className="fas fa-clock mb-2"></i>
                                    <p>Yönetici onayı bekleniyor...</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Hero Card */}
            <div className="bg-[#0f172a] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/50">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                            <i className="fas fa-star"></i> Sirius Trade Engine v1.0
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Ticaretin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Geleceği</span> Burada.
                        </h2>
                        <p className="text-indigo-200/80 text-lg leading-relaxed">
                            Nakit akışınız tıkanmasın. Sirius, alacaklarınızı ve borçlarınızı analiz ederek sizi kapalı devre takas döngülerine dahil eder. Tahsilat beklemeden borçlarınızı ödeyin.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setActiveTab('create_request')}
                                className="bg-white text-[#0f172a] px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg hover:shadow-white/20 transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                <i className="fas fa-plus-circle"></i> Talep Oluştur
                            </button>
                            <button
                                onClick={() => setActiveTab('my_requests')}
                                className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-white px-8 py-3.5 rounded-xl font-bold transition flex items-center gap-2 backdrop-blur-sm"
                            >
                                <i className="fas fa-list"></i> Taleplerim
                            </button>
                        </div>
                    </div>

                    {/* Visual Animation Placeholder */}
                    <div className="w-64 h-64 md:w-80 md:h-80 relative flex items-center justify-center">
                        <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute inset-4 border-2 border-purple-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-[0_0_50px_rgba(99,102,241,0.5)] flex items-center justify-center text-4xl text-white">
                                <i className="fas fa-infinity"></i>
                            </div>
                        </div>
                        {/* Orbiting Planets */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-6 h-6 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.8)]"></div>
                    </div>
                </div>
            </div>

            {/* Stats / How it works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                        <i className="fas fa-file-invoice-dollar"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">1. Alacağını Gir</h3>
                    <p className="text-slate-500 text-sm">Vadesi gelmemiş veya geçmiş alacaklarınızı sisteme yükleyin. Fatura veya çek bilgilerinizi girin.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                        <i className="fas fa-network-wired"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">2. Eşleşme Bekle</h3>
                    <p className="text-slate-500 text-sm">Sirius, alacaklı olduğunuz firmanın kime borcu olduğunu analiz eder ve zinciri tamamlar.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                        <i className="fas fa-check-double"></i>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">3. Mahsuplaş</h3>
                    <p className="text-slate-500 text-sm">Döngü tamamlandığında onay verin. Borcunuz ve alacağınız birbirini nakitsiz olarak ödesin.</p>
                </div>
            </div>
        </div >
    );

    const CreateRequestView = () => (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
            <button onClick={() => setActiveTab('dashboard')} className="text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-2 transition">
                <i className="fas fa-arrow-left"></i> Geri Dön
            </button>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-slate-900"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold">Yeni Sirius Talebi</h3>
                        <p className="text-slate-400 text-sm mt-1">Sisteme bir alacak/borç ilişkisi tanımlayın.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Alacaklı Olduğunuz Firma */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Alacaklı Olduğunuz Firma (Vergi No)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition font-mono"
                                placeholder="1234567890"
                                maxLength="11"
                                value={newRequest.target_tax_id}
                                onChange={e => setNewRequest({ ...newRequest, target_tax_id: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={handleSearchFirm}
                                disabled={searchLoading}
                                className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                            >
                                {searchLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                            </button>
                        </div>
                        {newRequest.target_name && (
                            <div className="mt-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-bold flex items-center gap-2 animate-fade-in">
                                <i className="fas fa-check-circle"></i> {newRequest.target_name}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tutar (TL)</label>
                            <input
                                type="number"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition font-bold text-slate-800"
                                placeholder="0.00"
                                value={newRequest.amount}
                                onChange={e => setNewRequest({ ...newRequest, amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Belge Türü</label>
                            <select
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition bg-white"
                                value={newRequest.document_type}
                                onChange={e => setNewRequest({ ...newRequest, document_type: e.target.value })}
                            >
                                <option value="invoice">Fatura</option>
                                <option value="check">Çek / Senet</option>
                                <option value="contract">Sözleşme</option>
                                <option value="other">Diğer</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama (Opsiyonel)</label>
                        <textarea
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition h-24 resize-none"
                            placeholder="Vade tarihi, fatura numarası vb. notlar..."
                            value={newRequest.description}
                            onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition"
                    >
                        Talebi Oluştur
                    </button>
                </form>
            </div>
        </div>
    );

    const MyRequestsView = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <button onClick={() => setActiveTab('dashboard')} className="w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 transition">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h2 className="text-2xl font-bold text-slate-800">Taleplerim</h2>
            </div>
            {/* List Placeholder */}
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-3xl">
                    <i className="fas fa-inbox"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-700">Henüz talep yok</h3>
                <p className="text-slate-400 mb-6">Aktif bir mahsuplaşma talebiniz bulunmuyor.</p>
                <button onClick={() => setActiveTab('create_request')} className="text-indigo-600 font-bold hover:underline">Şimdi oluştur</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-[500px]">
            {/* INTRO MODAL */}
            {showIntro && activeCycle && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-[fadeIn_0.3s_ease-out]">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <h2 className="text-2xl font-black text-white relative z-10">✨ Tebrikler!</h2>
                            <p className="text-indigo-100 relative z-10">Sirius Döngü Sistemine Dahil Oldunuz</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="text-center">
                                <div className="inline-block bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-mono font-bold mb-4">
                                    Döngü Kodu: #{activeCycle.code}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">
                                    ₺{parseFloat(activeCycle.volume).toLocaleString('tr-TR')}
                                </h3>
                                <p className="text-slate-500 text-sm">Tutarındaki borcunuz bu döngü ile silinecektir.</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Ödenecek Hizmet Bedeli</span>
                                    <span className="font-bold text-slate-800">₺{(parseFloat(activeCycle.volume) * 0.03 * 1.2).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">İmzalanacak Sözleşme</span>
                                    <span className="font-bold text-slate-800">Temlik & Mahsuplaşma</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowIntro(false)}
                                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                            >
                                Detayları İncele ve Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBankModal && <BankModal />}
            {showContractModal && <ContractModal />}

            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'create_request' && <CreateRequestView />}
            {activeTab === 'my_requests' && <MyRequestsView />}
        </div>
    );
};


// --- FILE: frontend/kullanicilar/panel.js ---
// User Panel Container
// Path: views/frontend/kullanicilar/panel.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.Panel = ({ onLogout, user }) => {
    const [activePage, setActivePage] = React.useState('dashboard');
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    // Shared Data State
    const [transactions, setTransactions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch Transactions
    React.useEffect(() => {
        fetch('../data/api/transactions.php')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Ensure numbers are float
                    const formatted = data.data.map(item => ({
                        ...item,
                        amount: parseFloat(item.amount)
                    }));
                    setTransactions(formatted);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("API Error:", err);
                setLoading(false);
            });
    }, []);

    const addTransaction = (newTx) => {
        // Optimistic UI Update
        setTransactions(prev => [newTx, ...prev]);

        // Send to API
        fetch('../data/api/transactions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTx)
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    alert("Kayıt veritabanına eklenemedi: " + res.message);
                    // Rollback if needed
                } else {
                    // Update ID with real ID from DB
                    setTransactions(prev => prev.map(t => t.id === newTx.id ? { ...t, id: res.id } : t));
                }
            })
            .catch(err => console.error("Save Error:", err));
    };

    // Calculate Summary
    const summary = React.useMemo(() => {
        // Since API now returns correct 'type' (Mapped from effective_type), 
        // we just sum them up directly.
        // debt = My output
        // credit = My input

        const debt = transactions
            .filter(t => t.type === 'debt')
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

        const credit = transactions
            .filter(t => t.type === 'credit')
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

        return {
            debt,
            credit,
            balance: credit - debt,
            cycleCount: Math.floor(transactions.length / 3) + 1
        };
    }, [transactions]);

    // Component Registry - Wrapped to pass props
    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <window.Kullanicilar.DashboardHome setPage={setActivePage} summary={summary} transactions={transactions} user={user} />;
            case 'invoices':
                return <window.Kullanicilar.Invoices transactions={transactions} onAddTransaction={addTransaction} />;
            case 'sirius':
                return <window.Kullanicilar.Sirius />;
            case 'profile':
                return <window.Kullanicilar.Profile user={user} />;
            default:
                return <div className="p-8">Sayfa Yapım Aşamasında</div>;
        }
    };

    // Remove old components map usage since we now use renderContent
    // const ActiveComponent = ... 

    const Sidebar = window.Kullanicilar.Sidebar;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">

            <Sidebar
                activePage={activePage}
                setPage={setActivePage}
                isMobileOpen={isMobileOpen}
                toggleMobile={() => setIsMobileOpen(!isMobileOpen)}
                user={user}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileOpen(true)} className="text-slate-500 hover:text-brand-600">
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                        <span className="font-bold text-slate-800">Likya Pay</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'M'}
                    </div>
                </header>

                {/* Top Bar (Desktop) */}
                <header className="hidden lg:flex bg-white/80 backdrop-blur border-b border-slate-200 px-8 py-4 justify-between items-center sticky top-0 z-30">
                    <h2 className="text-xl font-bold text-slate-800 capitalize">
                        {activePage === 'dashboard' ? 'Genel Bakış' :
                            activePage === 'invoices' ? 'Borç ve Alacaklar' : activePage}
                    </h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-600">
                            <i className="far fa-calendar-alt"></i>
                            <span>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <button onClick={onLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-2 transition text-sm font-medium">
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Çıkış Yap</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};


// --- FILE: frontend/muhasebe/panel.js ---
// Muhasebe Modülü - Gelecek Faz
// Path: views/frontend/muhasebe/panel.js

window.Muhasebe = {
    init: function () {
        console.log("Muhasebe modülü yüklendi.");
    }
};


// --- FILE: frontend/app.js ---
// Main App Entry Point
// Path: views/frontend/app.js

const { useState, useEffect } = React;

const App = () => {
    const [view, setView] = useState('home'); // home, admin, user
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [lang, setLang] = useState('tr'); // 'tr' or 'en'
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Check Session on Mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Use absolute path to ensure robustness
                const response = await fetch('../data/api/check_session.php');
                const data = await response.json();
                if (data.success) {
                    console.log("✅ Session Check SUCCESS:", data.user);
                    setCurrentUser(data.user);
                    if (data.user.role === 'admin') {
                        setView('admin');
                    } else {
                        setView('user');
                    }
                } else {
                    console.log("❌ Session Check FAILED: No active session.");
                }
            } catch (err) {
                console.error("Session check error:", err);
            } finally {
                setIsLoadingSession(false);
                // Debug fallback
                if (window.location.hash === '#user') setView('user');
                if (window.location.hash === '#admin') setView('admin');
            }
        };
        checkSession();
    }, []);

    // Navigation Handler
    const handleLogin = (role, userData) => {
        console.log("Logged in user:", userData);
        setCurrentUser(userData);
        setIsLoginOpen(false);
        if (role === 'admin') setView('admin');
        else setView('user');
    };

    const handleLogout = async () => {
        console.log("Logout initiated...");
        // Call logout API to destroy session
        try {
            await fetch('../data/api/logout.php');
        } catch (e) {
            console.error("Logout API failed:", e);
        }

        // Redirect to index.php explicit to force re-entry logic
        console.log("Redirecting to homepage...");
        window.location.replace('../index.php');
    };

    // Component Aliases (from Global Scope assigned in separate files)
    const Navbar = window.Anasayfa.Navbar;
    const LandingPage = window.Anasayfa.LandingPage;
    const LoginModal = window.Anasayfa.LoginModal;
    const RegisterModal = window.Anasayfa.RegisterModal;

    const AdminDashboard = window.Admin.Dashboard;
    const UserPanel = window.Kullanicilar.Panel;

    if (isLoadingSession) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><i className="fas fa-circle-notch fa-spin text-3xl text-brand-600"></i></div>;
    }

    return (
        <div className="min-h-screen">
            {/* Public Views */}
            {view === 'home' && (
                <React.Fragment>
                    <LandingPage
                        setView={setView}
                        toggleLoginModal={() => setIsLoginOpen(true)}
                        toggleRegisterModal={() => setIsRegisterOpen(true)}
                        lang={lang}
                        setLang={setLang}
                    />
                    <LoginModal
                        isOpen={isLoginOpen}
                        onClose={() => setIsLoginOpen(false)}
                        onLogin={handleLogin}
                        onRegisterClick={() => {
                            setIsLoginOpen(false);
                            setIsRegisterOpen(true);
                        }}
                    />
                    <RegisterModal
                        isOpen={isRegisterOpen}
                        onClose={() => setIsRegisterOpen(false)}
                        onLogin={handleLogin}
                    />
                </React.Fragment>
            )}

            {/* Private Views */}
            {view === 'admin' && <AdminDashboard onLogout={handleLogout} />}
            {view === 'user' && <UserPanel onLogout={handleLogout} user={currentUser} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
const ErrorBoundary = window.ErrorBoundary;

root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);

