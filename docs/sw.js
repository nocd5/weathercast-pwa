var CACHE_NAME = 'weathercast-pwa';
var urlsToCache = [
  './index.html',
  './css/style.css',
  './js/xml2json.js',
  './js/ame_master.js',
  './js/content.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches
    .match(event.request)
    .then(response => response ? response : fetch(event.request))
  );
});
