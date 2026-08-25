import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Flame, Droplets, Dumbbell, HeartPulse, Bot, 
  ArrowRight, Check, Activity, ShieldCheck, Zap, Layers 
} from 'lucide-react';
import CinematicPhone from './CinematicPhone';
import { FadeUp, RevealHeading } from './MotionText';
import ShaderButton from './ShaderButton';

export const DIMENSIONS_DATA = [
  {
    id: 'command',
    stepNumber: '01',
    tag: 'TODAY · COMMAND CENTER',
    title: 'Command Center',
    subtitle: 'All biological signals in one unified cockpit.',
    desc: 'Calories, step cadence, cellular hydration, and neuromuscular recovery readiness — calculated and presented without clicking through nested sub-menus.',
    icon: Sparkles,
    accentColor: '#CCFF00',
    accentBorder: 'border-[#CCFF00]/40',
    accentBg: 'bg-[#CCFF00]/10',
    stats: [
      { label: 'Energy Flux', val: '2,140 kcal' },
      { label: 'Pedometry', val: '9,420 steps' },
      { label: 'Recovery', val: '92% Optimal' }
    ]
  },
  {
    id: 'nutrition',
    stepNumber: '02',
    tag: 'NUTRITION OS · 8,000+ FOODS',
    title: 'Nutrition OS',
    subtitle: 'Precision macronutrient tracking built for real diets.',
    desc: 'Over 8,000 verified authentic and regional Indian foods with accurate protein, carb, and lipid breakdowns, meal timeline grouping, and cost-per-gram optimization.',
    icon: Flame,
    accentColor: '#F59E0B',
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-500/10',
    stats: [
      { label: 'Database', val: '8,000+ Items' },
      { label: 'Macro Precision', val: '1.0g Resolution' },
      { label: 'Regional', val: 'Pan-Indian DB' }
    ]
  },
  {
    id: 'hydration',
    stepNumber: '03',
    tag: 'HYDRATION OS · 3D VESSEL',
    title: 'Hydration OS',
    subtitle: 'Dynamic 3D fluid physics tailored to sweat rate.',
    desc: 'Physics-based liquid vessel simulation that automatically adjusts your cellular hydration targets according to ambient heat and daily workout intensity.',
    icon: Droplets,
    accentColor: '#00F0FF',
    accentBorder: 'border-cyan-400/40',
    accentBg: 'bg-cyan-400/10',
    stats: [
      { label: 'Volume Target', val: '3,000 ml' },
      { label: 'Logged', val: '2,450 ml (82%)' },
      { label: 'Physics', val: '3D Mesh Vessel' }
    ]
  },
  {
    id: 'workout',
    stepNumber: '04',
    tag: 'LIVE WORKOUT · DYNAMIC ISLAND',
    title: 'Live Workout',
    subtitle: 'Rest countdowns streamed live to your Dynamic Island.',
    desc: 'Real-time guided strength training with precision rest countdowns, automatic set increments, and haptic wrist alerts delivered directly to watchOS.',
    icon: Dumbbell,
    accentColor: '#10B981',
    accentBorder: 'border-emerald-400/40',
    accentBg: 'bg-emerald-400/10',
    stats: [
      { label: 'Rest Timer', val: '00:45 Live' },
      { label: 'Island Sync', val: 'ActivityKit' },
      { label: 'Haptics', val: 'watchOS Taptic' }
    ]
  },
  {
    id: 'recovery',
    stepNumber: '05',
    tag: 'RECOVERY MODEL · VITALITY SCORE',
    title: 'Recovery Model',
    subtitle: 'Mathematical balance of sleep deficit and training volume.',
    desc: 'A coupled recovery engine balancing sleep duration, resting heart rate, and cardiovascular output to deliver an objective daily readiness score every morning.',
    icon: HeartPulse,
    accentColor: '#8B5CF6',
    accentBorder: 'border-purple-400/40',
    accentBg: 'bg-purple-400/10',
    stats: [
      { label: 'Vitality', val: '92% Score' },
      { label: 'Sleep Balance', val: '7h 45m Rest' },
      { label: 'Resting HR', val: '58 bpm' }
    ]
  },
  {
    id: 'coach',
    stepNumber: '06',
    tag: 'AI INTELLIGENCE · PROACTIVE BRIEFING',
    title: 'AI Intelligence',
    subtitle: 'Powered by Gemini AI for contextual athletic briefings.',
    desc: 'Proactive morning briefings, volume recalibrations, and intelligent nutrition recommendations delivered before your training session begins.',
    icon: Bot,
    accentColor: '#D946EF',
    accentBorder: 'border-fuchsia-400/40',
    accentBg: 'bg-fuchsia-400/10',
    stats: [
      { label: 'Engine', val: 'Gemini AI' },
      { label: 'Mode', val: 'Proactive Coach' },
      { label: 'Latency', val: '< 600ms' }
    ]
  }
];

export default function ScrollDimensionShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const cardRefs = useRef([]);

  // Hardware-accelerated continuous distance calculation on scroll
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const viewportCenter = window.innerHeight * 0.45;
          let closestIdx = 0;
          let minDistance = Infinity;

          cardRefs.current.forEach((el, idx) => {
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const cardCenter = rect.top + rect.height * 0.5;
            const distance = Math.abs(cardCenter - viewportCenter);

            if (distance < minDistance) {
              minDistance = distance;
              closestIdx = idx;
            }
          });

          setActiveStep(closestIdx);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    handleScroll(); // Initial run

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  const scrollToStep = (idx) => {
    setActiveStep(idx);
    const target = cardRefs.current[idx];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const currentDimension = DIMENSIONS_DATA[activeStep] || DIMENSIONS_DATA[0];

  return (
    <section id="showcase" className="relative py-24 sm:py-36 px-6 sm:px-12 max-w-[1400px] mx-auto border-t border-white/10">
      
      {/* Section Header */}
      <div className="max-w-3xl mb-16 sm:mb-24 space-y-4">
        <FadeUp>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">
            <Layers className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>SCROLL-DRIVEN ARCHITECTURE</span>
          </div>
        </FadeUp>

        <RevealHeading
          as="h2"
          className="font-outfit text-4xl sm:text-6xl font-black tracking-tight text-white leading-[0.95] uppercase"
        >
          One interface. <br />
          <span className="text-[#8E8E93] font-light">Six continuous dimensions.</span>
        </RevealHeading>

        <FadeUp delay={0.15}>
          <p className="text-sm sm:text-base text-[#8E8E93] max-w-2xl leading-relaxed font-light">
            Scroll down to watch Calyxo transition seamlessly through all six biological dimensions — or tap any card to jump directly.
          </p>
        </FadeUp>
      </div>

      {/* Main 2-Column Grid with Sticky Phone on Left & Tall Scroll Stories on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start relative">
        
        {/* LEFT: Pinned / Sticky Phone Container */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] flex flex-col items-center justify-center relative py-4">
          
          {/* Dynamic Ambient Background Glow that morphs with active dimension */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[460px] h-[380px] sm:h-[460px] rounded-full blur-[140px] opacity-25 transition-colors duration-500 pointer-events-none"
            style={{ backgroundColor: currentDimension.accentColor }}
          />

          {/* Active Step Pill Indicator */}
          <div className="mb-3 flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/75 border border-white/15 backdrop-blur-xl z-20 shadow-lg">
            <span className="text-xs font-mono font-bold" style={{ color: currentDimension.accentColor }}>
              {currentDimension.stepNumber} / 06
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-xs font-mono font-medium text-white tracking-wide">
              {currentDimension.title}
            </span>
          </div>

          {/* iPhone Mockup with Real Animated UI */}
          <CinematicPhone currentStep={activeStep} />

          {/* Quick Progress Bar Under Phone */}
          <div className="mt-3 flex items-center gap-1.5 z-20">
            {DIMENSIONS_DATA.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToStep(idx)}
                aria-label={`Jump to dimension ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none p-0 ${
                  activeStep === idx 
                    ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

        </div>

        {/* RIGHT: Scrollable Sequence of 6 Dimension Cards */}
        <div className="lg:col-span-6 flex flex-col space-y-24 sm:space-y-36 pb-32">
          
          {DIMENSIONS_DATA.map((dim, idx) => {
            const isActive = activeStep === idx;
            const Icon = dim.icon;

            return (
              <div
                key={dim.id}
                ref={(el) => (cardRefs.current[idx] = el)}
                onClick={() => scrollToStep(idx)}
                className={`min-h-[50vh] sm:min-h-[60vh] flex flex-col justify-center p-6 sm:p-10 rounded-3xl transition-all duration-500 cursor-pointer ${
                  isActive 
                    ? 'bg-white/[0.05] border border-white/20 shadow-2xl scale-[1.02] opacity-100' 
                    : 'bg-transparent border border-white/5 opacity-35 hover:opacity-75 scale-100'
                }`}
              >
                {/* Step Badge & Icon */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${
                        isActive ? `${dim.accentBg} ${dim.accentBorder}` : 'bg-white/[0.02] border-white/10'
                      }`}
                    >
                      <Icon 
                        className="w-5 h-5 transition-colors" 
                        style={{ color: isActive ? dim.accentColor : '#8E8E93' }} 
                      />
                    </div>
                    <span 
                      className="text-xs font-mono font-bold tracking-widest uppercase"
                      style={{ color: isActive ? dim.accentColor : '#8E8E93' }}
                    >
                      {dim.tag}
                    </span>
                  </div>

                  <span className="text-2xl font-black font-mono text-white/20">
                    {dim.stepNumber}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-outfit text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
                  {dim.title}
                </h3>
                
                <h4 className="text-base text-gray-300 font-medium mb-4 font-sans leading-snug">
                  {dim.subtitle}
                </h4>

                <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed font-light mb-8 max-w-lg">
                  {dim.desc}
                </p>

                {/* Telemetry Stats Pills */}
                <div className="grid grid-cols-3 gap-2.5 pt-6 border-t border-white/10 font-mono">
                  {dim.stats.map((stat, sIdx) => (
                    <div key={sIdx} className="p-3 rounded-2xl bg-black/50 border border-white/10 text-center">
                      <span className="text-[9px] text-[#8E8E93] block font-medium mb-0.5">{stat.label}</span>
                      <span className="text-xs font-black text-white">{stat.val}</span>
                    </div>
                  ))}
                </div>

                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="active-scroll-bar"
                    className="h-1 w-full rounded-full mt-6"
                    style={{ backgroundColor: dim.accentColor }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
