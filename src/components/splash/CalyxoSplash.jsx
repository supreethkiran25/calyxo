import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SplashLoader from './SplashLoader';
import CalyxoWordmark from './CalyxoWordmark';
import { initializeApplication } from '../../services/appInitialization';

const MIN_SPLASH_DURATION = 1200; // ms

/**
 * Calyxo Flagship Apple-Level Cinematic Splash Screen
 *
 * Visual hierarchy:
 * 1. CALYXO Wordmark
 * 2. Subtle Matte Eclipse with soft silver rim light
 * 3. TRACK TODAY • TRANSFORM TOMORROW
 * 4. Minimal iOS-style progress indicator
 */
export default function CalyxoSplash({ onComplete = () => {} }) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef(null);
  const isCompletedRef = useRef(false);

  // Check user motion preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  // Smooth 60fps requestAnimationFrame progress interpolation
  useEffect(() => {
    let isRunning = true;
    const updateProgressLoop = () => {
      if (!isRunning) return;
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      if (current < target) {
        const delta = Math.max(0.5, (target - current) * 0.16);
        const nextVal = Math.min(target, current + delta);
        currentProgressRef.current = nextVal;
        setDisplayProgress(Math.round(nextVal * 10) / 10);
      }
      animFrameRef.current = requestAnimationFrame(updateProgressLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateProgressLoop);
    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const finishAndDismiss = useCallback((destination = '/') => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;

    currentProgressRef.current = 100;
    setDisplayProgress(100);
    setIsDismissing(true);

    if (typeof window !== 'undefined') {
      window.__calyxo_splash_dismissed = true;
      window.dispatchEvent(new CustomEvent('calyxo_splash_dismissed', { detail: { destination } }));
    }

    setTimeout(() => {
      onComplete(destination);
    }, 320);
  }, [onComplete]);

  // Application bootstrap execution
  const startInitialization = useCallback(async () => {
    setErrorState(null);
    targetProgressRef.current = 10;
    currentProgressRef.current = 0;

    const startTime = performance.now();

    // Absolute fallback safety timer: never trap user on splash screen
    const safetyTimer = setTimeout(() => {
      if (!isCompletedRef.current) {
        console.warn('[CalyxoSplash] Safety timeout reached, dismissing splash');
        finishAndDismiss('/');
      }
    }, 2800);

    try {
      const result = await Promise.race([
        initializeApplication((progress) => {
          targetProgressRef.current = Math.max(targetProgressRef.current, progress);
        }),
        new Promise((resolve) => setTimeout(() => resolve({ destination: '/' }), 2000))
      ]);

      // Ensure target reaches 100%
      targetProgressRef.current = 100;

      // Guarantee minimum presentation duration of 1000ms for visual polish
      const elapsed = performance.now() - startTime;
      const remainingTime = Math.max(0, MIN_SPLASH_DURATION - elapsed);
      if (remainingTime > 0) {
        await new Promise((r) => setTimeout(r, remainingTime));
      }

      // Smooth visual catch-up to 100% (max 350ms)
      const catchupStart = performance.now();
      while (currentProgressRef.current < 99 && performance.now() - catchupStart < 400) {
        await new Promise((r) => setTimeout(r, 20));
      }

      // Brief Apple-style dwell at 100% (150ms)
      currentProgressRef.current = 100;
      setDisplayProgress(100);
      await new Promise((r) => setTimeout(r, 150));

      clearTimeout(safetyTimer);
      finishAndDismiss(result?.destination || '/');
    } catch (err) {
      console.warn('[CalyxoSplash] Startup fallback:', err);
      clearTimeout(safetyTimer);
      finishAndDismiss('/');
    }
  }, [finishAndDismiss]);

  useEffect(() => {
    startInitialization();
  }, [startInitialization]);

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          key="calyxo-splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: prefersReducedMotion ? 1 : 1.01
          }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="fixed inset-0 z-[99999] bg-[#050606] flex flex-col items-center justify-between select-none overflow-hidden"
          style={{
            height: '100dvh',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
          role="status"
          aria-live="polite"
        >
          {/* Subtle Planetary Eclipse Visual */}
          <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 430 932"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full max-w-[540px] max-h-[1100px] object-cover pointer-events-none select-none"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <defs>
                {/* Rim Light Angle Gradient: from bottom-left to top-right */}
                <linearGradient id="rimCore" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="42%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="62%" stopColor="#94a3b8" stopOpacity="0.25" />
                  <stop offset="78%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="88%" stopColor="#e2e8f0" stopOpacity="0.65" />
                  <stop offset="96%" stopColor="#94a3b8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Atmospheric Haze Gradient */}
                <linearGradient id="rimHaze" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity="0" />
                  <stop offset="55%" stopColor="#94a3b8" stopOpacity="0.05" />
                  <stop offset="76%" stopColor="#ffffff" stopOpacity="0.32" />
                  <stop offset="88%" stopColor="#cbd5e1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#050606" stopOpacity="0" />
                </linearGradient>

                <filter id="hazeBlur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>

                <filter id="softGlowBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
              </defs>

              {/* Planet Eclipse: Center cx=220, cy=305, r=192 */}
              <g opacity="0.92">
                {/* Atmospheric diffuse haze */}
                <circle
                  cx="220"
                  cy="305"
                  r="193"
                  stroke="url(#rimHaze)"
                  strokeWidth="16"
                  fill="none"
                  filter="url(#hazeBlur)"
                  opacity="0.75"
                />

                {/* Soft perimeter rim glow */}
                <circle
                  cx="220"
                  cy="305"
                  r="192.5"
                  stroke="url(#rimCore)"
                  strokeWidth="4"
                  fill="none"
                  filter="url(#softGlowBlur)"
                  opacity="0.8"
                />

                {/* Sharp razor-thin rim light */}
                <circle
                  cx="220"
                  cy="305"
                  r="192"
                  stroke="url(#rimCore)"
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.95"
                />

                {/* Matte deep obsidian planetary disc */}
                <circle cx="220" cy="305" r="191" fill="#050606" />
              </g>
            </svg>
          </div>

          {/* Top spacer for optical balance */}
          <div className="w-full h-12 pointer-events-none" />

          {/* Center Brand Identity Container */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
            {/* Wordmark */}
            <CalyxoWordmark className="w-[260px] sm:w-[290px]" />

            {/* Subdued Tagline */}
            <p
              className="text-[9px] sm:text-[10px] uppercase font-light text-[#737981] mt-3 tracking-[0.32em] sm:tracking-[0.38em]"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif"
              }}
            >
              TRACK TODAY • TRANSFORM TOMORROW
            </p>
          </div>

          {/* Bottom Area: Minimal iOS Loading Indicator */}
          <div
            className="relative z-10 w-full flex flex-col items-center justify-center pointer-events-none"
            style={{
              marginBottom: 'max(48px, calc(env(safe-area-inset-bottom, 0px) + 28px))'
            }}
          >
            {errorState ? (
              <div className="flex flex-col items-center gap-3 pointer-events-auto">
                <p className="text-xs text-[#737981] tracking-wide">{errorState}</p>
                <button
                  type="button"
                  onClick={startInitialization}
                  className="px-4 py-1.5 text-xs text-[#F5F5F5] border border-[#30343A] rounded-full hover:border-[#737981] transition-colors"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : (
              <SplashLoader progress={displayProgress} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { CalyxoSplash };
