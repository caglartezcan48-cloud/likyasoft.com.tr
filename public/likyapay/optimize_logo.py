
import os
from PIL import Image
import shutil

# Dosya yolları
base_dir = r"c:\Users\USER\Desktop\xammp\htdocs\LİKYAPAY FİNAL\views\frontend\gorsel"
original_logo_path = os.path.join(base_dir, "logo.png")
backup_logo_path = os.path.join(base_dir, "logo_original_backup_v2.png")
optimized_logo_path = os.path.join(base_dir, "logo_optimized.png")

# 1. Yedekleme
if os.path.exists(original_logo_path):
    shutil.copy2(original_logo_path, backup_logo_path)
    print(f"✅ Orijinal logo yedeklendi: {backup_logo_path}")
else:
    print("❌ HATA: Logo dosyası bulunamadı!")
    exit()

# 2. Optimizasyon
try:
    with Image.open(original_logo_path) as img:
        print(f"🔍 Orijinal Boyutlar: {img.size}")
        print(f"💾 Orijinal Dosya Boyutu: {os.path.getsize(original_logo_path) / 1024:.2f} KB")

        # Optimizasyon Ayarları
        # Web için logo genelde max 800px genişlik yeterlidir (Retina ekranlar dahil)
        max_width = 800
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            print(f"📉 Yeni Boyutlar (Resize): {img.size}")

        # PNG olarak optimize et ve kaydet
        # optimize=True ve kalite ayarı
        img.save(original_logo_path, "PNG", optimize=True, quality=85)
        
        print(f"✅ Logo optimize edildi ve üzerine yazıldı.")
        print(f"💾 Yeni Dosya Boyutu: {os.path.getsize(original_logo_path) / 1024:.2f} KB")

except Exception as e:
    print(f"❌ Bir hata oluştu: {e}")
    # Hata olursa yedeği geri yükle
    shutil.copy2(backup_logo_path, original_logo_path)
    print("⚠️ Orijinal dosya geri yüklendi.")
