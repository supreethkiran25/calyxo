import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { subscribeToAuth, loadUserData, saveUserProfile } from '../lib/dbService';
import { useNavigate } from 'react-router-dom';

import LaunchScreen from '../components/LaunchScreen';
import LandingPage from '../components/LandingPage';
import OnboardingFlow from '../components/OnboardingFlow';

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
        const { profile, foods, workouts, weights, water } = await loadUserData(uid);
        if (profile) setUserProfile(profile);
        if (foods) useStore.getState().setFoodLogs(foods);
        if (workouts) useStore.getState().setWorkoutLogs(workouts);
        if (weights) useStore.getState().setWeightLogs(weights);
        if (water !== undefined && water !== null) useStore.getState().setWaterIntake(water);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, initializeTheme, setUserProfile]);

  const handleOnboardingComplete = async (onboardingData) => {
    try {
      const updatedProfile = { 
        ...userProfile, 
        ...onboardingData, 
        onboarded: true, 
        role: 'user' 
      };
      await saveUserProfile(user.uid || user.id, updatedProfile);
      setUserProfile(updatedProfile);
      navigate('/user/dashboard');
    } catch (err) {
      console.error("Failed to save onboarding data:", err);
    }
  };

  if (loading) {
    return <LaunchScreen isLoading={true} />;
  }

  // If user is authenticated but hasn't completed onboarding
  if (user && (!userProfile || userProfile.onboarded !== true)) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Navigating to / MUST always stay at / and render LandingPage
  return <LandingPage />;
}
