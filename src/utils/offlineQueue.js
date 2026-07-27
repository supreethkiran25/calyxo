// Calyxo Offline-First Queue & Sync Engine (IndexedDB + Background Sync)

let listeners = [];

export function subscribeSyncStatus(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notifySyncStatus(status) {
  listeners.forEach((l) => l(status));
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) return reject('No IndexedDB');

    const request = indexedDB.open('calyxo_offline_db', 2);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function enqueueOfflineAction(action) {
  try {
    const db = await openDB();
    const tx = db.transaction('queue', 'readwrite');
    const item = {
      id: `action-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...action
    };
    tx.objectStore('queue').put(item);

    notifySyncStatus({ isOnline: navigator.onLine, pendingCount: await getPendingQueueCount(), status: 'queued' });

    // Request Service Worker Background Sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.sync) {
        await reg.sync.register('calyxo-offline-sync');
      }
    }
    return item;
  } catch (e) {
    console.warn('[OfflineQueue] Enqueue error:', e);
  }
}

export async function getPendingQueueCount() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('queue', 'readonly');
      const req = tx.objectStore('queue').count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch (e) {
    return 0;
  }
}

export async function flushOfflineQueue(syncCallback) {
  if (typeof window === 'undefined' || !navigator.onLine) {
    notifySyncStatus({ isOnline: false, pendingCount: await getPendingQueueCount(), status: 'offline' });
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction('queue', 'readonly');
    const store = tx.objectStore('queue');
    const req = store.getAll();

    req.onsuccess = async () => {
      const items = req.result || [];
      if (items.length === 0) {
        notifySyncStatus({ isOnline: true, pendingCount: 0, status: 'synced' });
        return;
      }

      notifySyncStatus({ isOnline: true, pendingCount: items.length, status: 'syncing' });

      for (const item of items) {
        if (typeof syncCallback === 'function') {
          await syncCallback(item);
        }
        // Remove synced item from queue
        const delTx = db.transaction('queue', 'readwrite');
        delTx.objectStore('queue').delete(item.id);
      }

      notifySyncStatus({ isOnline: true, pendingCount: 0, status: 'synced' });
    };
  } catch (e) {
    console.warn('[OfflineQueue] Flush error:', e);
    notifySyncStatus({ isOnline: navigator.onLine, pendingCount: 0, status: 'error' });
  }
}

// Auto-attach network status listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOfflineQueue();
  });
  window.addEventListener('offline', () => {
    notifySyncStatus({ isOnline: false, pendingCount: 0, status: 'offline' });
  });
}
