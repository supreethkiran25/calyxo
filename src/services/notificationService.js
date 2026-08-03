// Calyxo W3C Web Push & PWA Notification Engine
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '../utils/vapidKeys';
import { supabase } from '../lib/supabaseClient';

let swRegistration = null;

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

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
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notifTag = tag || `calyxo-${title.replace(/\s+/g, '-').toLowerCase()}`;
      if ('serviceWorker' in navigator) {
        const reg = swRegistration || await navigator.serviceWorker.ready;
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
      new Notification(title, {
        body: body,
        icon: '/icon-192x192.png',
        tag: notifTag
      });
    } catch (e) {
      console.warn('[NotificationService] OS notification trigger exception:', e);
    }
  }
}

export async function requestNotificationPermission() {
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

export async function subscribeToPushNotifications(userId) {
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

    // Save subscription to Supabase database
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

      // Also call serverless endpoint
      try {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            subscription: subJson,
            platform: navigator.platform || 'web'
          })
        });
      } catch (apiErr) {}
    }

    scheduleDailyReminders();

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
          fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, endpoint })
          }).catch(() => {});
        }
      }
    }
  } catch (e) {
    console.warn('[NotificationService] Unsubscribe error:', e);
  }
}

export function sendImmediateNotification(title, body) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const msg = {
      type: 'SHOW_IMMEDIATE_NOTIFICATION',
      title,
      body
    };

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(msg);
    } else if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        if (reg && reg.active) reg.active.postMessage(msg);
      }).catch(() => {});
    }

    try {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      });
    } catch (e) {}
  }
}

export function scheduleExactNotification({ id, title, body, delayMs, tag }) {
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

export function scheduleDailyReminders() {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();

  // Water Intake Reminder (2 hours)
  scheduleExactNotification({
    id: 'reminder-water',
    title: 'Hydration Check 💧',
    body: 'Time to drink water! Target: 250-500ml to stay at peak performance.',
    delayMs: 2 * 60 * 60 * 1000,
    tag: 'water-reminder'
  });

  // Evening Workout Reminder (6:00 PM)
  const eveningWorkout = new Date();
  eveningWorkout.setHours(18, 0, 0, 0);
  if (eveningWorkout < now) eveningWorkout.setDate(eveningWorkout.getDate() + 1);

  scheduleExactNotification({
    id: 'reminder-workout',
    title: 'Workout Time 🏋️‍♂️',
    body: 'Crush today’s training session! Log your workout in Calyxo to maintain your streak.',
    delayMs: eveningWorkout.getTime() - now.getTime(),
    tag: 'workout-reminder'
  });

  // Night Nutrition Summary (9:00 PM)
  const nightMeal = new Date();
  nightMeal.setHours(21, 0, 0, 0);
  if (nightMeal < now) nightMeal.setDate(nightMeal.getDate() + 1);

  scheduleExactNotification({
    id: 'reminder-nutrition',
    title: 'Daily Macro Check-In 🥗',
    body: 'Did you hit your daily protein and calorie targets today? Log your final meal before bed!',
    delayMs: nightMeal.getTime() - now.getTime(),
    tag: 'nutrition-reminder'
  });
}

/* ==========================================================================
   IN-APP USER NOTIFICATIONS API (SUPABASE PERSISTENT & REALTIME)
   ========================================================================== */

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

  // Fetch initial notifications
  getUserNotifications(userId).then(n => callback(n));

  // Subscribe to Supabase Realtime channel for user_notifications
  const channel = supabase
    .channel(`user_notifications_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${userId}`
      },
      () => {
        getUserNotifications(userId).then(n => callback(n));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

