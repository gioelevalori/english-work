const CACHE = "english-work-v5";
const FILES = ["./", "index.html", "style.css", "app.js", "data.js", "data2.js", "data3.js", "data4.js", "audio-index.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rete prima (per avere sempre l'ultima versione), cache se offline.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // I file audio vanno direttamente al browser: Safari li scarica a pezzi (Range) e non vanno intercettati.
  if (url.pathname.includes("/audio/")) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
