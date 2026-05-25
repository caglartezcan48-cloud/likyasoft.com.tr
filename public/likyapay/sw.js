const CACHE_NAME = 'likyapay-v4';
const ASSETS = [
  '/public/likyapay/views/home.php',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  '/public/likyapay/views/frontend/css/style.css?v=3',
  '/public/likyapay/views/frontend/gorsel/logo.png'
];

// Install: Cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('LikyaPay: Önemli dosyalar önbelleğe alınıyor...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
  // Don't cache API calls
  if (event.request.url.includes('/api/') || event.request.url.includes('check_session')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // Cache new scripts and assets on the fly
        if (event.request.url.includes('.js') || event.request.url.includes('.css') || event.request.url.includes('/gorsel/')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
