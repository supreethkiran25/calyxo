// Calyxo Native OS & PWA Web Push Notification Service Worker
const CACHE_NAME = 'calyxo-pwa-cache-v2';
const activeTimers = new Map();

// Helper to open / access IndexedDB inside Service Worker
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('calyxo_sw_notifications_db', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('scheduled')) {
        db.createObjectStore('scheduled', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveScheduledNotification(item) {
  try {
    const db = await openDB();
    const tx = db.transaction('scheduled', 'readwrite');
    tx.objectStore('scheduled').put(item);
    return tx.complete;
  } catch (e) {
    console.warn('[SW] DB save error:', e);
  }
}

async function removeScheduledNotification(id) {
  try {
    const db = await openDB();
    const tx = db.transaction('scheduled', 'readwrite');
    tx.objectStore('scheduled').delete(id);
    return tx.complete;
  } catch (e) {
    console.warn('[SW] DB delete error:', e);
  }
}

async function checkPendingNotifications() {
  try {
    const db = await openDB();
    const tx = db.transaction('scheduled', 'readonly');
    const store = tx.objectStore('scheduled');
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result || [];
      const now = Date.now();
      for (const item of items) {
        if (item.targetTime <= now) {
          triggerNativeOSNotification(item);
          removeScheduledNotification(item.id);
        } else {
          scheduleLocalTimer(item);
        }
      }
    };
  } catch (e) {
    console.warn('[SW] DB check error:', e);
  }
}

function triggerNativeOSNotification(data) {
  const options = {
    body: data.body || 'Time for your daily workout and nutrition check-in!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || data.id || 'calyxo-reminder',
    vibrate: [300, 100, 300, 100, 300],
    renotify: true,
    requireInteraction: true,
    silent: false,
    data: { url: data.url || '/user/dashboard' }
  };

  self.registration.showNotification(data.title || 'Calyxo Health & Fitness', options);
}

function scheduleLocalTimer(item) {
  const delayMs = Math.max(10, item.targetTime - Date.now());

  // 1. Check if Native OS TimestampTrigger is supported
  if ('showTrigger' in Notification.prototype && typeof TimestampTrigger !== 'undefined') {
    try {
      const options = {
        body: item.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: item.tag || item.id,
        vibrate: [300, 100, 300, 100, 300],
        renotify: true,
        showTrigger: new TimestampTrigger(item.targetTime),
        data: { url: '/user/dashboard' }
      };
      self.registration.showNotification(item.title, options);
      return;
    } catch (e) {
      console.warn('[SW] TimestampTrigger fallback to setTimeout:', e);
    }
  }

  // 2. Standard Service Worker background setTimeout
  if (activeTimers.has(item.id)) {
    clearTimeout(activeTimers.get(item.id));
  }

  const timer = setTimeout(() => {
    triggerNativeOSNotification(item);
    removeScheduledNotification(item.id);
    activeTimers.delete(item.id);
  }, delayMs);

  activeTimers.set(item.id, timer);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      checkPendingNotifications()
    ])
  );
});

// Handle Web Push event from Push Server (VAPID)
self.addEventListener('push', (event) => {
  let data = { title: 'Calyxo Health & Fitness 🚀', body: 'Daily workout and nutrition check-in is due!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'calyxo-push-remote',
      vibrate: [300, 100, 300, 100, 300],
      renotify: true,
      requireInteraction: true,
      data: { url: data.url || '/user/dashboard' }
    })
  );
});

// Handle client messages
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'SCHEDULE_NOTIFICATION') {
    const { id, title, body, delayMs, tag } = data;
    const targetTime = Date.now() + Math.max(100, delayMs || 0);

    const item = {
      id: id || `notif-${Date.now()}`,
      title: title || 'Calyxo Fitness',
      body: body || 'Reminder from Calyxo',
      targetTime,
      tag: tag || id || 'calyxo-notif'
    };

    saveScheduledNotification(item);
    scheduleLocalTimer(item);
  }

  if (data.type === 'CANCEL_NOTIFICATION') {
    if (activeTimers.has(data.id)) {
      clearTimeout(activeTimers.get(data.id));
      activeTimers.delete(data.id);
    }
    removeScheduledNotification(data.id);
  }

  if (data.type === 'SHOW_IMMEDIATE_NOTIFICATION') {
    triggerNativeOSNotification({
      id: 'immediate-' + Date.now(),
      title: data.title || 'Calyxo Notification',
      body: data.body || 'Notification system active.',
      tag: data.tag || 'calyxo-instant'
    });
  }
});

// Handle OS Notification click event
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
