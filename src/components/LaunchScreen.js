"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import ColorBends from './ColorBends';
import { Sparkles, Shield, Cpu, Zap, Activity } from 'lucide-react';

export default function LaunchScreen({ isLoading }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate high-tech loading progress bar 0 -> 100
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          return 100;
        }
        const diff = Math.floor(Math.random() * 15) + 8;
        return Math.min(99, prev + diff);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const getStatusText = (pct) => {
    if (pct < 30) return "INITIALIZING HEALTH KERNEL...";
    if (pct < 65) return "CONNECTING AI HEALTH TWIN...";
    if (pct < 95) return "OPTIMIZING METABOLIC ENGINE...";
    return "SYSTEM OPERATIONAL • READY";
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-8 overflow-hidden select-none bg-[#030303]"
        >
          {/* Ambient ColorBends WebGL Shader Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <ColorBends
              colors={["#10B981", "#00F0FF", "#3B82F6", "#059669"]}
              rotation={87}
              speed={0.4}
              scale={1.2}
              frequency={1}
              warpStrength={1}
              mouseInfluence={1}
              noise={0.15}
              parallax={0.5}
              iterations={2}
              intensity={1.6}
              bandWidth={6}
              transparent={true}
              className="w-full h-full opacity-100"
            />
            {/* Fine Grid Background */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }}
            />
          </div>

          {/* Top Brand Tag */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 relative z-10 pt-4"
          >
            <div className="flex items-center gap-1.5 bg-[rgba(204,255,0,0.08)] border border-[rgba(204,255,0,0.25)] px-3 py-1 rounded-full backdrop-blur-md shadow-lg shadow-[rgba(204,255,0,0.05)]">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping shrink-0" />
              <span className="text-[10px] font-black tracking-widest text-[#ccff00] uppercase">
                CALYXO v2.4 OS
              </span>
            </div>
          </motion.div>

          {/* Centerpiece Glowing Emblem & Title */}
          <div className="flex flex-col items-center relative z-10 my-auto">
            {/* Multi-ring Glowing Emblem Container */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative flex items-center justify-center mb-8 group"
            >
              {/* Outer Pulsating Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-36 h-36 rounded-full border border-[#ccff00]/40 shadow-[0_0_50px_rgba(204,255,0,0.3)]"
              />

              {/* Glass Inner Frame */}
              <div className="w-28 h-28 rounded-3xl bg-surface/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-black/80 relative overflow-hidden">
                {/* Neon Shimmer Streak */}
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ccff00]/20 to-transparent transform -skew-x-12"
                />

                {/* Bright Glowing Logo */}
                <Logo className="w-16 h-16 text-[#ccff00]" glow={true} />
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] via-emerald-400 to-teal-300 uppercase leading-none text-center"
            >
              CALYXO
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.35 }}
              className="text-[11px] font-extrabold tracking-[0.25em] text-muted uppercase mt-2.5 text-center flex items-center gap-2"
            >
              <span>Track Today</span>
              <span className="text-[#ccff00]">•</span>
              <span>Transform Tomorrow</span>
            </motion.p>
          </div>

          {/* Bottom High-Tech Progress Bar & Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-xs relative z-10 flex flex-col items-center gap-3 pb-6"
          >
            {/* Percentage & Status Label */}
            <div className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
              <span className="text-muted flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#ccff00] animate-pulse" />
                {getStatusText(progress)}
              </span>
              <span className="text-[#ccff00] font-mono text-xs font-black">
                {progress}%
              </span>
            </div>

            {/* Segmented Neon Bar Container */}
            <div className="w-full h-2 bg-black/60 border border-white/10 rounded-full overflow-hidden p-0.5 relative shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#ccff00] via-emerald-400 to-teal-300 shadow-[0_0_15px_rgba(204,255,0,0.8)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>

            {/* System Encryption Badges */}
            <div className="flex items-center gap-4 text-[9px] text-muted font-bold tracking-widest uppercase opacity-60 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#ccff00]" /> End-to-End Encrypted
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" /> Neural Twin Active
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { LaunchScreen };
