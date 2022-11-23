version = "0.1.13"; 
self.addEventListener('install', function(e) {
  console.log(`Service Worker v${version} Installed`);
  e.waitUntil(
    caches.open('the-magic-cache').then(function(cache) {
      console.log("Caching Resources");
      return cache.addAll([
        '/',
        '/index.html',
        '/js/extension.js',
        '/js/main.js',
        '/js/vue.global.prod.js',
        '/css/main.css',
        '/assets/logo.png',
        '/assets/cantarell.ttf',
        '/assets/fira-code-regular.ttf',
        '/assets/jost-bold.otf',
        '/assets/bg.jpg',
        '/favicon.ico'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  if(event.request.url.endsWith("/version")){
    event.respondWith(new Response(version, {
      status: 200,
      statusText: "OK" //
    }));
  } else { 
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }
});
