// ============================================================
//  IHC MAINTENANCE APP – Service Worker (KILL SWITCH)
//  File: sw.js
//  This version removes offline capabilities, clears all caches, 
//  and completely unregisters the service worker from the browser.
// ============================================================

self.addEventListener("install", event => {
  self.skipWaiting(); // Force the new worker to take over immediately
});

self.addEventListener("activate", event => {
  event.waitUntil(
    // 1. Delete all existing caches
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => {
      // 2. Unregister the Service Worker completely
      return self.registration.unregister();
    })
  );
  self.clients.claim();
});

// Always go directly to the network, no caching at all
self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});
