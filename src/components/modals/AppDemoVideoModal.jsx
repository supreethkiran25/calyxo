import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, RotateCcw, Sparkles, Activity, 
  Flame, Droplets, Dumbbell, Utensils, Zap, ChevronRight 
} from 'lucide-react';

const DEMO_SCENES = [
  {
    id: 'health-core',
    title: 'Real-Time Health Hub & 3-Rings',
    duration: 4.5,
    tagline: 'Track calories, hydration & protein in 60fps real-time',
    color: '#10B981',
    renderScene: (progress) => (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 relative gap-3">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
          {/* Ring 1: Calories (Amber) */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="7" fill="none" />
            <circle 
              cx="50" cy="50" r="42" stroke="#F59E0B" strokeWidth="7" fill="none" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(1, progress * 1.1))}
            />
          </svg>
          {/* Ring 2: Hydration (Cyan) */}
          <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="34" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="7" fill="none" />
            <circle 
              cx="50" cy="50" r="34" stroke="#06B6D4" strokeWidth="7" fill="none" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - Math.min(1, progress * 1.3))}
            />
          </svg>
          {/* Ring 3: Protein (Coral) */}
          <svg className="absolute inset-4.5 w-[calc(100%-36px)] h-[calc(100%-36px)] transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="26" stroke="rgba(244, 63, 94, 0.15)" strokeWidth="7" fill="none" />
            <circle 
              cx="50" cy="50" r="26" stroke="#F43F5E" strokeWidth="7" fill="none" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 26}
              strokeDashoffset={2 * Math.PI * 26 * (1 - Math.min(1, progress * 1.2))}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl sm:text-2xl font-black text-white">{Math.round(progress * 1850)}</span>
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">KCAL BURNED</span>
          </div>
        </div>

        {/* Live metrics pill cards */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2 w-full max-w-xs"
        >
          <div className="p-2 rounded-xl bg-black/70 border border-amber-500/30 text-center">
            <div className="flex items-center justify-center gap-1 text-[8px] text-amber-400 font-bold uppercase"><Flame className="w-2.5 h-2.5" /> Cal</div>
            <span className="text-[11px] sm:text-xs font-black text-white">{Math.round(progress * 1850)} / 2200</span>
          </div>
          <div className="p-2 rounded-xl bg-black/70 border border-cyan-500/30 text-center">
            <div className="flex items-center justify-center gap-1 text-[8px] text-cyan-400 font-bold uppercase"><Droplets className="w-2.5 h-2.5" /> Water</div>
            <span className="text-[11px] sm:text-xs font-black text-white">{Math.round(progress * 2500)} ml</span>
          </div>
          <div className="p-2 rounded-xl bg-black/70 border border-rose-500/30 text-center">
            <div className="flex items-center justify-center gap-1 text-[8px] text-rose-400 font-bold uppercase"><Zap className="w-2.5 h-2.5" /> Protein</div>
            <span className="text-[11px] sm:text-xs font-black text-white">{Math.round(progress * 140)}g</span>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    id: 'live-workout',
    title: 'Guided Workout & Dynamic Island',
    duration: 4.5,
    tagline: 'Live rest timers stream directly to your Lock Screen & Apple Watch',
    color: '#00F0FF',
    renderScene: (progress) => {
      const restSecs = Math.max(0, 60 - Math.round(progress * 60));
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 relative space-y-2.5 max-w-xs mx-auto">
          {/* Dynamic Island HUD Mockup */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-black rounded-full border border-white/20 px-3.5 py-1.5 flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Dumbbell className="w-2.5 h-2.5" />
              </div>
              <span className="text-[9px] font-black text-white uppercase tracking-wider">Bench Press • Set 3</span>
            </div>
            <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              REST ACTIVE
            </span>
          </motion.div>

          {/* Active Workout Card */}
          <div className="w-full p-3.5 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-xl space-y-2.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Live Session</span>
                <h4 className="text-xs sm:text-sm font-black text-white">Chest & Triceps Hypertrophy</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">
                SET 3 / 4
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[8px] text-gray-400 uppercase block">Weight</span>
                <span className="text-xs font-black text-white">85 KG</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[8px] text-gray-400 uppercase block">Reps</span>
                <span className="text-xs font-black text-white">10 REPS</span>
              </div>
            </div>

            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      );
    }
  },
  {
    id: 'meal-logger',
    title: '11,000+ Indian & Global Food Database',
    duration: 4.5,
    tagline: 'Log authentic Indian meals or scan dishes in under 3 seconds',
    color: '#F59E0B',
    renderScene: (progress) => (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 relative space-y-2 max-w-xs mx-auto">
        <div className="w-full p-2.5 rounded-xl bg-black/70 border border-white/20 flex items-center gap-2">
          <Utensils className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-white truncate">Paneer Butter Masala (200g)</span>
          <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">380 kcal</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-2.5 rounded-xl bg-black/70 border border-white/20 flex items-center gap-2"
        >
          <Utensils className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-white truncate">2 Tandoori Roti</span>
          <span className="ml-auto text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded shrink-0">240 kcal</span>
        </motion.div>

        <div className="w-full p-3 rounded-2xl bg-black/80 border border-white/15 space-y-2">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-gray-300">Macro Allocation</span>
            <span className="text-emerald-400">On Target</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 rounded-lg bg-white/5">
              <span className="text-[7px] text-gray-400 uppercase block">Protein</span>
              <span className="text-xs font-black text-rose-400">32g</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5">
              <span className="text-[7px] text-gray-400 uppercase block">Carbs</span>
              <span className="text-xs font-black text-cyan-400">48g</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5">
              <span className="text-[7px] text-gray-400 uppercase block">Fats</span>
              <span className="text-xs font-black text-amber-400">22g</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'ai-health-twin',
    title: 'AI Health Twin & Biometric Forecast',
    duration: 4.5,
    tagline: 'Google Gemini intelligence projects your recovery and body composition',
    color: '#8B5CF6',
    renderScene: (progress) => (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 relative space-y-2.5 max-w-xs mx-auto">
        <div className="p-3.5 rounded-2xl bg-black/70 border border-purple-500/30 backdrop-blur-xl w-full text-center space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" /> AI Health Score
            </div>
            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">OPTIMAL</span>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-white">92<span className="text-xs text-gray-400">/100</span></div>

          <div className="grid grid-cols-2 gap-2 text-left pt-0.5">
            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-[7px] text-gray-400 uppercase block">Recovery Index</span>
              <span className="text-xs font-black text-emerald-400">89%</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-[7px] text-gray-400 uppercase block">Fitness Age</span>
              <span className="text-xs font-black text-cyan-400">23 Yrs (-2)</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[9.5px] text-purple-200 text-left leading-tight">
            ⚡ <strong>AI Forecast:</strong> High muscle recovery status. Optimal metabolic window for upper-body conditioning today.
          </div>
        </div>
      </div>
    )
  }
];

export default function AppDemoVideoModal({ isOpen, onClose, onStartTrial }) {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0);
  const totalDuration = DEMO_SCENES.reduce((acc, s) => acc + s.duration, 0);

  const reqRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentSceneIdx(0);
      setSceneProgress(0);
      setIsPlaying(true);
      return;
    }

    let lastTime = performance.now();

    const animate = (now) => {
      if (!isPlaying) {
        lastTime = now;
        reqRef.current = requestAnimationFrame(animate);
        return;
      }

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setSceneProgress((prev) => {
        const sceneDuration = DEMO_SCENES[currentSceneIdx].duration;
        const nextProg = prev + dt / sceneDuration;

        if (nextProg >= 1) {
          if (currentSceneIdx < DEMO_SCENES.length - 1) {
            setCurrentSceneIdx((c) => c + 1);
            return 0;
          } else {
            // Loop back to start
            setCurrentSceneIdx(0);
            return 0;
          }
        }
        return nextProg;
      });

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRef.current);
  }, [isOpen, isPlaying, currentSceneIdx]);

  if (!isOpen) return null;

  const currentScene = DEMO_SCENES[currentSceneIdx];

  // Calculate global playback progress
  const completedDuration = DEMO_SCENES.slice(0, currentSceneIdx).reduce((acc, s) => acc + s.duration, 0);
  const currentTotalSecs = completedDuration + sceneProgress * currentScene.duration;
  const globalProgressPct = (currentTotalSecs / totalDuration) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 pb-safe">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          onClick={onClose}
        />

        {/* Video Player Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0c0d10] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90dvh]"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Calyxo OS • Product Demo</h3>
                <p className="text-[10px] text-gray-400 font-medium">Interactive Feature Showcase</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scene Stage Screen (Video Simulator) */}
          <div className="relative w-full min-h-[310px] sm:min-h-[350px] bg-gradient-to-b from-[#111318] to-black flex flex-col justify-between p-3.5 overflow-hidden">
            {/* Background glowing aura */}
            <div 
              className="absolute w-72 h-72 rounded-full blur-[100px] opacity-25 pointer-events-none transition-all duration-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ backgroundColor: currentScene.color }}
            />

            {/* Top Scene Subtitle Banner (Dedicated space - NO overlapping) */}
            <div className="w-full p-2.5 rounded-2xl bg-black/75 border border-white/15 backdrop-blur-xl relative z-20">
              <span className="text-[9px] font-black uppercase tracking-wider block" style={{ color: currentScene.color }}>
                {currentScene.title}
              </span>
              <p className="text-[10.5px] sm:text-[11px] text-gray-300 font-medium leading-tight mt-0.5">
                {currentScene.tagline}
              </p>
            </div>

            {/* Render Current Animated Scene Visuals */}
            <div className="w-full flex-1 flex items-center justify-center relative z-10 py-1">
              {currentScene.renderScene(sceneProgress)}
            </div>
          </div>

          {/* Continuous Scrubber Timeline Bar */}
          <div className="w-full bg-white/10 h-1.5 relative cursor-pointer">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 transition-all duration-100"
              style={{ width: `${globalProgressPct}%` }}
            />
          </div>

          {/* Bottom Interactive Transport Controls */}
          <div className="p-3.5 sm:p-4 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Playback Transport */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer border border-white/15 transition-all"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={() => {
                  setCurrentSceneIdx(0);
                  setSceneProgress(0);
                  setIsPlaying(true);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer border border-white/15 transition-all"
                aria-label="Restart Demo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Scene Navigation Pills */}
              <div className="flex gap-1.5 ml-2">
                {DEMO_SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setCurrentSceneIdx(idx);
                      setSceneProgress(0);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer border-none ${
                      idx === currentSceneIdx 
                        ? 'bg-emerald-400 w-7' 
                        : idx < currentSceneIdx 
                        ? 'bg-white/50 w-3' 
                        : 'bg-white/20 w-3'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => {
                onClose();
                if (onStartTrial) onStartTrial();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 border-none transition-all"
            >
              <span>Start Free Trial</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
