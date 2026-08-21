// Calyxo Universal Notification Engine (iOS Native + W3C Web Push & PWA)
import { Capacitor } from '@capacitor/core';
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '../utils/vapidKeys.js';
import { supabase } from '../lib/supabaseClient.js';

let swRegistration = null;

export async function getNotificationStatus() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { CalyxoNotification } = Capacitor.Plugins;
      if (CalyxoNotification) {
        const res = await CalyxoNotification.getPermissionStatus();
        return res; // { status: "authorized" | "denied" | "notDetermined", isRegistered: boolean }
      }
    } catch (e) {
      console.warn('[CALYXO-PUSH] Error reading native status:', e);
    }
  }
  
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return {
      status: Notification.permission === 'granted' ? 'authorized' : Notification.permission === 'denied' ? 'denied' : 'notDetermined',
      isRegistered: false
    };
  }

  return { status: 'unsupported', isRegistered: false };
}

export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { CalyxoNotification } = Capacitor.Plugins;
      if (CalyxoNotification) {
        const res = await CalyxoNotification.requestPermissions();
        console.log('[CALYXO-PUSH] Native permission requested:', res);
        return res?.granted ? 'granted' : 'denied';
      }
    } catch (e) {
      console.error('[CALYXO-PUSH] Error requesting native permission:', e);
      return 'denied';
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('[NotificationService] Request permission error:', e);
    return 'denied';
  }
}

export async function registerServiceWorker() {
  if (Capacitor.isNativePlatform() || typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;
    if (reg.update) reg.update();
    console.log('[NotificationService] Service Worker registered with scope:', reg.scope);
    return reg;
  } catch (error) {
    console.warn('[NotificationService] Service Worker registration failed:', error);
    return null;
  }
}

export async function triggerOSNotification(title, body, url = '/user/dashboard', tag = null) {
  if (Capacitor.isNativePlatform()) {
    try {
      const { CalyxoNotification } = Capacitor.Plugins;
      if (CalyxoNotification) {
        await CalyxoNotification.scheduleLocalNotification({
          title,
          body,
          delaySeconds: 1,
          id: tag || `notif-${Date.now()}`
        });
        return;
      }
    } catch (e) {
      console.warn('[CALYXO-PUSH] Native trigger notification error:', e);
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (typeof window !== 'undefined' && typeof window.Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      const notifTag = tag || `calyxo-${title.replace(/\s+/g, '-').toLowerCase()}`;
      if ('serviceWorker' in navigator) {
        const reg = swRegistration || await navigator.serviceWorker.ready.catch(() => null);
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body: body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [300, 100, 300],
            tag: notifTag,
            renotify: true,
            data: { url: url || '/user/dashboard' }
          });
          return;
        }
      }
    } catch (e) {
      console.warn('[NotificationService] OS notification trigger exception:', e);
    }
  }
}

export function scheduleExactNotification({ id, title, body, delayMs, tag, type, workoutId, exerciseName, setNumber, isOngoing = false }) {
  const delaySecs = Math.max(1, Math.round((delayMs || 1000) / 1000));

  if (Capacitor.isNativePlatform()) {
    try {
      const { CalyxoNotification } = Capacitor.Plugins;
      if (CalyxoNotification) {
        CalyxoNotification.scheduleLocalNotification({
          title,
          body,
          delaySeconds: delaySecs,
          id: id || tag || `notif-${Date.now()}`,
          isOngoing: Boolean(isOngoing || (id && id.includes('live')) || (tag && tag.includes('workout'))),
          // Deep-link metadata attached to notification userInfo
          ...(type && { type }),
          ...(workoutId && { workoutId }),
          ...(exerciseName && { exerciseName }),
          ...(setNumber !== undefined && { setNumber })
        });
        console.log(`[CALYXO-PUSH] Scheduled native notification id=${id} in ${delaySecs}s: "${title}"`);
        return;
      }
    } catch (e) {
      console.warn('[CALYXO-PUSH] Native schedule notification error:', e);
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const msg = {
    type: 'SCHEDULE_NOTIFICATION',
    id: id || `notif-${Date.now()}`,
    title,
    body,
    delayMs: Math.max(100, delayMs || 0),
    tag
  };

  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(msg);
  } else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      if (reg && reg.active) reg.active.postMessage(msg);
    }).catch(() => {});
  }
}

/**
 * Cancel a pending notification by ID.
 */
export async function cancelNotification(id) {
  if (!id) return;

  if (Capacitor.isNativePlatform()) {
    try {
      const { CalyxoNotification } = Capacitor.Plugins;
      if (CalyxoNotification) {
        await CalyxoNotification.cancelLocalNotification({ id });
        console.log(`[CALYXO-PUSH] Cancelled notification id=${id}`);
      }
    } catch (e) {
      console.warn('[CALYXO-PUSH] Native cancel notification error:', e);
    }
    return;
  }

  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CANCEL_NOTIFICATION', id });
  }
}

export function scheduleDailyReminders() {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
    // Schedule water and workout reminders natively
    scheduleExactNotification({
      id: 'reminder-water',
      title: 'Hydration Check 💧',
      body: 'Time to drink water! Target: 250-500ml to stay at peak performance.',
      delayMs: 2 * 60 * 60 * 1000,
      tag: 'water-reminder'
    });
    return;
  }

  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

  scheduleExactNotification({
    id: 'reminder-water',
    title: 'Hydration Check 💧',
    body: 'Time to drink water! Target: 250-500ml to stay at peak performance.',
    delayMs: 2 * 60 * 60 * 1000,
    tag: 'water-reminder'
  });
}

export async function subscribeToPushNotifications(userId) {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
    const perm = await requestNotificationPermission();
    return { success: perm === 'granted' };
  }

  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Push notifications are not supported by this browser.' };
  }

  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission denied.' };
    }

    const reg = swRegistration || await registerServiceWorker();
    if (!reg) {
      return { success: false, error: 'Service worker unavailable.' };
    }

    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    const subJson = subscription.toJSON();
    const endpoint = subscription.endpoint;

    if (userId) {
      try {
        await supabase.from('push_subscriptions').upsert({
          user_id: userId,
          subscription: subJson,
          endpoint,
          platform: navigator.platform || 'web',
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser',
          updated_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        }, { onConflict: 'endpoint' });
      } catch (dbErr) {
        console.warn('[NotificationService] Supabase db save warning:', dbErr);
      }
    }

    return { success: true, subscription };
  } catch (err) {
    console.error('[NotificationService] Push subscription error:', err);
    return { success: false, error: err.message || 'Failed to generate push subscription' };
  }
}

export async function unsubscribeFromPushNotifications(userId) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const reg = swRegistration || await navigator.serviceWorker.getRegistration();
    if (reg) {
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        if (userId) {
          await supabase.from('push_subscriptions').delete().eq('user_id', userId).eq('endpoint', endpoint);
        }
      }
    }
  } catch (e) {
    console.warn('[NotificationService] Unsubscribe error:', e);
  }
}

/* In-App Notifications API */
export async function getUserNotifications(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[NotificationService] getUserNotifications DB error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[NotificationService] getUserNotifications exception:', err);
    return [];
  }
}

export async function markNotificationAsRead(notifId) {
  if (!notifId) return false;
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('id', notifId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[NotificationService] markNotificationAsRead error:', err);
    return false;
  }
}

export async function deleteNotification(notifId) {
  if (!notifId) return false;
  try {
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notifId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[NotificationService] deleteNotification error:', err);
    return false;
  }
}

export function subscribeToInAppNotifications(userId, callback) {
  if (!userId || typeof window === 'undefined') return () => {};

  getUserNotifications(userId).then(n => callback(n));

  // 1. Postgres changes on user_notifications table
  const postgresChannel = supabase
    .channel(`user_notifications_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          triggerOSNotification(
            payload.new.title || 'Calyxo Notification',
            payload.new.body || '',
            payload.new.cta_link || '/user/dashboard',
            payload.new.notification_id || payload.new.id
          );
        }
        getUserNotifications(userId).then(n => callback(n, payload.new));
      }
    )
    .subscribe();

  // 2. Realtime broadcast channel for instant live delivery across active iOS, Android, and Web apps
  const broadcastChannel = supabase
    .channel('calyxo_alerts_broadcast')
    .on('broadcast', { event: 'ADMIN_ALERT' }, (event) => {
      const alert = event.payload;
      if (!alert) return;
      const targetUserIds = alert.targetUserIds || [];
      // Deliver if targeted to everyone (empty targetUserIds) or explicitly targeted to this user
      if (targetUserIds.length === 0 || targetUserIds.includes(userId)) {
        triggerOSNotification(
          alert.title || 'Calyxo Announcement',
          alert.body || '',
          alert.cta_link || '/user/dashboard',
          alert.id
        );
        getUserNotifications(userId).then(n => callback(n, alert));
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(postgresChannel);
    supabase.removeChannel(broadcastChannel);
  };
}
