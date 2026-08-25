import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Check, Minus, Plus } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { toast } from 'sonner';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useStore } from '../../store/useStore';
import { addWeightLog, saveUserProfile } from '../../lib/dbService';

export default function WeightLoggerModal() {
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const addWeightLogStore = useStore(state => state.addWeightLog);
  const updateUserProfileStore = useStore(state => state.updateUserProfile);

  const initialUnits = userProfile?.units === 'imperial' ? 'imperial' : 'metric';
  const [units, setUnits] = useState(initialUnits);

  const parseInitialWeight = () => {
    const raw = Number(userProfile?.weight || userProfile?.currentWeight || (units === 'imperial' ? 150.0 : 64.3));
    if (isNaN(raw) || raw <= 0) return units === 'imperial' ? 150.0 : 64.3;
    return Math.round(raw * 10) / 10;
  };

  const [weight, setWeight] = useState(parseInitialWeight);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeWorkflow === 'update_weight') {
      setUnits(userProfile?.units === 'imperial' ? 'imperial' : 'metric');
      const base = Number(userProfile?.weight || userProfile?.currentWeight || (userProfile?.units === 'imperial' ? 150.0 : 64.3));
      if (!isNaN(base) && base > 0) {
        setWeight(Math.round(base * 10) / 10);
      }
    }
  }, [activeWorkflow, userProfile?.weight, userProfile?.units]);

  const minWeight = units === 'imperial' ? 65.0 : 30.0;
  const maxWeight = units === 'imperial' ? 450.0 : 220.0;
  const step = 0.1;
  const PX_PER_STEP = 10; // 10px per 0.1 unit

  const rulerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWeightRef = useRef(weight);
  const lastHapticWeightRef = useRef(weight);

  const triggerHaptic = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {}
  }, []);

  const updateWeightClamped = useCallback((newVal) => {
    const clamped = Math.min(maxWeight, Math.max(minWeight, Math.round(newVal * 10) / 10));
    setWeight(clamped);
    if (Math.abs(clamped - lastHapticWeightRef.current) >= 0.1) {
      lastHapticWeightRef.current = clamped;
      triggerHaptic();
    }
  }, [minWeight, maxWeight, triggerHaptic]);

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWeightRef.current = weight;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    // Dragging right moves ruler right, so weight decreases; dragging left increases weight
    const deltaWeight = -(deltaX / PX_PER_STEP) * step;
    updateWeightClamped(startWeightRef.current + deltaWeight);
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch (err) {}
  };

  // Mouse wheel handler for smooth scrolling
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY || e.deltaX;
    if (Math.abs(delta) < 1) return;
    const deltaStep = (delta > 0 ? 0.1 : -0.1);
    updateWeightClamped(weight + deltaStep);
  };

  // Render ruler ticks around current weight
  const renderTicks = () => {
    const visibleRange = 4.0; // Show +/- 4.0 units from center
    const startNum = Math.max(minWeight, Math.floor((weight - visibleRange) * 10) / 10);
    const endNum = Math.min(maxWeight, Math.ceil((weight + visibleRange) * 10) / 10);
    
    const ticks = [];
    for (let w = startNum; w <= endNum; w = Math.round((w + 0.1) * 10) / 10) {
      const isMajor = Math.abs(Math.round(w) - w) < 0.01;
      const offsetPx = (w - weight) * (PX_PER_STEP / step);
      
      ticks.push(
        <div
          key={w.toFixed(1)}
          className="absolute flex flex-col items-center pointer-events-none transform -translate-x-1/2"
          style={{ left: `calc(50% + ${offsetPx}px)` }}
        >
          <div
            className={`transition-colors ${
              isMajor
                ? 'w-[2px] h-7 bg-neutral-400 dark:bg-neutral-500'
                : 'w-[1.5px] h-4 bg-neutral-200 dark:bg-neutral-700'
            }`}
          />
          {isMajor && (
            <span className="text-[10px] sm:text-xs font-bold text-neutral-400 dark:text-neutral-500 font-mono mt-1.5">
              {Math.round(w)}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (loading || !weight || isNaN(weight) || weight <= 0) return;
    setLoading(true);

    const userId = user?.uid || user?.id;
    const weightVal = Number(weight.toFixed(1));

    try {
      if (userId) {
        // 1. Add weight log entry to DB
        const entry = await addWeightLog(userId, weightVal, units);
        
        // 2. Add to Zustand store logs
        if (entry) addWeightLogStore(entry);
        
        // 3. Update current weight in user profile DB & store
        const updatedProfile = { ...(userProfile || {}), weight: weightVal, units };
        await saveUserProfile(userId, updatedProfile);
        updateUserProfileStore({ weight: weightVal, units });

        // 4. Save to Native Apple HealthKit / Android Health Connect
        if (Capacitor.isNativePlatform()) {
          try {
            const weightKg = units === 'imperial' ? weightVal * 0.453592 : weightVal;
            const { CalyxoHealthKit, CalyxoHealthPlugin } = Capacitor.Plugins;
            if (CalyxoHealthKit) {
              await CalyxoHealthKit.saveWeight({ weightKg });
            } else if (CalyxoHealthPlugin) {
              await CalyxoHealthPlugin.saveWeight({ weightKg });
            }
          } catch (nativeErr) {
            console.warn('[WeightLoggerModal] Native HealthKit write error:', nativeErr);
          }
        }
      }

      toast.success(`Weight logged: ${weightVal} ${units === 'imperial' ? 'lbs' : 'kg'}`);
      closeWorkflow();
    } catch (err) {
      console.error('[WeightLoggerModal] Failed to save weight log:', err);
      toast.error('Could not save weight log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (activeWorkflow !== 'update_weight') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={closeWorkflow}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-sm sm:max-w-md bg-[#FAFAFA] dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-[2.25rem] p-6 sm:p-8 shadow-2xl flex flex-col items-center overflow-hidden"
        >
          {/* Header Row */}
          <div className="w-full flex items-center justify-between relative mb-2">
            <button
              onClick={closeWorkflow}
              aria-label="Close modal"
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors border-none bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
              Log Weight
            </h3>

            {/* Subtle Unit Toggle */}
            <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-800/80 p-0.5 rounded-full border border-neutral-300/60 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => {
                  if (units !== 'metric') {
                    setUnits('metric');
                    setWeight(prev => Math.round((prev * 0.453592) * 10) / 10);
                  }
                }}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all border-none cursor-pointer ${
                  units === 'metric'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 bg-transparent'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => {
                  if (units !== 'imperial') {
                    setUnits('imperial');
                    setWeight(prev => Math.round((prev / 0.453592) * 10) / 10);
                  }
                }}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all border-none cursor-pointer ${
                  units === 'imperial'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 bg-transparent'
                }`}
              >
                lbs
              </button>
            </div>
          </div>

          {/* Centered Scale Icon Badge */}
          <div className="w-16 h-16 rounded-full bg-[#ECFCCB] text-[#3F6212] dark:bg-lime-950/60 dark:text-lime-300 dark:border dark:border-lime-500/30 flex items-center justify-center mt-3 mb-4 shadow-sm">
            <Scale className="w-8 h-8 stroke-[2]" />
          </div>

          {/* Headline & Subtitle */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight text-center">
            Weight today?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1 mb-5 text-center">
            Consistency matters.
          </p>

          {/* Central White Interactive Weight Card */}
          <div className="w-full bg-white dark:bg-[#18181B] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col items-center justify-center relative select-none">
            {/* Numeric Readout */}
            <div className="flex items-baseline justify-center mb-6">
              <span className="text-5xl sm:text-6xl font-black text-neutral-900 dark:text-white font-mono tracking-tight leading-none">
                {weight.toFixed(1)}
              </span>
              <span className="text-lg sm:text-xl font-bold text-neutral-500 dark:text-neutral-400 ml-1.5 font-sans">
                {units === 'imperial' ? 'lbs' : 'kg'}
              </span>
            </div>

            {/* Horizontal Interactive Ruler */}
            <div
              ref={rulerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              className="w-full h-18 relative flex items-center justify-center overflow-hidden cursor-ew-resize touch-none"
            >
              {/* Fixed Lime Needle Indicator in the Center */}
              <div className="absolute top-0 bottom-6 left-1/2 -translate-x-1/2 w-1 bg-[#84CC16] dark:bg-[#A3E635] rounded-full z-20 shadow-sm pointer-events-none" />

              {/* Dynamic Ruler Ticks */}
              <div className="w-full h-full relative">
                {renderTicks()}
              </div>

              {/* Edge Gradient Mask */}
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white dark:from-[#18181B] to-transparent pointer-events-none z-10" />
              <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white dark:from-[#18181B] to-transparent pointer-events-none z-10" />
            </div>

            {/* Micro Step Quick Controls */}
            <div className="w-full flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 mt-2">
              <button
                type="button"
                onClick={() => updateWeightClamped(weight - 0.1)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors border-none bg-transparent cursor-pointer"
                title="-0.1"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                Drag wheel or tap +/-
              </span>
              <button
                type="button"
                onClick={() => updateWeightClamped(weight + 0.1)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors border-none bg-transparent cursor-pointer"
                title="+0.1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtitle / Footnote */}
          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium tracking-wide mt-3 mb-6">
            Updates AI plan.
          </span>

          {/* Bottom Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !weight}
            className="w-full py-4 rounded-full bg-neutral-950 hover:bg-neutral-850 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer border-none active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Save</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
