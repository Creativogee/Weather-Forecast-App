const staticCacheName = 'site-static-v03';
const dynamicCacheName = 'site-dynamic';
const assets = [
  'index.html',
  'images/bg.webp',
  'images/icons/weather-icon-72x72.png',
  'images/icons/weather-icon-96x96.png',
  'images/icons/weather-icon-152x152.png',
  'images/icons/weather-icon-192x192.png',
  'js/app.js',
  'js/ui.js',
  'css/main.css',
  'https://kit.fontawesome.com/7bbe69c105.js',
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// install event
self.addEventListener('install', (evt) => {
  console.log('service worker: installed');
  evt.waitUntil(
    caches
      .open(staticCacheName)
      .then((cache) => {
        cache.addAll(assets);
        console.log('service worker: caching assets...');
      })
      .then(() => self.skipWaiting())
  );
});

// activate event
self.addEventListener('activate', (evt) => {
  console.log('service worker: activated');
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Listen fetch event
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(evt.request).then((fetchRes) => {
          return caches.open(dynamicCacheName).then((cache) => {
            cache.put(evt.request.url, fetchRes.clone());
            return fetchRes;
          });
        })
      );
    })
  );
});
