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
