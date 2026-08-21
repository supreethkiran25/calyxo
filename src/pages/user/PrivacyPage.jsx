import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Server, Smartphone, Heart, UserCheck, FileText, Mail, Globe, CheckCircle2, AlertTriangle, Sparkles, Cpu, Layers } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 }
};

export default function PrivacyPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl pb-20 mx-auto"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1">
          <Shield className="w-4 h-4" /> Global Privacy Policy & Data Charter
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">Privacy Policy</h1>
        <p className="text-[var(--muted-foreground)] text-xs sm:text-sm mt-1 leading-relaxed">
          Effective Date: January 1, 2026 • Last Updated: August 2026 • Data Controller: Calyxo Health Technologies Private Limited • Registered Address: Bengaluru, Karnataka 560001, India
        </p>
      </div>

      <motion.div variants={itemVariants} className="bg-[var(--surface)] p-6 sm:p-10 rounded-3xl border border-[var(--card-border)] shadow-2xl space-y-8 text-[var(--foreground)] text-xs sm:text-sm leading-relaxed">
        
        {/* Intro */}
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
          This Privacy Policy explains how Calyxo collects, uses, stores, discloses, protects, and otherwise processes information when you use the Calyxo mobile applications, web services, connected-device features, AI features, subscription services, and related products (collectively, the “Services”).
        </div>

        {/* 1. Scope and Acceptance */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Globe className="w-4 h-4" /> 1. Scope and Acceptance
          </h3>
          <p className="text-[var(--muted-foreground)]">
            By creating an account, accessing, installing, or using the Services, you acknowledge that you have read this Privacy Policy. If you do not agree with the practices described here, do not use the Services. This Privacy Policy applies to information processed through the Calyxo apps, website, customer support, analytics, subscription and payment flows, notifications, connected health platforms, wearable integrations, and other Calyxo-controlled interfaces.
          </p>
          <p className="text-[var(--muted-foreground)]">
            Where a feature has a separate notice or consent screen, that notice supplements this Privacy Policy. If there is a conflict, the more specific notice will govern the relevant processing to the extent required by applicable law.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section className="space-y-4">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Database className="w-4 h-4" /> 2. Information We Collect
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">2.1 Account and Identity Information</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                Name, display name, username, email address, phone number, profile photograph, date of birth or age, gender information where voluntarily supplied, country/region, and account credentials or authentication identifiers. Account role, subscription tier, entitlement status, feature access, referral information, and lifecycle events. Information you provide when contacting support, reporting an issue, submitting feedback, or participating in surveys or promotions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">2.2 Health, Fitness and Wellness Information</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                Depending on the features you enable, Calyxo may process highly sensitive health and wellness information, including workout records, exercises, sets, repetitions, weights lifted (kg), training volume load, calories burned, nutrition and meal logs, water intake, sleep duration, heart rate, resting heart rate, Heart Rate Variability (HRV) where available, steps, distance, active energy, body measurements, blood pressure readings from supported devices, recovery indicators, fitness age estimates, and related timestamps.
              </p>
              <p className="text-cyan-300 text-[11px] font-medium">
                🛡️ Calyxo processes such information only for disclosed athletic tracking and subject to explicit consent and contractual lawful bases. Health information is NOT treated as ordinary advertising data.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">2.3 Nutrition Information</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                Foods, quantities, recipes, meals, calories, macronutrients (protein, carbohydrates, fats), micronutrients, dietary preferences, allergies or restrictions if you choose to enter them, meal timing, and nutrition goals. AI-generated estimates and derived nutritional ranges. Estimates contain uncertainty and are not guaranteed clinical laboratory measurements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">2.4 Device and Technical Information</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                Device model, operating-system version, app version, language, timezone, country/region, device identifiers, installation identifiers, network information, crash diagnostics, performance telemetry, and security events. IP address and approximate network-derived location where technically necessary for security, localization, fraud prevention, or service operation. Application state, diagnostic logs, and feature interactions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">2.5 Connected Health Platforms and Wearables</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                If you authorize integrations such as Apple Health/HealthKit, Android Health Connect, Apple Watch, supported boAt devices or companion services, or supported Bluetooth Low Energy (BLE) sensors, Calyxo receives only the data types and access scopes you authorize and that the relevant platform makes available. Compatibility and data availability vary by model, firmware, OS, region, and platform permissions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">2.6 Payment Information</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                Payments are processed by third-party payment providers such as Razorpay, Apple App Store, or Google Play billing systems. Calyxo receives transaction identifiers, payment status, subscription duration, refund information, and limited billing metadata rather than storing complete payment-card credentials or CVVs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">2.7 AI Conversations and Inputs</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                If you use Calyxo AI, we process your prompts, questions, uploaded or supplied context, conversation history, generated responses, and relevant account/health context needed to provide the requested feature. Certain AI outputs are stored to maintain chat history, personalization, safety, quality, and continuity, subject to your controls.
              </p>
            </div>
          </div>
        </section>

        {/* 3. How We Use Information */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Eye className="w-4 h-4" /> 3. How We Use Information
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li>Provide, maintain, secure, troubleshoot, and personalize the Services.</li>
            <li>Create health, fitness, nutrition, recovery, workout, hydration, and coaching views requested by you.</li>
            <li>Generate AI responses, meal plans, workout splits, briefings, reports, explanations, and other personalized athletic outputs.</li>
            <li>Synchronize data across your authorized devices and platforms and resolve synchronization conflicts.</li>
            <li>Schedule reminders, push notifications, rest countdown timers, workout alerts, and user-requested communications.</li>
            <li>Process subscriptions, verify purchases via HMAC signatures, manage entitlements, detect payment fraud, and handle refunds.</li>
            <li>Measure reliability, diagnose crashes, prevent abuse, detect security incidents, and optimize performance.</li>
            <li>Comply with legal obligations under DPDP Act 2023, GDPR, CCPA, enforce agreements, and protect user safety.</li>
          </ul>
        </section>

        {/* 4. AI, Estimates and Automated Processing */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> 4. AI, Estimates and Automated Processing
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo uses automated systems and AI models to analyze telemetry and generate athletic recommendations. AI outputs can be probabilistic, incomplete, or incorrect. Calyxo does NOT represent AI-generated health, nutrition, recovery, fitness-age, or training outputs as medical diagnoses or as substitutes for licensed healthcare professionals.
          </p>
          <p className="text-[var(--muted-foreground)]">
            Where practical, Calyxo displays provenance, freshness, and confidence indicators. Sensor-derived values are marked live, recent, stale, unavailable, or estimated. If source data is unavailable, Calyxo will not represent a fabricated value as a measured metric. Never rely on Calyxo AI for emergencies, medical diagnoses, or prescription alterations.
          </p>
        </section>

        {/* 5. Legal Bases and Consent */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <FileText className="w-4 h-4" /> 5. Legal Bases and Consent
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Depending on your jurisdiction, we process information based on explicit consent, performance of a contract, legitimate athletic and operational interests, compliance with statutory obligations, or protection of vital interests. You may withdraw permissions through device or platform settings at any time.
          </p>
        </section>

        {/* 6. Sharing and Disclosure */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Server className="w-4 h-4" /> 6. Sharing and Disclosure
          </h3>
          <p className="text-[var(--muted-foreground)] font-bold text-cyan-300">
            We do NOT sell personal health information as a product. We disclose information only in the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Service Providers & Processors:</strong> Entities hosting cloud databases (Supabase), serverless edge compute (Vercel), AI inference (Google Gemini), analytics, and payment gateways (Razorpay, Apple, Google).</li>
            <li><strong>Connected Platforms:</strong> Apple HealthKit, Health Connect, or paired BLE devices when explicitly authorized by you.</li>
            <li><strong>Corporate Transactions:</strong> Mergers, acquisitions, financing, or sale of assets, subject to strict confidentiality safeguards.</li>
            <li><strong>Legal & Regulatory Demands:</strong> Judicial or law-enforcement requests where disclosure is legally mandated by law.</li>
            <li><strong>Aggregated/De-identified Data:</strong> Telemetry stripped of all identifying tokens that cannot reasonably identify you.</li>
          </ul>
        </section>

        {/* 7. Third-Party Services */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> 7. Third-Party Services
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo relies on trusted third parties for infrastructure, authentication, analytics, AI processing, cloud storage, payments, notifications, and wearable companion connectivity. Examples include Apple Inc., Google LLC, Razorpay Software Private Limited, Supabase Inc., and Vercel Inc.
          </p>
        </section>

        {/* 8. Data Retention */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Layers className="w-4 h-4" /> 8. Data Retention
          </h3>
          <p className="text-[var(--muted-foreground)]">
            We retain information for as long as reasonably necessary to provide the Services, maintain workout history, satisfy legal obligations, resolve disputes, prevent fraud, and maintain security records. When no longer required, data is deleted, anonymized, or securely isolated.
          </p>
        </section>

        {/* 9. Security */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> 9. Security
          </h3>
          <p className="text-[var(--muted-foreground)]">
            We employ robust administrative, technical, and physical safeguards: <strong>TLS 1.3 encryption in transit</strong>, <strong>AES-256 encryption at rest</strong>, Row Level Security (RLS) database isolation, least-privilege role access, strict token authentication, and continuous security monitoring.
          </p>
        </section>

        {/* 10. Your Choices and Rights */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> 10. Your Choices and Rights
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Access & Portability:</strong> View and export your training, biometric, and nutrition history in CSV/JSON.</li>
            <li><strong>Correction & Rectification:</strong> Edit or correct any inaccurate biometric or log entry.</li>
            <li><strong>Deletion & Account Closure:</strong> Permanently scrub your entire account and telemetry.</li>
            <li><strong>Revocation of Consents:</strong> Disconnect HealthKit, Health Connect, or BLE devices at any time.</li>
            <li><strong>Regulatory Recourse:</strong> Lodge complaints with applicable data protection authorities.</li>
          </ul>
        </section>

        {/* 11. Children's Privacy */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Heart className="w-4 h-4" /> 11. Children's Privacy
          </h3>
          <p className="text-[var(--muted-foreground)]">
            The Services are not intended for children below 13 years of age (or minimum statutory age). We do not knowingly collect personal information from children in violation of law. If you believe a minor has registered improperly, contact us for immediate investigation and data purging.
          </p>
        </section>

        {/* 12. International Transfers */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Globe className="w-4 h-4" /> 12. International Data Transfers
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Information may be processed on secure servers located in India, the European Union, and the United States using Standard Contractual Clauses (SCCs) and statutory data transfer safeguards.
          </p>
        </section>

        {/* 13. Cookies & Technologies */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> 13. Cookies, Local Storage & Offline Cache
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo uses local storage, session storage, and IndexedDB caching to facilitate offline workout logging, session recovery, theme preferences, and security token management.
          </p>
        </section>

        {/* 14. Marketing Communications */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> 14. Marketing Communications
          </h3>
          <p className="text-[var(--muted-foreground)]">
            You may opt out of promotional emails or coaching digests via the unsubscribe link in any message. Essential transactional, billing, security, and account notices will continue to be delivered.
          </p>
        </section>

        {/* 15. Data Deletion & Account Closure */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> 15. Data Deletion & 48-Hour Purge Protocol
          </h3>
          <p className="text-[var(--muted-foreground)]">
            You can request complete account deletion directly from the Profile Settings tab. Upon submission, all workout logs, nutrition records, AI conversation histories, and biometrics are permanently purged from active production databases within 48 hours.
          </p>
        </section>

        {/* 16. Changes to Privacy Policy */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 16. Changes to this Privacy Policy
          </h3>
          <p className="text-[var(--muted-foreground)]">
            We may update this policy to reflect changes to the Services, statutory laws, or security protocols. Material changes will be communicated via in-app banner or email notice with a revised effective date.
          </p>
        </section>

        {/* 17. Contact & DPO */}
        <section className="space-y-3 pt-4 border-t border-[var(--card-border)]">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> 17. Privacy Contact & Data Protection Officer
          </h3>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 font-mono text-xs text-[var(--muted-foreground)]">
            <p><strong className="text-white font-sans">Legal Entity:</strong> Calyxo Health Technologies Private Limited</p>
            <p><strong className="text-white font-sans">Data Protection Officer:</strong> Supreeth Kiran</p>
            <p><strong className="text-white font-sans">Privacy Email:</strong> privacy@calyxo.app / supreethkiran23@gmail.com</p>
            <p><strong className="text-white font-sans">Registered Address:</strong> Bengaluru, Karnataka 560001, India</p>
            <p><strong className="text-white font-sans">Website:</strong> https://calyxo.vercel.app</p>
          </div>
        </section>

      </motion.div>
    </motion.div>
  );
}
