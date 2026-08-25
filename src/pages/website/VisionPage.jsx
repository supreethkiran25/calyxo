import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Milestone, CheckCircle2, Clock, Sparkles, Cpu, Layers, ShieldCheck } from 'lucide-react';
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

export default function VisionPage() {
  const navigate = useNavigate();
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

  const [selectedPhase, setSelectedPhase] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAppStoreRedirect = () => {
    window.open(CALYXO_APP_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  const roadmap = [
    {
      phase: 'Phase 01',
      status: 'Live Shipped',
      statusColor: 'text-[#CCFF00] bg-[#CCFF00]/10 border-[#CCFF00]/30',
      title: 'Unified Health OS & Dynamic Island Telemetry',
      timeline: '2026',
      items: [
        'iOS ActivityKit Dynamic Island rest timer countdown streaming',
        '8,000+ verified regional Indian & international food database',
        '3D volumetric fluid vessel hydration tracker',
        'Deterministic 0–100% vital readiness recovery scoring engine',
        'Apple HealthKit & Android Health Connect cross-platform bridge',
        'watchOS companion for continuous optical HR sampling'
      ]
    },
    {
      phase: 'Phase 02',
      status: 'Active Engineering',
      statusColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
      title: 'Continuous Molecular Biomarkers & Smart Rings',
      timeline: 'Q3–Q4 2026',
      items: [
        'Continuous Glucose Monitor (CGM) BLE stream for glycemic excursion tracking',
        'Smart ring integration (Oura, Ultrahuman, RingConn) for deep sleep staging',
        'Continuous HRV autonomic nervous system auto-strain compensation',
        'Optical barcode & receipt macro scanner with on-device computer vision'
      ]
    },
    {
      phase: 'Phase 03',
      status: 'In Research',
      statusColor: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
      title: 'Autonomous Gemini AI Health Agent',
      timeline: '2027',
      items: [
        'Predictive musculoskeletal fatigue alerts 72 hours prior to overtraining',
        'Automated circadian meal shift recommendations for shift workers & jet lag',
        'Blood panel biomarker synthesis (Lipid, HbA1c, Vitamin D) with meal adaptations',
        'Local fine-tuned lightweight neural net for 100% offline edge inference'
      ]
    },
    {
      phase: 'Phase 04',
      status: 'Roadmap Architecture',
      statusColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      title: 'Calyxo Open Telemetry Protocol (COTP)',
      timeline: 'Long-Term',
      items: [
        'Open Developer APIs for connected fitness equipment (Concept2, Peloton, Wahoo)',
        'Bi-directional trainer-to-athlete client management & remote telemetry portal',
        'Zero-knowledge encrypted clinical export for physicians & longevity specialists',
        'Cross-chain sovereign biological data ownership standard'
      ]
    }
  ];

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
              <Milestone className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>THE LONG HORIZON</span>
            </div>
          </FadeUp>

          <div className="space-y-2">
            <RevealHeading 
              as="h1"
              delay={0.1}
              className="font-outfit text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] uppercase block"
            >
              The future of human telemetry.
            </RevealHeading>
          </div>

          <FadeUp delay={0.25}>
            <p className="text-base sm:text-xl text-[#8E8E93] font-light max-w-2xl leading-relaxed">
              We are moving from reactive logging toward continuous, proactive biological intelligence. Explore our architectural roadmap from today’s unified platform to tomorrow’s autonomous health agent.
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

        {/* ── ROADMAP TIMELINE ── */}
        <section className="space-y-12 border-t border-white/10 pt-20">
          <FadeUp className="max-w-3xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#CCFF00] font-bold">
              PRODUCT MILESTONES
            </span>
            <h2 className="font-outfit text-3xl sm:text-5xl font-bold tracking-tight text-white">
              The Four Horizons of Calyxo
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roadmap.map((stage, idx) => (
              <FadeUp 
                key={idx}
                delay={idx * 0.1}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-400 font-bold">{stage.phase} · {stage.timeline}</span>
                    <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${stage.statusColor}`}>
                      {stage.status}
                    </span>
                  </div>

                  <h3 className="font-outfit text-2xl font-bold text-white leading-snug">
                    {stage.title}
                  </h3>

                  <ul className="space-y-3 pt-2 text-xs text-[#8E8E93] font-light">
                    {stage.items.map((it, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-[#CCFF00] mt-0.5">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span>Architecture Verified</span>
                  <span className="text-white">Calyxo Engineering</span>
                </div>
              </FadeUp>
            ))}
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
            Join the journey toward biological clarity.
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
