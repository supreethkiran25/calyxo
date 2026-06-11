import React, { useState } from 'react';
import { signUpUser, signInUser } from '../dbService';

function AuthFlow({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isSignUp) {
        user = await signUpUser(email, password);
      } else {
        user = await signInUser(email, password);
      }
      onAuthSuccess(user);
    } catch (err) {
      console.error("Authentication action failed", err);
      // Simplify error messages for standard readability
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-neon-green/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-green/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-premium rounded-2xl p-8 relative overflow-hidden">
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center w-12 h-12 mb-4">
            <div className="absolute w-10 h-10 border-2 border-neon-green rounded-full shadow-[0_0_12px_#39ff14]"></div>
            <div className="w-2.5 h-2.5 bg-neon-green rounded-full shadow-[0_0_8px_#39ff14]"></div>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-wider text-white uppercase">
            {isSignUp ? "Create Account" : "Access Calyxo"}
          </h2>
          <p className="text-gray-400 text-xs tracking-wider mt-1 uppercase font-medium">
            {isSignUp ? "Join the AI Concierge platform" : "Log in to track diet & training"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col space-y-1">
            <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-green focus:bg-white/10 transition-colors"
              required 
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-green focus:bg-white/10 transition-colors"
              required 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green text-black font-bold text-sm py-3.5 rounded-xl mt-6 cursor-pointer hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? "Authorizing..." : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-gray-400 hover:text-white text-xs font-medium cursor-pointer transition-colors"
          >
            {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthFlow;
