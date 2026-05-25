# Likya Pay API Todo List (api.md)

Bu dosya, backend sisteminin (Faz 2) geliştirilmesi için gerekli API uç noktalarını (endpoints) ve yapılacakları listeler.

## 1. Authentication (Kimlik Doğrulama)
- [ ] **POST** `/api/login`: Kullanıcı girişi (Email/Şifre). JWT veya Session döndürür.
- [ ] **POST** `/api/register`: Yeni kullanıcı ön kaydı (Şirket bilgileri, Vergi No, vb.).
- [ ] **POST** `/api/logout`: Çıkış işlemi.

## 2. Admin API
- [ ] **GET** `/api/admin/dashboard`: Toplam Kullanıcı, Toplam Borç/Alacak, Döngü Kazancı istatistikleri.
- [ ] **GET** `/api/admin/users`: Tüm kullanıcıları listele (Aktif/Pasif).
- [ ] **POST** `/api/admin/users`: Yeni kullanıcı ekle/düzenle (Yetkilendirme).
- [ ] **PUT** `/api/admin/users/{id}/status`: Kullanıcıyı Pasif/Aktif yap.
- [ ] **POST** `/api/admin/cycle/create`: Manuel döngü tetikle (Sirius Algoritması).
- [ ] **GET** `/api/admin/archive`: Arşivlenmiş döngü ve belgeleri listele (Filtreli: 5 Yıl).

## 3. User (Company) API
- [ ] **GET** `/api/company/dashboard`: Giriş yapan şirketin özeti (Borç, Alacak, Bakiye).
- [ ] **POST** `/api/company/debt`: Yeni borçlu firma ekle (Fatura yükleme ile).
- [ ] **POST** `/api/company/credit`: Yeni alacaklı firma ekle.
- [ ] **GET** `/api/company/transactions`: Borç/Alacak hareket dökümü.
- [ ] **POST** `/api/company/upload`: Belge yükleme (Resmi evraklar).

## 4. System & Reports
- [ ] **GET** `/api/reports/cycle/{id}`: Belirli bir döngünün detay raporu.
- [ ] **GET** `/api/reports/pdf/{type}/{id}`: PDF oluşturma servisi (Fatura, Sözleşme, Rapor).
- [ ] **GET** `/api/settings/logs`: Sistem logları (Hata ve işlem takibi).

---
**Teknolojiler:**
- PHP (Native veya Framework)
- MySQL (Veritabanı)
- JSON (Veri Formatı)
