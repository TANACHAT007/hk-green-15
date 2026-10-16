// Offline cache for the GitHub Pages site: pages network-first (always fresh when online), assets cache-first.
const V = 'hk15-1792142000';
const CORE = ['./', './index.html', './app.html', './style.css', './app.js', './model3d.js', './static_mode.js', './i18n.js', './landing3d.js',
  './vendor/three.module.js', './vendor/GLTFLoader.js', './vendor/OrbitControls.js', './vendor/RoomEnvironment.js', './vendor/BufferGeometryUtils.js',
  './vendor/meshopt_decoder.module.js', './icons/icon-192.png', './img/hero.jpg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('.mp4')) return;
  const page = e.request.mode === 'navigate' || /\.(html|js|css)$/.test(u.pathname);
  e.respondWith(page
    ? fetch(e.request).then((r) => { const c = r.clone(); caches.open(V).then((x) => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }))
    : caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(V).then((x) => x.put(e.request, c)); } return r; })));
});
