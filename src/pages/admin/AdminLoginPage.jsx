import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { loginSuperAdmin, isSuperAdmin } from '../../services/adminService';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    // If already authenticated as Super Admin, redirect to /admin
    try {
      const savedSession = JSON.parse(localStorage.getItem('calyxo_admin_session') || '{}');
      if (isSuperAdmin(user) || isSuperAdmin(savedSession)) {
        navigate('/admin', { replace: true });
      }
    } catch (e) {}
  }, [user, navigate]);

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="w-full max-w-md rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl p-8 space-y-6 relative overflow-hidden backdrop-blur-xl">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            CALYXO <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">ADMIN</span>
          </h1>
          <p className="text-xs text-neutral-400">
            Super Admin Operational Command Portal
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminSignIn} className="space-y-4 text-xs">
          <div>
            <label className="text-neutral-400 font-bold block mb-1">Super Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@calyxo.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-bold block mb-1">Master Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-10 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
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
            disabled={loggingIn}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {loggingIn ? 'Authenticating...' : 'Sign In to Command Center'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
