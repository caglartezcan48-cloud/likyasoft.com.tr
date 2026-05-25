# Likyasoft Projesi - Oturum Devir Notları (Handover Notes)

**Tarih:** 29 Nisan 2026
**Mevcut Durum:** Localhost'ta Geliştirme Tamamlandı. Canlıya Alma (Deploy) Aşamasına Geçilecek.

## Bugüne Kadar Neler Başarıldı?
1. **Mazello ERP Entegrasyonu:** `dist/mazelloerp` klasörü `public/mazelloerp` içine kopyalandı. API'deki 404 hataları çözüldü ve XAMPP Apache üzerinden çalışacak şekilde (port 80) veritabanı ayarları onarıldı.
2. **LikyaPay Entegrasyonu:** `LİKYAPAY FİNAL` projesi klasör olarak `public/likyapay` içine taşındı. `home.php` ve tüm scriptler içindeki sabit (hardcoded) `/views/...` kök yolları, `/likyasoft/public/likyapay/views/...` şeklinde dinamik hale getirildi.
3. **LikyaPay Veritabanı Onarımı:** `likyapay_full_backup.sql` dosyası UTF-16LE kodlamasından UTF-8'e çevrilerek başarıyla kuruldu.
4. **LikyaPay Kullanıcı Rolleri:** Veritabanındaki hatalı Türkçe karakterli `YÖNETİCİ` rolü `admin` olarak düzeltildi. "Kullanıcı Modülü Yüklenmedi" (React Component) hatası session sıfırlaması ile aşıldı. `admin@likyapay.com` hesabı sorunsuz bağlandı.
5. **Likyasoft Admin Paneli:** Ana projedeki `likyasoft_db` admin şifresi sıfırlandı (`admin` / `123456`).

## Yarın (Bir Sonraki Oturumda) Yapılacaklar:
**Hedef:** Projeyi `likyasoft.com.tr` veya belirlenen canlı sunucuya hatasız şekilde aktarmak (Deployment).

### Adım Adım Deploy Planı:
1. **Veritabanı Aktarımı:** 
   - `likyasoft_db`, `mazello_erp` (varsa) ve `likyapay` veritabanlarının dışa aktarılması (Export).
   - Canlı sunucudaki (örneğin InfinityFree) veritabanlarına import edilmesi.
2. **Konfigürasyon (Config/DB) Güncellemeleri:**
   - Likyasoft: `api/db.php` ve `setup.php` dosyalarındaki `localhost` bilgilerini canlı sunucu bilgileriyle değiştirmek.
   - Mazello ERP: `public/mazelloerp/config/db_secrets.php` güncellenmesi.
   - LikyaPay: `public/likyapay/core/config.php` dosyasındaki `$is_localhost` yapısının canlı sunucu (`DB_HOST`, `DB_NAME`, `DB_USER`) ayarlarına adapte edilmesi.
3. **Dosyaların Yüklenmesi:** 
   - `htdocs/likyasoft` klasörünün tamamının (veya build alınarak) ZIP yapılıp canlı sunucunun public_html veya htdocs dizinine yüklenmesi (FileZilla veya CPanel File Manager ile).
4. **Linklerin Güncellenmesi:** 
   - Veritabanındaki `seed_projects.php` içindeki veya projeler tablosundaki `http://localhost/...` yollarının `https://likyasoft.com.tr/...` olarak güncellenmesi.

> **Yapay Zeka Asistanı İçin Not (Self-Note):** Yeni oturum başladığında, bu dosyayı (`YARIN_ICIN_NOTLAR.md`) okuyarak projenin hangi dizin yapısında olduğunu ve localhost port çakışmalarını nasıl çözdüğümüzü anlayabilirsin. Vite React App `http://localhost:5173`'te çalışırken, alt projeler Apache port 80 üzerinden `http://localhost/likyasoft/public/...` şeklinde çalışmaktadır. Canlıya alınırken bu port ayrımı ortadan kalkacak, hepsi aynı Apache/Nginx sunucusunda çalışacaktır.
