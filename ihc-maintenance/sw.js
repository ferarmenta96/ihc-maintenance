// ============================================================
//  IHC MAINTENANCE APP – Service Worker
//  File: sw.js
//  Enables PWA install + basic offline shell
// ============================================================

const CACHE_NAME = "ihc-mtto-v1";

// Files to cache for offline shell
const SHELL_FILES = [
  "/ihc-maintenance/index.html",
  "/ihc-maintenance/maintenance.html",
  "/ihc-maintenance/css/styles.css",
  "/ihc-maintenance/js/config.js",
  "/ihc-maintenance/js/app.js",
  "/ihc-maintenance/manifest.json",
  "/ihc-maintenance/icons/icon-192.png",
  "/ihc-maintenance/icons/icon-512.png"
];

// ---- Install: cache the app shell ----
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
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
    return; // Let it pass through normally
  }

  // For app shell files: network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with fresh response
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
