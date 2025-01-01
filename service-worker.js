const CACHE_NAME = 'toolbox-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// 保持 Service Worker 活躍
self.addEventListener('message', event => {
  if (event.data === 'keepalive') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage('still-alive'));
    });
  }
}); 