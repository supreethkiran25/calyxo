import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Smartphone, Watch, Layers, Radio, Sparkles, Check, Play, Pause, RotateCcw, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import CinematicNavbar from '../../components/website/CinematicNavbar';
import WebFooter from '../../components/website/WebFooter';
import BetaAccessModal from '../../components/website/BetaAccessModal';
import AuthFlow from '../../components/AuthFlow';
import PageTransition from '../../components/website/PageTransition';
import { RevealHeading, FadeUp } from '../../components/website/MotionText';
import ScrollToTopButton from '../../components/website/ScrollToTopButton';
import { AppStoreBadge, GooglePlayBadge, CALYXO_APP_STORE_URL } from '../../components/website/StoreBadges';

export default function EcosystemPage() {
  const navigate = useNavigate();
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

  // Interactive Live Dynamic Island Simulator
  const [simRunning, setSimRunning] = useState(true);
  const [simSeconds, setSimSeconds] = useState(45);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let timer;
    if (simRunning) {
      timer = setInterval(() => {
        setSimSeconds(prev => (prev > 0 ? prev - 1 : 45));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [simRunning]);

  const openAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAppStoreRedirect = () => {
    window.open(CALYXO_APP_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageTransition className="bg-[#020203] text-[#F5F5F7] selection:bg-[#CCFF00] selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Permanent Fixed Header */}
      <CinematicNavbar 
        onOpenAuth={openAuth}
        onOpenBetaModal={handleAppStoreRedirect}
        onNavigateDashboard={() => navigate('/user/dashboard')}
      />

      <main className="pt-36 sm:pt-44 pb-32 px-6 sm:px-12 max-w-7xl mx-auto space-y-36">
        
        {/* ── HERO ── */}
        <section className="text-left space-y-8 max-w-4xl pt-6">
          <FadeUp>
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#CCFF00]" />
              <span>CONTINUOUS HARDWARE ARCHITECTURE</span>
            </div>
          </FadeUp>

          <div className="space-y-2">
            <RevealHeading 
              as="h1"
              delay={0.1}
              className="font-outfit text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] uppercase block"
            >
              Hardware in seamless synchrony.
            </RevealHeading>
          </div>

          <FadeUp delay={0.25}>
            <p className="text-base sm:text-xl text-[#8E8E93] font-light max-w-2xl leading-relaxed">
              From the iOS Dynamic Island and Apple Watch to lock screen widgets and Bluetooth heart rate sensors. Calyxo bridges your biological telemetry into one cohesive stream without battery drain.
            </p>
          </FadeUp>

          <FadeUp delay={0.35}>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <AppStoreBadge />
              <GooglePlayBadge />

              <button
                onClick={() => openAuth('signup')}
                className="px-6 py-3.5 border border-white/20 rounded-xl text-white font-mono text-xs font-medium hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
              >
                Launch Web Companion
              </button>
            </div>
          </FadeUp>
        </section>

        {/* ── LIVE INTERACTIVE DYNAMIC ISLAND SIMULATOR ── */}
        <FadeUp className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 space-y-10 relative overflow-hidden">
          <div className="max-w-3xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#CCFF00] font-bold">
              LIVE SIMULATOR
            </span>
            <h2 className="font-outfit text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Dynamic Island ActivityKit in Real-Time
            </h2>
            <p className="text-sm text-[#8E8E93] leading-relaxed">
              When you train, Calyxo keeps your rest timer countdown, current exercise set, and target heart rate live on your screen header, lock screen, and Apple Watch. Test the interactive preview:
            </p>
          </div>

          {/* Dynamic Island Interactive Capsule */}
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-black border border-white/15 shadow-2xl space-y-8">
            
            {/* The Island Capsule */}
            <motion.div 
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="w-full max-w-md h-14 rounded-full bg-[#0a0a0c] border border-white/20 px-5 flex items-center justify-between shadow-[0_0_40px_rgba(204,255,0,0.1)] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#CCFF00]/15 flex items-center justify-center border border-[#CCFF00]/30">
                  <Logo className="w-3.5 h-3.5 text-[#CCFF00]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-white block leading-none">Barbell Squat</span>
                  <span className="text-[8px] font-mono text-[#8E8E93] leading-none">Set 3 of 4 · 120 kg</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">REST</span>
                <span className="text-lg font-mono font-black text-[#CCFF00] tracking-tight">
                  00:{simSeconds < 10 ? `0${simSeconds}` : simSeconds}
                </span>
              </div>
            </motion.div>

            {/* Simulator Controls */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <button
                onClick={() => setSimRunning(!simRunning)}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all flex items-center gap-2 cursor-pointer border border-white/10 active:scale-95"
              >
                {simRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#CCFF00]" />}
                <span>{simRunning ? 'Pause Simulator' : 'Resume Countdown'}</span>
              </button>

              <button
                onClick={() => setSimSeconds(45)}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer border border-white/10 active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset 45s</span>
              </button>
            </div>

          </div>
        </FadeUp>

        {/* ── 4 COMPONENT HARDWARE GRID ── */}
        <section className="space-y-16 border-t border-white/10 pt-24">
          <FadeUp className="max-w-3xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8E8E93]">
              DEEP INTEGRATION SPECIFICATION
            </span>
            <h2 className="font-outfit text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Engineered for every layer of your device.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1: Dynamic Island & ActivityKit */}
            <FadeUp delay={0.1} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">iOS 16.0+ ActivityKit</span>
                <h3 className="font-outfit text-2xl font-bold text-white">Dynamic Island & Lock Screen</h3>
                <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                  Live rest timer countdowns, exercise set prompts, and heart rate telemetry rendered in native Swift ActivityKit. Updates seamlessly even when the app is in the background or your phone is locked.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>Push Token Frequency</span>
                  <span className="text-white">1 Hz Sub-second</span>
                </div>
                <div className="flex justify-between">
                  <span>Battery Overhead</span>
                  <span className="text-[#CCFF00]">&lt; 0.5% / hour</span>
                </div>
              </div>
            </FadeUp>

            {/* Card 2: Apple Watch Companion */}
            <FadeUp delay={0.2} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <Watch className="w-5 h-5 text-cyan-300" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-300 font-bold">watchOS 9.0+ Companion</span>
                <h3 className="font-outfit text-2xl font-bold text-white">Standalone Wrist Telemetry</h3>
                <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                  Continuous 50Hz optical heart rate sampling, haptic tap alerts right when your rest interval completes, and standalone offline workout logging with WatchConnectivity sync.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>Sensor Polling Rate</span>
                  <span className="text-white">50 Hz Continuous</span>
                </div>
                <div className="flex justify-between">
                  <span>Haptic Engine</span>
                  <span className="text-cyan-300">Waptic Taptic Feedback</span>
                </div>
              </div>
            </FadeUp>

            {/* Card 3: Home Screen Widgets */}
            <FadeUp delay={0.3} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300 font-bold">WidgetKit & Glance</span>
                <h3 className="font-outfit text-2xl font-bold text-white">4-Pillar Health Core Widgets</h3>
                <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                  Small, medium, and large home screen widgets showcasing real-time calorie burn, steps, 3D fluid intake, and morning 0–100% recovery score with StandBy nightstand support.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>Widget Formats</span>
                  <span className="text-white">Small, Medium, Large, Lock</span>
                </div>
                <div className="flex justify-between">
                  <span>StandBy Support</span>
                  <span className="text-amber-300">Nightstand OLED Mode</span>
                </div>
              </div>
            </FadeUp>

            {/* Card 4: HealthKit & Health Connect */}
            <FadeUp delay={0.4} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-purple-300 font-bold">Bi-directional Bridge</span>
                <h3 className="font-outfit text-2xl font-bold text-white">Apple Health & Health Connect</h3>
                <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                  Direct encrypted synchronization with Apple HealthKit and Android Health Connect. Read steps, active calories, sleep stages (REM, Core, Deep), and resting heart rate without battery overhead.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>Privacy Protocol</span>
                  <span className="text-white">Local-First Enclave</span>
                </div>
                <div className="flex justify-between">
                  <span>Cross-Platform Parity</span>
                  <span className="text-purple-300">100% iOS & Android</span>
                </div>
              </div>
            </FadeUp>

          </div>
        </section>

        {/* ── CALL TO ACTION ── */}
        <FadeUp className="py-20 text-center border-t border-white/10 space-y-8">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 shadow-2xl">
              <Logo className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="font-outfit text-4xl sm:text-6xl font-extrabold text-white">
            Experience the complete ecosystem.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <AppStoreBadge />
            <GooglePlayBadge />

            <button
              onClick={() => openAuth('signup')}
              className="px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-medium text-xs tracking-wider transition-all cursor-pointer border border-white/10 active:scale-95 flex items-center gap-2"
            >
              <span>Launch Web App</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />
            </button>
          </div>
        </FadeUp>

      </main>

      {/* Footer */}
      <WebFooter onOpenBetaModal={handleAppStoreRedirect} />

      {/* Floating Go Up Button */}
      <ScrollToTopButton />

      {/* Modals */}
      <BetaAccessModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        onOpenAuth={openAuth}
      />

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0c0c10] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>
              <AuthFlow
                initialMode={authMode}
                onSuccess={() => {
                  setShowAuthModal(false);
                  navigate('/user/dashboard');
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageTransition>
  );
}
