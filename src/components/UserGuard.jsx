import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { subscribeToAuth } from '../lib/dbService';
import { useStore } from '../store/useStore';
import LaunchScreen from './LaunchScreen';

const UserGuard = ({ children }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false
  });

  useEffect(() => {
    let localUser = null;
    try {
      const raw = localStorage.getItem('calyxo_user') || localStorage.getItem('calyxo_mock_user');
      if (raw) localUser = JSON.parse(raw);
    } catch (e) {}

    const storeUser = useStore.getState().user || localUser;
    if (storeUser) {
      if (!useStore.getState().user && localUser) {
        useStore.getState().setUser(localUser);
      }
      try {
        const rawProfile = localStorage.getItem('calyxo_user_profile');
        if (rawProfile) {
          const parsed = JSON.parse(rawProfile);
          if (parsed && typeof parsed === 'object') {
            useStore.getState().setUserProfile(parsed);
          }
        }
      } catch (e) {}
      setAuthState({ loading: false, authenticated: true });
    }

    const unsubscribe = subscribeToAuth((user) => {
      const active = user || useStore.getState().user || localUser;
      setAuthState({
        loading: false,
        authenticated: Boolean(active)
      });
    });

    const handleStorageChange = (e) => {
      if (e.key === 'calyxo_user' || e.key?.includes('auth-token') || e.key === 'calyxo_mock_user') {
        const storeUser = useStore.getState().user;
        setAuthState({
          loading: false,
          authenticated: Boolean(storeUser)
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  if (authState.loading) {
    return <LaunchScreen isLoading={true} />;
  }

  if (!authState.authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserGuard;
