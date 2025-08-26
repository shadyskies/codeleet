// Service Worker for offline functionality
const CACHE_NAME = 'leetcode-company-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/company.html',
    '/styles.css',
    '/script.js',
    '/company.js',
    '/company_list.txt'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
    );
});
