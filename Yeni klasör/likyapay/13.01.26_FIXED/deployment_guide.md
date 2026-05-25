# LikyaPay Güncelleme Rehberi (Programsız / Tarayıcı İle)

FileZilla indirmenize gerek yok. Doğrudan tarayıcı (Chrome/Edge) üzerinden yükleyeceğiz.

## 1. Hazırladığım Paketi Kullanın
Ben sizin için yerel ayar dosyalarını (`config.php`, `database.php`) çıkardığım ve sadece güncellemeleri içeren özel bir paket hazırladım.
*   Proje klasörünüzde: `likyapay_update.zip` adında bir dosya oluştu.

## 2. InfinityFree Paneline Girin
1.  [InfinityFree Client Area](https://app.infinityfree.com/login) adresine girin.
2.  Hesabınızın yanındaki **Manage** butonuna tıklayın.
3.  **File Manager** (Dosya Yöneticisi) butonuna tıklayın (Turuncu renkli olabilir).
4.  Sizi "Online File Manager" sayfasına atacak.

## 3. Yükleme ve Açma
1.  `htdocs` klasörünün içine girin.
2.  Alt taraftaki (veya üstteki) **Upload** butonuna basın ve **Zip File** seçeneğini seçin. (Sadece File varsa onu seçin).
3.  Bilgisayarınızdaki `likyapay_update.zip` dosyasını seçip yükleyin.
4.  Dosya yüklendikten sonra listede `likyapay_update.zip`'i bulun.
5.  Üzerine sağ tıklayın (veya yanındaki menüyü açın) ve **Extract** (Dışarı Çıkar) deyin.
6.  "Extract to:" sorarsa olduğu gibi bırakın (veya `/htdocs` yazın) ve onaylayın.

## 4. Bitiş
Bu işlem dosyaları sunucuya açacak ve eskilerin üzerine yazacaktır. Veritabanı ayarlarınız korunduğu için site bozulmaz.

Kontrol edin: `likyapaydemo.gt.tc`
