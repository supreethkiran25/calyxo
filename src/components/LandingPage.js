"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Shield, Zap, Heart, Bot, ArrowRight, X, Play, Cpu, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import AuthFlow from './AuthFlow';
import { useStore } from '../store/useStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  // Scroll Sync states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollRotation, setScrollRotation] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const goToDashboard = () => {
    if (userProfile?.role === 'trainer') {
      navigate('/trainer/dashboard');
    } else {
      navigate('/user/dashboard');
    }
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
    <div className="min-h-screen bg-[#030303] text-[#f3f4f6] relative overflow-y-auto selection:bg-[#10B981] selection:text-white font-sans pt-16">
      
      {/* ── Scroll Progress Indicator Bar (Scroll Sync) ── */}
      <div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00F0FF] via-[#34D399] to-[#10B981] z-50 origin-left transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Background glowing gradients (Argus style) */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-[#10B981]/15 to-[#00F0FF]/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-[5%] w-[500px] h-[500px] bg-gradient-to-bl from-violet-600/10 to-transparent rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-[10%] w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Fixed Transparent to Glass Navbar on Scroll */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 ${
          isScrolled 
            ? 'bg-[#030303]/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3' 
            : 'bg-transparent border-b border-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Logo className="w-7 h-7 sm:w-8 sm:h-8 text-[#00F0FF]" glow={true} />
            <span className="brand-name text-base sm:text-lg text-white bg-gradient-to-r from-white to-[#B9B9C7] bg-clip-text text-transparent">calyxo</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-4">
            {user && (
              <button 
                onClick={goToDashboard}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border border-white/10 flex items-center gap-1 sm:gap-2 whitespace-nowrap"
              >
                <span className="hidden xs:inline sm:inline">Go to</span> Dashboard
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
            <button 
              onClick={() => openAuth('login')}
              className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#B9B9C7] hover:text-white transition-colors cursor-pointer px-1.5 py-1.5 whitespace-nowrap"
            >
              Login
            </button>
            <button 
              onClick={() => openAuth('signup')}
              className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-lg hover:shadow-[#10B981]/25 transition-all duration-300 cursor-pointer border-none whitespace-nowrap shrink-0"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Full Hero Section with Background Photo & Heavy Black Layered Gradients */}
      <section className="relative w-full overflow-hidden border-b border-white/10 min-h-screen flex items-center justify-center">
        {/* Full-width Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero section.png" 
            alt="Calyxo AI Health Operating System Hero Background" 
            className="w-full h-full object-cover object-[70%_center] sm:object-center opacity-85 brightness-105 saturate-[1.15]"
          />
          {/* Subtle Dark Layered Gradients for high image visibility */}
          {/* 1. Light Bottom Fade to section transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent z-10 pointer-events-none"></div>
          {/* 2. Soft Left Vignette for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/90 via-[#030303]/60 sm:via-[#030303]/40 to-transparent z-10 pointer-events-none"></div>
          {/* 3. Header Blend */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#030303]/90 to-transparent z-10 pointer-events-none"></div>
          {/* 4. Ambient Glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-[#10B981]/15 via-[#00F0FF]/10 to-transparent rounded-full blur-[100px] z-10 pointer-events-none"></div>
        </div>

        {/* Hero Content Grid (On top of background & dark gradient layers) */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Action Buttons */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-4 sm:space-y-6 text-left"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 backdrop-blur-md text-[#00F0FF] text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              AI-POWERED HEALTH OPERATING SYSTEM
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.05] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            >
              ENGINEERED FOR <br />
              <span className="bg-gradient-to-r from-[#00F0FF] via-[#34D399] to-[#10B981] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.4)]">
                MAX PERFORMANCE
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xs sm:text-base lg:text-lg text-[#D1D5DB] max-w-xl font-medium leading-relaxed drop-shadow-md"
            >
              Calyxo is an immersive health operating system merging automated biometrics, real-time nutrition calculations, structured workouts, and proactive AI coaching.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-start items-center gap-3 sm:gap-4 pt-2 w-full"
            >
              <button 
                onClick={() => openAuth('signup')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[#10B981]/60 flex items-center justify-center gap-2 group cursor-pointer transition-all duration-300 border-none"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => openAuth('login')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors border border-white/20 shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#00F0FF]" />
                Watch Demo
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
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider block">AI Coach Status</span>
                  <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 sm:gap-2">
                    ACTIVE BRIEFING <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  </span>
                </div>
              </div>
              <span className="text-[9px] sm:text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#00F0FF]/20 shrink-0">98% SYNC</span>
            </motion.div>

            {/* Card 2: Biometric Performance Core */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider block">Readiness Score</span>
                  <span className="text-xs sm:text-sm font-black text-white">94% OPTIMAL RECOVERY</span>
                </div>
              </div>
              <span className="text-[9px] sm:text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#10B981]/20 shrink-0">PEAK STATE</span>
            </motion.div>

            {/* Card 3: Gamified Compliance */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider block">Compliance Streak</span>
                  <span className="text-xs sm:text-sm font-black text-white">12 DAYS ACTIVE 🔥</span>
                </div>
              </div>
              <span className="text-[9px] sm:text-xs font-bold text-purple-300 bg-purple-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-purple-500/20 shrink-0">+1,450 XP</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Bot className="w-6 h-6 text-[#00F0FF]" />,
              title: "PROACTIVE AI COACH",
              desc: "Get personalized daily briefings, workout plans, and nutrition scorecards calibrated to your biometrics."
            },
            {
              icon: <Cpu className="w-6 h-6 text-[#10B981]" />,
              title: "IMMERSIVE HEALTH CORE",
              desc: "Interactive 3D-like rendering dynamically maps steps, hydration, macros, and sleep trends."
            },
            {
              icon: <Zap className="w-6 h-6 text-[#38BDF8]" />,
              title: "GAMIFIED ENGINE",
              desc: "Earn compliance XP, unlock healthy milestones, and track streaks with automated logging checks."
            },
            {
              icon: <Heart className="w-6 h-6 text-red-500" />,
              title: "INTEGRATED HEALTH HUB",
              desc: "Calculate Readiness, Recovery, and composite Health Scores based on sleep metrics and heart rate."
            },
            {
              icon: <Shield className="w-6 h-6 text-[#00F0FF]" />,
              title: "TRAINER RBAC SYSTEM",
              desc: "Switch roles to access client tracking dashboards, assign customized workouts, and monitor dietary targets."
            },
            {
              icon: <Sparkles className="w-6 h-6 text-violet-500" />,
              title: "FOOD & WORKOUT ANALYTICS",
              desc: "Track personal records (PRs), volume progressions, body weight forecasts, and save recipe templates."
            }
          ].map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ delay: idx * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-2xl border border-white/5 bg-[#09090D] hover:bg-[#0c0c14] hover:border-[#10B981]/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#00F0FF]/30 transition-colors">
                {feat.icon}
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  {feat.title}
                  <ChevronRight className="w-3 h-3 text-[#B9B9C7] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-[#B9B9C7] font-medium leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SaaS Pricing Plans Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[10px] font-black tracking-widest text-[#10B981] uppercase px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 inline-block">PRICING TIERS</span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-white">CHOOSE YOUR ENGINE</h2>
          <p className="text-xs sm:text-sm text-[#B9B9C7] max-w-xl mx-auto font-medium">Activate biometric forecasts, client tracking models, and coach concierge access.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "FREE",
              price: "₹0",
              desc: "Essential tracking tools",
              features: ["Daily calorie logging", "Basic workouts log", "Limited AI messages", "Simple analytics"]
            },
            {
              name: "PRO LITE",
              price: "₹49",
              desc: "Interactive metrics",
              features: ["Unlimited logs", "3D Health Core View", "15 AI messages / day", "Water compliance checks"]
            },
            {
              name: "PRO",
              price: "₹99",
              desc: "Advanced self-coaching",
              features: ["Unlimited AI Coach", "Body composition forecast", "Milestone achievements", "XP gamification engine"]
            },
            {
              name: "PRO+",
              price: "₹199",
              desc: "Complete operating system",
              features: ["All Pro features", "Trainer & Dietitian access", "Client logs monitoring", "Direct workout assignments"]
            }
          ].map((plan, idx) => {
            const isPopular = plan.name === 'PRO';
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-40px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`p-6 rounded-2xl border bg-[#09090D] flex flex-col justify-between relative transition-all duration-300 ${
                  isPopular 
                    ? 'border-[#10B981] shadow-[0_0_25px_rgba(16,185,129,0.15)] bg-gradient-to-b from-[#10B981]/5 to-[#09090D]' 
                    : 'border-white/5 hover:border-[#10B981]/20'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#10B981] text-white text-[8px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    POPULAR
                  </span>
                )}
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-[#B9B9C7] font-bold uppercase tracking-wider block">{plan.name}</span>
                    <span className="text-3xl font-black text-white block mt-1.5">{plan.price}<span className="text-xs text-[#B9B9C7] font-bold">/mo</span></span>
                    <span className="text-[10px] text-[#B9B9C7] font-medium block mt-1.5">{plan.desc}</span>
                  </div>
                  
                  <ul className="space-y-3.5 border-t border-white/5 pt-5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-[10px] text-white font-semibold flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#00F0FF] stroke-[3px] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => openAuth('signup')}
                  className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-wider mt-8 cursor-pointer transition-all border ${
                    isPopular
                      ? 'bg-[#10B981] text-white border-none hover:bg-[#059669] hover:shadow-lg hover:shadow-[#10B981]/30'
                      : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </motion.div>
            );
          })}
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

    </div>
  );
}
