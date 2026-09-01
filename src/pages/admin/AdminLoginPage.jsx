import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { loginSuperAdmin, isSuperAdmin, logoutSuperAdmin, SUPER_ADMIN_EMAILS } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useStore(state => state.setUser);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeAdminEmail, setActiveAdminEmail] = useState(null);

  useEffect(() => {
    // If logout query parameter present, purge all old session storage
    if (location.search.includes('logout=true')) {
      logoutSuperAdmin();
      return;
    }

    const verifyActiveSession = async () => {
      try {
        const savedSession = JSON.parse(localStorage.getItem('calyxo_admin_session') || '{}');
        if (isSuperAdmin(savedSession)) {
          navigate('/admin', { replace: true });
          return;
        }

        // Check if user is already authenticated in Supabase as a Super Admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const email = (user.email || '').toLowerCase().trim();
          if (SUPER_ADMIN_EMAILS.includes(email)) {
            setActiveAdminEmail(email);
          }
        }
      } catch (e) {}
    };

    verifyActiveSession();
  }, [navigate, location]);

  const handleContinueActiveSession = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        user.role = 'super_admin';
        user.isAdminSession = true;
        if (typeof window !== 'undefined') {
          localStorage.setItem('calyxo_admin_session', JSON.stringify(user));
        }
        setUser(user);
        navigate('/admin', { replace: true });
      }
    });
  };

  const handleGoogleAdminSignIn = async () => {
    setErrorMsg('');
    setLoggingIn(true);
    try {
      const redirectUrl = window.location.origin + '/admin';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed.');
      setLoggingIn(false);
    }
  };

  const handleAdminSignIn = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoggingIn(true);
    try {
      const adminUser = await loginSuperAdmin(emailInput, passwordInput);
      setUser(adminUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('calyxo_admin_session', JSON.stringify(adminUser));
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Unauthorized. You do not have administrator access.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 selection:bg-blue-500/30 selection:text-blue-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center justify-center gap-2">
            Calyxo <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">ADMIN</span>
          </h1>
          <p className="text-xs text-neutral-400">
            Administrator portal
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Active Session Button if already logged into Supabase */}
        {activeAdminEmail && (
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 space-y-2 text-center">
            <p className="text-xs text-blue-200 font-medium">
              Signed in as <strong className="text-white font-mono">{activeAdminEmail}</strong>
            </p>
            <button
              type="button"
              onClick={handleContinueActiveSession}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-blue-900/30"
            >
              Continue to Admin Portal <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Google OAuth Super Admin Login Button */}
        <button
          type="button"
          onClick={handleGoogleAdminSignIn}
          disabled={loggingIn}
          className="w-full py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium text-xs flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-neutral-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Or with email</span>
          <div className="flex-grow border-t border-neutral-800"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminSignIn} className="space-y-4 text-xs" autoComplete="off">
          <div>
            <label className="text-neutral-400 font-medium block mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="off"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="supreethkiran25@gmail.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-10 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 focus:outline-none bg-transparent border-none cursor-pointer p-1 flex items-center justify-center"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loggingIn || !emailInput || !passwordInput}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
          >
            {loggingIn ? 'Authenticating...' : 'Sign in with Password'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;

