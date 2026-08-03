// Calyxo Enterprise PWA Service Worker & Background Sync Engine
const CACHE_NAME = 'calyxo-static-v4';
const DYNAMIC_CACHE = 'calyxo-dynamic-v4';
const SHELL_CACHE = 'calyxo-shell-v4';

const APP_SHELL_ROUTES = [
  '/',
  '/user/dashboard',
  '/user/nutrition',
  '/user/workout',
  '/user/progress',
  '/user/ai',
  '/user/profile',
  '/manifest.json',
  '/favicon.ico'
];

// Service Worker Install Lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Service Worker Activate Lifecycle & Stale Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => caches.delete(key))
        );
      })
    ])
  );
});

// Fetch Intercept — Smart Network-First Navigation & Development Bypass
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Bypass Localhost / Development & Non-GET Requests & Auth/APIs
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    req.method !== 'GET' ||
    url.pathname.includes('/auth/v1') ||
    url.pathname.includes('/admin') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('supabase.co')
  ) {
    return; // Pass directly to browser network
  }

  // 2. Navigation Routes (HTML Pages) -> Network-First (Never serve stale HTML on reload)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // 3. Static Assets (Images/Fonts) -> Stale-While-Revalidate
  if (req.destination === 'image' || req.destination === 'font') {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }
});

// Handle W3C Remote Web Push Event
self.addEventListener('push', (event) => {
  let data = { 
    title: 'Calyxo', 
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

  // Brand the title — always show "Calyxo" as the notification source
  const brandedTitle = data.title || 'Calyxo';

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || 'calyxo-push',
    vibrate: [300, 100, 300],
    renotify: false,
    requireInteraction: false,
    silent: false,
    data: { url: data.url || '/user/dashboard' }
  };

  event.waitUntil(self.registration.showNotification(brandedTitle, options));
});

// Handle Notification Click
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

// Background Sync Handler
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

// Message Event Listener
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'SCHEDULE_NOTIFICATION') {
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || data.id,
      vibrate: [300, 100, 300],
      data: { url: '/user/dashboard' }
    };
    setTimeout(() => {
      self.registration.showNotification(data.title, options);
    }, Math.max(100, data.delayMs || 0));
  }

});
