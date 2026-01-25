/* ================================
   Water Sort Puzzle – Service Worker
   Silent Auto-Update + Clean Cache
================================ */

const VERSION = "7.1.27"; // 🔁 CHANGE THIS ON EVERY RELEASE
const CACHE_NAME = `water-sort-cache-${VERSION}`;

// Core files to cache (App Shell)
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",

  // Images
  "./images/water-sort.png",
  "./images/reset.png",
  "./images/undo.png",
  "./images/level-up.png",
  "./images/developer.png",

  // Sounds
  "./sound/pour.mp3",
  "./sound/win.mp3"
];

/* ================================
   INSTALL – Cache core files
================================ */
self.addEventListener("install", event => {
  self.skipWaiting(); // ⚡ activate immediately

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

/* ================================
   ACTIVATE – Remove old caches
================================ */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

/* ================================
   FETCH STRATEGY
================================ */

/*
  1️⃣ HTML → Network First (Always Fresh)
  2️⃣ Assets → Cache First (Fast)
*/
self.addEventListener("fetch", event => {
  const req = event.request;

  // Always fetch fresh HTML
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(res => {
        // Save new files silently
        if (req.url.startsWith(self.location.origin)) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        }
        return res;
      });
    })
  );
});
