const CACHE_NAME = 'likyapay-v20260106-force-update';
const ASSETS = [
    '/likyasoft/public/likyapay/views/home.php',
    '/likyasoft/public/likyapay/views/frontend/gorsel/logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
