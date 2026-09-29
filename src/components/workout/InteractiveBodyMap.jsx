import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBodyPaths, getViewBox } from '../analytics/muscleMapPathData';
import { Dumbbell, RotateCw, Check } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const MUSCLE_NAMES = {
  chest: 'Chest (Pectorals)',
  abs: 'Abs & Core',
  obliques: 'Obliques',
  biceps: 'Biceps',
  triceps: 'Triceps',
  deltoids: 'Shoulders (Delts)',
  forearms: 'Forearms',
  quadriceps: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  lats: 'Back (Lats)',
  trapezius: 'Traps',
  lower_back: 'Lower Back'
};

export default function InteractiveBodyMap({
  gender = 'male',
  selectedMuscle = null,
  onSelectMuscle = () => {}
}) {
  const [view, setView] = useState('front'); // 'front' | 'back'

  const triggerHaptic = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {}
  };

  const activeGender = useMemo(() => {
    const g = String(gender).toLowerCase().trim();
    return (g.includes('fem') || g.includes('woman') || g === 'f') ? 'female' : 'male';
  }, [gender]);

  const bodyPaths = useMemo(() => {
    return getBodyPaths(activeGender, view);
  }, [activeGender, view]);

  const viewBox = useMemo(() => {
    return getViewBox(activeGender, view);
  }, [activeGender, view]);

  const handleMuscleClick = (slug) => {
    triggerHaptic();
    onSelectMuscle(slug);
  };

  return (
    <div className="w-full flex flex-col items-center bg-surface border border-card-border rounded-3xl p-4 sm:p-5 shadow-sm select-none">
      {/* View Switcher: Anterior / Posterior */}
      <div className="w-full flex items-center justify-between mb-3 border-b border-card-border/60 pb-3">
        <div className="flex items-center gap-1.5 bg-surface-elevated p-1 rounded-2xl border border-card-border">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setView('front');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              view === 'front'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground bg-transparent'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setView('back');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              view === 'back'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground bg-transparent'
            }`}
          >
            Back
          </button>
        </div>

        {selectedMuscle && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-black uppercase tracking-wider">
            <span>{MUSCLE_NAMES[selectedMuscle] || selectedMuscle}</span>
            <button
              onClick={() => onSelectMuscle(null)}
              className="text-accent hover:text-white cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* SVG Anatomical Human Body Map */}
      <div className="w-full max-w-[280px] h-[340px] flex items-center justify-center relative my-1">
        <svg
          viewBox={viewBox}
          className="w-full h-full object-contain filter drop-shadow-md"
        >
          {bodyPaths.map((item) => {
            const isSelected = selectedMuscle === item.slug;
            const allPathStrings = [...(item.common || []), ...(item.left || []), ...(item.right || [])];

            return (
              <g
                key={item.slug}
                onClick={() => handleMuscleClick(item.slug)}
                className="cursor-pointer group"
              >
                {allPathStrings.map((d, pIdx) => (
                  <path
                    key={pIdx}
                    d={d}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? 'fill-accent stroke-accent filter drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]'
                        : 'fill-neutral-800 hover:fill-accent/60 stroke-neutral-900 group-hover:stroke-accent/80'
                    }`}
                    strokeWidth="1.2"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-[11px] text-muted-foreground font-medium text-center mt-2">
        Tap any muscle on the model to instantly filter exercises
      </p>
    </div>
  );
}
