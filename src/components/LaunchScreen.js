import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CalyxoSplash from './splash/CalyxoSplash';
import { Capacitor } from '@capacitor/core';

export default function LaunchScreen() {
  const isAlreadyDismissed = typeof window !== 'undefined' && Boolean(window.__calyxo_splash_dismissed);
  const [visible, setVisible] = useState(!isAlreadyDismissed);

  // Safely hook router navigation
  let navigate = null;
  let location = null;
  try {
    navigate = useNavigate();
    location = useLocation();
  } catch (e) {
    // Rendered outside router context
  }

  const handleComplete = useCallback((destination) => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      window.__calyxo_splash_dismissed = true;
    }

    if (!destination) return;

    const currentPath = location?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');

    // 1. ACTIVE WORKOUT SPECIAL CASE: Return immediately to active workout screen
    if (destination === '/user/workout') {
      if (currentPath !== '/user/workout') {
        if (navigate) navigate('/user/workout', { replace: true });
        else window.location.replace('/user/workout');
      }
      return;
    }

    // 2. NATIVE MOBILE APP: route authenticated launch to dashboard
    if (Capacitor.isNativePlatform()) {
      if (destination !== currentPath) {
        if (navigate) navigate(destination, { replace: true });
        else window.location.replace(destination);
      }
      return;
    }

    // 3. WEB APP:
    // STRICT RULE (AGENTS.md): NEVER automatically redirect from root URL "/" to "/user/dashboard"
    if (currentPath === '/') {
      return; // Stay on landing page without forcing navigation
    }

    // If user had requested a specific route, navigate only if different
    if (destination !== currentPath && currentPath !== '/') {
      if (navigate) navigate(destination, { replace: true });
      else window.location.replace(destination);
    }
  }, [location?.pathname, navigate]);

  // Once dismissed or hidden, return null immediately
  if (isAlreadyDismissed || !visible) {
    return null;
  }

  return <CalyxoSplash onComplete={handleComplete} />;
}

export { LaunchScreen };

