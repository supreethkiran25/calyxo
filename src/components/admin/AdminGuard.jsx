import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { isSuperAdmin, verifyAdminPermission } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import { isMockMode } from '../../lib/dbService';

const AdminGuard = ({ children }) => {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);

  // Initialize synchronous check from Zustand or localStorage session
  const checkInitialSession = () => {
    if (user && isSuperAdmin(user)) return { authorized: true, checking: false };
    try {
      const savedSession = JSON.parse(localStorage.getItem('calyxo_admin_session') || '{}');
      if (savedSession && isSuperAdmin(savedSession)) {
        return { authorized: true, checking: false, restoredUser: savedSession };
      }
      const mockUser = JSON.parse(localStorage.getItem('calyxo_mock_user') || '{}');
      if (mockUser && isSuperAdmin(mockUser)) {
        return { authorized: true, checking: false, restoredUser: mockUser };
      }
    } catch (e) {}
    return { authorized: false, checking: !isMockMode };
  };

  const initial = checkInitialSession();
  const [authorized, setAuthorized] = useState(initial.authorized);
  const [checking, setChecking] = useState(initial.checking);

  useEffect(() => {
    // If initial session check restored a saved session, set user in store
    if (initial.restoredUser && !user) {
      setUser(initial.restoredUser);
    }

    // Verify session asynchronously with Supabase Auth & admin_users table
    let mounted = true;
    const verifySession = async () => {
      if (isMockMode) {
        if (mounted) setChecking(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isAllowed = await verifyAdminPermission(session.user);
          if (mounted) {
            if (isAllowed) {
              session.user.role = 'super_admin';
              setUser(session.user);
              localStorage.setItem('calyxo_admin_session', JSON.stringify(session.user));
              setAuthorized(true);
            } else {
              setAuthorized(false);
            }
          }
        } else {
          // Check local admin session
          const savedSession = JSON.parse(localStorage.getItem('calyxo_admin_session') || '{}');
          if (savedSession && isSuperAdmin(savedSession)) {
            if (mounted) setAuthorized(true);
          } else {
            if (mounted) setAuthorized(false);
          }
        }
      } catch (e) {
        console.warn('Session verification fallback:', e);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    verifySession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        const isAllowed = await verifyAdminPermission(session.user);
        if (isAllowed) {
          session.user.role = 'super_admin';
          setUser(session.user);
          localStorage.setItem('calyxo_admin_session', JSON.stringify(session.user));
          setAuthorized(true);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('calyxo_admin_session');
        setAuthorized(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [setUser]);

  // Render a minimal loader during initial F5 reload session verification
  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-neutral-400">Verifying Super Admin Session...</span>
      </div>
    );
  }

  // If unauthenticated, redirect to /admin/login
  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminGuard;
