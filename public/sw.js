const CACHE_NAME = "spendshare-cache-v4";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/SpendShare.png",
  "/manifest.json",
];

// ---- INSTALL ----
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ---- ACTIVATE ----
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ---- FETCH ----
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Skip non-GET
  if (event.request.method !== "GET") return;

  // 2. Skip non same-origin (chrome-extension://, blob://, data://, etc.)
  if (url.origin !== self.location.origin) return;

  // 3. Skip Firebase/Google services
  const skippedHosts = [
    "firebaseio.com",
    "firebasestorage.googleapis.com",
    "identitytoolkit.googleapis.com",
    "securetoken.googleapis.com",
    "googleapis.com",
  ];
  if (skippedHosts.some((host) => url.hostname.includes(host))) return;

  // 4. Skip URLs with query params like /split?id=...
  if (url.search) return;

  // 5. Navigation requests — network first, fall back to shell
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", clone));
          }
          return res;
        })
        .catch(() => caches.match("/index.html") ?? caches.match("/"))
    );
    return;
  }

  // 6. Static assets — cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((res) => {
        if (!res || !res.ok || res.type === "opaque") return res;

        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      });
    })
  );
});

// ---- MESSAGES ----
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});