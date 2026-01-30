/* ==================================
   Water Sort Puzzle – Service Worker
   Silent Auto Update + Version Sync
================================== */

const VERSION = "1.1.28"; // 🔁 MUST MATCH GAME_VERSION
const CACHE_NAME = `water-sort-${VERSION}`;

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

/* ---------- INSTALL ---------- */
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

/* ---------- ACTIVATE ---------- */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {

  // Ignore non-GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {

      if (cached) return cached;

      return fetch(event.request).then(response => {

        // ❌ DO NOT cache partial responses (206)
        if (
          !response ||
          response.status !== 200 ||
          response.type !== "basic"
        ) {
          return response;
        }

        const responseClone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      });

    }).catch(() => {
      // Optional offline fallback
    })
  );
});

