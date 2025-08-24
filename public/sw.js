// --- Burnout Buddy service worker (simple offline cache) ---
// public/sw.js
const CACHE = "bbuddy-v5";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

// Install: pre-cache basic shell
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// Fetch strategy:
// - HTML: network-first (fallback to cached /)
// - Others (js/css/png): cache-first (fallback to network)
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const isHTML = req.headers.get("accept")?.includes("text/html");

  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
    )
  );
});
self.addEventListener("install", (e) => {
  self.skipWaiting();                // take over immediately
  e.waitUntil(caches.open(CACHE));   // create/open the new cache
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : undefined)))
    )
  );
  self.clients.claim();              // claim all open pages/tabs
});

// (keep any fetch handler you already had; if none, this is enough to bust old caches)
