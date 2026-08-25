import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Cpu, Moon, Eye, Lock, Zap } from 'lucide-react';
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
import ShaderButton from '../../components/website/ShaderButton';

export default function PhilosophyPage() {
  const navigate = useNavigate();
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

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

  const principles = [
    {
      icon: Eye,
      num: '01',
      title: 'The Antidote to Gamified Noise',
      subtitle: 'Clarity over engagement addiction.',
      desc: 'Most modern fitness apps are designed like casino slots: flashing points, ad banners, popups, and fake streaks meant to keep you scrolling. Calyxo was built on the inverse philosophy: deliver complete biological clarity in under 3 seconds, and then get out of your life.'
    },
    {
      icon: Cpu,
      num: '02',
      title: 'Deterministic Science vs Black-Box Scores',
      subtitle: 'Transparent physiological equations.',
      desc: 'We reject proprietary "mystery scores" that fluctuate arbitrarily without explanation. Calyxo calculates recovery readiness and basal metabolic burn through validated peer-reviewed mathematical models (Katch-McArdle, Mifflin-St Jeor, and the Banister Impulse-Response Strain Model).'
    },
    {
      icon: Lock,
      num: '03',
      title: 'Sovereign Local-First Privacy',
      subtitle: 'Your biology is not an advertising dataset.',
      desc: 'Health metrics are the most intimate data human beings generate. Calyxo uses encrypted on-device storage with zero third-party tracking scripts, zero data brokering, and zero ad network SDKs. What happens in your biology stays on your device.'
    },
    {
      icon: Moon,
      num: '04',
      title: 'Circadian Chronobiology',
      subtitle: 'Timing is as decisive as volume.',
      desc: 'Human metabolism is deeply coupled to solar and circadian rhythms. Logging 2,000 calories right before deep sleep affects heart rate variability differently than nutrient intake post-workout. Calyxo coordinates hydration, nutrition, and training with your circadian clock.'
    },
    {
      icon: Zap,
      num: '05',
      title: 'Industrial Restraint & OLED Craft',
      subtitle: 'A quiet interface for a loud world.',
      desc: 'Built in pure Obsidian (#020203), off-white Swiss typography, and single-pixel hairline dividers. Designed to be easy on your eyes at 6:00 AM before your workout and at 10:30 PM before you sleep, preserving melatonin production.'
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
              <span>THE CALYXO MANIFESTO</span>
            </div>
          </FadeUp>

          <div className="space-y-2">
            <RevealHeading 
              as="h1"
              delay={0.1}
              className="font-outfit text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] uppercase block"
            >
              Understand more. Do less.
            </RevealHeading>
          </div>

          <FadeUp delay={0.25}>
            <p className="text-base sm:text-xl text-[#8E8E93] font-light max-w-2xl leading-relaxed">
              The fundamental conviction behind Calyxo is that health technology should respect human attention. We build quiet, deterministic software for people who care about high biological performance.
            </p>
          </FadeUp>

          <FadeUp delay={0.35}>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <AppStoreBadge />
              <GooglePlayBadge />

              <ShaderButton
                onClick={() => openAuth('signup')}
                variant="star-portal"
                size="md"
                className="h-[48px]"
              >
                Launch Web Companion
              </ShaderButton>
            </div>
          </FadeUp>
        </section>

        {/* ── FIVE PILLARS OF PHILOSOPHY ── */}
        <section className="space-y-12 border-t border-white/10 pt-20">
          <FadeUp className="max-w-3xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#CCFF00] font-bold">
              FOUNDATIONAL PILLARS
            </span>
            <h2 className="font-outfit text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Five non-negotiable principles.
            </h2>
          </FadeUp>

          <div className="space-y-6">
            {principles.map((item, index) => {
              const Icon = item.icon;
              return (
                <FadeUp 
                  key={index}
                  delay={index * 0.1}
                  className="p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-full border border-[#CCFF00]/20">
                        {item.num}
                      </span>
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="font-outfit text-2xl font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono text-gray-400">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="lg:col-span-8">
                    <p className="text-sm text-[#8E8E93] leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </section>

        {/* ── SCIENTIFIC FORMULA BREAKDOWN ── */}
        <FadeUp className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#CCFF00] font-bold">
              PHYSIOLOGICAL FOUNDATIONS
            </span>
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Transparent, Peer-Reviewed Mathematics
            </h2>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              We believe you have the right to know exactly how every metric inside Calyxo is computed:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <span className="text-[#CCFF00] font-bold uppercase tracking-wider block text-[10px]">Katch-McArdle BMR</span>
              <p className="text-gray-300">BMR = 370 + (21.6 × LBM_kg)</p>
              <p className="text-[10px] text-gray-500 font-sans">Calculates basal energy output strictly against lean tissue mass.</p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <span className="text-cyan-300 font-bold uppercase tracking-wider block text-[10px]">Banister Strain Model</span>
              <p className="text-gray-300">P(t) = w_i · e^(-t/τ_1) - k · e^(-t/τ_2)</p>
              <p className="text-[10px] text-gray-500 font-sans">Balances fitness adaptation against residual central nervous fatigue.</p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <span className="text-purple-300 font-bold uppercase tracking-wider block text-[10px]">Hydration Sweat Pacing</span>
              <p className="text-gray-300">H_target = (Weight_kg × 35ml) + (T_workout × 500ml)</p>
              <p className="text-[10px] text-gray-500 font-sans">Compensates baseline cellular turnover with acute cardiovascular sweat loss.</p>
            </div>
          </div>
        </FadeUp>

        {/* ── CALL TO ACTION ── */}
        <FadeUp className="py-20 text-center border-t border-white/10 space-y-8">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 shadow-2xl">
              <Logo className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="font-outfit text-4xl sm:text-6xl font-extrabold text-white">
            Quiet clarity. Uncompromising science.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <AppStoreBadge />
            <GooglePlayBadge />

            <ShaderButton
              onClick={() => openAuth('signup')}
              variant="star-portal"
              size="md"
              className="h-[48px]"
              icon={<ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />}
            >
              Launch Web App
            </ShaderButton>
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
