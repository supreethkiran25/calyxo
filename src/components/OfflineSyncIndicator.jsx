import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { subscribeSyncStatus, getPendingQueueCount } from '../utils/offlineQueue';

export default function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncState, setSyncState] = useState('online'); // 'online' | 'offline' | 'syncing' | 'synced'
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setSyncState('syncing');
      setTimeout(() => setSyncState('synced'), 2500);
      setTimeout(() => setSyncState('online'), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = subscribeSyncStatus(({ isOnline, pendingCount, status }) => {
      setIsOnline(isOnline);
      setPendingCount(pendingCount);
      if (status === 'syncing') setSyncState('syncing');
      else if (status === 'synced') {
        setSyncState('synced');
        setTimeout(() => setSyncState('online'), 4000);
      } else if (!isOnline) setSyncState('offline');
    });

    getPendingQueueCount().then(setPendingCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  if (isOnline && syncState === 'online' && pendingCount === 0) {
    return null; // Silent when fully online and synced
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg border backdrop-blur-md transition-all duration-300 pointer-events-none select-none bg-[var(--surface)] border-[var(--card-border)] text-[var(--foreground)]">
      {!isOnline && (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>○ Offline — changes will sync automatically</span>
        </>
      )}

      {isOnline && syncState === 'syncing' && (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-[var(--color-acid-green)] animate-spin" />
          <span>↻ Syncing {pendingCount > 0 ? `(${pendingCount} queued)` : ''}...</span>
        </>
      )}

      {isOnline && syncState === 'synced' && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>✓ Synced</span>
        </>
      )}
    </div>
  );
}
