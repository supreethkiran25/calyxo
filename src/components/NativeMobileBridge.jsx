import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

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

    initStatusBar();
    hideSplash();
    initBackButton();

    return () => {
      if (backButtonListener && typeof backButtonListener.remove === 'function') {
        backButtonListener.remove();
      }
    };
  }, []);

  return null;
}
