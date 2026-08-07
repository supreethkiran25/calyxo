import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { loginSuperAdmin, isSuperAdmin, logoutSuperAdmin } from '../../services/adminService';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useStore(state => state.setUser);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    // If logout query parameter present, purge all old session storage
    if (location.search.includes('logout=true')) {
      logoutSuperAdmin();
      return;
    }

    try {
      const savedSession = JSON.parse(localStorage.getItem('calyxo_admin_session') || '{}');
      if (isSuperAdmin(savedSession)) {
        navigate('/admin', { replace: true });
      }
    } catch (e) {}
  }, [navigate, location]);

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
                placeholder="admin@calyxo.com"
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
            {loggingIn ? 'Authenticating...' : 'Sign in'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
