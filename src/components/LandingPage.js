"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Shield, Zap, Heart, Bot, ArrowRight, X, Play } from 'lucide-react';
import Logo from './Logo';
import AuthFlow from './AuthFlow';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-obsidian text-foreground relative overflow-y-auto selection:bg-acid-green selection:text-black">
      
      {/* Background glowing gradients */}
      <div className="absolute top-10 left-[10%] w-[380px] h-[380px] bg-acid-green/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-[10%] w-[420px] h-[420px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-[20%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-nav border-b border-card-border px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-2xl">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-acid-green" glow={true} />
          <span className="text-lg font-black tracking-widest uppercase text-foreground">calyxo</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => openAuth('login')}
            className="text-xs font-black uppercase tracking-wider text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={() => openAuth('signup')}
            className="btn-primary px-4 py-2 text-[10px] uppercase tracking-wider shadow-md cursor-pointer border-none"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-acid-green/10 border border-acid-green/20 text-acid-green text-[10px] font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED HEALTH OPERATING SYSTEM
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.05]"
          >
            THE FUTURE OF <br />
            <span className="bg-gradient-to-r from-acid-green to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
              HUMAN PERFORMANCE
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-lg text-muted max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Calyxo is an immersive health operating system merging automated biometrics, real-time nutrition calculations, structured workouts, and proactive AI coaching.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <button 
              onClick={() => openAuth('signup')}
              className="btn-primary w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group cursor-pointer border-none"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => openAuth('login')}
              className="btn-ghost w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Watch Demo
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Visual Mockup Section */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass rounded-3xl border border-card-border p-3.5 shadow-2xl relative"
        >
          <div className="aspect-video bg-surface rounded-2xl overflow-hidden border border-card-border shadow-inner flex items-center justify-center relative group">
            {/* Visual placeholder of system interface */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-transparent z-10"></div>
            <div className="z-20 text-center space-y-3 p-6 max-w-md">
              <Logo className="w-16 h-16 text-acid-green mx-auto animate-pulse" glow={true} />
              <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Interactive Dashboard</h3>
              <p className="text-xs text-muted leading-relaxed font-medium">Real-time calorie ring tracking, multi-log streaks, personal records, and active meal scoring calculated locally.</p>
            </div>
            
            {/* Interactive orbiting details */}
            <div className="absolute top-8 left-8 bg-black/60 border border-card-border rounded-xl px-3 py-1.5 text-[9px] font-bold text-acid-green tracking-wider uppercase z-20">
              🔥 STREAK: 12 DAYS
            </div>
            <div className="absolute bottom-8 right-8 bg-black/60 border border-card-border rounded-xl px-3 py-1.5 text-[9px] font-bold text-foreground tracking-wider uppercase z-20">
              🏋️ VOL: 4,820 kg
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Storytelling Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-card-border">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-foreground">HEALTH OPERATING SYSTEM FEATURES</h2>
          <p className="text-xs sm:text-sm text-muted font-medium">A unified workspace designed to optimize diet, training, and recovery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Bot className="w-6 h-6 text-acid-green" />,
              title: "PROACTIVE AI COACH",
              desc: "Get personalized daily briefings, workout plans, and grocery checklists driven by Gemini."
            },
            {
              icon: <Activity className="w-6 h-6 text-orange" />,
              title: "IMMERSIVE HEALTH CORE",
              desc: "Enable optional Three.js rendering to visualize steps, hydration, protein, and sleep as an interactive 3D orb."
            },
            {
              icon: <Zap className="w-6 h-6 text-yellow-500" />,
              title: "GAMIFIED ENGINE",
              desc: "Earn XP, unlock milestones, complete challenges, and track active log compliance streaks."
            },
            {
              icon: <Heart className="w-6 h-6 text-red-500" />,
              title: "INTEGRATED HEALTH HUB",
              desc: "Calculate Readiness, Recovery, and composite Health Scores based on sleep quality and heart rate."
            },
            {
              icon: <Shield className="w-6 h-6 text-blue-500" />,
              title: "TRAINER RBAC SYSTEM",
              desc: "Switch roles to access Trainer/Dietitian tools, assign workouts/meals, and track client metrics."
            },
            {
              icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
              title: "FOOD & WORKOUT ANALYTICS",
              desc: "Track personal records (PRs), volume progressions, body measurements, and save customized templates."
            }
          ].map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="glass p-6 rounded-2xl border border-card-border shadow-xs hover:border-acid-green/30 transition-all flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-surface border border-card-border flex items-center justify-center mb-6">
                {feat.icon}
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">{feat.title}</h4>
                <p className="text-xs text-muted font-medium leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SaaS Pricing Plans Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-card-border">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-foreground">PRICING AND PLANS</h2>
          <p className="text-xs sm:text-sm text-muted font-medium">Select a tier to activate customized biometrics, forecasts, and RBAC client models.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "FREE",
              price: "₹0",
              desc: "Essential tracking",
              features: ["Daily calorie logging", "Basic workouts log", "Limited AI messages", "Simple analytics"]
            },
            {
              name: "PRO LITE",
              price: "₹49",
              desc: "Interactive essentials",
              features: ["Unlimited logs", "3D Health Core", "15 AI messages / day", "Water compliance checks"]
            },
            {
              name: "PRO",
              price: "₹99",
              desc: "Advanced training",
              features: ["Unlimited AI Coach", "Body composition forecast", "Milestone achievements", "XP gamification engine"]
            },
            {
              name: "PRO+",
              price: "₹199",
              desc: "Complete operating system",
              features: ["All Pro features", "Trainer & Dietitian access", "Client logs monitoring", "Direct workout assignments"]
            }
          ].map((plan, idx) => (
            <div 
              key={idx}
              className={`glass p-6 rounded-2xl border border-card-border shadow-md flex flex-col justify-between relative ${
                plan.name === 'PRO' ? 'border-acid-green/45 shadow-[0_0_15px_rgba(181,242,61,0.15)] bg-acid-green/5' : ''
              }`}
            >
              {plan.name === 'PRO' && (
                <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-acid-green text-accent-foreground text-[8px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  POPULAR
                </span>
              )}
              
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{plan.name}</span>
                  <span className="text-3xl font-black text-foreground block mt-1.5">{plan.price}<span className="text-xs text-muted font-bold">/mo</span></span>
                  <span className="text-[10px] text-muted font-medium block mt-1.5">{plan.desc}</span>
                </div>
                
                <ul className="space-y-2 border-t border-card-border pt-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-[10px] text-foreground font-semibold flex items-center gap-1.5">
                      <span className="text-acid-green font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => openAuth('signup')}
                className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider mt-8 cursor-pointer transition-all border ${
                  plan.name === 'PRO'
                    ? 'bg-acid-green text-accent-foreground border-none hover:shadow-lg'
                    : 'bg-surface text-foreground border-card-border hover:border-acid-green/30'
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border py-8 text-center max-w-6xl mx-auto px-6">
        <p className="text-[9px] text-muted font-bold tracking-widest uppercase">© 2026 CALYXO HEALTH OS. ALL RIGHTS RESERVED. ACCESSIBILITY COMPLIANT.</p>
      </footer>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
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
                className="absolute top-4 right-4 text-muted hover:text-foreground z-50 p-2 cursor-pointer"
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
