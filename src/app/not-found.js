"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] text-[#f3f4f6] px-6 py-12 relative overflow-hidden select-none">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-[#f57c38]/5 rounded-full blur-[100px] pointer-events-none" />

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

        {/* 404 Illustration */}
        <div className="relative py-4">
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--foreground)] to-[var(--accent)] select-none drop-shadow-[0_0_35px_var(--accent-glow)]"
          >
            404
          </motion.h1>
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive/20 px-3.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md"
          >
            <AlertCircle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[10px] font-black uppercase tracking-wider text-destructive">Route Not Found</span>
          </motion.div>
        </div>

        {/* Messaging */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">You&apos;ve Stepped Off-Track</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            The page or athletic resource you are trying to reach doesn&apos;t exist, has been relocated, or is undergoing server-side training log compaction.
          </p>
        </div>

        {/* Buttons */}
        <motion.div 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4 w-full"
        >
          <Link href="/" passHref legacyBehavior>
            <a className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[var(--accent)] text-accent-foreground text-xs font-black uppercase tracking-widest shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all border-none">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </a>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
