'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "c5fdca0fd1df8cdbafbd061e58591bf3",
"splash/img/light-2x.png": "372196467bea943fa24aebcac5f33c43",
"splash/img/dark-4x.png": "d8b39ed1fae9380f8e7fbbae19a8065d",
"splash/img/light-3x.png": "3fdebf263d8a392c315869ec39ef9da4",
"splash/img/dark-3x.png": "3fdebf263d8a392c315869ec39ef9da4",
"splash/img/light-4x.png": "d8b39ed1fae9380f8e7fbbae19a8065d",
"splash/img/dark-2x.png": "372196467bea943fa24aebcac5f33c43",
"splash/img/dark-1x.png": "f86d2f05f9cdc18acf8fcae3e6032b0b",
"splash/img/light-1x.png": "f86d2f05f9cdc18acf8fcae3e6032b0b",
"index.html": "78cf33d9e6f189133f47db04f231536d",
"/": "78cf33d9e6f189133f47db04f231536d",
"main.dart.js": "6f87987306993aa09602b213cbbac15c",
"flutter.js": "6fef97aeca90b426343ba6c5c9dc5d4a",
"favicon.png": "66ca57edae7af2e15abdd6c0632e0045",
"icons/Icon-192.png": "1f6fddb8e617d9ad8ec62953ee278c6b",
"icons/Icon-maskable-192.png": "9563b30fdb5c98633e6943ed4c816b58",
"icons/Icon-maskable-512.png": "a2117d9872c5a06a403b4ddf6c59b3c5",
"icons/Icon-512.png": "ac0a133c43d3cd1219aee517e8cacf0e",
"manifest.json": "2855f5d4f018c26d58089f736ffa5231",
"assets/AssetManifest.json": "abb1994c41aeb339fca2bd1e59a53f14",
"assets/NOTICES": "775d5a1a8ee2ebbcf6ee5f2ad1c9bdd3",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "57d849d738900cfd590e9adc7e208250",
"assets/packages/mhu_flutter_commons/assets/icons/bottom_panel_open.svg": "b34d0453f4a0b5150fc17b37a9dacde1",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf",
"assets/AssetManifest.bin": "e5c87ab0ee4a401b642c187a92b32617",
"assets/fonts/MaterialIcons-Regular.otf": "eb8d117a0d9e58ddb27da4ad1887482a",
"assets/assets/images/apple-store-badge.svg": "2928664fe1fc6aca88583a6f606d60ba",
"assets/assets/images/google-play-badge.png": "faf732f09f86b1a970250f53f846e35c",
"assets/assets/images/google-play-icon.svg": "ab8d80a0cdf768e8d6335a75e8da8d3e",
"assets/assets/images/github-mark.svg": "8dcc6b5262f3b6138b1566b357ba89a9",
"assets/assets/descriptions/pizza_flutter.md": "de4499c69d3f8744b53b12c755327822",
"assets/assets/descriptions/invoices_portugal.md": "fe8ddf51434d77c841c7deca51362a25",
"assets/assets/descriptions/everything_solver.md": "3926d14f07c20904f782f96788f0011a",
"assets/assets/icons/invoices_portugal.svg": "76d0496ec4adf6d30bbe06172beaa597",
"assets/assets/icons/everything_solver.svg": "297ade76d790ed03931f3dbc52137e69",
"assets/assets/icons/pizza_flutter.svg": "792bfcc09f909006d6be53ec473e0990",
"canvaskit/skwasm.js": "1df4d741f441fa1a4d10530ced463ef8",
"canvaskit/skwasm.wasm": "6711032e17bf49924b2b001cef0d3ea3",
"canvaskit/chromium/canvaskit.js": "8c8392ce4a4364cbb240aa09b5652e05",
"canvaskit/chromium/canvaskit.wasm": "fc18c3010856029414b70cae1afc5cd9",
"canvaskit/canvaskit.js": "76f7d822f42397160c5dfc69cbc9b2de",
"canvaskit/canvaskit.wasm": "f48eaf57cada79163ec6dec7929486ea",
"canvaskit/skwasm.worker.js": "19659053a277272607529ef87acf9d8a"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
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
        // Claim client to enable caching on first launch
        self.clients.claim();
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
      // Claim client to enable caching on first launch
      self.clients.claim();
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
