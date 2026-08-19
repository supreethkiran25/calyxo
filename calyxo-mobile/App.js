// Polyfill DOMException for React Native / Hermes engine
if (typeof globalThis.DOMException === 'undefined') {
  class DOMExceptionPolyfill extends Error {
    constructor(message = '', name = 'Error') {
      super(message);
      this.name = name;
    }
  }
  globalThis.DOMException = DOMExceptionPolyfill;
  if (typeof global !== 'undefined') {
    global.DOMException = DOMExceptionPolyfill;
  }
}

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { supabase } from './src/config/supabase';
import { useMobileStore } from './src/store/useMobileStore';

export default function App() {
  const setUser = useMobileStore((state) => state.setUser);
  const setProfile = useMobileStore((state) => state.setProfile);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setProfile({ email: session.user.email });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setProfile({ email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#090d16" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
