"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Shield, Zap, Heart, Bot, ArrowRight, X, Play, Cpu, ChevronRight, Check } from 'lucide-react';
import Logo from './Logo';
import AuthFlow from './AuthFlow';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  // Scroll Sync states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollRotation, setScrollRotation] = useState(0);

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
    <div className="min-h-screen bg-[#030303] text-[#f3f4f6] relative overflow-y-auto selection:bg-[#10B981] selection:text-white font-sans">
      
      {/* ── Scroll Progress Indicator Bar (Scroll Sync) ── */}
      <div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00F0FF] via-[#34D399] to-[#10B981] z-50 origin-left transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Background glowing gradients (Argus style) */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-[#10B981]/15 to-[#00F0FF]/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-[5%] w-[500px] h-[500px] bg-gradient-to-bl from-violet-600/10 to-transparent rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-[10%] w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="sticky top-[3px] z-50 bg-[#030303]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-2xl">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-[#00F0FF]" glow={true} />
          <span className="brand-name text-lg text-white bg-gradient-to-r from-white to-[#B9B9C7] bg-clip-text text-transparent">calyxo</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => openAuth('login')}
            className="text-xs font-black uppercase tracking-wider text-[#B9B9C7] hover:text-white transition-colors cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={() => openAuth('signup')}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg hover:shadow-[#10B981]/25 transition-all duration-300 cursor-pointer border-none"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Headline */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 space-y-6 text-left"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#00F0FF] text-[10px] font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED HEALTH OPERATING SYSTEM
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05]"
          >
            ENGINEERED FOR <br />
            <span className="bg-gradient-to-r from-[#00F0FF] via-[#34D399] to-[#10B981] bg-clip-text text-transparent drop-shadow-sm">
              MAX PERFORMANCE
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-lg text-[#B9B9C7] max-w-xl font-medium leading-relaxed"
          >
            Calyxo is an immersive health operating system merging automated biometrics, real-time nutrition calculations, structured workouts, and proactive AI coaching.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-start items-center gap-4 pt-4 w-full"
          >
            <button 
              onClick={() => openAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-[#10B981]/40 flex items-center justify-center gap-2 group cursor-pointer transition-all duration-300 border-none"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => openAuth('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors border border-white/10"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#00F0FF]" />
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Right Column: BIG Interactive Scroll-Linked 3D Shield Core */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center items-center relative"
        >
          {/* Main Core Container: Styled larger to fit "Big 3D" requests */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full aspect-square max-w-[500px] relative flex items-center justify-center bg-[#09090D]/30 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-3xl p-8 overflow-visible"
          >
            
            {/* Outer radial glows behind core */}
            <div className="absolute w-[280px] h-[280px] rounded-full bg-[#10B981]/15 blur-[70px] pointer-events-none z-0"></div>
            <div className="absolute w-[180px] h-[180px] rounded-full bg-[#00F0FF]/10 blur-[50px] pointer-events-none z-0"></div>
            
            {/* Animated Rotating SVG Core */}
            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 select-none overflow-visible">
              <defs>
                <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00F0FF" />
                  <stop offset="50%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <filter id="core-glow">
                  <feGaussianBlur stdDeviation="9" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* 1. Outer Ring (Slow clockwise dashed ring, synced with scroll rotation) */}
              <circle 
                cx="100" cy="100" r="92" 
                stroke="rgba(255,255,255,0.06)" 
                strokeWidth="1.5" 
                fill="none" 
              />
              <circle 
                cx="100" cy="100" r="92" 
                stroke="url(#shield-grad)" 
                strokeWidth="1.8" 
                strokeDasharray="20 160 40 100" 
                fill="none" 
                style={{ transform: `rotate(${scrollRotation * 0.4}deg)` }}
                className="origin-center transition-transform duration-200"
              />

              {/* 2. Middle Ring (Medium counter-clockwise dashed circuit) */}
              <circle 
                cx="100" cy="100" r="76" 
                stroke="rgba(0,240,255,0.08)" 
                strokeWidth="1" 
                fill="none" 
              />
              <circle 
                cx="100" cy="100" r="76" 
                stroke="url(#shield-grad)" 
                strokeWidth="2.5" 
                strokeDasharray="50 90 20 50" 
                fill="none" 
                style={{ transform: `rotate(${-scrollRotation * 0.7}deg)` }}
                className="origin-center opacity-85 transition-transform duration-200"
              />

              {/* 3. Inner Geometry (Rotating triangles/hex) */}
              <circle 
                cx="100" cy="100" r="60" 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="1" 
                fill="none" 
              />
              <polygon 
                points="100,43 151,130 49,130" 
                stroke="rgba(16,185,129,0.25)" 
                strokeWidth="1.5" 
                fill="none"
                style={{ transform: `rotate(${scrollRotation * 1.1}deg)` }}
                className="origin-center transition-transform duration-200"
              />
              <polygon 
                points="100,157 151,70 49,70" 
                stroke="rgba(0,240,255,0.2)" 
                strokeWidth="1" 
                fill="none"
                style={{ transform: `rotate(${-scrollRotation * 1.4}deg)` }}
                className="origin-center transition-transform duration-200"
              />

              {/* 4. Central Pulse Orb Shield */}
              <g className="animate-[pulse_3.5s_ease-in-out_infinite] origin-center">
                <circle 
                  cx="100" cy="100" r="32" 
                  fill="url(#shield-grad)" 
                  className="opacity-15"
                  filter="url(#core-glow)"
                />
                <circle 
                  cx="100" cy="100" r="22" 
                  fill="url(#shield-grad)" 
                  className="opacity-60"
                  filter="url(#core-glow)"
                />
                <path 
                  d="M100,87 C93.5,87 89,91.5 89,97.5 L89,105 C89,113.5 100,119 100,119 C100,119 111,113.5 111,105 L111,97.5 C111,91.5 106.5,87 100,87 Z" 
                  fill="#ffffff" 
                  className="drop-shadow-[0_2px_10px_rgba(0,240,255,0.65)]"
                />
              </g>
            </svg>

            {/* Floating Glass Telemetry Elements */}
            <div className="absolute top-10 left-[-20px] bg-[#0F0F15]/85 border border-white/10 backdrop-blur-xl rounded-2xl px-4 py-2.5 text-left z-20 shadow-2xl animate-[bounce_4.5s_ease-in-out_infinite]">
              <span className="text-[9px] text-[#B9B9C7] font-bold uppercase tracking-wider block">Coaching Score</span>
              <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                94% <span className="text-[9px] text-[#00F0FF] font-semibold">OPTIMAL</span>
              </span>
            </div>

            <div className="absolute bottom-14 right-[-20px] bg-[#0F0F15]/85 border border-white/10 backdrop-blur-xl rounded-2xl px-4 py-2.5 text-left z-20 shadow-2xl animate-[bounce_5.5s_ease-in-out_infinite_delayed]">
              <span className="text-[9px] text-[#B9B9C7] font-bold uppercase tracking-wider block">Bio Sync status</span>
              <span className="text-sm font-extrabold text-white flex items-center gap-1">
                ⚡ SECURE
              </span>
            </div>

            <div className="absolute bottom-6 left-12 bg-[#0F0F15]/85 border border-white/10 backdrop-blur-xl rounded-xl px-3.5 py-2 text-[8px] font-black text-[#00F0FF] tracking-widest uppercase z-20 shadow-lg">
              🔥 STREAK: 12 DAYS
            </div>
          </motion.div>
        </motion.div>

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
