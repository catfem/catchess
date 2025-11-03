// Service Worker for CatChess PWA
// Enables offline play, caching, and background sync

const CACHE_NAME = 'catchess-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS)
          .catch((err) => {
            console.error('[SW] Failed to cache assets:', err);
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Skip WebSocket and API requests
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }
  
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws/')) {
    return;
  }

  // Cache-first strategy for static assets
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2)$/) ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  ) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            console.log('[SW] Serving from cache:', request.url);
            return cached;
          }

          return fetch(request)
            .then((response) => {
              // Don't cache non-OK responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone response before caching
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });

              return response;
            })
            .catch((err) => {
              console.error('[SW] Fetch failed:', err);
              
              // Return offline page for navigation requests
              if (request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
              }
              
              return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
              });
            });
        })
    );
  }
});

// Background sync for game data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-games') {
    event.waitUntil(syncGames());
  }
});

async function syncGames() {
  console.log('[SW] Syncing games...');
  
  try {
    // Get games from IndexedDB that need syncing
    // This would integrate with your game storage
    // For now, just log
    console.log('[SW] Games synced');
  } catch (err) {
    console.error('[SW] Sync failed:', err);
    throw err;
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New chess challenge!',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag || 'catchess-notification',
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CatChess', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Message handler for communication with clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(STATIC_ASSETS))
    );
  }
});

console.log('[SW] Service worker loaded');
