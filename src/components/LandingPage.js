
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Shield, Zap, Heart, Bot, ArrowRight, X, Play, Cpu, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import AuthFlow from './AuthFlow';
import BorderGlow from './BorderGlow';
import AppDemoVideoModal from './modals/AppDemoVideoModal';
import { useStore } from '../store/useStore';
const ColorBends = React.lazy(() => import('./ColorBends'));

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  // Scroll Sync states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollRotation, setScrollRotation] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const goToDashboard = () => {
    navigate('/user/dashboard');
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Scroll Event Listeners for Scroll Sync features
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // 1. Scroll Progress percentage
      if (totalHeight > 0) {
        setScrollProgress((scrolled / totalHeight) * 100);
      }
      
      // 2. Interactive scroll-linked rotation multiplier
      setScrollRotation(scrolled * 0.25);

      // 3. Transparent to Solid Glass Navbar on Scroll
      setIsScrolled(scrolled > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on load to initialize positions
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div 
      data-theme="dark"
      style={{ backgroundColor: '#030303', colorScheme: 'dark' }}
      className="min-h-screen bg-[#030303] text-[#f3f4f6] dark-immersion relative overflow-x-hidden w-full max-w-full selection:bg-[#10B981] selection:text-white font-sans pt-[calc(4.5rem+env(safe-area-inset-top,0px))]"
    >
      
      {/* ── Scroll Progress Indicator Bar (Scroll Sync) ── */}
      <div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00F0FF] via-[#34D399] to-[#10B981] z-[60] origin-left transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ── Fixed Full-Page Interactive ColorBends WebGL Background ── */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <React.Suspense fallback={null}>
          <ColorBends
            colors={["#10B981", "#00F0FF", "#3B82F6", "#059669"]}
            rotation={87}
            speed={0.35}
            scale={1.15}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            noise={0.08}
            parallax={0.5}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
            transparent={true}
            className="w-full h-full opacity-100"
          />
        </React.Suspense>
      </div>

      {/* Seamless Floating Navbar with Zero-Border Blend & Safe Area Status Bar Support */}
      <header 
        style={{
          backgroundColor: isScrolled ? 'rgba(3, 3, 3, 0.92)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',
          color: '#ffffff'
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] dark-immersion-header ${
          isScrolled 
            ? 'border-b border-white/10 shadow-2xl pb-2.5 sm:pb-3' 
            : 'border-b-0 border-transparent pb-3 sm:pb-4 bg-gradient-to-b from-black/40 via-transparent to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Logo className="w-6 h-6 sm:w-8 sm:h-8 text-[#00F0FF]" glow={true} />
            <span 
              style={{ color: '#ffffff' }}
              className="brand-name text-sm sm:text-lg text-white force-white tracking-wider leading-none font-black"
            >
              CALYXO
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <button 
                onClick={goToDashboard}
                aria-label="Go to Dashboard"
                className="px-3.5 sm:px-5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer border border-emerald-500/40 hover:border-emerald-400/70 backdrop-blur-xl flex items-center gap-1.5 whitespace-nowrap shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_24px_rgba(16,185,129,0.4)] active:scale-95"
              >
                <span className="font-black text-emerald-400">Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => openAuth('login')}
                  aria-label="Login to Calyxo"
                  style={{ color: '#ffffff' }}
                  className="hidden sm:inline-flex text-xs font-black uppercase tracking-wider text-white force-white hover:text-white transition-all cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 hover:border-white/30 shadow-sm whitespace-nowrap"
                >
                  Login
                </button>
                <button 
                  onClick={() => openAuth('signup')}
                  aria-label="Get Started with Calyxo"
                  className="px-4 sm:px-6 py-2 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-300 hover:text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all duration-300 cursor-pointer whitespace-nowrap border border-emerald-500/50 backdrop-blur-xl"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Full Hero Section */}
      <section className="relative w-full overflow-hidden border-b border-white/10 min-h-[90vh] sm:min-h-screen flex items-center justify-center">

        {/* Hero Content Grid (On top of background & dark gradient layers) */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Action Buttons */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-4 sm:space-y-6 text-left"
          >
            <motion.h1 
              variants={itemVariants}
              style={{ color: '#ffffff' }}
              className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white force-white leading-[1.05] drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
            >
              <span className="text-white force-white" style={{ color: '#ffffff' }}>ENGINEERED FOR</span> <br />
              <span className="bg-gradient-to-r from-[#00F0FF] via-[#34D399] to-[#10B981] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.4)]">
                MAX PERFORMANCE
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              style={{ color: '#d1d5db' }}
              className="text-xs sm:text-base lg:text-lg text-[#D1D5DB] max-w-xl font-medium leading-relaxed drop-shadow-md"
            >
              Calyxo is an immersive health operating system merging automated biometrics, real-time nutrition calculations, structured workouts, and proactive AI coaching.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-start items-center gap-3.5 sm:gap-5 pt-3 w-full"
            >
              {/* Vibrant Primary CTA Button */}
              <button 
                onClick={() => openAuth('signup')}
                aria-label="Start Free Trial"
                className="w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black text-xs font-black uppercase tracking-widest border-none shadow-[0_8px_32px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_44px_rgba(16,185,129,0.7)] flex items-center justify-center gap-2.5 group cursor-pointer transition-all duration-300 relative overflow-hidden"
              >
                <span className="font-black text-black">Start Free Trial</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Glassmorphic Secondary Button */}
              <button 
                onClick={() => setShowDemoModal(true)}
                aria-label="Watch Demo"
                style={{ color: '#ffffff' }}
                className="w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] backdrop-blur-2xl text-white force-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 border border-white/25 hover:border-white/50 shadow-[0_8px_32px_rgba(255,255,255,0.08)] hover:shadow-[0_12px_36px_rgba(255,255,255,0.18)] relative overflow-hidden group"
              >
                <Play className="w-4 h-4 text-white fill-white/30 group-hover:scale-110 transition-transform" />
                <span className="font-black text-white force-white" style={{ color: '#ffffff' }}>Watch Demo</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column: Floating Sleek HUD Cards Floating over the Photo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-2.5 sm:gap-3.5 relative justify-center w-full max-w-md mx-auto lg:max-w-none"
          >
            {/* Card 1: AI Coach Status */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-black/75 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-between"
            >
              <div>
                <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-wider block" style={{ color: '#9ca3af' }}>AI Coach Status</span>
                <span className="text-xs sm:text-sm font-black text-white force-white flex items-center gap-1.5 sm:gap-2" style={{ color: '#ffffff' }}>
                  ACTIVE BRIEFING <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                </span>
              </div>
              <span className="text-[9px] sm:text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/15 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#00F0FF]/30 shrink-0">98% SYNC</span>
            </motion.div>

            {/* Card 2: Biometric Performance Core */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-black/75 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-between"
            >
              <div>
                <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-wider block" style={{ color: '#9ca3af' }}>Readiness Score</span>
                <span className="text-xs sm:text-sm font-black text-white force-white" style={{ color: '#ffffff' }}>94% OPTIMAL RECOVERY</span>
              </div>
              <span className="text-[9px] sm:text-xs font-bold text-[#10B981] bg-[#10B981]/15 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#10B981]/30 shrink-0">PEAK STATE</span>
            </motion.div>

            {/* Card 3: Gamified Compliance */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-black/75 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-between"
            >
              <div>
                <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-wider block" style={{ color: '#9ca3af' }}>Compliance Streak</span>
                <span className="text-xs sm:text-sm font-black text-white force-white" style={{ color: '#ffffff' }}>12 DAYS ACTIVE</span>
              </div>
              <span className="text-[9px] sm:text-xs font-bold text-purple-300 bg-purple-500/15 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-purple-500/30 shrink-0">+1,450 XP</span>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Trust & Highlights Section (Scroll Sync Trigger) */}
      <section className="max-w-6xl mx-auto px-6 py-8 border-y border-white/5 text-center bg-[#050508]/40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-2xl font-black text-white block">100%</span>
            <span className="text-[10px] text-[#B9B9C7] font-bold uppercase tracking-wider">Local Privacy</span>
          </div>
          <div>
            <span className="text-2xl font-black text-white block">30ms</span>
            <span className="text-[10px] text-[#B9B9C7] font-bold uppercase tracking-wider">API Response</span>
          </div>
          <div>
            <span className="text-2xl font-black text-white block">24/7</span>
            <span className="text-[10px] text-[#B9B9C7] font-bold uppercase tracking-wider">AI Coaching Support</span>
          </div>
          <div>
            <span className="text-2xl font-black text-white block">Zero</span>
            <span className="text-[10px] text-[#B9B9C7] font-bold uppercase tracking-wider">Data Sharing</span>
          </div>
        </div>
      </section>

      {/* Features Storytelling Grid */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[10px] font-black tracking-widest text-[#10B981] uppercase px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 inline-block">SECURE ECOSYSTEM</span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-white">HEALTH OPERATING SYSTEM</h2>
          <p className="text-xs sm:text-sm text-[#B9B9C7] max-w-xl mx-auto font-medium">A unified, highly responsive workspace designed to engineer your nutrition, training, and recovery.</p>
        </div>

        {/* Scroll Sync triggers: once: false ensures items animate out/in on scroll */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Bot className="w-5 h-5 text-[#00F0FF]" />,
              title: "PROACTIVE AI COACH",
              desc: "Get personalized daily briefings, workout plans, and nutrition scorecards calibrated to your biometrics.",
              glowColor: "180 100 50",
              colors: ['#10B981', '#00F0FF', '#3B82F6']
            },
            {
              icon: <Cpu className="w-5 h-5 text-[#10B981]" />,
              title: "IMMERSIVE HEALTH CORE",
              desc: "Interactive 3D-like rendering dynamically maps steps, hydration, macros, and sleep trends.",
              glowColor: "160 100 50",
              colors: ['#34D399', '#10B981', '#059669']
            },
            {
              icon: <Zap className="w-5 h-5 text-[#38BDF8]" />,
              title: "GAMIFIED ENGINE",
              desc: "Earn compliance XP, unlock healthy milestones, and track streaks with automated logging checks.",
              glowColor: "200 100 50",
              colors: ['#38BDF8', '#818CF8', '#C084FC']
            },
            {
              icon: <Heart className="w-5 h-5 text-red-500" />,
              title: "INTEGRATED HEALTH HUB",
              desc: "Calculate Readiness, Recovery, and composite Health Scores based on sleep metrics and heart rate.",
              glowColor: "350 100 50",
              colors: ['#F43F5E', '#FB7185', '#E11D48']
            },
            {
              icon: <Shield className="w-5 h-5 text-[#00F0FF]" />,
              title: "TRAINER RBAC SYSTEM",
              desc: "Switch roles to access client tracking dashboards, assign customized workouts, and monitor dietary targets.",
              glowColor: "190 100 50",
              colors: ['#00F0FF', '#0284C7', '#38BDF8']
            },
            {
              icon: <Sparkles className="w-5 h-5 text-violet-400" />,
              title: "FOOD & WORKOUT ANALYTICS",
              desc: "Track personal records (PRs), volume progressions, body weight forecasts, and save recipe templates.",
              glowColor: "270 100 50",
              colors: ['#C084FC', '#A855F7', '#E879F9']
            }
          ].map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <BorderGlow
                backgroundColor="#09090D"
                borderRadius={20}
                edgeSensitivity={30}
                glowRadius={35}
                glowIntensity={1.2}
                coneSpread={25}
                glowColor={feat.glowColor}
                colors={feat.colors}
                className="h-full"
              >
                <div className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-6 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:border-white/20 transition-colors">
                    {feat.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center justify-between">
                      <span>{feat.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#B9B9C7] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-[#B9B9C7] font-medium leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center max-w-6xl mx-auto px-6">
        <p className="text-[9px] text-[#B9B9C7] font-bold tracking-widest uppercase">© 2026 CALYXO HEALTH OS. ALL RIGHTS RESERVED. ACCESSIBILITY COMPLIANT.</p>
      </footer>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-[#B9B9C7] hover:text-white z-50 p-2 cursor-pointer border-none bg-transparent"
                aria-label="Close Authentication Form"
              >
                <X className="w-5 h-5" />
              </button>

              <AuthFlow isInitialSignUp={authMode === 'signup'} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Demo Video Walkthrough Modal */}
      <AppDemoVideoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
        onStartTrial={() => openAuth('signup')} 
      />

    </div>
  );
}
