import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Globe, Database, Eye, Sparkles, FileText, 
  Server, Lock, CheckCircle2, AlertTriangle, ArrowLeft, Download
} from 'lucide-react';
import CinematicNavbar from '../../components/website/CinematicNavbar';
import WebFooter from '../../components/website/WebFooter';
import ScrollToTopButton from '../../components/website/ScrollToTopButton';
import PageTransition from '../../components/website/PageTransition';
import { RevealHeading, FadeUp } from '../../components/website/MotionText';
import BetaAccessModal from '../../components/website/BetaAccessModal';
import AuthFlow from '../../components/AuthFlow';

export default function WebPrivacyPage() {
  const navigate = useNavigate();
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  return (
    <PageTransition className="bg-[#020203] text-white min-h-screen selection:bg-[#CCFF00] selection:text-black">
      <Helmet>
        <title>Privacy Policy & Global Data Charter — Calyxo Health OS</title>
        <meta name="description" content="Read Calyxo's Privacy Policy & Global Data Charter. Learn how your biometrics, telemetry, and nutrition data are encrypted and protected." />
        <link rel="canonical" href="https://calyxo.vercel.app/privacy" />
      </Helmet>

      {/* Fixed Header */}
      <CinematicNavbar 
        onOpenAuth={(mode) => setAuthMode(mode)}
        onOpenBetaModal={() => setBetaModalOpen(true)}
        onNavigateDashboard={() => navigate('/user/dashboard')}
      />

      {/* Main Content */}
      <main className="pt-36 sm:pt-44 pb-28 px-6 sm:px-12 max-w-5xl mx-auto space-y-16">
        
        {/* Back Link & Header */}
        <div className="space-y-6">
          <button 
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#8E8E93] hover:text-[#CCFF00] transition-colors cursor-pointer bg-none border-none p-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Calyxo HQ</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>GLOBAL DATA CHARTER</span>
          </div>

          <RevealHeading 
            as="h1" 
            className="font-outfit text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-[0.95]"
          >
            Privacy Policy
          </RevealHeading>

          <FadeUp delay={0.1}>
            <p className="text-sm sm:text-base text-[#8E8E93] leading-relaxed max-w-3xl">
              Effective Date: January 1, 2026 • 2026 Production Edition • Data Controller: <strong>Calyxo Health Technologies Private Limited</strong>, Bengaluru, Karnataka, India.
            </p>
          </FadeUp>
        </div>

        {/* Highlight Callout */}
        <FadeUp delay={0.2}>
          <div className="p-6 rounded-2xl bg-cyan-500/[0.07] border border-cyan-500/25 space-y-2">
            <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Our Absolute Privacy Commitment
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed">
              Calyxo will <strong>never sell your personal biometrics or health telemetry</strong> to advertisers, brokers, or third-party data aggregators. Your health data exists solely to power your personalized training and metabolic insights.
            </p>
          </div>
        </FadeUp>

        {/* 17 Legal Sections */}
        <div className="space-y-12 text-sm text-gray-300 leading-relaxed font-sans">
          
          {/* 1. Scope and Acceptance */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-cyan-400" />
              1. Scope & Acceptance
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              By accessing, installing, or using the Calyxo mobile applications, connected-device features, AI intelligence hubs, and web platform (collectively, the "Services"), you acknowledge that you have read and agree to this Privacy Policy. If you do not agree with the practices described here, do not use the Services.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Database className="w-5 h-5 text-cyan-400" />
              2. Information We Collect
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h3 className="text-white font-bold">2.1 Account & Identity</h3>
                <p className="text-gray-400">Name, email, date of birth, age, gender, timezone, country, and subscription status.</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h3 className="text-white font-bold">2.2 Health & Biometric Telemetry</h3>
                <p className="text-gray-400">Workouts, sets, reps, weights, calories burned, heart rate, resting HR, HRV, sleep logs, hydration, and recovery scores.</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h3 className="text-white font-bold">2.3 Nutrition & Dietary Records</h3>
                <p className="text-gray-400">Meal entries, food items, macronutrients (protein, carbs, fats), micronutrients, and hydration levels.</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <h3 className="text-white font-bold">2.4 Connected Wearables</h3>
                <p className="text-gray-400">Apple Health / HealthKit, Android Health Connect, watchOS, and BLE sensors authorized by you.</p>
              </div>
            </div>
          </section>

          {/* 3. How We Use Information */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-cyan-400" />
              3. How We Use Information
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-400 text-xs sm:text-sm">
              <li>Deliver automated biometric analysis, live workout telemetry, and recovery scores.</li>
              <li>Provide personalized AI coaching briefings, meal recommendations, and training periodization.</li>
              <li>Synchronize real-time health data between iOS, Android, watchOS, and Web dashboards.</li>
              <li>Maintain high-availability infrastructure, fraud prevention, and audit security logs.</li>
              <li>Comply with Indian DPDP Act 2023, GDPR, CCPA, and statutory regulations.</li>
            </ul>
          </section>

          {/* 4. AI & Automated Processing */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              4. AI & Automated Processing
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Calyxo utilizes Google Gemini and custom machine learning inference models to generate predictive training recommendations. AI outputs are probabilistic mathematical estimates and <strong>are NOT medical diagnoses or clinical prescriptions</strong>.
            </p>
          </section>

          {/* 5. Zero Health Data Sale */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Server className="w-5 h-5 text-cyan-400" />
              5. Zero Health Data Sale Guarantee
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              We do not sell, rent, lease, or monetize your biometrics or fitness data. Telemetry is shared strictly with essential cloud subprocessors (Supabase PostgreSQL, Vercel Edge, Razorpay) necessary to deliver the service under strict confidentiality terms.
            </p>
          </section>

          {/* 6. Security, Encryption & Retention */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-cyan-400" />
              6. Security, Retention & Zero-Ad Cookie Policy
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              All communications utilize <strong>TLS 1.3 encryption in transit</strong> and <strong>AES-256 encryption at rest</strong> with Supabase Row Level Security (RLS). You maintain the right to export your complete telemetry history or request irreversible account erasure within 48 hours.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              <strong>Local Storage & Cookies:</strong> Calyxo employs <strong>zero third-party advertising cookies</strong>, pixels, or trackers. Session credentials, theme styles, and offline sync queues are persisted locally in your browser storage (<code className="text-cyan-400">localStorage</code>, <code className="text-cyan-400">sessionStorage</code>, and <code className="text-cyan-400">IndexedDB</code>).
            </p>
          </section>

          {/* 7. Contact & Grievance Officer */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-white/[0.04] border border-white/15">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">
              7. Data Protection & Grievance Officer
            </h2>
            <div className="font-mono text-xs text-gray-300 space-y-1.5">
              <p><strong className="text-white font-sans">Entity:</strong> Calyxo Health Technologies Private Limited</p>
              <p><strong className="text-white font-sans">Data Protection Officer:</strong> Supreeth Kiran</p>
              <p><strong className="text-white font-sans">Email:</strong> privacy@calyxo.app / supreethkiran23@gmail.com</p>
              <p><strong className="text-white font-sans">Registered Office:</strong> Bengaluru, Karnataka 560001, India</p>
            </div>
          </section>

        </div>

      </main>

      {/* Footer */}
      <WebFooter onOpenBetaModal={() => setBetaModalOpen(true)} />

      {/* Scroll to Top */}
      <ScrollToTopButton />

      {/* Download Modal */}
      <BetaAccessModal 
        isOpen={betaModalOpen} 
        onClose={() => setBetaModalOpen(false)} 
      />

      {/* Auth Modal */}
      {authMode && (
        <AuthFlow 
          initialMode={authMode} 
          onClose={() => setAuthMode(null)} 
          onSuccess={() => {
            setAuthMode(null);
            navigate('/user/dashboard');
          }} 
        />
      )}
    </PageTransition>
  );
}
