import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, FileText, Bot, Lock, Scale, Mail } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.08 }
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
      className="space-y-8 max-w-4xl pb-16"
    >
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">
          <Shield className="w-4 h-4" /> Comprehensive Legal Framework
        </div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">Privacy Policy</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          Compliant with DPDP Act 2023 (India), IT Act 2000 & SPDI Rules, GDPR (EU), and CCPA (US) • Last Revised: 2026
        </p>
      </div>

      <motion.div variants={itemVariants} className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-[var(--card-border)] shadow-lg space-y-6 text-[var(--foreground)] text-xs leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> 1. Overview & Data Fiduciary Details
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the Calyxo Health Operating System, mobile applications, widgets, and live athletic telemetry services. As a <strong>Data Fiduciary</strong> under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and applicable international regulations (including the EU GDPR and California CCPA/CPRA), we are committed to processing your personal and biometric data transparently, ethically, and securely.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 2. Sensitive Personal Data & HealthKit / Health Connect Processing
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo processes health-related Sensitive Personal Data or Information (SPDI) under the <strong>Information Technology (SPDI) Rules, 2011</strong>. When you connect Apple Health (HealthKit), Android Health Connect, or paired wearables (Apple Watch, Garmin, WHOOP, Oura, Galaxy Watch), we access only authorized metrics (active energy, steps, heart rate, workouts).
          </p>
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] space-y-2 mt-2">
            <span className="font-black text-[var(--foreground)] block text-[11px] uppercase tracking-wider text-emerald-400">Strict Statutory & Platform Compliance Guarantees:</span>
            <ul className="list-disc list-inside space-y-1 text-[var(--muted-foreground)] text-[11px]">
              <li><strong>Zero Advertising Exploitation:</strong> Health and biometric data is <strong>NEVER</strong> used for advertising, marketing, or behavioural profiling.</li>
              <li><strong>No Third-Party Sale:</strong> We <strong>NEVER</strong> sell, monetize, lease, or trade your health data to data brokers, advertising networks, or insurance agencies.</li>
              <li><strong>Encrypted Sandboxing:</strong> Wearable metrics are processed directly on-device and synced to personal encrypted tables protected by Row Level Security (RLS).</li>
            </ul>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <FileText className="w-4 h-4" /> 3. Categories of Data Collected
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-[var(--muted-foreground)]">
            <li><strong>Identity & Account Data:</strong> Name, username, email address, password hash, and OAuth authentication tokens.</li>
            <li><strong>Biometric & Metrological Profile:</strong> Age, biological sex, height, weight, body composition targets, and weekly activity coefficient.</li>
            <li><strong>Nutritional Intake & Diet Logs:</strong> Food names, portions, timestamps, caloric content, and macronutrients (protein, carbohydrates, dietary fat).</li>
            <li><strong>Athletic Conditioning Telemetry:</strong> Exercise names, sets, reps, weight loads, rest timer durations, and workout timestamps.</li>
            <li><strong>Device & OS Identifiers:</strong> APNs / FCM push notification tokens and sandboxed App Group preferences for iOS/Android Home Screen widgets.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Bot className="w-4 h-4" /> 4. AI Generative Intelligence & Model Boundaries
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo integrates Google Gemini AI models to generate personalized workout routines and customized macro suggestions. All AI requests are dispatched through secure serverless backend functions. Prompts contain only anonymized fitness parameters. No personal credentials, contact info, or raw identity records are transmitted to or stored by external generative AI providers for foundational model training.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> 5. Data Security, Storage & Coach Access Isolation
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Your data is stored in enterprise-grade cloud databases with TLS 1.3 encryption in transit and AES-256 at rest. All database queries enforce Supabase Row Level Security (RLS) guaranteeing that no other user can access your metrics. If you connect with a coach, that trainer is granted read-only telemetry access solely for the duration of your verified partnership; you may terminate access at any instant.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Scale className="w-4 h-4" /> 6. Data Principal Rights & 1-Tap Account Erasure
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Under Chapter III of the <strong>DPDP Act 2023</strong> and Articles 15&ndash;22 of the <strong>GDPR</strong>, you have the statutory right to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[var(--muted-foreground)]">
            <li>Obtain a summary of personal data being processed.</li>
            <li>Request correction or updating of inaccurate biometric records.</li>
            <li>Request <strong>permanent erasure and deletion</strong> of your account and all associated health history directly via Account Settings.</li>
            <li>Withdraw consent at any time without affecting the lawfulness of prior processing.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> 7. Grievance Redressal Officer (India)
          </h3>
          <p className="text-[var(--muted-foreground)]">
            In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Section 12 of the DPDP Act 2023, the details of the Grievance Officer are:
          </p>
          <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] space-y-1 text-[var(--muted-foreground)] text-[11px]">
            <p><strong>Designation:</strong> Grievance Redressal Officer</p>
            <p><strong>Entity:</strong> Calyxo Health Technologies Private Limited</p>
            <p><strong>Email:</strong> <a href="mailto:grievance@calyxo.com" className="text-emerald-400 underline font-bold">grievance@calyxo.com</a> (cc: <a href="mailto:privacy@calyxo.com" className="text-emerald-400 underline font-bold">privacy@calyxo.com</a>)</p>
            <p><strong>Response Time:</strong> Acknowledgment within 24 hours; resolution within 15 working days.</p>
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
}
