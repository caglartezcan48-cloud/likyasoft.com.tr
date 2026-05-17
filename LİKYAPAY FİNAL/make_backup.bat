@echo off
chcp 65001 >nul
echo Yedekleme Basliyor...

set SOURCE="%~dp0"
set DEST="C:\Users\Casper\Desktop\13.01.26kapanış"

echo Kaynak: %SOURCE%
echo Hedef: %DEST%

if not exist %DEST% mkdir %DEST%

echo Dosyalar kopyalaniyor...
robocopy %SOURCE% %DEST% /E /XD .git .idea node_modules .gemini "13.01.26kapanış" /R:1 /W:1 /XF make_backup.bat

echo Veritabani yedekleniyor (XAMPP Varsayilan: root, sifresiz)...
"C:\xampp\mysql\bin\mysqldump.exe" -u root --opt likyapay > %DEST%\likyapay_full_backup.sql

echo.
echo ==========================================
echo YEDEKLEME TAMAMLANDI.
echo Klasor: 13.01.26kapanış (Masaüstü)
echo ==========================================
pause
