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
    const storeUser = useStore.getState().user;
    if (storeUser) {
      setAuthState({ loading: false, authenticated: true });
    }

    const unsubscribe = subscribeToAuth((user) => {
      setAuthState({
        loading: false,
        authenticated: Boolean(user || useStore.getState().user)
      });
    });

    return () => unsubscribe();
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
