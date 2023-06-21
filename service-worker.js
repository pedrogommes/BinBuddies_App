const CACHE_STATIC_NAME = "static-v1";
const CACHE_DYNAMIC_NAME = "dynamic-v1";

const OFFLINE_URL = "./offline.html";

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      return cache.addAll([
        "/index.html",
        "/Login.js",
        "offlinePage.css",
        "/Home.html",
        "/Profile.html",
        "/signin.html",
        "/Local.html",
        OFFLINE_URL,
      ]);
    })
  );
});

self.addEventListener("fetch", function (e) {
  async function handleNavigationRequest(request) {
    try {
      const networkResponse = await fetch(request);
      return networkResponse;
    } catch (error) {
      console.log("Fetch failed; returning offline page instead.", error);
      const cache = await caches.open(CACHE_STATIC_NAME);
      const cachedResponse = await cache.match(OFFLINE_URL);

      if (cachedResponse) {
        return cachedResponse;
      }

      console.log("Unable to retrieve the offline page from the cache.");

      // Respond with a simple offline message
      return new Response("<h1>You are offline</h1>", {
        headers: { "Content-Type": "offline.html" }
      });
    }
  }

  if (e.request.mode === "navigate") {
    e.respondWith(
      handleNavigationRequest(e.request).catch(function (error) {
        console.log("Navigation request failed; returning offline page instead.", error);
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(e.request)
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
                cache.put(e.request.url, res.clone());
                return res;
              });
            })
            .catch(function (err) {
              console.log(err);
            });
        }
      })
    );
  }
});