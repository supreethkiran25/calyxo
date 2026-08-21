
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, Eye, EyeOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signUpUser, signInWithUsernameOrEmail, signInWithGoogle, signInWithApple, sendPasswordReset, loadUserData } from '../lib/dbService';
import { useStore } from '../store/useStore';
import Logo from './Logo';

export default function AuthFlow({ isInitialSignUp = false }) {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const setUserProfile = useStore((state) => state.setUserProfile);
  const [isSignUp, setIsSignUp] = useState(isInitialSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const redirectAfterAuth = async (authUser) => {
    setUser(authUser);
    if (authUser) {
      const uid = authUser.uid || authUser.id;
      const { profile, foods, workouts, weights, water } = await loadUserData(uid);
      setUserProfile(profile || { onboarded: false });
      if (foods) useStore.getState().setFoodLogs(foods);
      if (workouts) useStore.getState().setWorkoutLogs(workouts);
      if (weights) useStore.getState().setWeightLogs(weights);
      if (water !== undefined && water !== null) useStore.getState().setWaterIntake(water);
      navigate('/user/dashboard');
    }
  };

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      await sendPasswordReset(forgotEmail.trim());
      setForgotSuccess("Password reset link sent! Check your inbox.");
      setCooldown(60);
    } catch (err) {
      console.error("Password reset error", err);
      setForgotError(err.message || "Failed to send reset link. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp && !termsAgreed) {
      setError('You must agree to the Terms of Service, Privacy Policy, and Medical Disclaimer to create an account.');
      return;
    }

    setLoading(true);

    try {
      let user;
      if (isSignUp) {
        user = await signUpUser(email, password, rememberMe);
      } else {
        user = await signInWithUsernameOrEmail(email, password, rememberMe);
      }
      await redirectAfterAuth(user);
    } catch (err) {
      console.error("Auth action failed", err);
      const code = err.code || "";
      if (code.includes("auth/weak-password")) {
        setError("Password should be at least 6 characters.");
      } else if (code.includes("auth/email-already-in-use")) {
        setError("This email address is already in use.");
      } else if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password") || code.includes("auth/user-not-found")) {
        setError("Invalid credentials. Please check your username/email and password.");
      } else if (err.message && err.message.toLowerCase().includes("email not confirmed")) {
        setError("Email not confirmed. Please check your inbox for a confirmation link, or disable 'Confirm Email' in your Supabase Auth settings.");
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
      await redirectAfterAuth(user);
    } catch (err) {
      console.error(`${providerName} login failed`, err);
      setError(err.message || `${providerName} Sign-In aborted.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.97, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md glass-premium rounded-2xl p-6 relative overflow-hidden z-10 mx-auto"
    >
      {/* Upper Brand Section */}
      <div className="flex flex-col items-center mb-8">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer mb-4"
        >
          <Logo className="w-16 h-16" />
        </motion.div>
        <h2 className="brand-name text-2xl text-foreground">
          {forgotMode ? "Reset Password" : (isSignUp ? "Join Calyxo" : "Calyxo Login")}
        </h2>
        <p className="text-muted text-[10px] tracking-widest mt-1 uppercase font-semibold">
          {forgotMode ? "Account recovery link" : (isSignUp ? "AI Fitness & Diet Concierge" : "Log in to track diet & training")}
        </p>
      </div>

      {forgotMode ? (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {forgotError && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold leading-relaxed flex items-start gap-2"
            >
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{forgotError}</span>
            </motion.div>
          )}
          {forgotSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-semibold leading-relaxed flex items-start gap-2"
            >
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{forgotSuccess}</span>
            </motion.div>
          )}

          <div className="flex flex-col space-y-1">
            <label className="text-muted text-[10px] uppercase font-bold tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-muted" />
              <input 
                type="email" 
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[var(--input)] border border-card-border rounded-xl pl-12 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors"
                required 
                disabled={forgotLoading}
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={forgotLoading || cooldown > 0}
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm py-3.5 rounded-xl mt-6 cursor-pointer transition-colors border-none"
          >
            {forgotLoading ? "Sending..." : (cooldown > 0 ? `Resend in ${cooldown}s` : "Send Recovery Email")}
          </motion.button>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setForgotError('');
                setForgotSuccess('');
              }}
              className="text-muted hover:text-foreground text-xs font-semibold cursor-pointer transition-colors focus:outline-none bg-transparent border-none"
            >
              Back to Login
            </button>
          </div>
        </form>
      ) : (
        <>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold leading-relaxed flex items-start gap-2"
            >
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-muted text-[10px] uppercase font-bold tracking-wider">{isSignUp ? 'Email Address' : 'Email or Username'}</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-muted" />
                <input 
                  type={isSignUp ? "email" : "text"} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isSignUp ? "you@example.com" : "Email or Username"}
                  className="w-full bg-[var(--input)] border border-card-border rounded-xl pl-12 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors"
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
                  className="w-full bg-[var(--input)] border border-card-border rounded-xl pl-12 pr-12 py-3 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors"
                  required 
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-muted hover:text-foreground cursor-pointer focus:outline-none bg-transparent border-none"
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
                  className="w-4 h-4 rounded bg-[var(--input)] border border-card-border accent-acid-green focus:ring-0 cursor-pointer"
                />
                <span>Remember Me</span>
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setForgotEmail(email);
                  }}
                  className="text-muted hover:text-[var(--color-acid-green)] font-semibold cursor-pointer focus:outline-none bg-transparent border-none"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            {/* Mandatory Legal Consent for Sign Up */}
            {isSignUp && (
              <div className="p-3 rounded-2xl bg-surface/70 border border-card-border space-y-2 text-[11px] text-muted leading-tight">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={termsAgreed} 
                    onChange={(e) => setTermsAgreed(e.target.checked)} 
                    className="w-4 h-4 mt-0.5 rounded bg-[var(--input)] border border-card-border accent-acid-green focus:ring-0 cursor-pointer shrink-0"
                  />
                  <span>
                    I agree to Calyxo's{' '}
                    <a 
                      href="/user/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-acid-green hover:underline font-bold"
                    >
                      Terms of Service
                    </a>
                    {', '}
                    <a 
                      href="/user/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-acid-green hover:underline font-bold"
                    >
                      Privacy Policy
                    </a>
                    {', and Medical & Exercise Disclaimer.'}
                  </span>
                </label>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || (isSignUp && !termsAgreed)}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm py-3.5 rounded-xl mt-6 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 border-none"
            >
              {loading ? "Authenticating..." : (isSignUp ? "Create Account & Agree" : "Sign In")}
            </motion.button>
          </form>
        </>
      )}

      {/* Divider */}
      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-card-border"></div>
        <span className="flex-shrink mx-4 text-muted text-[10px] font-bold uppercase tracking-wider">Or continue with</span>
        <div className="flex-grow border-t border-card-border"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="w-full">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleOAuth('google')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-[var(--input)] border border-card-border hover:bg-[var(--surface)] text-foreground text-xs font-bold py-3.5 px-4 rounded-xl cursor-pointer transition-colors shadow-sm"
        >
          {/* Google Icon SVG */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.78 0 3.3.61 4.56 1.81l3.42-3.42C17.9 1.54 15.17 1 12 1 7.24 1 3.2 3.73 1.25 7.72l4.03 3.12C6.27 7.76 8.87 5.04 12 5.04z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.65-5.02 3.65-8.65z" />
            <path fill="#FBBC05" d="M5.28 14.78a6.98 6.98 0 0 1 0-4.16L1.25 7.5a11.96 11.96 0 0 0 0 9l4.03-3.12z" />
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.76-2.91c-1.11.75-2.53 1.21-4.2 1.21-3.13 0-5.73-2.72-6.72-5.8L1.25 15.65C3.2 19.64 7.24 23 12 23z" />
          </svg>
          <span>Continue with Google</span>
        </motion.button>
      </div>

      {/* Switch Mode */}
      <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          className="text-muted hover:text-foreground text-xs font-semibold cursor-pointer transition-colors focus:outline-none bg-transparent border-none"
        >
          {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
        </button>
      </div>
    </motion.div>
  );
}

export { AuthFlow };
