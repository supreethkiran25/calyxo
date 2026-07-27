// Calyxo Enterprise PWA Service Worker & Background Sync Engine
const CACHE_NAME = 'calyxo-static-v3';
const DYNAMIC_CACHE = 'calyxo-dynamic-v3';
const SHELL_CACHE = 'calyxo-shell-v3';

const APP_SHELL_ROUTES = [
  '/',
  '/user/dashboard',
  '/user/nutrition',
  '/user/workout',
  '/user/progress',
  '/user/ai',
  '/user/profile',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Helper: Open IndexedDB for offline queue & push timers
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('calyxo_offline_db', 2);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('push_timers')) {
        db.createObjectStore('push_timers', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Service Worker Install Lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL_ROUTES).catch((err) => {
        console.warn('[SW] Pre-caching shell routes warning:', err);
      });
    })
  );
});

// Service Worker Activate Lifecycle & Stale Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key !== DYNAMIC_CACHE && key !== SHELL_CACHE) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Fetch Intercept — Smart Hybrid Caching Engine
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass non-GET requests and Supabase Auth / Gemini API endpoints
  if (req.method !== 'GET' || url.pathname.includes('/auth/v1') || url.hostname.includes('googleapis.com')) {
    return;
  }

  // 1. App Shell / Navigation Routes -> Stale-While-Revalidate
  if (req.mode === 'navigate' || APP_SHELL_ROUTES.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        const fetchPromise = fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts) -> Cache-First
  if (req.destination === 'style' || req.destination === 'script' || req.destination === 'image' || req.destination === 'font') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. Dynamic API Data -> Network-First
  event.respondWith(
    fetch(req).then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, clone));
      }
      return response;
    }).catch(() => caches.match(req))
  );
});

// Handle W3C Remote Web Push Event
self.addEventListener('push', (event) => {
  let data = { 
    title: 'Calyxo Health & Fitness 🚀', 
    body: 'Time for your daily workout and nutrition check-in!',
    url: '/user/dashboard',
    tag: 'calyxo-push-event'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    tag: data.tag || 'calyxo-push',
    vibrate: [300, 100, 300, 100, 300],
    renotify: true,
    requireInteraction: true,
    silent: false,
    data: { url: data.url || '/user/dashboard' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle Notification Click & Smart Tab Focus Routing
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/user/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/user/') && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background Sync Handler for Offline Action Queues
self.addEventListener('sync', (event) => {
  if (event.tag === 'calyxo-offline-sync') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});

// Handle Messages from Client React Application
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'SCHEDULE_NOTIFICATION') {
    const targetTime = Date.now() + Math.max(100, data.delayMs || 0);
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || data.id,
      vibrate: [300, 100, 300, 100, 300],
      renotify: true,
      requireInteraction: true,
      data: { url: '/user/dashboard' }
    };

    // Native OS TimestampTrigger support
    if ('showTrigger' in Notification.prototype && typeof TimestampTrigger !== 'undefined') {
      try {
        options.showTrigger = new TimestampTrigger(targetTime);
        self.registration.showNotification(data.title, options);
        return;
      } catch (e) {}
    }

    setTimeout(() => {
      self.registration.showNotification(data.title, options);
    }, Math.max(100, data.delayMs || 0));
  }

  if (data.type === 'SHOW_IMMEDIATE_NOTIFICATION') {
    self.registration.showNotification(data.title || 'Calyxo Alert', {
      body: data.body || 'Notification system active.',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      data: { url: '/user/dashboard' }
    });
  }
});
