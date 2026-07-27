// Calyxo Push Notification Service for Web & PWA

let swRegistration = null;

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;
    if (reg.update) reg.update();
    console.log('Calyxo Service Worker registered successfully:', reg.scope);
    return reg;
  } catch (error) {
    console.warn('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';

  if (Notification.permission === 'granted') {
    scheduleDailyReminders();
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendImmediateNotification(
        'Calyxo Notifications Active 🚀',
        'Push notifications enabled! You will receive daily workout, meal, and hydration reminders at exact scheduled times.'
      );
      scheduleDailyReminders();
    }
    return permission;
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return 'denied';
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
    } catch (e) {
      console.warn('Direct notification fallback:', e);
    }
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

  // 1. Primary: Post to active Service Worker controller
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(msg);
  } else if ('serviceWorker' in navigator) {
    // 2. Fallback: Wait for Service Worker registration ready
    navigator.serviceWorker.ready.then(reg => {
      if (reg && reg.active) reg.active.postMessage(msg);
    }).catch(() => {});
  }

  // 3. Independent client timer fallback
  setTimeout(() => {
    try {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: tag || id
        });
      }
    } catch (e) {}
  }, Math.max(100, delayMs || 0));
}

export function scheduleDailyReminders() {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();

  // 1. Water Intake Reminder (2 hours from now)
  scheduleExactNotification({
    id: 'reminder-water',
    title: 'Hydration Check 💧',
    body: 'Time to drink water! Target: 250-500ml to stay at peak performance.',
    delayMs: 2 * 60 * 60 * 1000,
    tag: 'water-reminder'
  });

  // 2. Evening Workout Reminder (6:00 PM)
  const eveningWorkout = new Date();
  eveningWorkout.setHours(18, 0, 0, 0);
  if (eveningWorkout < now) eveningWorkout.setDate(eveningWorkout.getDate() + 1);
  const workoutDelay = eveningWorkout.getTime() - now.getTime();

  scheduleExactNotification({
    id: 'reminder-workout',
    title: 'Workout Time 🏋️‍♂️',
    body: 'Crush today’s training session! Log your workout in Calyxo to maintain your streak.',
    delayMs: workoutDelay,
    tag: 'workout-reminder'
  });

  // 3. Night Nutrition & Macro Summary (9:00 PM)
  const nightMeal = new Date();
  nightMeal.setHours(21, 0, 0, 0);
  if (nightMeal < now) nightMeal.setDate(nightMeal.getDate() + 1);
  const mealDelay = nightMeal.getTime() - now.getTime();

  scheduleExactNotification({
    id: 'reminder-nutrition',
    title: 'Daily Macro Check-In 🥗',
    body: 'Did you hit your daily protein and calorie targets today? Log your final meal before bed!',
    delayMs: mealDelay,
    tag: 'nutrition-reminder'
  });
}
