import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Droplets, Timer, HeartPulse, Bot, Layers, Sparkles, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import Logo from '../Logo';

// Minimalist Cinematic Components
import CinematicNavbar from './CinematicNavbar';
import Cinematic3DCore from './Cinematic3DCore';
import CinematicPhone from './CinematicPhone';
import ScrollDimensionShowcase from './ScrollDimensionShowcase';
import BetaAccessModal from './BetaAccessModal';
import WebFooter from './WebFooter';
import PageTransition from './PageTransition';
import { RevealHeading, FadeUp } from './MotionText';
import ScrollToTopButton from './ScrollToTopButton';
import { AppStoreBadge, GooglePlayBadge, CALYXO_APP_STORE_URL, CALYXO_PLAY_STORE_URL } from './StoreBadges';

// Existing App Modals
import AuthFlow from '../AuthFlow';
import AppDemoVideoModal from '../modals/AppDemoVideoModal';

export default function CinematicExperience() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const featureSteps = [
    {
      title: 'Command Center',
      tag: '01 · TODAY',
      icon: Sparkles,
      headline: 'Your daily health cockpit.',
      desc: 'All vital signals — calories, movement, hydration, and recovery readiness — synchronized into one continuous view.'
    },
    {
      title: 'Nutrition OS',
      tag: '02 · NUTRITION',
      icon: Flame,
      headline: 'Verified macro precision.',
      desc: 'Over 8,000 regional and authentic Indian foods with accurate macro breakdowns, meal timeline grouping, and grocery budget optimization.'
    },
    {
      title: 'Hydration OS',
      tag: '03 · HYDRATION',
      icon: Droplets,
      headline: '3D fluid dynamics.',
      desc: 'Physics-based fluid vessel simulation automatically calculating cellular hydration targets adjusted for daily workout strain.'
    },
    {
      title: 'Live Workout',
      tag: '04 · MOVEMENT',
      icon: Timer,
      headline: 'Live guided telemetry.',
      desc: 'Real-time guided workouts with precision rest countdowns streamed directly to the iOS Dynamic Island and Apple Watch.'
    },
    {
      title: 'Recovery Model',
      tag: '05 · RECOVERY',
      icon: HeartPulse,
      headline: '0–100% Deterministic Vitality.',
      desc: 'A coupled recovery engine balancing sleep deficit and cardiovascular output to give you an objective readiness score every morning.'
    },
    {
      title: 'AI Intelligence',
      tag: '06 · PROACTIVE AI',
      icon: Bot,
      headline: 'A coach that anticipates your day.',
      desc: 'Powered by Gemini AI, delivering proactive morning briefings and volume recalibrations before your workout starts.'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress(scrolled / total);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleNavigateDashboard = () => {
    navigate('/user/dashboard');
  };

  const handleAppStoreRedirect = () => {
    window.open(CALYXO_APP_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageTransition className="bg-[#020203] text-[#F5F5F7] selection:bg-[#CCFF00] selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Top Minimal Scroll Progress Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#CCFF00] z-[60] origin-left opacity-90 transition-all duration-75"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* Floating Fluid Navbar */}
      <CinematicNavbar
        onOpenAuth={openAuth}
        onOpenBetaModal={handleAppStoreRedirect}
        onNavigateDashboard={handleNavigateDashboard}
      />

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO (THE CINEMATIC LAUNCHPAD)
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[95vh] sm:min-h-screen flex flex-col justify-center pt-36 sm:pt-44 pb-20 px-6 sm:px-12 overflow-hidden z-10 max-w-7xl mx-auto">
        
        {/* Clean Ambient Background (Ready for User 3D Asset) */}
        <Cinematic3DCore />

        {/* Ambient Subtle Radial Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle,rgba(204,255,0,0.04)_0%,rgba(2,2,3,0)_70%)] rounded-full pointer-events-none" />

        {/* Hero Content */}
        <div className="max-w-4xl relative z-20 space-y-8 text-left">
          
          {/* Official Calyxo Logo Badge */}
          <FadeUp delay={0.1}>
            <div className="inline-flex items-center gap-3 p-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <Logo className="w-5 h-5 text-white" />
              </div>
              <span className="brand-name text-xs text-white font-black tracking-[0.18em] pr-2">
                CALYXO HEALTH OS
              </span>
            </div>
          </FadeUp>

          {/* Large Hero Title with Staggered Kinetic Word Reveal */}
          <div className="space-y-2">
            <RevealHeading 
              as="h1" 
              delay={0.15}
              className="font-outfit text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight text-white leading-[0.92] uppercase block"
            >
              CALYXO
            </RevealHeading>

            <RevealHeading 
              as="h2" 
              delay={0.25}
              className="font-outfit text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight text-[#8E8E93] leading-[0.95] block"
            >
              Your health. Connected.
            </RevealHeading>
          </div>

          <FadeUp delay={0.4}>
            <p className="text-base sm:text-xl text-[#8E8E93] font-light max-w-xl leading-relaxed">
              A unified operating system for your biology. Precision data meets cinematic clarity.
            </p>
          </FadeUp>

          {/* Action Hub: Official Apple App Store + Google Play Badges */}
          <FadeUp delay={0.5}>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {user ? (
                <button
                  onClick={handleNavigateDashboard}
                  className="px-8 py-4 bg-white hover:bg-gray-200 text-black rounded-xl font-mono font-bold text-xs tracking-wider transition-all cursor-pointer shadow-xl active:scale-95 border-none flex items-center justify-center gap-2"
                >
                  <span>Open Your Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  {/* Official Apple App Store Badge (Black matching screenshot) */}
                  <AppStoreBadge />

                  {/* Official Google Play Badge (Black matching screenshot) */}
                  <GooglePlayBadge />

                  {/* Instant Web App Ghost Button */}
                  <button
                    onClick={() => openAuth('signup')}
                    className="px-6 py-3.5 border border-white/20 rounded-xl text-white font-mono text-xs font-medium hover:bg-white/5 transition-colors cursor-pointer text-center active:scale-95"
                  >
                    Launch Web App
                  </button>
                </>
              )}
            </div>
          </FadeUp>

        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 2: LARGE-SCALE TYPOGRAPHY ("Everything starts with today.")
          ───────────────────────────────────────────────────────────────────────────── */}
      <section id="overview" className="py-32 sm:py-48 px-6 sm:px-12 flex justify-center items-center text-center border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,255,255,0.02)_0%,rgba(2,2,3,0)_70%)] rounded-full pointer-events-none" />
        
        <RevealHeading 
          as="h2"
          className="font-outfit text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold max-w-5xl leading-tight tracking-tighter text-white/90 relative z-10 justify-center text-center"
        >
          Everything starts with today.
        </RevealHeading>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 3: SCROLL-DRIVEN CONTINUOUS DIMENSIONS SHOWCASE (PINNED IPHONE)
          ───────────────────────────────────────────────────────────────────────────── */}
      <ScrollDimensionShowcase />

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 4: PHILOSOPHY ("Understand more. Do less.")
          ───────────────────────────────────────────────────────────────────────────── */}
      <section id="philosophy" className="py-36 sm:py-52 px-6 sm:px-12 text-center border-t border-white/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <FadeUp>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8E8E93]">
              DESIGN PHILOSOPHY
            </span>
          </FadeUp>

          <RevealHeading
            as="h2"
            className="font-outfit text-4xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.02] justify-center text-center"
          >
            Understand more. Do less.
          </RevealHeading>

          <FadeUp delay={0.2}>
            <p className="text-sm sm:text-lg text-[#8E8E93] font-light max-w-xl mx-auto leading-relaxed pt-2">
              The goal of technology is not to keep you trapped in an application. It is to deliver absolute biological clarity, and then get out of your way.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 5: CONNECTED HARDWARE ECOSYSTEM
          ───────────────────────────────────────────────────────────────────────────── */}
      <section id="ecosystem" className="py-32 sm:py-48 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="space-y-16">
          
          <FadeUp className="max-w-3xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#CCFF00] font-bold">
              CONTINUOUS HARDWARE
            </span>
            <h2 className="font-outfit text-3xl sm:text-5xl font-bold tracking-tight text-white">
              From your wrist to your Dynamic Island.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Dynamic Island',
                tag: 'iOS 16.0+ ActivityKit',
                desc: 'Rest timer countdowns and active exercise names update live in the Dynamic Island without opening the app.'
              },
              {
                name: 'Apple Watch',
                tag: 'watchOS Companion',
                desc: 'Continuous heart rate streaming and haptic wrist alerts as your rest period concludes.'
              },
              {
                name: 'Home Widgets',
                tag: 'iOS & Android Widgets',
                desc: 'Live 4-ring health metrics (Calories, Steps, Water, Protein) synchronized to your home screen.'
              },
              {
                name: 'Health Connect',
                tag: 'Bi-directional Bridge',
                desc: 'Native Apple HealthKit and Android Health Connect synchronization for steps, energy, and sleep.'
              }
            ].map((hw, i) => (
              <FadeUp 
                key={i}
                delay={i * 0.1}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#8E8E93]">{hw.tag}</span>
                  <h4 className="font-outfit text-base font-bold text-white">{hw.name}</h4>
                </div>
                <p className="text-xs text-[#8E8E93] font-light leading-relaxed">
                  {hw.desc}
                </p>
              </FadeUp>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 6: EDITORIAL COMPARISON ("One app. Instead of five.")
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="py-32 sm:py-48 px-6 sm:px-12 max-w-5xl mx-auto border-t border-white/10">
        <div className="space-y-16">
          
          <FadeUp className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8E8E93]">
              EDITORIAL PERSPECTIVE
            </span>
            <h2 className="font-outfit text-3xl sm:text-5xl font-bold tracking-tight text-white">
              One app. <br />
              <span className="text-[#8E8E93] font-normal">Instead of five disconnected habits.</span>
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* The Fragmented Reality */}
            <FadeUp delay={0.1} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93]">The Fragmented Reality</span>
                <h3 className="font-outfit text-xl font-bold text-[#8E8E93]">Multiple Single-Purpose Trackers</h3>
              </div>

              <ul className="space-y-3 text-xs text-[#8E8E93] font-light">
                <li className="flex items-start gap-2.5">
                  <span className="text-gray-600 mt-0.5">•</span>
                  <span>Separate nutrition app with isolated calorie databases</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-gray-600 mt-0.5">•</span>
                  <span>Standalone workout logger requiring manual set typing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-gray-600 mt-0.5">•</span>
                  <span>Isolated sleep and recovery tracking with no meal context</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-gray-600 mt-0.5">•</span>
                  <span>$60+/month across four separate subscription tiers</span>
                </li>
              </ul>
            </FadeUp>

            {/* The Calyxo Architecture */}
            <FadeUp delay={0.2} className="p-8 rounded-3xl bg-white/[0.04] border border-[#CCFF00]/40 space-y-6 flex flex-col justify-between shadow-2xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">The Unified Standard</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                </div>
                <h3 className="font-outfit text-xl font-bold text-white">Calyxo Health Operating System</h3>
              </div>

              <ul className="space-y-3 text-xs text-[#F5F5F7] font-light">
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span>8,000+ verified foods coupled directly to daily metabolic strain</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span>Live Dynamic Island rest timers synced to Apple Watch</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span>Deterministic 0–100% recovery score adjusting your workouts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span>One unified platform. Zero subscription fragmentation.</span>
                </li>
              </ul>
            </FadeUp>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION 7: DOWNLOAD HEADQUARTERS & FINAL CTA (APP STORE + GOOGLE PLAY)
          ───────────────────────────────────────────────────────────────────────────── */}
      <section id="download" className="py-36 sm:py-52 px-6 sm:px-12 text-center border-t border-white/10 relative overflow-hidden">
        
        <FadeUp className="max-w-4xl mx-auto space-y-10 relative z-10">
          
          <div className="flex justify-center">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl">
              <Logo className="w-10 h-10 text-white" />
            </div>
          </div>

          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#CCFF00] font-bold">
            DIGITAL HEADQUARTERS
          </span>

          <h2 className="font-outfit text-4xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.02]">
            Ready to make <br />
            <span className="text-[#8E8E93] font-normal">every day clearer?</span>
          </h2>

          <p className="text-sm sm:text-lg text-[#8E8E93] font-light max-w-md mx-auto leading-relaxed">
            Experience Calyxo today on iOS, Android, and Web.
          </p>

          {/* Official App Store & Google Play Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {user ? (
              <button
                onClick={handleNavigateDashboard}
                className="px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-black font-semibold text-xs tracking-wider transition-all cursor-pointer shadow-xl active:scale-95 border-none flex items-center gap-2"
              >
                <span>Open Calyxo Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <AppStoreBadge />
                <GooglePlayBadge />

                <button
                  onClick={() => openAuth('signup')}
                  className="px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-medium text-xs tracking-wider transition-all cursor-pointer border border-white/10 active:scale-95 flex items-center gap-2"
                >
                  <span>Launch Web App</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />
                </button>
              </>
            )}
          </div>

          <div className="pt-8 text-[11px] font-mono text-[#8E8E93] flex flex-wrap items-center justify-center gap-6">
            <span>Encrypted local-first storage</span>
            <span>•</span>
            <span>Zero third-party tracking</span>
            <span>•</span>
            <span className="brand-name tracking-widest text-white">CALYXO v1.0.0</span>
          </div>

        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <WebFooter onOpenBetaModal={handleAppStoreRedirect} />

      {/* ── FLOATING SCROLL TO TOP (GO UP) BUTTON ── */}
      <ScrollToTopButton />

      {/* ── AUTH MODAL ── */}
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

      {/* ── DEMO VIDEO MODAL ── */}
      <AppDemoVideoModal 
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />

      {/* ── OFFICIAL APP STORE DOWNLOAD MODAL ── */}
      <BetaAccessModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        onOpenAuth={openAuth}
      />

    </PageTransition>
  );
}
