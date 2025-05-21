const CACHE_NAME = 'my-pwa-cache';
const urlsToCache = [
    '/',
    '/index.html',
    '/Views/formView.html',
    '/Views/dataView.html',
    '/css/style.css',
    '/js/app.js',
    '/js/form.js',
    '/js/api.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[Service Worker] Caching failed:', error);
            })
    );
});

self.addEventListener('fetch', event => {
    //Cache-first
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log('[Service Worker] Serving from cache:', event.request.url);
                return response;
            }
            console.log('[Service Worker] Fetching from network:', event.request.url);
            return fetch(event.request).then(networkResponse => {
                if (networkResponse.ok && event.request.method === 'GET') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('<h1>Offline</h1><p>Brak połączenia z internetem i zasób nie jest dostępny w pamięci podręcznej.</p>', {
                    headers: { 'Content-Type': 'text/html' }
                });
            });
        })
    );
});