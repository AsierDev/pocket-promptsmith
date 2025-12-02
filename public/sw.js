const CACHE_NAME = 'pocket-promptsmith-static-v4';
const PRECACHE_URLS = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/offline.html'
];
const ASSET_DESTINATIONS = new Set(['style', 'script', 'font', 'image']);
const PRIVATE_PATH_PREFIXES = ['/api', '/dashboard', '/profile'];
// Note: Removed '/prompts' from PRIVATE_PATH_PREFIXES to allow SW to handle these routes

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
  
  // Debug logging for requests to /prompts paths
  if (url.pathname.startsWith('/prompts')) {
    console.log('[DEBUG SW] Fetch event for /prompts path:', url.pathname);
    console.log('[DEBUG SW] Should handle request:', shouldHandleRequest(event.request, url));
  }

  if (!shouldHandleRequest(event.request, url)) return;

  event.respondWith(handleStaticRequest(event.request));
});

function shouldHandleRequest(request, url) {
  const isSameOrigin = url.origin === self.location.origin;

  // Always allow network requests for /prompts paths to ensure fresh session data
  if (isSameOrigin && url.pathname.startsWith('/prompts')) {
    console.log('[DEBUG SW] Allowing network request for /prompts path:', url.pathname);
    return false; // Don't handle with SW, let it go to network
  }

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
  const url = new URL(request.url);

  if (url.pathname.startsWith('/prompts')) {
    console.log('[DEBUG SW] Handling request for:', url.pathname);
    console.log('[DEBUG SW] Cached response exists:', !!cachedResponse);
  }

  if (cachedResponse) {
    if (url.pathname.startsWith('/prompts')) {
      console.log('[DEBUG SW] Serving cached response for:', url.pathname);
    }
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (shouldCacheResponse(networkResponse)) {
      await cache.put(request, networkResponse.clone());
    }
    if (url.pathname.startsWith('/prompts')) {
      console.log('[DEBUG SW] Serving network response for:', url.pathname);
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
