const CACHE_NAME = 'mortgage-calc-v1';
const BASE_PATH = '/MortgageCalc/';

const urlsToCache = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'styles.css',
    BASE_PATH + 'script.js',
    BASE_PATH + 'manifest.json',
    BASE_PATH + 'icon-192.png',
    BASE_PATH + 'icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
}); 