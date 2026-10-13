// Hors ligne : coquille de l'app mise à jour en arrière-plan, images en cache permanent
const V = 'forme-v5';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'util.js', 'store.js', 'exercises.js', 'program.js', 'core.js', 'ui.js',
  'timer.js', 'workout.js', 'views.js', 'manifest.webmanifest', 'icons/icon-192.png', 'fonts/inter.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/img/') || url.pathname.includes('/fonts/')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(V).then(c => c.put(e.request, copy)); return res;
    })));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(cached => {
    // no-cache : évite de mélanger un fichier neuf et un fichier encore dans le cache HTTP
    const net = fetch(e.request.mode === 'navigate' ? e.request : new Request(e.request, { cache: 'no-cache' })).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => cached);
    return cached || net;
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs[0] ? cs[0].focus() : self.clients.openWindow('./')));
});
