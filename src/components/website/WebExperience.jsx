import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Download, Shield, Activity, Dumbbell, Flame, Droplets, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

// Website Components
import WebNavbar from './WebNavbar';
import Hero3DCanvas from './Hero3DCanvas';
import ProductExplanationSection from './ProductExplanationSection';
import FeaturePillarsShowcase from './FeaturePillarsShowcase';
import InteractiveAppShowcase from './InteractiveAppShowcase';
import EcosystemMatrixSection from './EcosystemMatrixSection';
import WhyCalyxoComparison from './WhyCalyxoComparison';
import TechCraftSection from './TechCraftSection';
import DownloadHeadquarters from './DownloadHeadquarters';
import WebFooter from './WebFooter';
import BetaAccessModal from './BetaAccessModal';

// Modals from existing app
import AuthFlow from '../AuthFlow';
import AppDemoVideoModal from '../modals/AppDemoVideoModal';

// Optional WebGL Shader Background
const ColorBends = React.lazy(() => import('../ColorBends'));

export default function WebExperience() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'login' | 'signup'
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((scrolled / totalHeight) * 100);
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

  return (
    <div 
      data-theme="dark"
      style={{ backgroundColor: '#020204', colorScheme: 'dark' }}
      className="min-h-screen bg-[#020204] text-white selection:bg-emerald-500 selection:text-black font-sans relative overflow-x-hidden w-full max-w-full"
    >
      {/* Top Scroll Progress Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#00F0FF] via-[#34D399] to-[#10B981] z-[60] origin-left transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Subtle ColorBends WebGL Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-30">
        <Suspense fallback={null}>
          <ColorBends
            colors={["#10B981", "#00F0FF", "#3B82F6", "#059669"]}
            rotation={87}
            speed={0.25}
            scale={1.2}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0.5}
            noise={0.06}
            parallax={0.3}
            iterations={1}
            intensity={1.2}
            bandWidth={6}
            transparent={true}
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* ── Navigation ── */}
      <WebNavbar
        onOpenAuth={openAuth}
        onOpenBetaModal={() => setShowBetaModal(true)}
        onNavigateDashboard={handleNavigateDashboard}
      />

      {/* ── HERO EXPERIENCE ── */}
      <section className="relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-16 px-4 sm:px-6 overflow-hidden z-10">
        
        {/* Interactive 3D Canvas in Hero Background */}
        <Hero3DCanvas />

        {/* Hero Content Overlay */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20 pointer-events-none">
          
          {/* Headline & CTAs (Pointer Events Active) */}
          <div className="lg:col-span-7 space-y-6 text-left pointer-events-auto">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-emerald-400 text-xs font-mono font-bold tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>THE IMMERSIVE HEALTH OPERATING SYSTEM</span>
            </div>

            {/* Massive Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[1.02] drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
              CALYXO <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-[#00F0FF] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,240,255,0.35)]">
                Your health. Connected.
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-gray-300 font-medium leading-relaxed max-w-xl drop-shadow-md">
              A unified operating system merging precision nutrition calculations, structured live workouts, 3D fluid hydration, deterministic recovery biometrics, and proactive AI coaching.
            </p>

            {/* Action Buttons (Button-in-Button architecture) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {user ? (
                <button
                  onClick={handleNavigateDashboard}
                  className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-emerald-500/30 active:scale-95 transition-all border-none"
                >
                  <span>Open Your Dashboard</span>
                  <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-current" />
                  </div>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => openAuth('signup')}
                    className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer shadow-2xl shadow-emerald-500/40 active:scale-95 transition-all border-none group"
                  >
                    <span>Launch Web App</span>
                    <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5 text-current" />
                    </div>
                  </button>

                  <button
                    onClick={() => setShowBetaModal(true)}
                    className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-2xl border border-white/20 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download App</span>
                  </button>

                  <button
                    onClick={() => setShowDemoModal(true)}
                    className="px-5 py-4 rounded-2xl bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer border border-white/10 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                    <span>Demo</span>
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Right Floating Live Telemetry Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-w-md mx-auto lg:max-w-none w-full pointer-events-auto">
            
            {/* Card 1: AI Coach Live Briefing */}
            <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center justify-between hover:border-emerald-500/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider block">PROACTIVE AI</span>
                  <span className="text-xs sm:text-sm font-black text-white">Daily Morning Briefing</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {/* Card 2: 4-Ring Health Biometrics */}
            <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-2.5 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span className="font-bold text-white uppercase">HEALTH CORE METRICS</span>
                <span className="text-emerald-400 font-bold">98% SYNC</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[8px] text-amber-400 block font-bold">KCAL</span>
                  <span className="text-xs font-black text-white">2,140</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[8px] text-emerald-400 block font-bold">STEPS</span>
                  <span className="text-xs font-black text-white">9.4k</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[8px] text-cyan-400 block font-bold">WATER</span>
                  <span className="text-xs font-black text-white">2.4L</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[8px] text-red-400 block font-bold">RECOVERY</span>
                  <span className="text-xs font-black text-white">92%</span>
                </div>
              </div>
            </div>

            {/* Card 3: Dynamic Island & Wearables */}
            <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center justify-between hover:border-amber-500/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">HARDWARE MATRIX</span>
                  <span className="text-xs sm:text-sm font-black text-white">Apple Watch & Dynamic Island</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400">iOS 16+</span>
            </div>

          </div>

        </div>

      </section>

      {/* ── SECTION 01: WHAT IS CALYXO? (20-Second Clarity) ── */}
      <ProductExplanationSection />

      {/* ── SECTION 02: CORE CAPABILITIES (Bento Deep Dives) ── */}
      <FeaturePillarsShowcase 
        onOpenAuth={openAuth}
        onOpenBetaModal={() => setShowBetaModal(true)}
      />

      {/* ── SECTION 03: INTERACTIVE APP SHOWCASE (3D Phone Tour) ── */}
      <InteractiveAppShowcase 
        onOpenAuth={openAuth}
      />

      {/* ── SECTION 04: CONNECTED HARDWARE ECOSYSTEM ── */}
      <EcosystemMatrixSection />

      {/* ── SECTION 05: WHY CALYXO VS FRAGMENTED APPS ── */}
      <WhyCalyxoComparison 
        onOpenAuth={openAuth}
      />

      {/* ── SECTION 06: TECHNICAL CRAFT & ARCHITECTURE ── */}
      <TechCraftSection />

      {/* ── SECTION 07: DIGITAL HEADQUARTERS & DOWNLOAD ── */}
      <DownloadHeadquarters 
        onOpenAuth={openAuth}
        onOpenBetaModal={() => setShowBetaModal(true)}
        onNavigateDashboard={handleNavigateDashboard}
        user={user}
      />

      {/* ── FOOTER ── */}
      <WebFooter 
        onOpenBetaModal={() => setShowBetaModal(true)}
      />

      {/* ── AUTH MODAL ── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#0a0a0e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
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

      {/* ── BETA ACCESS & DOWNLOAD MODAL ── */}
      <BetaAccessModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        onOpenAuth={openAuth}
      />

    </div>
  );
}
