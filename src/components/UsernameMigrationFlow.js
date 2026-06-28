"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AtSign, Check, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { checkUsernameAvailability, claimUsername } from '../lib/socialService';

// Simple debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function UsernameMigrationFlow({ user, onComplete }) {
  const [username, setUsername] = useState('');
  const debouncedUsername = useDebounce(username, 500);
  
  const [status, setStatus] = useState('idle'); // idle, checking, available, taken, error
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function validateUsername() {
      if (!debouncedUsername) {
        setStatus('idle');
        setMessage('');
        setSuggestions([]);
        return;
      }
      
      if (debouncedUsername.length < 3) {
        setStatus('error');
        setMessage('Username must be at least 3 characters.');
        setSuggestions([]);
        return;
      }

      setStatus('checking');
      try {
        const result = await checkUsernameAvailability(debouncedUsername);
        if (result.available) {
          setStatus('available');
          setMessage('Username is available!');
          setSuggestions([]);
        } else {
          setStatus('taken');
          setMessage(result.reason || 'Username is not available.');
          setSuggestions(result.suggestions || []);
        }
      } catch (err) {
        setStatus('error');
        setMessage('Error checking availability.');
      }
    }

    validateUsername();
  }, [debouncedUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== 'available' || !username) return;

    setIsSubmitting(true);
    try {
      await claimUsername(user.uid, username, user.email);
      onComplete(username);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Failed to claim username.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface border border-card-border rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-acid-green via-blue-500 to-purple-500" />
        
        <div className="w-16 h-16 rounded-2xl bg-acid-green/10 border border-acid-green/30 flex items-center justify-center mb-6">
          <AtSign className="w-8 h-8 text-acid-green" />
        </div>

        <h1 className="text-3xl font-black text-foreground mb-2">Claim Your Identity</h1>
        <p className="text-sm text-muted font-medium mb-8">
          We've introduced unique usernames! Please choose a globally unique username to represent you across Calyxo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted">Unique Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-black">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase())}
                placeholder="username"
                className={`w-full bg-[var(--input)] border-2 rounded-xl pl-10 pr-12 py-3 text-base text-foreground font-bold focus:outline-none transition-colors ${
                  status === 'available' ? 'border-acid-green' :
                  status === 'taken' || status === 'error' ? 'border-red-500/50' :
                  'border-card-border focus:border-white/20'
                }`}
                disabled={isSubmitting}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {status === 'checking' && <Loader2 className="w-5 h-5 text-muted animate-spin" />}
                {status === 'available' && <Check className="w-5 h-5 text-acid-green" />}
                {status === 'taken' && <X className="w-5 h-5 text-red-500" />}
                {status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>
            </div>

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-xs font-bold ${
                    status === 'available' ? 'text-acid-green' : 
                    status === 'taken' || status === 'error' ? 'text-red-400' : 'text-muted'
                  }`}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-acid-green" />
                  Suggestions
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setUsername(sug)}
                      className="px-3 py-1.5 rounded-full bg-surface border border-card-border text-xs font-bold text-foreground hover:border-acid-green transition-colors"
                    >
                      @{sug}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={status !== 'available' || isSubmitting}
            className="w-full py-4 rounded-xl bg-acid-green text-accent-foreground font-black uppercase tracking-widest text-sm disabled:opacity-50 hover:bg-acid-green/90 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              'Claim Username'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-xl bg-surface/50 border border-card-border/50 text-xs font-medium text-muted leading-relaxed">
          <p>• Only letters, numbers, underscores, and periods.</p>
          <p>• Cannot be changed for 30 days after claiming.</p>
          <p>• Becomes your public profile link (calyxo.app/@username).</p>
        </div>

      </motion.div>
    </div>
  );
}
