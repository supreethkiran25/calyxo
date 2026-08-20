"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

export default function LaunchScreen({ isLoading }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth minimalist progress animation (0 -> 100 in ~1 second)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 100;
        }
        return prev + 12;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      const timer = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 overflow-hidden select-none bg-[#030303]"
        >
          {/* Subtle Deep Ambient Halo Effect */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: [0.2, 0.4, 0.25] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-[450px] h-[450px] sm:w-[600px] sm:h-[600px] rounded-full bg-radial from-[#10B981]/25 via-[#00F0FF]/10 to-transparent blur-[120px]"
            />
          </div>

          {/* Centered Iconic Nike/Puma-style Brand Hero Container */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
            {/* Iconic Glowing Logo Emblem */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center mb-6 group cursor-default"
            >
              {/* Outer Subtle Radial Pulse Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.25, 0.6, 0.25]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 blur-sm"
              />

              {/* Glassmorphic Logo Shield */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/15 flex items-center justify-center shadow-[0_16px_40px_rgba(0,0,0,0.8)] relative p-3 overflow-hidden">
                <Logo className="w-12 h-12 sm:w-14 sm:h-14 text-[#10B981]" />
              </div>
            </motion.div>

            {/* Bold Premium Brand Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ color: '#ffffff' }}
              className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-white force-white uppercase leading-none text-center"
            >
              CALYXO
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ color: '#9ca3af' }}
              className="text-[10px] sm:text-[11px] font-bold tracking-[0.35em] text-[#9CA3AF] uppercase mt-3 text-center"
            >
              TRACK TODAY &bull; TRANSFORM TOMORROW
            </motion.p>
          </div>

          {/* Minimalist Bottom Precision Loading Line */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="relative z-10 w-36 sm:w-44 flex flex-col items-center gap-2 pb-8"
          >
            {/* Ultra-thin Minimalist Neon Progress Line */}
            <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#10B981] via-[#00F0FF] to-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { LaunchScreen };
