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

// Global In-Memory Rate Limiter & Anti-Spam Pipeline
const recentNotificationDispatches = new Map();

function isNotificationThrottled(key, cooldownMs = 15000) {
  const now = Date.now();
  const lastTime = recentNotificationDispatches.get(key) || 0;
  if (now - lastTime < cooldownMs) {
    return true;
  }
  recentNotificationDispatches.set(key, now);
  return false;
}

export async function triggerOSNotification(title, body, url = '/user/dashboard', tag = null) {
  const deterministicTag = tag || `calyxo-${(title || 'notif').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  // Rate Limiter: Drop rapid burst notifications with the exact same content within 15 seconds
  if (isNotificationThrottled(deterministicTag, 15000)) {
    console.log(`[NotificationService] Dropped duplicate notification burst: "${title}"`);
    return;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const { CalyxoNotification } = Capacitor.Plugins;
      if (CalyxoNotification) {
        await CalyxoNotification.scheduleLocalNotification({
          title,
          body,
          delaySeconds: 1,
          id: deterministicTag
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
      if ('serviceWorker' in navigator) {
        const reg = swRegistration || await navigator.serviceWorker.ready.catch(() => null);
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body: body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [300, 100, 300],
            tag: deterministicTag,
            renotify: false,
            data: { url: url || '/user/dashboard' }
          });
          return;
        }
      }

      if (typeof window.Notification === 'function') {
        new Notification(title, {
          body,
          icon: '/icon-192x192.png',
          tag: deterministicTag
        });
      }
    } catch (e) {
      console.warn('[NotificationService] OS notification trigger exception:', e);
    }
  }
}

export async function sendTestNotification(options = {}) {
  const title = options.title || 'Calyxo Quad Rings Synced 🔥';
  const body = options.body || 'Your daily steps (7,420 / 10,000) and calories (1,450 kcal) have synced to your Home Screen!';
  const url = options.url || '/user/dashboard';
  
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    await requestNotificationPermission();
  }

  await triggerOSNotification(title, body, url, 'calyxo-test-notif');
  return { success: true, title, body };
}

export function scheduleExactNotification({ id, title, body, delayMs, tag, type, workoutId, exerciseName, setNumber, isOngoing = false }) {
  const delaySecs = Math.max(1, Math.round((delayMs || 1000) / 1000));
  const deterministicId = id || tag || `calyxo-${(title || 'notif').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  // If immediate notification, apply anti-burst throttle
  if (delaySecs <= 5 && !isOngoing) {
    if (isNotificationThrottled(deterministicId, 10000)) {
      console.log(`[NotificationService] Suppressed rapid schedule burst for id=${deterministicId}`);
      return;
    }
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const { CalyxoNotification } = Capacitor.Plugins;
      if (CalyxoNotification) {
        CalyxoNotification.scheduleLocalNotification({
          title,
          body,
          delaySeconds: delaySecs,
          id: deterministicId,
          isOngoing: Boolean(isOngoing || (id && id.includes('live')) || (tag && tag.includes('workout'))),
          // Deep-link metadata attached to notification userInfo
          ...(type && { type }),
          ...(workoutId && { workoutId }),
          ...(exerciseName && { exerciseName }),
          ...(setNumber !== undefined && { setNumber })
        });
        console.log(`[CALYXO-PUSH] Scheduled native notification id=${deterministicId} in ${delaySecs}s: "${title}"`);
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
    id: deterministicId,
    title,
    body,
    delayMs: Math.max(100, delayMs || 0),
    tag: tag || deterministicId
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

/**
 * Legacy schedule daily reminders placeholder (Managed by SmartReminderEngine)
 */
export function scheduleDailyReminders() {
  // Handled dynamically by SmartReminderEngine.evaluateAndTriggerReminders
}

import { toValidUuid } from '../lib/dbService.js';

export async function subscribeToPushNotifications(userId) {
  if (Capacitor.isNativePlatform()) {
    const perm = await requestNotificationPermission();
    if (userId) {
      try {
        const platform = Capacitor.getPlatform();
        let pushToken = null;
        if (platform === 'ios') {
          try {
            const { CalyxoNotification } = Capacitor.Plugins;
            if (CalyxoNotification && CalyxoNotification.getApnsToken) {
              const res = await CalyxoNotification.getApnsToken();
              pushToken = res?.token || null;
            }
          } catch (e) {}
        }
        await supabase.from('push_subscriptions').upsert({
          user_id: toValidUuid(userId),
          subscription: { native: true, platform, pushToken, permissionStatus: perm },
          endpoint: `native-${platform}-${userId}`,
          platform,
          browser: `Calyxo Native ${platform.toUpperCase()}`,
          updated_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        }, { onConflict: 'endpoint' });
      } catch (dbErr) {
        console.warn('[NotificationService] Supabase native device registration warning:', dbErr);
      }
    }
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
    .on('broadcast', { event: 'ADMIN_ALERT' }, async (event) => {
      const alert = event?.payload;
      if (!alert) return;
      
      const targetUserIds = Array.isArray(alert.targetUserIds) ? alert.targetUserIds : [];
      const currentUid = String(userId || '').trim().toLowerCase();
      const currentValidUuid = toValidUuid(currentUid);
      
      const isMatch = alert.isBroadcast === true || 
                      targetUserIds.length === 0 || 
                      targetUserIds.some(tid => {
                        const strTid = String(tid || '').trim().toLowerCase();
                        return strTid === currentUid || strTid === currentValidUuid || toValidUuid(strTid) === currentValidUuid;
                      });

      if (isMatch) {
        // Trigger OS notification banner (native iOS/Android or Web Push/PWA)
        await triggerOSNotification(
          alert.title || 'Calyxo Announcement',
          alert.body || '',
          alert.cta_link || '/user/dashboard',
          alert.id || `alert-${Date.now()}`
        ).catch(() => {});

        // Refresh in-app notifications and trigger in-app toast
        getUserNotifications(userId).then(n => {
          callback(n || [], alert);
        }).catch(() => {
          callback([], alert);
        });
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(postgresChannel);
    supabase.removeChannel(broadcastChannel);
  };
}
