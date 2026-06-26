"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ShieldAlert, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log runtime exceptions safely in production
    console.error("Calyxo Runtime Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] text-[#f3f4f6] px-6 py-12 relative overflow-hidden select-none">
      {/* Red/Amber glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-destructive/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--border) 1px, transparent 0), radial-gradient(var(--border) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      <div className="z-10 flex flex-col items-center text-center max-w-md w-full space-y-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-[var(--accent)]" glow={true} />
          <span className="brand-name text-lg tracking-[0.16em] font-black text-white">calyxo</span>
        </div>

        {/* Error icon with warning pulse */}
        <div className="relative py-2 flex justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 0px rgba(239, 83, 80, 0.2)",
                "0 0 0 15px rgba(239, 83, 80, 0)",
                "0 0 0 0px rgba(239, 83, 80, 0)"
              ]
            }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center"
          >
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </motion.div>
        </div>

        {/* Messaging */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">Application Exception</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            A state or client render exception occurred while processing this segment. Don&apos;t worry, your logged biometrics and streaks are saved in cache storage.
          </p>
        </div>

        {/* Safe Error Debug Info Container */}
        <div className="w-full bg-[#0d0d12] border border-[var(--border)] rounded-xl p-4 text-left font-mono space-y-2.5">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">System Diagnostic</span>
            <span className="text-[8px] bg-destructive/15 text-destructive font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Exception</span>
          </div>
          <p className="text-[10px] text-destructive font-bold break-all leading-normal">
            {error?.message || "Unknown client-side exception"}
          </p>
          {error?.digest && (
            <p className="text-[9px] text-[var(--text-muted)]">
              Digest ID: <span className="text-[9px] font-bold text-white select-text">{error.digest}</span>
            </p>
          )}
        </div>

        {/* Actions Row */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pt-2 w-full flex flex-col sm:flex-row gap-3"
        >
          <button 
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[var(--accent)] text-accent-foreground text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-transform hover:scale-[1.02] shadow-lg shadow-[var(--accent)]/15 border-none"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-surface border border-card-border text-[var(--text-muted)] hover:text-white hover:border-white/20 text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-transform hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4" />
            Reload Page
          </button>
        </motion.div>
      </div>
    </div>
  );
}
