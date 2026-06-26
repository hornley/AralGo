const SHELL_CACHE = "aralgo-shell-v3";
const DATA_CACHE = "aralgo-data-v3";
const API_CACHE = "aralgo-api-v3";
const DYNAMIC_CACHE = "aralgo-dynamic-v3";

const SHELL_URLS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon.svg",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/icon-512x512-maskable.png",
  "/apple-icon-120x120.png",
  "/apple-icon-152x152.png",
  "/apple-icon-167x167.png",
  "/apple-icon-180x180.png",
];

const STATIC_REGEX = /\.(js|css|woff2?|png|svg|ico|json)$/;
const DATA_REGEX = /^https:\/\/[^/]+\.supabase\.co\/rest\/v1\//;
const API_GET_REGEX = /^\/api\//;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DATA_CACHE && k !== API_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  clients.claim();
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-outbox") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: "FLUSH_OUTBOX" });
        }
      }),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (STATIC_REGEX.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (DATA_REGEX.test(request.url)) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (request.method === "GET" && API_GET_REGEX.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  event.respondWith(networkFirst(request));
});

function addStaleHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-AralGo-Cached", "true");
  headers.set("X-AralGo-Cached-At", new Date().toISOString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    const staleResponse = addStaleHeaders(cached);

    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response);
        }
      })
      .catch(() => {});

    return staleResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok && cacheName) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      return caches.match("/offline");
    }
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
