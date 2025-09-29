// ===============================
// Service Worker Final (Fix Dist)
// ===============================

const CACHE_NAME = "story-app-cache-v5";
const urlsToCache = [
  "/",
  "/index.html",
  "/app.bundle.js",
  "/images/logo.png",
];

// Install
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching:", urlsToCache);
      return cache.addAll(urlsToCache);
    }).catch((err) => {
      console.error("[SW] Caching failed:", err);
    })
  );
});


// Activate
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      )
    )
  );
});

// Fetch: gunakan cache jika offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match("/index.html")
        )
      );
    })
  );
});

// Push Notification
self.addEventListener("push", (event) => {
  console.log("[SW] Push event:", event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: "Story App", message: event.data.text(), url: "/" };
    }
  }

  const options = {
    body: data.message || "Anda mendapat notifikasi baru!",
    icon: "/images/logo.png",
    badge: "/images/logo.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Buka Aplikasi" },
      { action: "close", title: "Tutup" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Story App", options)
  );
});

// Handle klik notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" && event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else {
    event.waitUntil(clients.openWindow("/"));
  }
});
