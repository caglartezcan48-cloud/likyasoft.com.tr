const CACHE_NAME = 'mazello-turbo-v25';
const ASSETS = [
    './',
    './index.html',
    './assets/index-BnZXNgDp.css',
    './assets/index-BRJCz15D.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Sadece GET isteklerini cache'le (API POST - Kayıt işlemleri hariç)
    if (event.request.method !== 'GET') return;

    // API çağrılarını cache'leme (Onu js/store.js zaten yapabiliyor veya canlı veri lazım)
    if (event.request.url.includes('api/')) return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
