<?php
require_once 'api/db.php';

$slug = isset($_GET['slug']) ? $_GET['slug'] : '';

if (empty($slug)) {
    header("Location: index.html");
    exit;
}

$stmt = $conn->prepare("SELECT * FROM projects WHERE slug = ?");
$stmt->execute([$slug]);
$project = $stmt->fetch();

if (!$project) {
    echo "<h1>Modül Bulunamadı</h1><p>Aradığınız proje henüz yayında değil veya ismi değişmiş olabilir.</p><a href='/likyasoft/'>Ana Sayfaya Dön</a>";
    exit;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($project['title']) ?> | Likyasoft Proje İnceleme</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root {
            --bg-color: #fafbfc;
            --text-primary: #111827;
            --text-secondary: #4b5563;
            --primary: #1eacc7;
            --secondary: #c5a363;
            --accent: #d4af37;
            --glass-bg: #ffffff;
            --glass-border: rgba(0, 0, 0, 0.08);
            --transition-main: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: 'Outfit', sans-serif;
            line-height: 1.6;
            transition: var(--transition-main);
        }

        .container { max-width: 1000px; margin: 0 auto; padding: 4rem 2rem; }
        
        .header { margin-bottom: 4rem; text-align: center; }
        .header span { color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 0.9rem; }
        .header h1 { font-size: 4rem; margin-top: 1rem; color: var(--text-primary); }

        .image-preview { 
            width: 100%; aspect-ratio: 16/9; 
            background: white; 
            border: 1px solid var(--glass-border); 
            border-radius: 32px; 
            overflow: hidden;
            margin-bottom: 4rem;
            display: flex; align-items: center; justify-content: center;
            transition: var(--transition-main);
            box-shadow: var(--shadow-sm);
        }
        .image-preview:hover { transform: scale(1.01); border-color: var(--secondary); box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1); }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; }
        .no-image { color: var(--text-secondary); font-style: italic; }

        .details { display: grid; grid-template-columns: 2fr 1fr; gap: 4rem; }
        .description h2 { margin-bottom: 1.5rem; font-size: 2rem; }
        .description p { color: var(--text-secondary); font-size: 1.1rem; }

        .sidebar { padding: 2rem; background: white; border: 1px solid var(--glass-border); border-radius: 24px; height: fit-content; box-shadow: var(--shadow-sm); }
        .info-item { margin-bottom: 2rem; }
        .info-item label { display: block; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; margin-bottom: 0.5rem; }
        .info-item p { font-weight: 600; font-size: 1.1rem; color: var(--text-primary); }

        .btn-live {
            display: inline-flex; align-items: center; gap: 0.8rem;
            width: 100%; justify-content: center;
            padding: 1rem; background: linear-gradient(135deg, var(--secondary), var(--accent));
            color: white; text-decoration: none; border-radius: 12px; font-weight: 800;
            transition: var(--transition-main);
        }
        .btn-live:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(197, 163, 99, 0.3); }

        .back-link { 
            position: fixed; top: 2rem; left: 2rem; 
            color: var(--text-secondary); text-decoration: none; 
            display: flex; align-items: center; gap: 0.8rem; 
            font-weight: 600; transition: var(--transition-main);
            padding: 0.5rem 1rem; background: #fff; border-radius: 50px; border: 1px solid var(--glass-border); box-shadow: var(--shadow-sm);
        }
        .back-link:hover { color: var(--primary); transform: translateX(-5px); }

        @media (max-width: 768px) {
            .header h1 { font-size: 2.5rem; }
            .details { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

    <a href="/likyasoft/" class="back-link"><i data-lucide="arrow-left"></i> Geri Dön</a>

    <div class="container">
        <div style="text-align: center; margin-bottom: 2rem;">
            <img src="logo.png" alt="Likyasoft" style="height: 80px; width: auto;">
        </div>
        <div class="header">
            <span><?= htmlspecialchars($project['category']) ?> Sektörü</span>
            <h1><?= htmlspecialchars($project['title']) ?></h1>
        </div>

        <div class="image-preview">
            <?php if ($project['image_url']): ?>
                <img src="<?= htmlspecialchars($project['image_url']) ?>" alt="<?= htmlspecialchars($project['title']) ?>">
            <?php else: ?>
                <div class="no-image">Bu proje için önizleme görseli eklenmemiş.</div>
            <?php endif; ?>
        </div>

        <div class="details">
            <div class="description">
                <h2>Proje Hakkında</h2>
                <p>
                    <?= nl2br(htmlspecialchars($project['description'] ?: 'Likyasoft tarafından geliştirilen bu modül, sektördeki dijital ihtiyaçları karşılamak üzere özel olarak tasarlanmıştır. Yüksek performans, modern arayüz ve kullanıcı odaklı yaklaşım ile inşa edilmiştir.')) ?>
                </p>
            </div>
            
            <div class="sidebar">
                <div class="info-item">
                    <label>Sektör</label>
                    <p><?= htmlspecialchars($project['category']) ?></p>
                </div>
                <div class="info-item">
                    <label>Modül Durumu</label>
                    <p>Aktif / Canlıda</p>
                </div>
                
                <?php if ($project['project_url']): ?>
                    <a href="<?= htmlspecialchars($project['project_url']) ?>" target="_blank" class="btn-live">
                        Canlı Siteyi Gör <i data-lucide="external-link"></i>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
