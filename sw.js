self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('the-magic-cache').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/js/extension.js',
        '/js/main.js',
        '/js/vue.global.prod.js',
        '/css/main.css',
        '/assets/bg.jpg',
        '/assets/logo.png',
        '/assets/cantarell.ttf',
        '/assets/fira-code-regular.ttf',
        '/assets/jost-bold.otf',
        '/favicon.ico'
      ]);
    })
  );
});

self.addEventListener('fetch', async function(event) {
  if(event.request.url.endsWith("/version")){
    event.respondWith(new Response("0.1", {
      status: 200,
      statusText: "OK" //
    }));
  } else { 
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return cachedResponse;
    return fetch(event.request); 
  }
});
