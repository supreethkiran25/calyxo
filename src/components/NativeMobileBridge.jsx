import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { supabase } from '../lib/supabaseClient';

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

          const rawUrl = data.url;
          // Check if deep link contains auth parameters (#access_token=... or ?code=...)
          if (rawUrl.includes('access_token=') || rawUrl.includes('code=')) {
            try {
              if (rawUrl.includes('code=')) {
                const urlObj = new URL(rawUrl.replace('com.supreethkiran.calyxo://', 'https://localhost/'));
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
              // Redirect cleanly to dashboard inside native app
              window.location.href = '/user/dashboard';
            } catch (err) {
              console.error('[NativeMobileBridge] Deep link auth session error:', err);
            }
          }
        });
      } catch (e) {
        console.warn('[NativeMobileBridge] Deep link listener error:', e);
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
          }
        });
      } catch (e) {
        console.warn('[NativeMobileBridge] AppState listener error:', e);
      }
    };

    initStatusBar();
    hideSplash();
    initBackButton();
    initDeepLinks();
    initAppStateChange();

    return () => {
      if (backButtonListener && typeof backButtonListener.remove === 'function') {
        backButtonListener.remove();
      }
      if (appUrlListener && typeof appUrlListener.remove === 'function') {
        appUrlListener.remove();
      }
      if (appStateListener && typeof appStateListener.remove === 'function') {
        appStateListener.remove();
      }
    };
  }, []);

  return null;
}


