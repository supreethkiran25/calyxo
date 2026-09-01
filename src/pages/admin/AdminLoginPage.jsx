import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { loginSuperAdmin, isSuperAdmin, logoutSuperAdmin, sendAdminPasswordReset, updateAdminPassword } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useStore(state => state.setUser);

  // Modes: 'login' | 'forgot' | 'reset'
  const [authMode, setAuthMode] = useState('login');
  const [emailInput, setEmailInput] = useState('supreethkiran25@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If logout query parameter present, purge all old session storage
    if (location.search.includes('logout=true')) {
      logoutSuperAdmin();
      return;
    }

    // Check if recovery flow was triggered from reset email
    if (location.hash && (location.hash.includes('type=recovery') || location.hash.includes('access_token'))) {
      setAuthMode('reset');
      return;
    }

    try {
      const savedSession = JSON.parse(localStorage.getItem('calyxo_admin_session') || '{}');
      if (isSuperAdmin(savedSession)) {
        navigate('/admin', { replace: true });
      }
    } catch (e) {}

    // Listen for auth recovery state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('reset');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, location]);

  // Standard Super Admin Sign-In
  const handleAdminSignIn = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const adminUser = await loginSuperAdmin(emailInput, passwordInput);
      setUser(adminUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('calyxo_admin_session', JSON.stringify(adminUser));
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid Super Admin credentials. Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Send Password Reset Email Link
  const handleSendResetEmail = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await sendAdminPasswordReset(emailInput);
      setSuccessMsg(`Password reset link sent to ${emailInput}. Check your inbox to set a new password.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Set New Password in Recovery Mode
  const handleSetNewPassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPasswordInput.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updateAdminPassword(newPasswordInput);
      setSuccessMsg('Master password updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 selection:bg-blue-500/30 selection:text-blue-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            {authMode === 'reset' ? <KeyRound className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center justify-center gap-2">
            Calyxo <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">ADMIN</span>
          </h1>
          <p className="text-xs text-neutral-400">
            {authMode === 'forgot' && 'Reset Super Admin Password'}
            {authMode === 'reset' && 'Set New Super Admin Password'}
            {authMode === 'login' && 'Master Administrator Portal'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleAdminSignIn} className="space-y-4 text-xs" autoComplete="off">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Super Admin Email</label>
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-400 font-medium">Master Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setAuthMode('forgot');
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
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
              disabled={loading || !emailInput || !passwordInput}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Authenticating...' : 'Sign in as Super Admin'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. FORGOT PASSWORD (REQUEST RESET LINK) */}
        {authMode === 'forgot' && (
          <form onSubmit={handleSendResetEmail} className="space-y-4 text-xs" autoComplete="off">
            <p className="text-neutral-400 text-xs leading-relaxed">
              Enter your authorized admin email. We will send a secure password reset link to your inbox.
            </p>
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Super Admin Email</label>
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

            <button
              type="submit"
              disabled={loading || !emailInput}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending Link...' : 'Send Password Reset Link'} <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setAuthMode('login');
              }}
              className="w-full py-2 text-neutral-400 hover:text-neutral-200 text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        )}

        {/* 3. SET NEW PASSWORD (RECOVERY MODE) */}
        {authMode === 'reset' && (
          <form onSubmit={handleSetNewPassword} className="space-y-4 text-xs" autoComplete="off">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">New Master Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-10 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-10 py-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPasswordInput || !confirmPasswordInput}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password & Enter'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;


