var VERSION = "v20191014-1";

var CACHE_NAME = 'weathercast-pwa';
var urlsToCache = [
  './index.html',
  './css/style.css',
  './js/xml2json.js',
  './js/ame_master.js',
  './js/content.js',
  './image/app-icon-512.png',
  './image/app-icon-384.png',
  './image/app-icon-192.png',
  'https://cdn.jsdelivr.net/npm/pwacompat@2.0.9/pwacompat.min.js'
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
