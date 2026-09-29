import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, SkipForward, Volume2, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export default function WorkoutRestHUD({
  isActive = false,
  durationSeconds = 90,
  nextExerciseName = 'Next Set',
  nextTarget = '',
  onComplete = () => {},
  onSkip = () => {},
  onAddSeconds = () => {}
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);
  const endTimeRef = useRef(Date.now() + durationSeconds * 1000);

  useEffect(() => {
    if (isActive) {
      endTimeRef.current = Date.now() + durationSeconds * 1000;
      setSecondsRemaining(durationSeconds);
    }
  }, [isActive, durationSeconds]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        // Haptic feedback & Web Audio alert
        try {
          if (Capacitor.isNativePlatform()) {
            Haptics.notification({ type: NotificationType.Success });
          } else if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        } catch (e) {}

        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {}

        onComplete();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  const handleAdd15Sec = () => {
    endTimeRef.current += 15 * 1000;
    setSecondsRemaining(prev => prev + 15);
    if (onAddSeconds) onAddSeconds(15);
  };

  if (!isActive) return null;

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 max-w-md mx-auto z-50">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="p-4 rounded-3xl bg-neutral-900/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 text-white"
      >
        {/* Left Timer Ring / Readout */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-black text-sm">
            {timeFormatted}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-mono block">
              RESTING
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[200px] block">
              {nextExerciseName}
            </span>
            {nextTarget && (
              <span className="text-[10px] text-neutral-400 font-mono">
                {nextTarget}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleAdd15Sec}
            className="px-2.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[11px] font-bold text-white border border-neutral-700 transition-all cursor-pointer active:scale-95"
          >
            +15s
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 border-none shadow-sm shadow-cyan-400/20"
          >
            Skip
          </button>
        </div>
      </motion.div>
    </div>
  );
}
