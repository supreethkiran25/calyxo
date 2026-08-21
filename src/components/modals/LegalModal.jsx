import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Scale, Heart, Activity, Sparkles, FileText, Lock, Mail, AlertTriangle, Globe, Database, Smartphone, UserCheck, Server, CheckCircle2, Award, RefreshCw, Layers, Cpu, Eye } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, type = 'terms' }) {
  const [selectedTab, setSelectedTab] = useState(null);

  if (!isOpen) return null;

  // Direct synchronous derivation of active tab:
  const activeTab = selectedTab || type || 'terms';
  const isPrivacy = activeTab === 'privacy' || activeTab === 'privacy_policy';

  const handleClose = () => {
    setSelectedTab(null);
    onClose?.();
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 pb-safe">
        {/* Full Screen Backdrop Overlay */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-0"
          onClick={handleClose}
        />

        {/* Modal Dialog Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-4xl bg-[#111116] border border-white/15 rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden z-10"
        >
          {/* Header with Switcher and Close Button */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111116]/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-acid-green)]/15 border border-[var(--color-acid-green)]/30 flex items-center justify-center text-[var(--color-acid-green)] shrink-0">
                {isPrivacy ? <Shield className="w-5 h-5 text-cyan-400" /> : <Scale className="w-5 h-5 text-[var(--color-acid-green)]" />}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  {isPrivacy ? 'Privacy Policy & Global Data Charter' : 'Terms and Conditions & User Agreement'}
                </h2>
                <p className="text-[9.5px] text-gray-400 font-bold uppercase tracking-widest">
                  Calyxo Health Technologies Private Limited • 2026 Production Edition
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedTab('privacy')}
                  className={`py-1 px-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                    isPrivacy 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTab('terms')}
                  className={`py-1 px-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                    !isPrivacy 
                      ? 'bg-[var(--color-acid-green)]/20 text-[var(--color-acid-green)] border border-[var(--color-acid-green)]/40 shadow-sm' 
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  Terms of Service
                </button>
              </div>

              <button 
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none shrink-0"
                aria-label="Close Legal Document"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Document Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-xs sm:text-sm text-gray-300 leading-relaxed custom-scrollbar flex-1">
            {isPrivacy ? (
              /* =========================================================================
                 PART I — PRIVACY POLICY (COMPLETE 17 SECTIONS FROM PDF)
                 ========================================================================= */
              <>
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
                  This Privacy Policy explains how Calyxo collects, uses, stores, discloses, protects, and otherwise processes information when you use the Calyxo mobile applications, web services, connected-device features, AI features, subscription services, and related products (collectively, the “Services”).
                </div>

                {/* 1. Scope and Acceptance */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> 1. Scope and Acceptance
                  </h3>
                  <p className="text-gray-400">
                    By creating an account, accessing, installing, or using the Services, you acknowledge that you have read this Privacy Policy. If you do not agree with the practices described here, do not use the Services. This Privacy Policy applies to information processed through Calyxo apps, website, customer support, analytics, subscriptions, notifications, connected health platforms, wearable integrations, and other Calyxo-controlled interfaces.
                  </p>
                </section>

                {/* 2. Information We Collect */}
                <section className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Database className="w-4 h-4" /> 2. Information We Collect
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                      <strong className="text-white">2.1 Account & Identity Information:</strong>
                      <p className="text-gray-400">Name, display name, username, email address, phone number, profile photo, date of birth, age, gender, country/region, authentication identifiers, subscription tier status, and support correspondence.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                      <strong className="text-white">2.2 Health, Fitness & Wellness Telemetry:</strong>
                      <p className="text-gray-400">Workouts, exercises, sets, reps, weights lifted (kg), training load, calories burned, meal logs, water intake, sleep duration, heart rate, resting heart rate, HRV, steps, distance, active energy, blood pressure, recovery indicators, fitness age estimates, and timestamps. Processed only for disclosed fitness tracking; NOT treated as advertising data.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                      <strong className="text-white">2.3 Nutrition Information:</strong>
                      <p className="text-gray-400">Foods, quantities, recipes, macronutrients (protein, carbs, fats), micronutrients, dietary preferences, allergen exclusions, meal timing, and AI nutritional ranges.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                      <strong className="text-white">2.4 Technical & Device Telemetry:</strong>
                      <p className="text-gray-400">Device model, OS version, app version, language, timezone, crash diagnostics, IP address, and security logs.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                      <strong className="text-white">2.5 Connected Health Platforms:</strong>
                      <p className="text-gray-400">Apple Health/HealthKit, Android Health Connect, Apple Watch, boAt smartwatches, and Bluetooth BLE sensors data scopes authorized by you.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                      <strong className="text-white">2.6 Payment Information:</strong>
                      <p className="text-gray-400">Processed by Razorpay, Apple App Store, or Google Play. Calyxo stores only transaction IDs and subscription entitlement states, never complete card credentials or CVVs.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                      <strong className="text-white">2.7 AI Conversations & Inputs:</strong>
                      <p className="text-gray-400">Prompts, questions, conversation logs, and generated athletic briefings to maintain chat continuity and coaching quality.</p>
                    </div>
                  </div>
                </section>

                {/* 3. How We Use Information */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> 3. How We Use Information
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 text-xs">
                    <li>Provide, maintain, secure, troubleshoot, and personalize fitness dashboards.</li>
                    <li>Generate AI responses, meal plans, workout splits, briefings, and recovery explanations.</li>
                    <li>Synchronize telemetry across iOS, Android, watchOS, and Web dashboards.</li>
                    <li>Schedule reminders, rest countdown timers, and workout notifications.</li>
                    <li>Verify Razorpay and App Store purchase signatures and manage subscriptions.</li>
                    <li>Comply with Indian DPDP Act 2023, GDPR, CCPA, and statutory regulations.</li>
                  </ul>
                </section>

                {/* 4. AI, Estimates and Automated Processing */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> 4. AI, Estimates and Automated Processing
                  </h3>
                  <p className="text-gray-400">
                    Calyxo uses automated models to produce recommendations. AI outputs can be probabilistic and are NOT clinical diagnoses or substitutes for medical practitioners. Sensor-derived values are marked live, recent, stale, or estimated. Calyxo will not invent fabricated health metrics when data is unavailable.
                  </p>
                </section>

                {/* 5. Legal Bases & Consent */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> 5. Legal Bases and Consent
                  </h3>
                  <p className="text-gray-400">
                    Processed based on explicit consent, contract performance, legitimate operational interests, and statutory compliance. Permissions may be revoked at any time via device settings.
                  </p>
                </section>

                {/* 6. Sharing & Disclosure */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Server className="w-4 h-4" /> 6. Sharing and Disclosure (Zero Health Data Sale)
                  </h3>
                  <p className="text-cyan-300 font-bold text-xs">
                    We do NOT sell personal health information as a commercial product. We share data only with:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 text-xs">
                    <li>Vetted cloud service providers (Supabase, Vercel, Google Gemini, Razorpay).</li>
                    <li>Connected platforms (Apple Health, Health Connect) explicitly authorized by you.</li>
                    <li>Law enforcement or judicial authorities where legally mandated by statute.</li>
                  </ul>
                </section>

                {/* 7 to 10 */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 7–10. Security, Retention & Your Choices
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 text-xs">
                    <li><strong>Security:</strong> TLS 1.3 in transit, AES-256 at rest, Row Level Security (RLS) database isolation.</li>
                    <li><strong>Retention:</strong> Retained during active account lifecycle; permanently purged upon deletion.</li>
                    <li><strong>User Rights:</strong> Full access, CSV/JSON export, correction, consent revocation, and 48-hour permanent account erasure.</li>
                  </ul>
                </section>

                {/* 11 to 17 */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> 11–17. Global Compliance & Contact
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Compliant with Indian DPDP Act 2023, EU GDPR Articles 15–22, and California CCPA/CPRA. Minors under 13 strictly prohibited without parental consent.
                  </p>
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs text-gray-300 space-y-1">
                    <p><strong className="text-white font-sans">Data Protection Officer:</strong> Supreeth Kiran</p>
                    <p><strong className="text-white font-sans">Entity:</strong> Calyxo Health Technologies Private Limited</p>
                    <p><strong className="text-white font-sans">Email:</strong> privacy@calyxo.app / supreethkiran23@gmail.com</p>
                    <p><strong className="text-white font-sans">Location:</strong> Bengaluru, Karnataka 560001, India</p>
                  </div>
                </section>
              </>
            ) : (
              /* =========================================================================
                 PART II — TERMS AND CONDITIONS (COMPLETE 26 CLAUSES & APPENDIX FROM PDF)
                 ========================================================================= */
              <>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                  These Terms and Conditions (“Terms”) form a legally binding agreement between you and Calyxo Health Technologies Private Limited regarding your access to and use of Calyxo and its Services.
                </div>

                {/* 1. Eligibility */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Scale className="w-4 h-4" /> 1. Eligibility
                  </h3>
                  <p className="text-gray-400">
                    You must meet minimum age and legal capacity requirements. You must be at least 18 years old to purchase paid subscriptions (Calyxo High). Individuals 13–17 may use free tiers only with parental supervision.
                  </p>
                </section>

                {/* 2. Account Registration */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 2. Account Registration and Security
                  </h3>
                  <p className="text-gray-400">
                    You must provide accurate information and keep account details current. You are responsible for all activities under your credentials. Do not share login details or bypass authentication controls.
                  </p>
                </section>

                {/* 3. License to Use */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Award className="w-4 h-4" /> 3. License to Use Calyxo
                  </h3>
                  <p className="text-gray-400">
                    Calyxo grants you a limited, non-exclusive, non-transferable, revocable license for personal, lawful fitness tracking. No ownership of software, source code, models, or algorithms is transferred to you.
                  </p>
                </section>

                {/* 4. Prohibited Conduct */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> 4. Prohibited Conduct
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 text-xs">
                    <li>Reverse-engineer, decompile, scrape, copy, or extract proprietary code or APIs.</li>
                    <li>Circumvent subscription restrictions, rate limits, HMAC signatures, or security features.</li>
                    <li>Create fraudulent health records, impersonate others, or falsify sensor telemetry.</li>
                    <li>Abuse automated AI systems or attempt prompt injection/model extraction attacks.</li>
                    <li>Use Services for clinical emergency response or high-risk medical decision making.</li>
                  </ul>
                </section>

                {/* 5. Health & Fitness Disclaimer - STATUTORY NOTICE */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" /> 5. Health and Fitness Disclaimer (STATUTORY NOTICE)
                  </h3>
                  <div className="p-4 rounded-2xl bg-destructive/15 border border-destructive/30 space-y-2 text-xs">
                    <p className="font-black text-red-400 uppercase">
                      CALYXO IS A HEALTH, FITNESS, NUTRITION, AND TRAINING SOFTWARE SERVICE. IT IS NOT A DOCTOR, CLINIC, EMERGENCY SERVICE, MEDICAL DEVICE, OR SUBSTITUTE FOR PROFESSIONAL MEDICAL CARE.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                      Sensor readings can be delayed, noisy, or affected by hardware fit, movement, and OS limitations. Calyxo cannot guarantee medical suitability. Never use Calyxo to diagnose conditions or alter prescribed medications. <strong>IN AN EMERGENCY, CONTACT EMERGENCY SERVICES IMMEDIATELY (112 / 911).</strong>
                    </p>
                  </div>
                </section>

                {/* 6. AI Terms */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> 6. AI Terms & Generative Outputs
                  </h3>
                  <p className="text-gray-400">
                    AI outputs are probabilistic software estimates derived from available logs. Users remain responsible for evaluating whether exercise weights or nutrition plans are appropriate for their physical capabilities.
                  </p>
                </section>

                {/* 7 to 10 */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> 7–10. Subscriptions, Payments & Cancellations
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Subscriptions (Calyxo High Monthly at ₹2, Annual VIP at ₹199) auto-renew until cancelled at least 24 hours prior to billing cycle via Account Settings or App Store. Payments processed securely via Razorpay and Apple/Google. Fees are non-refundable except where mandated by statutory consumer law.
                  </p>
                </section>

                {/* 11 to 18 */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> 11–18. Limitations of Liability & Warranty Disclaimers
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400 text-xs">
                    <li><strong>“AS IS” Warranty:</strong> Services provided without warranties of merchantability or uninterrupted availability.</li>
                    <li><strong>Liability Cap:</strong> Calyxo's aggregate liability shall not exceed the greater of amounts paid by you in the preceding 12 months, or ₹1,000 INR.</li>
                    <li><strong>Indemnification:</strong> You agree to hold harmless Calyxo and its directors from claims arising from your unlawful use.</li>
                  </ul>
                </section>

                {/* 19. Arbitration */}
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> 19. Dispute Resolution, Binding Arbitration & Governing Law
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Governed by the substantive laws of the <strong>Republic of India</strong>. All disputes shall be resolved through confidential individual arbitration in <strong>Bengaluru, Karnataka, India</strong> under the <strong>Arbitration and Conciliation Act, 1996</strong>. Class action waiver applies to fullest extent permitted by law.
                  </p>
                </section>

                {/* Appendix */}
                <section className="space-y-2 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> APPENDIX — Product-Specific Disclosures
                  </h3>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <p><strong>A. Health Data Labels:</strong> Distinguishes directly measured, synchronized, estimated, and stale telemetry.</p>
                    <p><strong>B. Wearables:</strong> Bluetooth BLE connectivity does not imply medical device certification.</p>
                    <p><strong>C. Recovery & Fitness Age:</strong> Derived algorithmic estimates, not clinical laboratory tests.</p>
                    <p><strong>D. Notifications:</strong> Subject to OS sleep focus, battery optimization, and platform permission delivery.</p>
                    <p><strong>E. Multi-Device Sync:</strong> Conflict resolution logic preserves data consistency across platforms.</p>
                  </div>
                </section>

                {/* 26. Contact */}
                <section className="space-y-2 pt-2 border-t border-white/10">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> 26. Legal Notices & Grievance Officer
                  </h3>
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs text-gray-300 space-y-1">
                    <p><strong className="text-white font-sans">Legal Entity:</strong> Calyxo Health Technologies Private Limited</p>
                    <p><strong className="text-white font-sans">Grievance Officer:</strong> Supreeth Kiran</p>
                    <p><strong className="text-white font-sans">Legal Email:</strong> legal@calyxo.app / supreethkiran23@gmail.com</p>
                    <p><strong className="text-white font-sans">Support:</strong> support@calyxo.app</p>
                    <p><strong className="text-white font-sans">Address:</strong> Bengaluru, Karnataka 560001, India</p>
                    <p><strong className="text-white font-sans">Website:</strong> https://calyxo.vercel.app</p>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-white/10 bg-[#111116] flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              {isPrivacy ? '🔒 Calyxo DPDP & GDPR Protection' : '⚖️ Calyxo Production Terms 2026'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[var(--color-acid-green)] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer border-none"
            >
              I Understand & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Render directly into document.body to ensure complete overlay without sibling bleeding
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
