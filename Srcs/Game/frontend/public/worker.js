const CACHE_NAME = 'pong-cache-v1';
const OFFLINE_URL = '/offline.html';

// 1. INSTALL EVENT: Runs once when the app is installed
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache the offline page so we always have it
      return cache.add(OFFLINE_URL);
    })
  );
  // Force the waiting worker to become the active worker
  self.skipWaiting(); 
});

// 2. ACTIVATE EVENT: Clean up old caches if we update the version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
                  .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH EVENT: The Traffic Cop
self.addEventListener('fetch', (event) => {
  // Only intercept page navigation requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If the network fails (offline), serve the offline.html!
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
