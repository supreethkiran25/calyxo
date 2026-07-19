import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { subscribeToAuth, getUserProfile, saveUserProfile } from '../lib/dbService';
import { useNavigate } from 'react-router-dom';

import LaunchScreen from '../components/LaunchScreen';
import LandingPage from '../components/LandingPage';
import OnboardingFlow from '../components/OnboardingFlow';
import RoleSelection from '../components/RoleSelection';

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
    
    // Global Auth Subscription
    const unsubscribe = subscribeToAuth(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const profile = await getUserProfile(authUser.uid || authUser.id);
        setUserProfile(profile || { onboarded: false });
        setLoading(false);
        // Redirect logic
        if (profile?.role === 'trainer') {
          navigate('/trainer/dashboard');
        } else if (profile?.role === 'user' && profile?.onboarded) {
          navigate('/user/dashboard');
        }
      } else {
        setUserProfile({ onboarded: false });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, initializeTheme, setUserProfile, navigate]);

  const handleRoleSelected = async (role) => {
    try {
      const isOnboarded = role === 'trainer'; // Trainer is onboarded immediately; User must complete onboarding flow
      const updatedProfile = { ...userProfile, role, onboarded: isOnboarded };
      await saveUserProfile(user.uid || user.id, updatedProfile);
      setUserProfile(updatedProfile);
      
      if (role === 'trainer') {
        navigate('/trainer/dashboard');
      }
    } catch (err) {
      console.error("Failed to save role", err);
      throw err;
    }
  };

  // 1. Loading State
  if (loading) return <LaunchScreen isLoading={loading} />;

  // 2. Unauthenticated -> Landing
  if (!user) return <LandingPage />;

  // 3. Authenticated but no role assigned -> Role Selection
  if (!userProfile?.role) {
    return <RoleSelection user={user} onRoleSelected={handleRoleSelected} />;
  }

  // 4. Authenticated, role='user', but not onboarded -> OnboardingFlow
  if (userProfile.role === 'user' && !userProfile.onboarded) {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  // 5. Trainer -> Redirect
  if (userProfile.role === 'trainer') {
    return <LaunchScreen isLoading={true} />;
  }

  // 6. User -> Redirect
  return <LaunchScreen isLoading={true} />;
}
