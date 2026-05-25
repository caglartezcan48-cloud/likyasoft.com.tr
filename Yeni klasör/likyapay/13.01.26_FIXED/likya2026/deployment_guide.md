# LikyaPay Canlı Yayın (Deployment) Rehberi

Sitenizi internette herkesin erişimine açmak (yayına almak) için izlemeniz gereken 4 temel adım aşağıdadır.

## 1. Gereksinimler (Satın Alma)
Bir web sitesini yayınlamak için iki temel şeye ihtiyacınız vardır:
*   **Domain (Alan Adı):** Sitenizin ismi (Örn: `likyapay.com`). Godaddy, İsimtescil gibi yerlerden alınır. (~10-15$ / yıl)
*   **Hosting (Sunucu):** Dosyalarınızın barınacağı bilgisayar.
    *   **Önerilen:** Linux Hosting (cPanel'li) veya bir VPS sunucusu.
    *   **Teknik Şartlar:**
        *   PHP 8.0 veya üzeri
        *   MySQL Veritabanı
        *   Apache sunucusu (veya Nginx)

## 2. Veritabanı Transferi
Bilgisayarınızdaki verileri sunucuya taşımanız gerekir.
1.  **Dışa Aktar (Local):** `http://localhost/phpmyadmin` adresine gidip `likyapay` veritabanını seçin ve **"Dışa Aktar" (Export)** diyerek `.sql` dosyasını indirin.
2.  **İçe Aktar (Sunucu):** Hosting panelinizden (cPanel) "phpMyAdmin"e girin, yeni bir veritabanı oluşturun ve indirdiğiniz dosyayı **"İçe Aktar" (Import)** yapın.

## 3. Dosyaların Yüklenmesi
1.  **FTP Programı:** FileZilla gibi bir program indirin.
2.  **Bağlantı:** Hosting firmanızın verdiği FTP bilgileriyle sunucuya bağlanın.
3.  **Yükleme:** `c:\Users\Casper\Desktop\xampp\htdocs\likyapay` klasöründeki **tüm dosyaları**, sunucudaki `public_html` klasörünün içine sürükleyip bırakın.

## 4. Ayarların Yapılması
Dosyalar yüklendikten sonra siteniz hemen çalışmaz, çünkü veritabanı şifreleri değişmiştir.
1.  Sunucudaki `core/database.php` dosyasını açın (veya yüklemeden önce düzenleyin).
2.  Aşağıdaki kısımları sunucu bilgilerine göre güncelleyin:

```php
private $host = "localhost";
private $db_name = "likyapay_db"; // Sunucudaki veritabanı adı
private $username = "kullanici_adi"; // Sunucudaki kullanıcı adı
private $password = "sifre"; // Sunucudaki şifre
```

## 5. Özel Durumlar (LikyaPay İçin)
*   **SSL Sertifikası:** Sitenizin güvenli görünmesi (`https://`) için hosting panelinden "Let's Encrypt SSL"i aktif edin.
*   **Performans:** Eğer mobilde hız sorunu yaşarsanız, daha önce hazırladığımız `bundle.js` sistemini aktif edebiliriz.
*   **.htaccess:** Linklerin düzgün çalışması için `api` klasöründeki yönlendirmelerin çalıştığından emin olun (çoğu hostingde otomatik çalışır).

**Özet Kontrol Listesi:**
- [ ] Domain alındı
- [ ] Hosting alındı
- [ ] Veritabanı yüklendi
- [ ] Dosyalar yüklendi
- [ ] `database.php` güncellendi

Yardıma ihtiyacınız olursa, hosting bilgilerinizi (özelden değil, paneli açıp) paylaşırsanız kurulumu sizin yerinize de yapabilirim (uzaktan erişimle).
