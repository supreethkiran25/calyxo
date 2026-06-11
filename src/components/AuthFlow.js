"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { signUpUser, signInUser, signInWithGoogle, signInWithApple } from '../lib/dbService';
import { useStore } from '../store/useStore';
import Logo from './Logo';

export default function AuthFlow() {
  const setUser = useStore((state) => state.setUser);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isSignUp) {
        user = await signUpUser(email, password, rememberMe);
      } else {
        user = await signInUser(email, password, rememberMe);
      }
      setUser(user);
    } catch (err) {
      console.error("Auth action failed", err);
      const code = err.code || "";
      if (code.includes("auth/weak-password")) {
        setError("Password should be at least 6 characters.");
      } else if (code.includes("auth/email-already-in-use")) {
        setError("This email address is already in use.");
      } else if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password") || code.includes("auth/user-not-found")) {
        setError("Invalid email or password credentials.");
      } else {
        setError(err.message || "Authentication failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (providerName) => {
    setError('');
    setLoading(true);
    try {
      let user;
      if (providerName === 'google') {
        user = await signInWithGoogle(rememberMe);
      } else if (providerName === 'apple') {
        user = await signInWithApple(rememberMe);
      }
      setUser(user);
    } catch (err) {
      console.error(`${providerName} login failed`, err);
      setError(err.message || `${providerName} Sign-In aborted.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-acid-green/10 dark:bg-acid-green/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md glass-premium rounded-2xl p-8 relative overflow-hidden z-10"
      >
        {/* Upper Brand Section */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer mb-4"
          >
            <Logo className="w-16 h-16" />
          </motion.div>
          <h2 className="font-display text-2xl font-black tracking-widest text-foreground uppercase">
            {isSignUp ? "Join Calyxo" : "Calyxo Login"}
          </h2>
          <p className="text-muted text-[10px] tracking-widest mt-1 uppercase font-semibold">
            {isSignUp ? "AI Fitness & Diet Concierge" : "Log in to track diet & training"}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs font-semibold leading-relaxed flex items-start gap-2"
          >
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-muted text-[10px] uppercase font-bold tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-muted" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 dark:bg-white/5 border border-card-border rounded-xl pl-12 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors"
                required 
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-muted text-[10px] uppercase font-bold tracking-wider">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-muted" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 dark:bg-white/5 border border-card-border rounded-xl pl-12 pr-12 py-3 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors"
                required 
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-muted hover:text-foreground cursor-pointer focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <label className="flex items-center gap-2 text-muted hover:text-foreground cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                className="w-4 h-4 rounded bg-white/5 border border-card-border accent-acid-green focus:ring-0 cursor-pointer"
              />
              <span>Remember Me</span>
            </label>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-acid-green to-emerald-500 text-black font-bold text-sm py-3.5 rounded-xl mt-6 cursor-pointer hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : (isSignUp ? "Sign Up" : "Sign In")}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-card-border"></div>
          <span className="flex-shrink mx-4 text-muted text-[10px] font-bold uppercase tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-card-border"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white/5 border border-card-border hover:bg-white/10 text-foreground text-xs font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors"
          >
            {/* Google Icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.78 0 3.3.61 4.56 1.81l3.42-3.42C17.9 1.54 15.17 1 12 1 7.24 1 3.2 3.73 1.25 7.72l4.03 3.12C6.27 7.76 8.87 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.65-5.02 3.65-8.65z" />
              <path fill="#FBBC05" d="M5.28 14.78a6.98 6.98 0 0 1 0-4.16L1.25 7.5a11.96 11.96 0 0 0 0 9l4.03-3.12z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.76-2.91c-1.11.75-2.53 1.21-4.2 1.21-3.13 0-5.73-2.72-6.72-5.8L1.25 15.65C3.2 19.64 7.24 23 12 23z" />
            </svg>
            Google
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleOAuth('apple')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white/5 border border-card-border hover:bg-white/10 text-foreground text-xs font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors"
          >
            {/* Apple Icon SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
            </svg>
            Apple
          </motion.button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-muted hover:text-foreground text-xs font-semibold cursor-pointer transition-colors focus:outline-none"
          >
            {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
export { AuthFlow };
