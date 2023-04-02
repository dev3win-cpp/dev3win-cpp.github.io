'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "cdbddc4177c4f911c30d28d5a546245f",
"favicon.ico": "ed75c02958a7e222ec4ea40c7fb53040",
"index.html": "950e71a7fb2f98469c2a0946c26d0808",
"/": "950e71a7fb2f98469c2a0946c26d0808",
"apple-touch-icon.png": "be7462b72e903e327584ac84fc49d0d0",
"main.dart.js": "c19c895c79ced33d7104c2d5fb62a6a2",
"icon-192.png": "d92f353a59d167e4043e743f78015b7d",
"flutter.js": "a85fcf6324d3c4d3ae3be1ae4931e9c5",
"icon-192-maskable.png": "6a35d2024d310f7ffd2c22c3f9ae0acd",
"icon-512-maskable.png": "028373945c22c2e98ea4b0c8de62b572",
"manifest.json": "2e64f6c28a26934b3b3a58c1c38f3304",
"assets/AssetManifest.json": "4de40e028477f05854e45e0022f517fb",
"assets/NOTICES": "66d61a52f6068d7d5e34a67c159f9b33",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/lib/asset/300x300p5.jpg": "c4e4761690ebd580c063e5e5fb92697a",
"assets/lib/asset/300x300p7.jpg": "2c472e5cf8b82b96ebd505d4127552b9",
"assets/lib/asset/300x300p18.jpg": "1cefbb39fb0627f70a9bcb2029d5c580",
"assets/lib/asset/800x600g18.jpg": "c36d720907fe6f06a4348672df7789a0",
"assets/lib/asset/600x800g8.jpg": "a92e7c5c55d9d49388abddd8c1768c57",
"assets/lib/asset/800x600g11.jpg": "d0c0ab2cea5170dd49b739d3e74dc107",
"assets/lib/asset/800x600g10.jpg": "4d7d7cef92701bfd9441e475709c0d1d",
"assets/lib/asset/600x800g3.jpg": "5b44e677a0ff3816100d08bee2994078",
"assets/lib/asset/600x800g4.jpg": "350c133d562537774ad4d4c6e656d2ec",
"assets/lib/asset/800x600g17.jpg": "bcf51a419c7845cf752e00d55b247759",
"assets/lib/asset/800x600g16.jpg": "66b369b2ade834a1b48e51a5f7e76073",
"assets/lib/asset/600x800g7.jpg": "8a807eac1be66503e6db3f700155e154",
"assets/lib/asset/800x600g14.jpg": "f299cb02553b53f2f4cf1d5b751cf1b5",
"assets/lib/asset/300x300p14.jpg": "c0697727e2a3157658d179e2b08fb3d6",
"assets/lib/asset/800x600g6.jpg": "b7ab5b523406f1eefc2365283da54858",
"assets/lib/asset/600x800g12.jpg": "3f6e917ca8768d0d770a41ac99b04c38",
"assets/lib/asset/800x600g1.jpg": "de54a9d003cb81f8fac046f3b31f1192",
"assets/lib/asset/300x300p11.jpg": "5c23ab9cff462aff585e0e09b636f02c",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"icon-512.png": "f2b3535cb6511204bc0feb3ab20b11d3",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
