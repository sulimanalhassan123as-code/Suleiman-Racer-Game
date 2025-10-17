const CACHE = 'never-hide-cache-v1';
const urls = ['/', '/index.html', '/css/style.css', '/js/app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(urls)));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
