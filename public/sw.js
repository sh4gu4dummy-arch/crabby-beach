const CACHE = "crabby-beach-v.026";
const PRECACHE = [
  "/",
  "/grownups",
  "/favicon.svg",
  "/fonts/Fredoka.ttf",
  "/game/beach.jpg",
  "/game/crab-idle-1.png",
  "/game/crab-idle-2.png",
  "/game/crab-idle-3.png",
  "/game/crab-idle-4.png",
  "/game/crab-walk-1.png",
  "/game/crab-walk-2.png",
  "/game/crab-walk-3.png",
  "/game/crab-walk-4.png",
  "/game/shell-white-1.png",
  "/game/shell-white-2.png",
  "/game/shell-white-3.png",
  "/game/shell-white-4.png",
  "/game/shell-green-1.png",
  "/game/shell-green-2.png",
  "/game/shell-green-3.png",
  "/game/shell-green-4.png",
  "/voice/one.mp3",
  "/voice/two.mp3",
  "/voice/three.mp3",
  "/voice/four.mp3",
  "/voice/five.mp3",
  "/voice/six.mp3",
  "/voice/seven.mp3",
  "/voice/eight.mp3",
  "/voice/nine.mp3",
  "/voice/ten.mp3",
  "/voice/win-sunny.mp3",
  "/voice/win-sunset.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/downloads/")) return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            void caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match("/") || Response.error());
    }),
  );
});
