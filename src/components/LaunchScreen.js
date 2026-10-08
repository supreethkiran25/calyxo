import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LaunchScreen({ isLoading }) {
  // If splash was already completed in this session, render a lightweight route loader
  const isAlreadyDismissed = typeof window !== 'undefined' && Boolean(window.__calyxo_splash_dismissed);
  const [visible, setVisible] = useState(!isAlreadyDismissed);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAlreadyDismissed) return;

    // Organic progressive loader animation (0 -> 96% over ~1.2s)
    const startTime = Date.now();
    const minDuration = 1200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const fraction = Math.min(elapsed / minDuration, 1);
      // Ease-out cubic curve
      const curved = 1 - Math.pow(1 - fraction, 3);
      const target = Math.min(Math.round(curved * 96), 96);
      setProgress((prev) => Math.max(prev, target));

      if (fraction >= 1) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isAlreadyDismissed]);

  useEffect(() => {
    if (isAlreadyDismissed) return;

    if (!isLoading) {
      // Once app ready, smoothly hit 100% and exit
      const completeTimer = setTimeout(() => {
        setProgress(100);
        const exitTimer = setTimeout(() => {
          setVisible(false);
          window.__calyxo_splash_dismissed = true;
          window.dispatchEvent(new CustomEvent('calyxo_splash_dismissed'));
        }, 220);
        return () => clearTimeout(exitTimer);
      }, 700);

      return () => clearTimeout(completeTimer);
    }
  }, [isLoading, isAlreadyDismissed]);

  // Safety fallback: ensure splash is never stuck beyond 2.8s
  useEffect(() => {
    if (isAlreadyDismissed) return;

    const safetyTimer = setTimeout(() => {
      setProgress(100);
      const exitTimer = setTimeout(() => {
        setVisible(false);
        window.__calyxo_splash_dismissed = true;
        window.dispatchEvent(new CustomEvent('calyxo_splash_dismissed'));
      }, 200);
      return () => clearTimeout(exitTimer);
    }, 2800);

    return () => clearTimeout(safetyTimer);
  }, [isAlreadyDismissed]);

  if (isAlreadyDismissed) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none bg-black"
        >
          {/* Full-bleed Edge-to-Edge Cinematic Splash Artwork */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img 
              src="/splash.png" 
              alt="Calyxo Splash" 
              className="w-full h-full object-cover object-center pointer-events-none select-none"
            />

            {/* Dynamic Animated Cyan Progress Bar Track */}
            <div 
              className="absolute z-20 pointer-events-none"
              style={{
                bottom: '11.62%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(168px, 35.8vw)',
                height: '3px',
                backgroundColor: 'rgba(40, 48, 53, 0.95)',
                borderRadius: '9999px',
                overflow: 'hidden'
              }}
            >
              <div 
                className="h-full rounded-full transition-all duration-150 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #38BDF8 0%, #00F0FF 60%, #70E0FF 100%)',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.9), 0 0 3px rgba(255, 255, 255, 0.95)'
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { LaunchScreen };
