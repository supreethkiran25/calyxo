import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Shield, FileText, Heart, Activity, Mail, Sparkles, HelpCircle, ChevronRight, Scale } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 }
};

// ─── ABOUT PAGE ───
export function AboutPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-black text-foreground">About Calyxo</h1>
        <p className="text-muted text-sm mt-1">Track Today. Transform Tomorrow.</p>
      </div>

      <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border border-card-border shadow-lg space-y-4">
        <h2 className="text-lg font-black text-acid-green flex items-center gap-2">
          <Activity className="w-5 h-5" /> The Health Operating System
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Calyxo is a premium, unified fitness and nutrition platform built to bridge the gap between clients and elite coaches. Our mission is to combine state-of-the-art tracking engines, interactive 3D indicators, gamified leveling loops, and professional trainer CRM workflows into a singular, cohesive health operating system.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-surface border border-card-border p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-acid-green/10 flex items-center justify-center text-acid-green">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm">AI Health Twin</h3>
          <p className="text-xs text-muted">Deep learning engine that analyzes your weight logs, macro intake, sleep cycles, and physical workouts to predict recovery indices and biological trends.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface border border-card-border p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm">Coaching Integrations</h3>
          <p className="text-xs text-muted">Direct trainer-client pipelines enabling real-time workout assignment, diet plan prescriptions, calendar meetings, and messaging vaults.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface border border-card-border p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm">Ecosystem & XP</h3>
          <p className="text-xs text-muted">Every logged food item, completed workout, and hydration milestone grants experience points (XP) to fuel your health score leveling system.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── HELP & SUPPORT ───
export function SupportPage() {
  const faqs = [
    { q: "How do I connect with my personal trainer?", a: "Navigate to the 'My Coach' tab in the navigation menu. Enter your trainer's invite code or browse available trainer profiles to send a connection request. Once accepted, your coach can assign custom workouts and nutrition guidelines." },
    { q: "What is the AI Health Twin?", a: "The AI Health Twin compiles your logged metrics, sleeping schedule, and daily calorie burns to compute a daily health recovery score (0-100%) and project weight predictions for the next 30 to 180 days." },
    { q: "How can I edit my daily calorie targets?", a: "Go to your 'Profile' page. Tap 'Adjust Biometrics' to update your weight, height, age, activity level, and goal (gains, maintenance, weight loss). The system will automatically recalculate your baseline targets." }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-black text-foreground">Help & Support</h1>
        <p className="text-muted text-sm mt-1">Get answers to questions and contact our support team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-acid-green flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-surface border border-card-border p-5 rounded-2xl">
              <h4 className="font-bold text-sm text-foreground">{faq.q}</h4>
              <p className="text-xs text-muted mt-2 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border border-card-border h-fit space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-acid-green/10 flex items-center justify-center text-acid-green mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-black text-lg">Still Need Help?</h3>
          <p className="text-xs text-muted leading-relaxed">Our athletic support team is available 24/7. Reach out directly and we will get back to you within 12 hours.</p>
          <a href="mailto:support@calyxo.com" className="block w-full py-3 bg-acid-green text-black rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all">
            Contact Support
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── PRIVACY POLICY ───
export function PrivacyPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl pb-16"
    >
      <div>
        <div className="flex items-center gap-2 text-acid-green text-xs font-black uppercase tracking-widest mb-1">
          <Shield className="w-4 h-4" /> Comprehensive Legal Framework
        </div>
        <h1 className="text-3xl font-black text-foreground">Privacy Policy</h1>
        <p className="text-muted text-sm mt-1">
          Compliant with DPDP Act 2023 (India), IT Act 2000 & SPDI Rules, GDPR (EU), and CCPA (US) • Last Revised: 2026
        </p>
      </div>

      <motion.div variants={itemVariants} className="glass p-6 sm:p-8 rounded-3xl border border-card-border shadow-lg space-y-6 text-foreground text-xs leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Shield className="w-4 h-4" /> 1. Overview & Data Fiduciary Details
          </h3>
          <p className="text-muted-foreground">
            Calyxo ("we", "our", or "us") operates the Calyxo Health Operating System, mobile applications, widgets, and live athletic telemetry services. As a <strong>Data Fiduciary</strong> under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and applicable international regulations (including the EU GDPR and California CCPA/CPRA), we are committed to processing your personal and biometric data transparently, ethically, and securely.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Activity className="w-4 h-4" /> 2. Sensitive Personal Data & HealthKit / Health Connect Processing
          </h3>
          <p className="text-muted-foreground">
            Calyxo processes health-related Sensitive Personal Data or Information (SPDI) under the <strong>Information Technology (SPDI) Rules, 2011</strong>. When you connect Apple Health (HealthKit), Android Health Connect, or paired wearables (Apple Watch, Garmin, WHOOP, Oura, Galaxy Watch), we access only authorized metrics (active energy, steps, heart rate, workouts).
          </p>
          <div className="p-4 rounded-2xl bg-surface/80 border border-card-border space-y-2 mt-2">
            <span className="font-black text-foreground block text-[11px] uppercase tracking-wider text-acid-green">Strict Statutory & Platform Compliance Guarantees:</span>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li><strong>Zero Advertising Exploitation:</strong> Health and biometric data is <strong>NEVER</strong> used for advertising, marketing, or behavioural profiling.</li>
              <li><strong>No Third-Party Sale:</strong> We do <strong>NEVER</strong> sell, monetize, lease, or trade your health data to data brokers, advertising networks, or insurance agencies.</li>
              <li><strong>Encrypted Sandboxing:</strong> Wearable metrics are processed directly on-device and synced to personal encrypted tables protected by Row Level Security (RLS).</li>
            </ul>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <FileText className="w-4 h-4" /> 3. Categories of Data Collected
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
            <li><strong>Identity & Account Data:</strong> Name, username, email address, password hash, and OAuth authentication tokens.</li>
            <li><strong>Biometric & Metrological Profile:</strong> Age, biological sex, height, weight, body composition targets, and weekly activity coefficient.</li>
            <li><strong>Nutritional Intake & Diet Logs:</strong> Food names, portions, timestamps, caloric content, and macronutrients (protein, carbohydrates, dietary fat).</li>
            <li><strong>Athletic Conditioning Telemetry:</strong> Exercise names, sets, reps, weight loads, rest timer durations, and workout timestamps.</li>
            <li><strong>Device & OS Identifiers:</strong> APNs / FCM push notification tokens and sandboxed App Group preferences for iOS/Android Home Screen widgets.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Bot className="w-4 h-4" /> 4. AI Generative Intelligence & Model Boundaries
          </h3>
          <p className="text-muted-foreground">
            Calyxo integrates Google Gemini AI models to generate personalized workout routines and customized macro suggestions. All AI requests are dispatched through secure serverless backend functions. Prompts contain only anonymized fitness parameters. No personal credentials, contact info, or raw identity records are transmitted to or stored by external generative AI providers for foundational model training.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Lock className="w-4 h-4" /> 5. Data Security, Storage & Coach Access Isolation
          </h3>
          <p className="text-muted-foreground">
            Your data is stored in enterprise-grade cloud databases with TLS 1.3 encryption in transit and AES-256 at rest. All database queries enforce Supabase Row Level Security (RLS) guaranteeing that no other user can access your metrics. If you connect with a coach, that trainer is granted read-only telemetry access solely for the duration of your verified partnership; you may terminate access at any instant.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Scale className="w-4 h-4" /> 6. Data Principal Rights & 1-Tap Account Erasure
          </h3>
          <p className="text-muted-foreground">
            Under Chapter III of the <strong>DPDP Act 2023</strong> and Articles 15–22 of the <strong>GDPR</strong>, you have the statutory right to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Obtain a summary of personal data being processed.</li>
            <li>Request correction or updating of inaccurate biometric records.</li>
            <li>Request <strong>permanent erasure and deletion</strong> of your account and all associated health history directly via Account Settings.</li>
            <li>Withdraw consent at any time without affecting the lawfulness of prior processing.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Mail className="w-4 h-4" /> 7. Grievance Redressal Officer (India)
          </h3>
          <p className="text-muted-foreground">
            In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Section 12 of the DPDP Act 2023, the details of the Grievance Officer are:
          </p>
          <div className="p-3.5 rounded-2xl bg-surface/80 border border-card-border space-y-1 text-muted-foreground text-[11px]">
            <p><strong>Designation:</strong> Grievance Redressal Officer</p>
            <p><strong>Entity:</strong> Calyxo Health Technologies Private Limited</p>
            <p><strong>Email:</strong> <a href="mailto:grievance@calyxo.com" className="text-acid-green underline font-bold">grievance@calyxo.com</a> (cc: <a href="mailto:privacy@calyxo.com" className="text-acid-green underline font-bold">privacy@calyxo.com</a>)</p>
            <p><strong>Response Time:</strong> Acknowledgment within 24 hours; resolution within 15 working days.</p>
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
}

// ─── TERMS OF SERVICE ───
export function TermsPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl pb-16"
    >
      <div>
        <div className="flex items-center gap-2 text-acid-green text-xs font-black uppercase tracking-widest mb-1">
          <Scale className="w-4 h-4" /> Statutory User Agreement
        </div>
        <h1 className="text-3xl font-black text-foreground">Terms of Service</h1>
        <p className="text-muted text-sm mt-1">
          Governed under the Indian Contract Act 1872 & International Consumer Standards • Last Revised: 2026
        </p>
      </div>

      <motion.div variants={itemVariants} className="glass p-6 sm:p-8 rounded-3xl border border-card-border shadow-lg space-y-6 text-foreground text-xs leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Scale className="w-4 h-4" /> 1. Acceptance of Terms & Legal Capacity
          </h3>
          <p className="text-muted-foreground">
            By creating an account, downloading, accessing, or using Calyxo, you enter into a legally binding contract with Calyxo Health Technologies under the <strong>Indian Contract Act, 1872</strong>. You represent that you are at least 18 years old (or at least 13 with parental consent) and legally capable of entering into binding contracts.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" /> 2. Comprehensive Medical & Health Disclaimer (STATUTORY NOTICE)
          </h3>
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-2">
            <p className="font-bold text-destructive text-[11px] leading-relaxed">
              CALYXO IS NOT A MEDICAL DEVICE, MEDICAL PRACTITIONER, CLINICAL PROVIDER, OR EMERGENCY SERVICE.
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              All fitness routines, caloric computations, macronutrient targets, rest interval countdowns, and AI-generated wellness insights are provided strictly for general athletic conditioning, recreational fitness tracking, and educational purposes. Calyxo does not provide medical diagnosis, treatment, prescription, or clinical monitoring.
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              <strong>Mandatory Consultation:</strong> You must consult a licensed medical physician or certified healthcare professional before initiating any new workout split, strenuous weight training program, or caloric deficit. If at any time you experience dizziness, shortness of breath, chest pain, or physical discomfort during exercise, STOP IMMEDIATELY and seek professional emergency medical care.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Activity className="w-4 h-4" /> 3. Voluntary Assumption of Risk & Total Liability Release
          </h3>
          <p className="text-muted-foreground">
            Athletic conditioning and physical exercise inherently involve risks of injury (including, without limitation, muscle strains, ligament tears, fractures, cardiovascular stress, or adverse dietary reactions). To the maximum extent permitted by applicable law, you knowingly, freely, and voluntarily assume all known and unknown risks associated with your training, and release Calyxo, its directors, developers, and affiliated trainers from any and all liability, claims, or damages arising out of your use of the application.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 4. Subscriptions, In-App Purchases & Payments
          </h3>
          <p className="text-muted-foreground">
            Certain advanced capabilities (Calyxo High, AI Twin programs, annual passes) are billed on a recurring subscription basis. Payments are processed securely via authorized payment aggregators (Razorpay / Apple In-App Purchases) in compliance with Reserve Bank of India (RBI) tokenization guidelines and Apple Store Commerce rules. You may cancel recurring renewals at any time prior to the billing cycle directly through your Account Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Shield className="w-4 h-4" /> 5. Intellectual Property & Acceptable Use
          </h3>
          <p className="text-muted-foreground">
            All code, UI designs, 3D visualizations, workout algorithms, trademarks, and logos are the exclusive intellectual property of Calyxo. You agree not to reverse-engineer, decompile, scrape, copy, or disrupt Calyxo's systems, APIs, or trainer directories.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Scale className="w-4 h-4" /> 6. Dispute Resolution, Governing Law & Jurisdiction
          </h3>
          <p className="text-muted-foreground">
            These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>. Any dispute, claim, or controversy arising out of these Terms shall be resolved by binding arbitration under the <strong>Arbitration and Conciliation Act, 1996</strong> in Bengaluru, Karnataka, India. The courts in <strong>Bengaluru, Karnataka</strong> shall have exclusive jurisdiction.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Mail className="w-4 h-4" /> 7. Legal Contact
          </h3>
          <p className="text-muted-foreground">
            For legal inquiries, notices, or support, contact our compliance team at <a href="mailto:support@calyxo.com" className="text-acid-green font-bold underline">support@calyxo.com</a>.
          </p>
        </section>
      </motion.div>
    </motion.div>
  );
}
