/* FitDuo service worker: app works offline; food lookups always go to the network. */
const CACHE = "fitduo-1.0.0";
const SHELL = ["./", "index.html", "style.css", "i18n.js", "exercises.js", "data.js", "cues.js", "fig.js", "app.js",
  "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "vendor/zxing.min.js", "privacy.html"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // Open Food Facts etc: network only
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; }).catch(() => hit || caches.match("index.html"));
    return hit || net;
  }));
});
