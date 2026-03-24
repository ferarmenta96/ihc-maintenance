// ============================================================
//  IHC MAINTENANCE APP – Service Worker
//  File: sw.js
//  Enables PWA install + basic offline shell
// ============================================================

const CACHE_NAME = "ihc-mtto-v2";

// ---- Install: skip caching shell to avoid path issues ----
self.addEventListener("install", event => {
  self.skipWaiting();
});

// ---- Activate: clean up old caches ----
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ---- Fetch: network first, fallback to cache ----
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Always go network-first for API calls (Apps Script)
  if (url.hostname.includes("script.google.com")) {
    return;
  }

  // For everything else: network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
