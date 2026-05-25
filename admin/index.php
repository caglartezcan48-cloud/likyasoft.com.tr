<?php
session_start();
require_once '../api/db.php';

// --- ASLA OTURUM KAPATMAYAN GARANTİ SİSTEM ---
if (!isset($_SESSION['logged_in']) && isset($_COOKIE['likya_token'])) {
    if ($_COOKIE['likya_token'] === 'secure_admin_access') {
        $_SESSION['logged_in'] = true;
    }
}

// GİRİŞ FORMU (Orijinal Tasarım)
if (!isset($_SESSION['logged_in']) && !isset($_POST['login'])) {
    ?>
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8"><title>Giriş | Likyasoft</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body { background: #fafbfc; color: #111; font-family: 'Outfit'; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .login-box { background: white; padding: 3rem; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            input { width: 100%; padding: 12px; margin: 10px 0; background: #fff; border: 1px solid #ddd; color: #111; border-radius: 8px; box-sizing: border-box; }
            button { width: 100%; padding: 12px; background: linear-gradient(135deg, #c5a363, #d4af37); border: none; color: white; font-weight: 800; border-radius: 8px; cursor: pointer; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h2 style="margin-bottom: 2rem;">Likyasoft Admin</h2>
            <form method="POST">
                <input type="text" name="username" placeholder="Kullanıcı Adı" required>
                <input type="password" name="password" placeholder="Şifre" required>
                <button type="submit" name="login">Giriş Yap</button>
            </form>
            <p style="font-size: 0.7rem; color: #555; margin-top: 2rem;">Varsayılan: admin / likyasoft2024</p>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// GİRİŞ İŞLEMİ
if (isset($_POST['login'])) {
    $user = $_POST['username'];
    $pass = $_POST['password'];

    if (($user === 'admin' && $pass === 'likyasoft2024')) {
        $_SESSION['logged_in'] = true;
        setcookie('likya_token', 'secure_admin_access', time() + (86400 * 30), "/");
        header("Location: index.php");
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$user]);
    $u = $stmt->fetch();

    if ($u && password_verify($pass, $u['password'])) {
        $_SESSION['logged_in'] = true;
        setcookie('likya_token', 'secure_admin_access', time() + (86400 * 30), "/");
        header("Location: index.php");
        exit;
    }
}

// ÇIKIŞ
if (isset($_GET['logout'])) {
    session_destroy();
    setcookie('likya_token', '', time() - 3600, "/");
    header("Location: index.php");
    exit;
}

// İŞLEMLER
if (isset($_GET['delete'])) { $stmt = $conn->prepare("DELETE FROM projects WHERE id = ?"); $stmt->execute([$_GET['delete']]); header("Location: index.php"); exit; }
if (isset($_POST['add_project'])) {
    $stmt = $conn->prepare("INSERT INTO projects (title, slug, category, project_url, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$_POST['title'], $_POST['slug'], $_POST['category'], $_POST['url'], $_POST['status']]);
    header("Location: index.php"); exit;
}

$projects = $conn->query("SELECT * FROM projects ORDER BY id DESC")->fetchAll();
?>

<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8"><title>Panel | Likyasoft</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { background: #fafbfc; color: #111; font-family: 'Outfit'; margin: 0; display: flex; }
        aside { width: 280px; background: white; height: 100vh; border-right: 1px solid #eee; padding: 2rem; box-sizing: border-box; }
        main { flex: 1; padding: 3rem; overflow-y: auto; }
        .glass-card { background: white; border: 1px solid #eee; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .btn { padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: none; color: white; transition: 0.3s; }
        .btn-add { background: #c5a363; } .btn-delete { background: #ff4444; color: white; }
        .form-add { background: white; padding: 2.5rem; border-radius: 12px; border: 1px solid #eee; margin-bottom: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        input { background: #fff; border: 1px solid #ddd; color: #111; padding: 10px; border-radius: 6px; margin-right: 10px; box-sizing: border-box; }
        h1 { margin-bottom: 2rem; font-size: 2rem; color: #111; }
    </style>
</head>
<body>
    <aside>
        <div style="text-align: center; margin-bottom: 2rem;"><img src="../logo.png" alt="Logo" style="height: 60px; width: auto;"></div>
        <h2 style="font-size: 1.1rem; color: #c5a363; font-weight: 800; text-align: center;">Likyasoft Panel</h2>
        <nav style="margin-top: 2rem;">
            <a href="index.php" style="color: #111; text-decoration: none; display: block; margin-bottom: 1.2rem; font-weight: 600;">Projeleri Yönet</a>
            <a href="?logout" style="color: #6b7280; text-decoration: none; font-size: 0.85rem;">Çıkış Yap</a>
        </nav>
    </aside>
    <main>
        <h1>Proje Yönetimi</h1>
        <div class="form-add">
            <form method="POST">
                <input type="text" name="title" placeholder="Başlık" required>
                <input type="text" name="slug" placeholder="Slug" required>
                <input type="text" name="category" placeholder="Sektör" required>
                <input type="text" name="url" placeholder="Link">
                <select name="status" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd;"><option value="completed">Tamamlandı</option><option value="upcoming">Yakında</option></select>
                <button type="submit" name="add_project" class="btn btn-add">Ekle</button>
            </form>
        </div>
        <div class="projects-list">
            <?php foreach($projects as $p): ?>
            <div class="glass-card">
                <div>
                    <strong><?= htmlspecialchars($p['title']) ?></strong><br>
                    <span style="color: #00d2ff; font-size: 0.8rem;"><?= htmlspecialchars($p['category']) ?></span>
                </div>
                <a href="?delete=<?= $p['id'] ?>" class="btn btn-delete" onclick="return confirm('Sil?')">Sil</a>
            </div>
            <?php endforeach; ?>
        </div>
    </main>
</body>
</html>
