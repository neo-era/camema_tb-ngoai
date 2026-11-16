// Service worker: cache "app shell" (cache-first); KHÔNG can thiệp API Apps Script và ô bản đồ OpenStreetMap.
const SHELL = 'tbngoai-v1.0.5';
const FILES = ['./', 'index.html', 'app.css', 'config.js', 'manifest.webmanifest', 'js/app.js', 'js/core.js', 'js/version.js', 'js/theme.js',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css', 'vendor/exceljs.min.js', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== SHELL).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.hostname.endsWith('script.google.com') || u.hostname.endsWith('googleusercontent.com')) return; // API: luôn đi mạng
  if (u.hostname.endsWith('tile.openstreetmap.org')) return; // ô bản đồ: để trình duyệt tải trực tiếp (giữ Referer theo chính sách OSM)
  if (u.origin !== location.origin) return;
  // config.js: mạng trước để nhận URL mới
  if (u.pathname.endsWith('/config.js')) {
    // no-cache: bỏ qua bộ nhớ đệm HTTP để nhận cấu hình mới ngay
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(SHELL).then((c) => c.put(e.request, cp)); } return r.ok ? r : caches.match(e.request).then((h) => h || r); }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).catch(() => (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });
