const CACHE_NAME = 'pocket-promptsmith-static-v3';
const PRECACHE_URLS = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/offline.html'
];
const ASSET_DESTINATIONS = new Set(['style', 'script', 'font', 'image']);
const PRIVATE_PATH_PREFIXES = ['/api', '/prompts', '/dashboard', '/profile'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (!shouldHandleRequest(event.request, url)) return;

  event.respondWith(handleStaticRequest(event.request));
});

function shouldHandleRequest(request, url) {
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin && PRIVATE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return false;
  }

  if (isSameOrigin && PRECACHE_URLS.includes(url.pathname)) {
    return true;
  }

  return ASSET_DESTINATIONS.has(request.destination);
}

async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (shouldCacheResponse(networkResponse)) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

function shouldCacheResponse(response) {
  if (!response || !response.ok) return false;
  const cacheControl = response.headers.get('cache-control');
  if (!cacheControl) return true;
  return !/no-store|no-cache|private/i.test(cacheControl);
}
