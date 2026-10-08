import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { subscribeToAuth, loadUserData, saveUserProfile } from '../lib/dbService';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

import LaunchScreen from '../components/LaunchScreen';
import LandingPage from '../components/LandingPage';

export default function HomePage() {
  const isDismissed = typeof window !== 'undefined' && Boolean(window.__calyxo_splash_dismissed);
  const [loading, setLoading] = useState(!isDismissed);
  const navigate = useNavigate();
  
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const userProfile = useStore((state) => state.userProfile);
  const setUserProfile = useStore((state) => state.setUserProfile);
  const initializeTheme = useStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();

    const handleSplashDismissed = () => {
      setLoading(false);
    };
    window.addEventListener('calyxo_splash_dismissed', handleSplashDismissed);
    
    const unsubscribe = subscribeToAuth(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const uid = authUser.uid || authUser.id;
        try {
          const { profile, foods, workouts, weights, water } = await loadUserData(uid);
          if (profile) setUserProfile(profile);
          if (foods) useStore.getState().setFoodLogs(foods);
          if (workouts) useStore.getState().setWorkoutLogs(workouts);
          if (weights) useStore.getState().setWeightLogs(weights);
          if (water !== undefined && water !== null) useStore.getState().setWaterIntake(water);
        } catch (err) {
          console.warn('[HomePage] User data load notice:', err);
        }
        setLoading(false);
        // On native mobile app, navigate directly to dashboard
        if (Capacitor.isNativePlatform()) {
          navigate('/user/dashboard', { replace: true });
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('calyxo_splash_dismissed', handleSplashDismissed);
    };
  }, [setUser, initializeTheme, setUserProfile, navigate]);

  // If splash screen is still running, show LaunchScreen
  if (loading && !(typeof window !== 'undefined' && window.__calyxo_splash_dismissed)) {
    return <LaunchScreen isLoading={true} />;
  }

  // If already authenticated on native, navigate to dashboard
  if (user && Capacitor.isNativePlatform()) {
    navigate('/user/dashboard', { replace: true });
    return null;
  }

  // Web landing page
  return <LandingPage />;
}
