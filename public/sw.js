// Calyxo PWA & Web Push Notification Service Worker
const CACHE_NAME = 'calyxo-pwa-cache-v1';
const scheduledTimers = new Map();

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming messages from client window/PWA
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'SCHEDULE_NOTIFICATION') {
    const { id, title, body, delayMs, tag } = data;
    if (scheduledTimers.has(id)) {
      clearTimeout(scheduledTimers.get(id));
    }

    const timer = setTimeout(() => {
      self.registration.showNotification(title || 'Calyxo Health & Fitness', {
        body: body || 'Time for your daily workout and nutrition check-in!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: tag || id || 'calyxo-reminder',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: { url: '/user/dashboard' }
      });
      scheduledTimers.delete(id);
    }, Math.max(100, delayMs || 0));

    scheduledTimers.set(id, timer);
  }

  if (data.type === 'CANCEL_NOTIFICATION') {
    if (scheduledTimers.has(data.id)) {
      clearTimeout(scheduledTimers.get(data.id));
      scheduledTimers.delete(data.id);
    }
  }

  if (data.type === 'SHOW_IMMEDIATE_NOTIFICATION') {
    self.registration.showNotification(data.title || 'Calyxo Notification', {
      body: data.body || 'Notification system active.',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'calyxo-instant',
      vibrate: [100, 50, 100],
      data: { url: '/user/dashboard' }
    });
  }
});

// Handle notification banner clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/user/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/user/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
