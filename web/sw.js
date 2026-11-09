// Shudu PWA Service Worker
const CACHE_NAME = 'shudu-pwa-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './addon.html',
  './manifest.json',
  './public/stylesheets/style.css',
  './public/javascripts/zh_TW.js',
  './public/javascripts/pangu.js',
  './public/javascripts/shudu.js',
  './public/javascripts/query.js',
  './public/javascripts/pwa.js',
  './public/javascripts/addon.js',
  './public/libs/quill/quill.js',
  './public/libs/quill/quill.snow.css',
  './public/libs/jquery/jquery.min.js',
  './public/libs/opencc/opencc.js',
  './public/libs/opencc/opencc.wasm',
  './public/libs/opencc/s2twp.json',
  './public/libs/opencc/tw2sp.json',
  './public/libs/opencc/STCharacters.ocd2',
  './public/libs/opencc/STPhrases.ocd2',
  './public/libs/opencc/TSCharacters.ocd2',
  './public/libs/opencc/TSPhrases.ocd2',
  './public/libs/opencc/TWPhrases.ocd2',
  './public/libs/opencc/TWPhrasesRev.ocd2',
  './public/libs/opencc/TWVariants.ocd2',
  './public/libs/opencc/TWVariantsRev.ocd2',
  './public/libs/opencc/TWVariantsRevPhrases.ocd2',
  './public/images/favicon.ico',
  './public/images/icon-192.png',
  './public/images/icon-512.png',
  './public/images/icon-maskable-192.png',
  './public/images/icon-maskable-512.png',
  './public/images/apple-touch-icon.png',
  './public/images/icon.svg'
];

// Install: precache all core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache or network
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Skip analytics / tag manager requests
  if (url.hostname.includes('googletagmanager.com') || url.hostname.includes('google-analytics.com')) {
    return;
  }

  // Navigation requests: Network first, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('./index.html') || caches.match('/');
        })
    );
    return;
  }

  // Resource requests: Cache first, then network, then cache dynamically
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            (networkResponse.status === 200 || networkResponse.type === 'opaque')
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an image, could return a fallback if needed
          return cachedResponse;
        });
    })
  );
});
