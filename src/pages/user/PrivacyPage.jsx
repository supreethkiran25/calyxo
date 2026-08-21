import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Server, Smartphone, Heart, UserCheck, FileText, Mail, Globe, CheckCircle2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.06 }
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
          <Shield className="w-4 h-4" /> Global Privacy Standard & Data Charter
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">Privacy Policy</h1>
        <p className="text-[var(--muted-foreground)] text-xs sm:text-sm mt-1">
          Effective Date: January 1, 2026 • Last Revised: August 2026 • Compliant with Indian DPDP Act 2023, EU GDPR, CCPA/CPRA & Apple HealthKit Data Guidelines
        </p>
      </div>

      <motion.div variants={itemVariants} className="bg-[var(--surface)] p-6 sm:p-10 rounded-3xl border border-[var(--card-border)] shadow-2xl space-y-8 text-[var(--foreground)] text-xs sm:text-sm leading-relaxed">
        
        {/* Section 1 - OUR CORE COMMITMENT */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> 1. Our Core Privacy Commitment
          </h3>
          <p className="text-[var(--muted-foreground)]">
            At Calyxo Health Technologies Private Limited (“<strong>Calyxo</strong>”, “<strong>we</strong>”, “<strong>us</strong>”), your physical health telemetry, dietary records, and biometric measurements represent your most personal data.
          </p>
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
            <p className="font-bold text-cyan-300 text-xs">
              🛡️ OUR UNCOMPROMISING DATA GUARANTEES:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[var(--muted-foreground)] text-xs">
              <li><strong>Zero Sale of Health Data:</strong> We NEVER sell, rent, or lease your personal biometric, nutritional, or workout data to data brokers, advertising networks, or insurance companies.</li>
              <li><strong>Apple HealthKit & Google Health Connect Protection:</strong> Health data synced via Apple HealthKit or Health Connect is NEVER used for marketing or advertising purposes.</li>
              <li><strong>Complete Data Ownership:</strong> You retain 100% ownership of your logged data and can export or permanently delete your account and all associated telemetry at any time.</li>
            </ul>
          </div>
        </section>

        {/* Section 2 - INFORMATION WE COLLECT */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Database className="w-4 h-4" /> 2. Information We Collect
          </h3>
          <p className="text-[var(--muted-foreground)]">
            To provide accurate caloric calculations, progressive overload tracking, and AI fitness coaching, we collect the following categories of information:
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">A. Account & Profile Information</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                Email address, full name, username, authentication identifiers (via Supabase Auth / Google OAuth / Apple Sign-In), subscription tier status, and user avatar.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">B. Biometrics & Physical Characteristics</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                Age, gender, body weight history, height, body fat percentage, resting heart rate, sleep duration, and physical fitness goals (hypertrophy, fat loss, athletic conditioning).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">C. Nutrition & Dietary Logs</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                Logged meals, food items, portion quantities, calculated macronutrients (calories, protein, carbs, fats), micronutrients, hydration/water intake logs, and dietary preferences (vegetarian, non-vegetarian, vegan, allergies).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">D. Workout & Athletic Telemetry</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                Exercise names, sets, reps, weight loaded (kg), rest interval durations, RPE ratings, personal records (1RM), and workout session timestamps.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">E. Wearable & Device Sensor Data</h4>
              <p className="text-[var(--muted-foreground)] text-xs">
                With your explicit permission: Step counts, active energy burned, resting heart rate, Heart Rate Variability (HRV), and Live Activity workout telemetry from Apple Watch, Bluetooth BLE heart rate straps, and smartphone accelerometers.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 - HOW WE USE DATA */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Eye className="w-4 h-4" /> 3. How We Use Your Information
          </h3>
          <p className="text-[var(--muted-foreground)]">
            We use collected information solely for legitimate athletic, operational, and service delivery purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Personalized Algorithms:</strong> Computing your Total Daily Energy Expenditure (TDEE), target macronutrients, recovery readiness scores, and progressive overload targets.</li>
            <li><strong>AI Coaching & Reasoning:</strong> Powering generative AI coaching (Calyxo Intelligence) to provide grounded dietary suggestions, routine modifications, and daily performance briefings.</li>
            <li><strong>Multi-Device Cloud Sync:</strong> Synchronizing your workout and food diaries across iOS, Android, Apple Watch, and Web dashboards via secure Supabase PostgreSQL databases.</li>
            <li><strong>Billing & Entitlements:</strong> Verifying Razorpay payment signatures and Apple/Google in-app purchase receipts to unlock premium features (Calyxo High).</li>
            <li><strong>Security & Anti-Fraud:</strong> Protecting our APIs against malicious abuse, automated scraping, and unauthorized access.</li>
          </ul>
        </section>

        {/* Section 4 - DATA SHARING */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Server className="w-4 h-4" /> 4. Service Providers & Third-Party Sharing
          </h3>
          <p className="text-[var(--muted-foreground)]">
            We only share minimal necessary data with vetted, enterprise-grade cloud service providers bound by strict confidentiality and data protection agreements:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Database & Authentication:</strong> Supabase Inc. (Encrypted PostgreSQL database and user authentication hosting).</li>
            <li><strong>Payment Aggregation:</strong> Razorpay Software Private Limited / Apple Inc. / Google LLC (PCI-DSS compliant payment gateways).</li>
            <li><strong>AI Inference APIs:</strong> Google Cloud / Gemini AI (Ephemeral processing of user prompts; prompts are not used to train public foundation models without consent).</li>
            <li><strong>Cloud Hosting & CDN:</strong> Vercel Inc. (Global edge distribution and serverless execution).</li>
          </ul>
        </section>

        {/* Section 5 - DATA RETENTION & RIGHT TO ERASURE */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> 5. Data Retention, Export & Right to be Forgotten
          </h3>
          <p className="text-[var(--muted-foreground)]">
            We retain your health and workout data for as long as your account remains active. You possess absolute rights over your data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Account Deletion:</strong> You can initiate complete account deletion directly from the Profile & Settings menu. Upon deletion, all your food logs, workout logs, biometric history, and user identifiers are permanently scrubbed from our active production databases within 48 hours.</li>
            <li><strong>Data Portability:</strong> You can export your historical training logs and nutrition diaries in standard CSV or JSON format at any time.</li>
          </ul>
        </section>

        {/* Section 6 - SECURITY SAFEGUARDS */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> 6. Enterprise-Grade Security Safeguards
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo employs rigorous administrative, technical, and physical security safeguards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Encryption in Transit:</strong> All communication between your device and Calyxo servers is encrypted using modern <strong>TLS 1.3</strong> protocols.</li>
            <li><strong>Encryption at Rest:</strong> Database tables and user credentials are encrypted using industry-standard <strong>AES-256</strong>.</li>
            <li><strong>Tokenized Authentication:</strong> Passwords are never stored in plaintext; authentication relies on cryptographically hashed JWT tokens with automated expiry.</li>
          </ul>
        </section>

        {/* Section 7 - GLOBAL PRIVACY RIGHTS (GDPR, CCPA, DPDP 2023) */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Globe className="w-4 h-4" /> 7. Global Privacy Rights (India DPDP Act 2023, GDPR & CCPA)
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Depending on your physical jurisdiction, you are entitled to statutory rights regarding your personal information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>India (Digital Personal Data Protection Act, 2023):</strong> Right to access summary of personal data, right to correction and erasure, right to grievance redressal, and right to nominate a representative.</li>
            <li><strong>European Economic Area & UK (GDPR):</strong> Right of access (Art. 15), Right to rectification (Art. 16), Right to erasure (Art. 17), Right to restrict processing (Art. 18), and Right to data portability (Art. 20).</li>
            <li><strong>California Residents (CCPA/CPRA):</strong> Right to know what personal information is collected, right to delete, right to correct, and right to non-discrimination for exercising privacy rights.</li>
          </ul>
        </section>

        {/* Section 8 - CHILDREN'S PRIVACY */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Heart className="w-4 h-4" /> 8. Children's Privacy (COPPA Compliance)
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo does not knowingly collect or solicit personal information from children under 13 years of age. If we learn that we have inadvertently collected personal data from a child under 13 without verified parental consent, we will promptly delete that information from our servers.
          </p>
        </section>

        {/* Section 9 - CONTACT & DPO */}
        <section className="space-y-3 pt-2 border-t border-[var(--card-border)]">
          <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> 9. Data Protection Officer (DPO) & Contact
          </h3>
          <p className="text-[var(--muted-foreground)]">
            If you have questions, data subject access requests (DSAR), or privacy inquiries, contact our Data Protection Officer:
          </p>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 font-mono text-xs text-[var(--muted-foreground)]">
            <p><strong className="text-white font-sans">Data Protection Officer:</strong> Supreeth Kiran</p>
            <p><strong className="text-white font-sans">Entity:</strong> Calyxo Health Technologies Private Limited</p>
            <p><strong className="text-white font-sans">Email:</strong> privacy@calyxo.app / supreethkiran23@gmail.com</p>
            <p><strong className="text-white font-sans">Address:</strong> Bengaluru, Karnataka 560001, India</p>
          </div>
        </section>

      </motion.div>
    </motion.div>
  );
}
