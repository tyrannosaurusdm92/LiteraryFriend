/* LiteraryFriend final shell service worker.
   Large AI shards, conversion helpers, PDF maps, and Studio payloads remain
   network-on-demand so installation is reliable on limited devices. */
const CACHE = 'literaryfriend-final-shell-2026-08-10-backend-r2';
const RUNTIME_CACHE = 'literaryfriend-final-runtime-2026-08-10-backend-r2';
const SHELL = [
  './literaryfriend-login.html',
  './literaryfriend.html',
  './css/app.css',
  './css/accessibility.css',
  './css/retro.css',
  './css/print.css',
  './css/final-completion.css',
  './json/literaryfriend.webmanifest',
  './json/final-completion.json',
  './assets/images/Icon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './js/compat.js',
  './js/core.js',
  './js/storage.js',
  './js/api.js',
  './js/security.js',
  './js/writer-tools.js',
  './js/editor.js',
  './js/assistant.js',
  './js/accessibility.js',
  './js/app.js',
  './js/final-completion.js',
  './js/pwa.js',
  './js/studio-shell-template.js'
];

function isRuntimeResource(url) {
  const path = url.pathname;
  if (/\/(?:assets\/converters|assets\/pdf-cmaps|json\/ai-index)\//.test(path)) return false;
  if (/\/js\/intelligence-corpus-part-[123]_studio\.js$/.test(path)) return false;
  return /\.(?:css|js|mjs|json|webmanifest|png|svg|wav)$/i.test(path);
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('literaryfriend-') && ![CACHE, RUNTIME_CACHE].includes(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const shellRequest = SHELL.some(path => url.pathname.endsWith(path.replace('./', '')));
  const runtimeRequest = isRuntimeResource(url);
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && (shellRequest || runtimeRequest)) {
          const clone = response.clone();
          caches.open(shellRequest ? CACHE : RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
