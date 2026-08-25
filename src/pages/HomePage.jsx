import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { subscribeToAuth, loadUserData, saveUserProfile } from '../lib/dbService';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

import LaunchScreen from '../components/LaunchScreen';
import LandingPage from '../components/LandingPage';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const userProfile = useStore((state) => state.userProfile);
  const setUserProfile = useStore((state) => state.setUserProfile);
  const initializeTheme = useStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
    
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

    return () => unsubscribe();
  }, [setUser, initializeTheme, setUserProfile, navigate]);

  if (loading) {
    return <LaunchScreen isLoading={true} />;
  }

  // If already authenticated on native, navigate to dashboard
  if (user && Capacitor.isNativePlatform()) {
    navigate('/user/dashboard', { replace: true });
    return <LaunchScreen isLoading={true} />;
  }

  // Web landing page
  return <LandingPage />;
}
