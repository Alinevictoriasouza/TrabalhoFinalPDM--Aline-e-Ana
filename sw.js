// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
const OFFLINE_VERSION = 1;
const CACHE_NAME = "Livraria-Online";
const OFFLINE_URL = "/fallback";
// Customize this with a different URL if needed.
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            // Setting {cache: 'reload'} in the new request will ensure that the response
            // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
            await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
        })()
    );
});

self.addEventListener("activate", (event) => {
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        if (event.request.url.match(/SignOut/)) {
            return false;
        }
        event.respondWith(
            (async () => {
                try {
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    console.log("Fetch failed; returning offline page instead.", error);

                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match(OFFLINE_URL);
                    return cachedResponse;
                }
            })()
        );
    }
});