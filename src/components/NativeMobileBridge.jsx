import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Browser } from '@capacitor/browser';
import { Keyboard } from '@capacitor/keyboard';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store/useStore';
import { loadUserData, migratePreAuthLocalState, saveWaterIntake } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import useQuickActionsStore from '../store/useQuickActionsStore';
import { requestNotificationPermission } from '../services/notificationService';
import { toast } from 'sonner';

export default function NativeMobileBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Initialize Native Push / Local Notification Authorization
    requestNotificationPermission().catch(() => {});

    // Configure Status Bar with Dynamic Theme Support
    const updateStatusBar = async () => {
      try {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light' || 
                        (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: light)').matches);
        await StatusBar.setStyle({ style: isLight ? Style.Light : Style.Dark });
        await StatusBar.setBackgroundColor({ color: isLight ? '#F8FAFC' : '#09090B' });
      } catch (e) {
        console.warn('[NativeMobileBridge] StatusBar init error:', e);
      }
    };

    // Listen for theme attribute mutations
    const themeObserver = new MutationObserver(() => {
      updateStatusBar();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Hide Splash Screen after React mount
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
      } catch (e) {
        console.warn('[NativeMobileBridge] SplashScreen hide error:', e);
      }
    };

    let isMounted = true;

    // Hardware Back Button listener (Android)
    let backButtonListener = null;
    const initBackButton = async () => {
      try {
        const handle = await CapApp.addListener('backButton', ({ canGoBack }) => {
          const path = window.location.pathname;
          if (path !== '/' && path !== '/user/dashboard' && path !== '/admin') {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        });
        if (!isMounted) {
          handle?.remove?.();
        } else {
          backButtonListener = handle;
        }
      } catch (e) {
        console.warn('[NativeMobileBridge] BackButton listener error:', e);
      }
    };

    // Deep-Link URL listener for Native Supabase OAuth & Magic Link Callbacks
    let appUrlListener = null;
    const initDeepLinks = async () => {
      try {
        const handle = await CapApp.addListener('appUrlOpen', async (data) => {
          console.log('[NativeMobileBridge] App opened with URL:', data?.url);
          if (!data?.url) return;

          // Automatically close in-app browser tab when OAuth completes
          try {
            await Browser.close();
          } catch (bErr) {
            // Browser might already be closed or not active
          }

          const rawUrl = data.url;
          // Check if deep link contains auth parameters (#access_token=... or ?code=...)
          if (rawUrl.includes('access_token=') || rawUrl.includes('code=')) {
            try {
              if (rawUrl.includes('code=')) {
                const urlObj = new URL(rawUrl.replace('calyxo://', 'https://localhost/').replace('com.supreethkiran.calyxo://', 'https://localhost/'));
                const code = urlObj.searchParams.get('code');
                if (code) {
                  await supabase.auth.exchangeCodeForSession(code);
                }
              } else if (rawUrl.includes('access_token=')) {
                const hashIndex = rawUrl.indexOf('#');
                if (hashIndex !== -1) {
                  const hashParams = new URLSearchParams(rawUrl.substring(hashIndex + 1));
                  const accessToken = hashParams.get('access_token');
                  const refreshToken = hashParams.get('refresh_token');
                  if (accessToken && refreshToken) {
                    await supabase.auth.setSession({
                      access_token: accessToken,
                      refresh_token: refreshToken
                    });
                  }
                }
              }

              // Verify session restoration and load user profile synchronously
              const { data: sessionRes } = await supabase.auth.getSession();
              const authUser = sessionRes?.session?.user;
              
              if (authUser) {
                const uid = authUser.id;
                migratePreAuthLocalState(uid);

                const { profile, foods, workouts, weights, water, ecosystem } = await loadUserData(uid);
                
                console.log('[AuthAudit] Google OAuth Session Restored:', {
                  userId: uid,
                  email: authUser.email,
                  onboarded: profile?.onboarded,
                  foodCount: foods?.length || 0,
                  workoutCount: workouts?.length || 0
                });

                const store = useStore.getState();
                store.setUser(authUser);
                if (profile) store.setUserProfile(profile);
                if (foods) store.setFoodLogs(foods);
                if (workouts) store.setWorkoutLogs(workouts);
                if (weights) store.setWeightLogs(weights);
                if (water !== undefined && water !== null) store.setWaterIntake(water);
                if (ecosystem) useEcosystemStore.getState().syncEcosystemState(ecosystem);
              }

              // Trigger smooth in-app navigation to dashboard
              if (window.location.pathname !== '/user/dashboard') {
                window.history.pushState(null, '', '/user/dashboard');
                window.dispatchEvent(new Event('popstate'));
              }
              window.dispatchEvent(new CustomEvent('calyxo_data_sync'));
            } catch (err) {
              console.error('[NativeMobileBridge] Deep link auth session error:', err);
            }
          }
        });
        if (!isMounted) {
          handle?.remove?.();
        } else {
          appUrlListener = handle;
        }
      } catch (e) {
        console.warn('[NativeMobileBridge] Deep link listener error:', e);
      }
    };

    // Check for pending notification tap deep-links on native iOS
    const checkNotificationDeepLink = async () => {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
        try {
          const { CalyxoNotification } = Capacitor.Plugins;
          if (CalyxoNotification) {
            const deepLink = await CalyxoNotification.getPendingDeepLink();
            if (deepLink) {
              console.log('[NativeMobileBridge] Consumed notification tap deep link:', deepLink);
              const action = deepLink.action || '';
              const type = deepLink.type || '';
              const tag = deepLink.tag || deepLink.notificationId || '';

              if (action === 'LOG_WATER_250' || action === 'log_water_250') {
                useStore.getState().addWaterIntake(250);
                const user = useStore.getState().user;
                if (user?.uid || user?.id) {
                  saveWaterIntake(user.uid || user.id, useStore.getState().waterIntake);
                }
                toast.success('💧 Quick Log: +250ml water recorded!');
              } else if (action === 'LOG_WATER_500' || action === 'log_water_500') {
                useStore.getState().addWaterIntake(500);
                const user = useStore.getState().user;
                if (user?.uid || user?.id) {
                  saveWaterIntake(user.uid || user.id, useStore.getState().waterIntake);
                }
                toast.success('🥛 Quick Log: +500ml water recorded!');
              } else if (action === 'OPEN_HYDRATION' || action === 'open_hydration' || type === 'hydration' || tag.includes('water')) {
                useQuickActionsStore.getState().setActiveWorkflow('log_water');
              } else if (action === 'LOG_MEAL' || action === 'log_meal' || type === 'meal' || tag.includes('nutrition') || tag.includes('meal')) {
                useQuickActionsStore.getState().setActiveWorkflow('log_meal');
              } else if (action === 'START_WORKOUT' || action === 'start_workout' || type === 'workout' || tag.includes('workout')) {
                useQuickActionsStore.getState().setActiveWorkflow('log_workout');
              } else if (type === 'rest_completed') {
                // Direct navigation to the workout tab in the user dashboard
                useStore.getState().setActiveTab('workout');
                if (window.location.pathname !== '/user/dashboard') {
                  window.history.pushState(null, '', '/user/dashboard');
                  window.dispatchEvent(new Event('popstate'));
                }
                window.dispatchEvent(new CustomEvent('calyxo_workout_focus', { detail: deepLink }));
              }
            }
          }
        } catch (e) {
          console.warn('[NativeMobileBridge] Notification deep-link check error:', e);
        }
      }
    };

    // App State Change Listener (App foreground / resume auto-sync on phones)
    let appStateListener = null;
    const initAppStateChange = async () => {
      try {
        const handle = await CapApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            console.log('[NativeMobileBridge] Mobile app resumed — triggering instant cross-device auto-sync');
            window.dispatchEvent(new CustomEvent('calyxo_data_sync'));
            checkNotificationDeepLink();
          }
        });
        if (!isMounted) {
          handle?.remove?.();
        } else {
          appStateListener = handle;
        }
      } catch (e) {
        console.warn('[NativeMobileBridge] AppState listener error:', e);
      }
    };

    // Smart active element scroll-into-view helper
    const ensureElementVisible = (el) => {
      if (!el || typeof el.getBoundingClientRect !== 'function') return;
      try {
        const rect = el.getBoundingClientRect();
        const vvHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const currentKbHeight = parseFloat(document.documentElement.style.getPropertyValue('--keyboard-height') || '0');
        const effectiveVisibleHeight = vvHeight > 0 ? vvHeight : Math.max(200, window.innerHeight - currentKbHeight);

        // If element is covered by keyboard or below the bottom 50% of the visible area
        if (rect.bottom > effectiveVisibleHeight - 20 || rect.top < 60) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      }
    };

    const triggerSmartScrollSequence = (targetEl) => {
      const el = targetEl || document.activeElement;
      if (!el || !['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      
      // Multi-phase positioning to match keyboard slide-up curve
      setTimeout(() => ensureElementVisible(el), 40);
      setTimeout(() => ensureElementVisible(el), 160);
      setTimeout(() => ensureElementVisible(el), 320);
      setTimeout(() => ensureElementVisible(el), 480);
    };

    // Keyboard viewport handling on mobile (Capacitor & Web Visual Viewport)
    let keyboardShowListener = null;
    let keyboardHideListener = null;
    let keyboardDidShowListener = null;
    let keyboardDidHideListener = null;

    const initKeyboardHandling = async () => {
      try {
        // 1. Native Capacitor Keyboard listeners
        const showHandle = await Keyboard.addListener('keyboardWillShow', (info) => {
          const height = info.keyboardHeight || 0;
          document.documentElement.style.setProperty('--keyboard-height', `${height}px`);
          document.documentElement.classList.add('keyboard-open');
          document.body.classList.add('keyboard-open');
          triggerSmartScrollSequence();
        });
        if (isMounted) keyboardShowListener = showHandle; else showHandle?.remove?.();

        const didShowHandle = await Keyboard.addListener('keyboardDidShow', (info) => {
          const height = info.keyboardHeight || 0;
          document.documentElement.style.setProperty('--keyboard-height', `${height}px`);
          triggerSmartScrollSequence();
        });
        if (isMounted) keyboardDidShowListener = didShowHandle; else didShowHandle?.remove?.();

        const hideHandle = await Keyboard.addListener('keyboardWillHide', () => {
          document.documentElement.style.setProperty('--keyboard-height', '0px');
          document.documentElement.classList.remove('keyboard-open');
          document.body.classList.remove('keyboard-open');
        });
        if (isMounted) keyboardHideListener = hideHandle; else hideHandle?.remove?.();

        const didHideHandle = await Keyboard.addListener('keyboardDidHide', () => {
          document.documentElement.style.setProperty('--keyboard-height', '0px');
          document.documentElement.classList.remove('keyboard-open');
          document.body.classList.remove('keyboard-open');
        });
        if (isMounted) keyboardDidHideListener = didHideHandle; else didHideHandle?.remove?.();
      } catch (e) {
        console.warn('[NativeMobileBridge] Keyboard plugin listener notice:', e);
      }
    };

    // 2. Standard Web Visual Viewport API (for iOS Safari, Android Chrome, and PWA)
    const handleVisualViewportChange = () => {
      if (!window.visualViewport) return;
      const vv = window.visualViewport;
      const heightDelta = window.innerHeight - vv.height;
      if (heightDelta > 150) {
        // Keyboard is likely open
        document.documentElement.style.setProperty('--keyboard-height', `${Math.round(heightDelta)}px`);
        document.documentElement.classList.add('keyboard-open');
        document.body.classList.add('keyboard-open');
        triggerSmartScrollSequence();
      } else {
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.documentElement.classList.remove('keyboard-open');
        document.body.classList.remove('keyboard-open');
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange);
    }

    // Auto-scroll input into view on focus across all devices
    const handleFocusIn = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        triggerSmartScrollSequence(e.target);
      }
    };
    window.addEventListener('focusin', handleFocusIn);

    updateStatusBar();
    hideSplash();
    initBackButton();
    initDeepLinks();
    initAppStateChange();
    initKeyboardHandling();
    checkNotificationDeepLink();

    return () => {
      isMounted = false;
      themeObserver.disconnect();
      window.removeEventListener('focusin', handleFocusIn);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportChange);
      }
      if (backButtonListener && typeof backButtonListener.remove === 'function') {
        backButtonListener.remove();
      }
      if (appUrlListener && typeof appUrlListener.remove === 'function') {
        appUrlListener.remove();
      }
      if (appStateListener && typeof appStateListener.remove === 'function') {
        appStateListener.remove();
      }
      if (keyboardShowListener && typeof keyboardShowListener.remove === 'function') {
        keyboardShowListener.remove();
      }
      if (keyboardDidShowListener && typeof keyboardDidShowListener.remove === 'function') {
        keyboardDidShowListener.remove();
      }
      if (keyboardHideListener && typeof keyboardHideListener.remove === 'function') {
        keyboardHideListener.remove();
      }
      if (keyboardDidHideListener && typeof keyboardDidHideListener.remove === 'function') {
        keyboardDidHideListener.remove();
      }
    };
  }, []);

  return null;
}


