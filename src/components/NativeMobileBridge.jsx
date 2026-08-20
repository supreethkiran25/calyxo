import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Browser } from '@capacitor/browser';
import { Keyboard } from '@capacitor/keyboard';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store/useStore';
import { loadUserData, migratePreAuthLocalState } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';

export default function NativeMobileBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Configure Status Bar
    const initStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0a0a0c' });
      } catch (e) {
        console.warn('[NativeMobileBridge] StatusBar init error:', e);
      }
    };

    // Hide Splash Screen after React mount
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
      } catch (e) {
        console.warn('[NativeMobileBridge] SplashScreen hide error:', e);
      }
    };

    // Hardware Back Button listener (Android)
    let backButtonListener = null;
    const initBackButton = async () => {
      try {
        backButtonListener = await CapApp.addListener('backButton', ({ canGoBack }) => {
          const path = window.location.pathname;
          if (path !== '/' && path !== '/user/dashboard' && path !== '/admin') {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        });
      } catch (e) {
        console.warn('[NativeMobileBridge] BackButton listener error:', e);
      }
    };

    // Deep-Link URL listener for Native Supabase OAuth & Magic Link Callbacks
    let appUrlListener = null;
    const initDeepLinks = async () => {
      try {
        appUrlListener = await CapApp.addListener('appUrlOpen', async (data) => {
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
            if (deepLink && deepLink.type === 'rest_completed') {
              console.log('[NativeMobileBridge] Consumed notification tap deep link:', deepLink);
              // Direct navigation to the workout tab in the user dashboard
              useStore.getState().setActiveTab('workout');
              if (window.location.pathname !== '/user/dashboard') {
                window.history.pushState(null, '', '/user/dashboard');
                window.dispatchEvent(new Event('popstate'));
              }
              window.dispatchEvent(new CustomEvent('calyxo_workout_focus', { detail: deepLink }));
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
        appStateListener = await CapApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            console.log('[NativeMobileBridge] Mobile app resumed — triggering instant cross-device auto-sync');
            window.dispatchEvent(new CustomEvent('calyxo_data_sync'));
            checkNotificationDeepLink();
          }
        });
      } catch (e) {
        console.warn('[NativeMobileBridge] AppState listener error:', e);
      }
    };

    // Keyboard viewport handling on mobile
    let keyboardShowListener = null;
    let keyboardHideListener = null;
    const initKeyboardHandling = async () => {
      try {
        keyboardShowListener = await Keyboard.addListener('keyboardWillShow', (info) => {
          const height = info.keyboardHeight || 0;
          document.documentElement.style.setProperty('--keyboard-height', `${height}px`);
          document.body.classList.add('keyboard-open');
          
          const activeEl = document.activeElement;
          if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) {
            setTimeout(() => {
              activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        });

        keyboardHideListener = await Keyboard.addListener('keyboardWillHide', () => {
          document.documentElement.style.setProperty('--keyboard-height', '0px');
          document.body.classList.remove('keyboard-open');
        });
      } catch (e) {
        console.warn('[NativeMobileBridge] Keyboard listener error:', e);
      }
    };

    // Auto-scroll input into view on focus across all devices
    const handleFocusIn = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      }
    };
    window.addEventListener('focusin', handleFocusIn);

    initStatusBar();
    hideSplash();
    initBackButton();
    initDeepLinks();
    initAppStateChange();
    initKeyboardHandling();
    checkNotificationDeepLink();

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
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
      if (keyboardHideListener && typeof keyboardHideListener.remove === 'function') {
        keyboardHideListener.remove();
      }
    };
  }, []);

  return null;
}


