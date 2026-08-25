import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, Award, AlertTriangle, Heart, Sparkles, Activity, 
  Shield, Globe, Mail, ArrowLeft, Download, CheckCircle2
} from 'lucide-react';
import CinematicNavbar from '../../components/website/CinematicNavbar';
import WebFooter from '../../components/website/WebFooter';
import ScrollToTopButton from '../../components/website/ScrollToTopButton';
import PageTransition from '../../components/website/PageTransition';
import { RevealHeading, FadeUp } from '../../components/website/MotionText';
import BetaAccessModal from '../../components/website/BetaAccessModal';
import AuthFlow from '../../components/AuthFlow';

export default function WebTermsPage() {
  const navigate = useNavigate();
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  return (
    <PageTransition className="bg-[#020203] text-white min-h-screen selection:bg-[#CCFF00] selection:text-black">
      <Helmet>
        <title>Terms and Conditions & User Agreement — Calyxo Health OS</title>
        <meta name="description" content="Read the Terms and Conditions and User Agreement for Calyxo Health OS. Understand eligibility, subscription terms, and health disclaimers." />
        <link rel="canonical" href="https://calyxo.vercel.app/terms" />
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

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-mono tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>USER AGREEMENT & POLICIES</span>
          </div>

          <RevealHeading 
            as="h1" 
            className="font-outfit text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-[0.95]"
          >
            Terms & Conditions
          </RevealHeading>

          <FadeUp delay={0.1}>
            <p className="text-sm sm:text-base text-[#8E8E93] leading-relaxed max-w-3xl">
              Effective Date: January 1, 2026 • 2026 Production Edition • Binding Agreement with <strong>Calyxo Health Technologies Private Limited</strong>.
            </p>
          </FadeUp>
        </div>

        {/* STATUTORY HEALTH WARNING BOX */}
        <FadeUp delay={0.2}>
          <div className="p-6 rounded-2xl bg-red-500/[0.08] border border-red-500/30 space-y-3">
            <h2 className="text-sm font-black text-red-400 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              STATUTORY HEALTH & FITNESS DISCLAIMER
            </h2>
            <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed">
              <strong>CALYXO IS NOT A MEDICAL PROVIDER, CLINIC, OR EMERGENCY SERVICE.</strong> The software, biometric telemetry, workout recommendations, and AI coaching are for informational and athletic conditioning purposes only. Never disregard professional medical advice. <strong>In an emergency, dial emergency services immediately (112 / 911).</strong>
            </p>
          </div>
        </FadeUp>

        {/* Terms Sections */}
        <div className="space-y-12 text-sm text-gray-300 leading-relaxed font-sans">
          
          {/* 1. Eligibility */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#CCFF00]" />
              1. Eligibility & Capacity
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              You must be at least 18 years of age to purchase paid subscriptions (Calyxo High). Users aged 13 to 17 may use the free tier only with parental or legal guardian consent and supervision. By creating an account, you represent and warrant that you possess full legal capacity to enter into these Terms.
            </p>
          </section>

          {/* 2. License to Use */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Award className="w-5 h-5 text-[#CCFF00]" />
              2. License to Use Calyxo
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Calyxo grants you a personal, revocable, non-exclusive, non-transferable, non-sublicensable license to access and use the Calyxo software on your devices. All rights, title, source code, design systems, and algorithms remain the exclusive intellectual property of Calyxo Health Technologies Private Limited.
            </p>
          </section>

          {/* 3. Prohibited Conduct */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              3. Prohibited Activities
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-400 text-xs sm:text-sm">
              <li>Reverse engineer, decompile, scrape, copy, or extract proprietary algorithms or APIs.</li>
              <li>Circumvent subscription tiers, payment verification signatures, or rate limits.</li>
              <li>Inject malicious scripts or attempt prompt extraction attacks against AI engines.</li>
              <li>Falsify sensor records or impersonate other users' fitness profiles.</li>
            </ul>
          </section>

          {/* 4. Subscriptions & Billing */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#CCFF00]" />
              4. Subscriptions, Payments & Auto-Renewal
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Paid plans (Calyxo High Monthly at ₹2, Annual VIP at ₹199) auto-renew automatically unless cancelled at least 24 hours prior to the next billing cycle. Transactions are processed via Razorpay or the Apple/Google app stores. Fees are non-refundable except where mandated by statutory consumer protection law.
            </p>
          </section>

          {/* 5. Limitation of Liability */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#CCFF00]" />
              5. Limitation of Liability & Warranty
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Calyxo is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Under no circumstances will Calyxo's total aggregate liability exceed the total amount paid by you in the preceding 12 months, or ₹1,000 INR.
            </p>
          </section>

          {/* 6. Governing Law & Arbitration */}
          <section className="space-y-3 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-[#CCFF00]" />
              6. Governing Law & Dispute Resolution
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              These Terms shall be governed by and construed in accordance with the substantive laws of the <strong>Republic of India</strong>. All disputes arising from these Terms shall be resolved exclusively through confidential binding individual arbitration in <strong>Bengaluru, Karnataka, India</strong> under the Arbitration and Conciliation Act, 1996.
            </p>
          </section>

          {/* 7. Contact & Legal Notices */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-white/[0.04] border border-white/15">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">
              7. Legal Notices & Grievance Contact
            </h2>
            <div className="font-mono text-xs text-gray-300 space-y-1.5">
              <p><strong className="text-white font-sans">Entity:</strong> Calyxo Health Technologies Private Limited</p>
              <p><strong className="text-white font-sans">Grievance Officer:</strong> Supreeth Kiran</p>
              <p><strong className="text-white font-sans">Legal Email:</strong> legal@calyxo.app / supreethkiran23@gmail.com</p>
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
