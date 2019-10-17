importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

var CACHE_NAME = 'weathercast-pwa';

workbox.routing.registerRoute(
  /.+(?:\/lib\/.+\.js|\.png)$/,
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAME,
  })
);

workbox.routing.registerRoute(
  /.+\/ame_master\.js$/,
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  /.+(?:\/|\.html|\/js\/.+\.js|\/css\/.+\.css)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAME,
  })
);

workbox.routing.registerRoute(
  /.+\.xml$/,
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAME,
  })
);
