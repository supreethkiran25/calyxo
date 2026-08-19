/**
 * Calyxo PWA & Service Worker Manager
 * Handles installation prompts, service worker update detection,
 * push notification permissions, and standalone mode checks.
 */

import { registerServiceWorker, requestNotificationPermission, subscribeToPushNotifications } from './notificationService';

class PWAManagerService {
  deferredInstallPrompt = null;
  isInstallable = false;
  isInstalled = false;
  hasUpdateAvailable = false;
  waitingServiceWorker = null;
  listeners = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkStandaloneMode();
      this.initListeners();
    }
  }

  checkStandaloneMode() {
    if (typeof window === 'undefined') return;
    const isStandaloneDisplay = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    this.isInstalled = Boolean(isStandaloneDisplay || isIOSStandalone);
  }

  initListeners() {
    if (typeof window === 'undefined') return;

    // Capture beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      this.isInstallable = true;
      this.notifyListeners();
      console.log('[PWAManager] App is ready to be installed.');
    });

    // Detect app installation completion
    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      this.isInstallable = false;
      this.isInstalled = true;
      this.notifyListeners();
      console.log('[PWAManager] App installed successfully.');
    });

    // Register & listen for SW updates
    registerServiceWorker().then((reg) => {
      if (!reg) return;

      // Check if a SW is already waiting
      if (reg.waiting) {
        this.hasUpdateAvailable = true;
        this.waitingServiceWorker = reg.waiting;
        this.notifyListeners();
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.hasUpdateAvailable = true;
            this.waitingServiceWorker = newWorker;
            this.notifyListeners();
            console.log('[PWAManager] New app version update available!');
          }
        });
      });
    });
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((cb) => {
      try { cb(state); } catch (e) {}
    });
  }

  getState() {
    return {
      isInstallable: this.isInstallable && !this.isInstalled,
      isInstalled: this.isInstalled,
      hasUpdateAvailable: this.hasUpdateAvailable,
      notificationPermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
    };
  }

  /**
   * Trigger native browser PWA Install prompt
   */
  async promptInstall() {
    if (!this.deferredInstallPrompt) {
      console.warn('[PWAManager] No install prompt available.');
      return false;
    }

    try {
      this.deferredInstallPrompt.prompt();
      const choiceResult = await this.deferredInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWAManager] User accepted PWA installation.');
        this.isInstallable = false;
        this.isInstalled = true;
      } else {
        console.log('[PWAManager] User dismissed PWA installation.');
      }
      this.deferredInstallPrompt = null;
      this.notifyListeners();
      return choiceResult.outcome === 'accepted';
    } catch (err) {
      console.error('[PWAManager] Prompt install error:', err);
      return false;
    }
  }

  /**
   * Trigger Service Worker update (skip waiting & refresh)
   */
  updateApp() {
    if (this.waitingServiceWorker) {
      this.waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  /**
   * Request Notification permission & subscribe to push
   */
  async enableNotifications(userId) {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      await subscribeToPushNotifications(userId);
    }
    this.notifyListeners();
    return permission;
  }
}

export const pwaManager = new PWAManagerService();
