// Self-destructing service worker.
// A previous build of this site or another tool registered a service worker
// that can intercept auth routes. This file clears caches, unregisters itself,
// and sends pages back to the network.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (error) {
        // best effort
      }

      try {
        await self.registration.unregister();
      } catch (error) {
        // ignore
      }

      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});

// While alive, never intercept; go straight to network.
self.addEventListener("fetch", () => {});
