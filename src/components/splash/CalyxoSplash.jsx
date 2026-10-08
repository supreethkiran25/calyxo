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
    const updateProgressLoop = () => {
      setDisplayProgress((prev) => {
        const target = targetProgressRef.current;
        if (prev < target) {
          const delta = Math.max(0.4, (target - prev) * 0.14);
          const nextVal = Math.min(target, prev + delta);
          return nextVal;
        }
        return prev;
      });
      animFrameRef.current = requestAnimationFrame(updateProgressLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateProgressLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Application bootstrap execution
  const startInitialization = useCallback(async () => {
    setErrorState(null);
    targetProgressRef.current = 5;

    const startTime = performance.now();

    try {
      const result = await initializeApplication((progress) => {
        targetProgressRef.current = progress;
      });

      // Ensure target hits 100%
      targetProgressRef.current = 100;

      // Guarantee minimum presentation duration of 1200ms
      const elapsed = performance.now() - startTime;
      const remainingTime = Math.max(0, MIN_SPLASH_DURATION - elapsed);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      // Ensure smooth visual catch-up to 100%
      const waitForCatchup = () =>
        new Promise((resolve) => {
          const check = () => {
            setDisplayProgress((current) => {
              if (current >= 99.5) {
                resolve();
                return 100;
              }
              setTimeout(check, 16);
              return current;
            });
          };
          check();
        });

      await waitForCatchup();

      // Brief Apple-style dwell at 100% (150ms)
      await new Promise((resolve) => setTimeout(resolve, 150));

      if (!isCompletedRef.current) {
        isCompletedRef.current = true;
        setIsDismissing(true);

        // Notify system and native bridge that splash is departing
        if (typeof window !== 'undefined') {
          window.__calyxo_splash_dismissed = true;
          window.dispatchEvent(new CustomEvent('calyxo_splash_dismissed'));
        }

        // Complete transition callback
        setTimeout(() => {
          onComplete(result?.destination || '/');
        }, 320);
      }
    } catch (err) {
      console.error('[CalyxoSplash] Startup error:', err);
      setErrorState('Unable to restore your session.');
    }
  }, [onComplete]);

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
