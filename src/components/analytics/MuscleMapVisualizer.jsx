import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, User } from 'lucide-react';
import { getBodyPaths, getViewBox } from './muscleMapPathData';
import { STIMULUS_LEVELS, ANATOMICAL_MUSCLE_GROUPS } from '../../services/analytics/MuscleStimulusEngine';

export default function MuscleMapVisualizer({
  gender = 'male',
  slugColorMap = {},
  muscleDetails = {},
  onSelectMuscle = () => {},
  selectedSlug = null
}) {
  const [view, setView] = useState('front'); // 'front' | 'back'
  const [zoomLevel, setZoomLevel] = useState(1);

  // Strictly bind anatomical model to user profile gender
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
    let targetMuscleKey = null;
    for (const [mKey, group] of Object.entries(ANATOMICAL_MUSCLE_GROUPS)) {
      if (group.slugs.includes(slug)) {
        targetMuscleKey = mKey;
        break;
      }
    }
    const detail = targetMuscleKey && muscleDetails[targetMuscleKey] 
      ? muscleDetails[targetMuscleKey] 
      : { name: slug, stimulusLevel: STIMULUS_LEVELS.NONE, totalVolumeKg: 0, totalSets: 0, contributingExercises: [] };

    onSelectMuscle(slug, detail);
  };

  return (
    <div className="relative w-full rounded-3xl bg-surface border border-card-border overflow-hidden flex flex-col items-center justify-between p-4 sm:p-6 shadow-card select-none">
      
      {/* ── Top Bar Controls ──────────────────────────────────────────────── */}
      <div className="w-full flex items-center justify-between z-10 gap-2 mb-2">
        {/* Front / Back Flip Pill */}
        <div className="flex items-center bg-surface-elevated p-1 rounded-2xl border border-card-border shadow-xs">
          <button
            type="button"
            onClick={() => setView('front')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              view === 'front'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anterior (Front)
          </button>
          <button
            type="button"
            onClick={() => setView('back')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              view === 'back'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Posterior (Back)
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-surface-elevated p-0.5 rounded-xl border border-card-border">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.15))}
              className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer border-none"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.85, prev - 0.15))}
              className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer border-none"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1.5 text-accent hover:brightness-110 cursor-pointer border-none"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Center SVG Canvas ─────────────────────────────────────────────── */}
      <div className="w-full flex items-center justify-center my-2 relative min-h-[380px] sm:min-h-[460px]">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-orange-500/5 pointer-events-none rounded-2xl" />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeGender}-${view}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: zoomLevel }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full flex items-center justify-center"
          >
            <svg
              viewBox={viewBox}
              className="w-full max-w-[290px] sm:max-w-[340px] max-h-[460px] h-auto drop-shadow-md cursor-pointer transition-all duration-300"
              style={{ maxHeight: '460px' }}
            >
              <g className="body-silhouette">
                {bodyPaths.map((part, pIdx) => {
                  const slug = part.slug;
                  const stimulusLevelObj = slugColorMap[slug] || STIMULUS_LEVELS.NONE;
                  const isHighlighted = stimulusLevelObj.level > 0;
                  const isSelected = selectedSlug === slug;

                  // Render paths (common, left, right)
                  const allSubPaths = [...(part.common || []), ...(part.left || []), ...(part.right || [])];

                  return allSubPaths.map((d, sIdx) => (
                    <path
                      key={`${slug}-${pIdx}-${sIdx}`}
                      d={d}
                      onClick={() => handleMuscleClick(slug)}
                      className="transition-all duration-300 cursor-pointer outline-none"
                      fill={isHighlighted ? stimulusLevelObj.color : 'var(--map-neutral-fill, #1a1a22)'}
                      fillOpacity={isHighlighted ? (isSelected ? 1 : 0.88) : 0.85}
                      stroke={isSelected ? 'var(--foreground, #ffffff)' : (isHighlighted ? stimulusLevelObj.color : 'var(--map-neutral-stroke, #3f3f4c)')}
                      strokeWidth={isSelected ? 3 : (isHighlighted ? 2 : 1.5)}
                      strokeLinejoin="round"
                      style={{
                        filter: isHighlighted ? `drop-shadow(0 0 ${isSelected ? 8 : 4}px ${stimulusLevelObj.color})` : 'none',
                        vectorEffect: 'non-scaling-stroke'
                      }}
                    >
                      <title>{`${slug} — ${stimulusLevelObj.label} Stimulus`}</title>
                    </path>
                  ));
                })}
              </g>
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Minimal 5-Level Heatmap Legend ────────────────────────────────── */}
      <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 border-t border-card-border/60 text-[10px] sm:text-xs font-mono font-bold">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-card-border bg-surface-subtle" />
          <span className="text-muted-foreground">None</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-xs shadow-green-500/40" />
          <span className="text-emerald-400">Light</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-xs shadow-yellow-500/40" />
          <span className="text-yellow-400">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-xs shadow-orange-500/40" />
          <span className="text-orange-400">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-xs shadow-red-500/40" />
          <span className="text-red-400">Very High</span>
        </div>
      </div>
    </div>
  );
}
