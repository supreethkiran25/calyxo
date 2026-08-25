import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Flame, Dumbbell, Droplets, HeartPulse, Bot, 
  Sparkles, Check, Search, IndianRupee, Layers, ShieldCheck, Activity 
} from 'lucide-react';
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

export default function ExperiencePage() {
  const navigate = useNavigate();
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

  // Interactive Food Search Demo
  const [searchQuery, setSearchQuery] = useState('Paneer');
  
  const sampleFoods = [
    { name: 'Paneer Bhurji (200g)', p: '28g', c: '8g', f: '34g', cal: 450, cost: '₹75', region: 'North India', desc: 'Fresh cottage cheese scrambled with tomatoes, onions, and cumin.' },
    { name: 'Soya Chunks Curry (100g)', p: '52g', c: '33g', f: '1g', cal: 345, cost: '₹35', region: 'Pan-Indian', desc: 'Ultra high-protein plant staple cooked in homestyle ginger-garlic gravy.' },
    { name: 'Grilled Chicken Breast (200g)', p: '62g', c: '0g', f: '7g', cal: 330, cost: '₹95', region: 'Global', desc: 'Lean marinated chicken breast grilled with black pepper and lemon.' },
    { name: 'Egg Bhurji - 4 Whole Eggs', p: '24g', c: '4g', f: '20g', cal: 290, cost: '₹30', region: 'Mumbai Street', desc: 'Spiced scrambled whole eggs with green chillies and coriander.' },
    { name: 'Moong Dal Tadka (1 Cup)', p: '14g', c: '28g', f: '4g', cal: 210, cost: '₹25', region: 'North India', desc: 'Yellow lentils tempered with ghee, mustard seeds, and dried red chillies.' },
    { name: 'Masala Oats with Whey (60g)', p: '32g', c: '42g', f: '5g', cal: 340, cost: '₹55', region: 'Fitness Fusion', desc: 'Rolled oats cooked savory with 1 scoop unflavored isolate protein.' }
  ];

  const filteredFoods = sampleFoods.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>SIX CONTINUOUS DIMENSIONS</span>
            </div>
          </FadeUp>

          <div className="space-y-2">
            <RevealHeading 
              as="h1"
              delay={0.1}
              className="font-outfit text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] uppercase block"
            >
              One interface. Six continuous dimensions.
            </RevealHeading>
          </div>

          <FadeUp delay={0.25}>
            <p className="text-base sm:text-xl text-[#8E8E93] font-light max-w-2xl leading-relaxed">
              Every layer of Calyxo is connected. Your morning recovery score recalculates your workout volume; your daily workout sweat rate recalculates your 3D water goal; and over 8,000 verified foods fuel your biological engine.
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

        {/* ── DIMENSION 1: COMMAND CENTER (TODAY) ── */}
        <FadeUp className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#CCFF00]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">DIMENSION 01</span>
              <h2 className="font-outfit text-2xl sm:text-4xl font-bold text-white">The Command Center</h2>
            </div>
          </div>

          <p className="text-sm text-[#8E8E93] max-w-3xl leading-relaxed">
            A single, continuous cockpit where your calories, steps, 3D hydration, and recovery readiness live together. No navigating through 10 nested sub-menus — everything you need for today is visible within one glance.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 font-mono">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center space-y-1">
              <span className="text-[10px] text-[#F59E0B] block font-bold">CALORIE FLUX</span>
              <span className="text-xl font-black text-white">2,140 kcal</span>
              <span className="text-[9px] text-gray-500 block">Target: 2,400</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center space-y-1">
              <span className="text-[10px] text-[#10B981] block font-bold">STEP PEDOMETRY</span>
              <span className="text-xl font-black text-white">9,420</span>
              <span className="text-[9px] text-gray-500 block">Target: 10,000</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center space-y-1">
              <span className="text-[10px] text-[#00F0FF] block font-bold">3D HYDRATION</span>
              <span className="text-xl font-black text-white">2.45 L</span>
              <span className="text-[9px] text-gray-500 block">Target: 3.00 L</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center space-y-1">
              <span className="text-[10px] text-[#CCFF00] block font-bold">VITALITY SCORE</span>
              <span className="text-xl font-black text-[#CCFF00]">92%</span>
              <span className="text-[9px] text-[#CCFF00]/80 block">Optimal Day</span>
            </div>
          </div>
        </FadeUp>

        {/* ── DIMENSION 2: NUTRITION OS & 8,000+ REGIONAL FOODS ── */}
        <FadeUp className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">DIMENSION 02</span>
              <h2 className="font-outfit text-2xl sm:text-4xl font-bold text-white">Nutrition OS & Regional Indian Foods</h2>
            </div>
          </div>

          <p className="text-sm text-[#8E8E93] max-w-3xl leading-relaxed">
            Most western apps lack accurate data for authentic Indian dishes like Paneer Bhurji, Soya Chunks, Dal Tadka, Dosa, and Roti. Calyxo features an authentic 8,000+ verified regional food database coupled with live Indian Rupee (₹) grocery cost optimization.
          </p>

          {/* Interactive Food Search Sandbox */}
          <div className="p-6 sm:p-8 rounded-3xl bg-black/70 border border-white/15 space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 8,000+ foods (e.g. Paneer, Soya, Chicken, Dal)..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00]"
                />
              </div>
              <span className="text-[10px] font-mono text-[#CCFF00] self-center">
                Showing {filteredFoods.length} Verified Entries
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
              {filteredFoods.map((food, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.015 }}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 hover:border-[#CCFF00]/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-outfit">{food.name}</h4>
                      <span className="text-[9px] font-mono text-gray-400">{food.region}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded">
                      {food.p} Protein
                    </span>
                  </div>

                  <p className="text-[11px] text-[#8E8E93] font-light leading-snug">{food.desc}</p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>C: {food.c}</span>
                      <span>•</span>
                      <span>F: {food.f}</span>
                      <span>•</span>
                      <span className="text-white font-bold">{food.cal} kcal</span>
                    </div>
                    <span className="text-amber-300 font-bold">{food.cost}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* ── DIMENSION 3 & 4: HYDRATION & LIVE WORKOUT ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Hydration */}
          <FadeUp delay={0.1} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold">DIMENSION 03</span>
                  <h3 className="font-outfit text-2xl font-bold text-white">3D Hydration OS</h3>
                </div>
              </div>

              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                Physics-based volumetric fluid simulation tracking cellular water hydration with dynamic sweat rate adaptation driven by workout intensity.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Pacing Status</span>
                <span className="text-[#CCFF00] font-bold">On Schedule (+300ml ahead)</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Workout Sweat Load</span>
                <span className="text-white font-bold">+500 ml compensated</span>
              </div>
            </div>
          </FadeUp>

          {/* Live Workout */}
          <FadeUp delay={0.2} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold">DIMENSION 04</span>
                  <h3 className="font-outfit text-2xl font-bold text-white">Live Movement Suite</h3>
                </div>
              </div>

              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                1,000+ exercise library with muscle targeting, compound 5x5 progressions, RPE scale auto-regulation, and live Dynamic Island rest countdown timers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Rest Timer Streaming</span>
                <span className="text-[#CCFF00] font-bold">Dynamic Island + Watch</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Progression Engine</span>
                <span className="text-white font-bold">Auto-Linear + RPE Capping</span>
              </div>
            </div>
          </FadeUp>

        </div>

        {/* ── DIMENSION 5 & 6: RECOVERY MODEL & PROACTIVE AI ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Recovery */}
          <FadeUp delay={0.1} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold">DIMENSION 05</span>
                  <h3 className="font-outfit text-2xl font-bold text-white">Deterministic 0–100% Recovery</h3>
                </div>
              </div>

              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                An objective biological vitality model balancing sleep debt against cardiovascular training strain to determine daily training readiness without subjective guesswork.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Algorithm Class</span>
                <span className="text-white font-bold">Coupled Differential Strain</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Readiness Tier</span>
                <span className="text-[#CCFF00] font-bold">92% High Readiness</span>
              </div>
            </div>
          </FadeUp>

          {/* Proactive AI */}
          <FadeUp delay={0.2} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400 font-bold">DIMENSION 06</span>
                  <h3 className="font-outfit text-2xl font-bold text-white">Proactive AI Intelligence</h3>
                </div>
              </div>

              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                Powered by Google Gemini AI, providing proactive daily morning health briefings, meal recommendations, and volume adjustments before your workout begins.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Intelligence Engine</span>
                <span className="text-purple-300 font-bold">Gemini Pro Multimodal</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Contextual Synthesis</span>
                <span className="text-[#CCFF00] font-bold">Sleep + Macros + Volume</span>
              </div>
            </div>
          </FadeUp>

        </div>

        {/* ── CALL TO ACTION ── */}
        <FadeUp className="py-20 text-center border-t border-white/10 space-y-8">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 shadow-2xl">
              <Logo className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="font-outfit text-4xl sm:text-6xl font-extrabold text-white">
            Experience the six dimensions today.
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
