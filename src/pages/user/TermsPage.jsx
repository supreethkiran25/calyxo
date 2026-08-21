import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Heart, Activity, Sparkles, Shield, Mail, AlertTriangle, FileText, CheckCircle2, Lock, Globe, Database, Smartphone, RefreshCw, Cpu, Layers, Award } from 'lucide-react';

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

export default function TermsPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl pb-20 mx-auto"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">
          <Scale className="w-4 h-4" /> Production Legal Agreement & User Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">Terms and Conditions</h1>
        <p className="text-[var(--muted-foreground)] text-xs sm:text-sm mt-1 leading-relaxed">
          Effective Date: January 1, 2026 • Last Updated: August 2026 • Legal Entity: Calyxo Health Technologies Private Limited (“Calyxo”) • Bengaluru, Karnataka 560001, India
        </p>
      </div>

      <motion.div variants={itemVariants} className="bg-[var(--surface)] p-6 sm:p-10 rounded-3xl border border-[var(--card-border)] shadow-2xl space-y-8 text-[var(--foreground)] text-xs sm:text-sm leading-relaxed">
        
        {/* Intro */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
          These Terms and Conditions (“Terms”) form a legally binding agreement between you and Calyxo Health Technologies Private Limited regarding your access to and use of Calyxo, including our mobile apps, web platform, connected devices, AI coaching engines, and subscription services (collectively, the “Services”).
        </div>

        {/* 1. Eligibility */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Scale className="w-4 h-4" /> 1. Eligibility
          </h3>
          <p className="text-[var(--muted-foreground)]">
            You must meet the minimum age and legal capacity requirements applicable in your jurisdiction. You must be at least 18 years of age to purchase paid subscriptions. Users between 13 and 17 may use the Services only with the active supervision and consent of a parent or legal guardian. If you use Calyxo on behalf of an organization, you represent that you have authority to bind that organization.
          </p>
        </section>

        {/* 2. Account Registration and Security */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> 2. Account Registration and Security
          </h3>
          <p className="text-[var(--muted-foreground)]">
            You must provide accurate information and keep your account details current. You are responsible for all activities performed through your account. Do not share credentials or attempt to bypass authentication or entitlement controls.
          </p>
        </section>

        {/* 3. License to Use Calyxo */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Award className="w-4 h-4" /> 3. License to Use Calyxo
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Subject to these Terms and your entitlement status, Calyxo grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Services for personal, lawful fitness tracking purposes. No ownership of software, source code, trademarks, algorithms, datasets, or models is transferred to you.
          </p>
        </section>

        {/* 4. Prohibited Conduct */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> 4. Prohibited Conduct
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li>Reverse engineer, decompile, disassemble, scrape, copy, or attempt to discover source code or non-public APIs.</li>
            <li>Circumvent subscription restrictions, access controls, rate limits, HMAC signatures, or security mechanisms.</li>
            <li>Use Calyxo to create fraudulent health records, impersonate another person, or misrepresent sensor measurements.</li>
            <li>Upload malware, malicious code, unlawful material, or content that infringes another person's intellectual property.</li>
            <li>Abuse automated AI systems, attempt prompt injection or model extraction, or disrupt infrastructure.</li>
            <li>Use the Services for clinical medical diagnosis, emergency response, or other high-risk medical scenarios.</li>
            <li>Resell, sublicense, or commercially exploit the Services without express written authorization.</li>
          </ul>
        </section>

        {/* 5. Health and Fitness Disclaimer - STATUTORY NOTICE */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" /> 5. Health and Fitness Disclaimer (STATUTORY NOTICE)
          </h3>
          <div className="p-5 rounded-2xl bg-destructive/15 border border-destructive/30 space-y-3">
            <p className="font-black text-red-400 text-xs uppercase tracking-wide">
              CALYXO IS A HEALTH, FITNESS, NUTRITION, WELLNESS, AND TRAINING SOFTWARE SERVICE. IT IS NOT A DOCTOR, CLINIC, EMERGENCY SERVICE, MEDICAL DEVICE, OR SUBSTITUTE FOR PROFESSIONAL MEDICAL CARE.
            </p>
            <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
              Sensor readings can be unavailable, delayed, noisy, inaccurate, or affected by device fit, environment, firmware, connectivity, user movement, and platform limitations. Calyxo cannot guarantee the accuracy, completeness, timeliness, or medical suitability of any reading or recommendation.
            </p>
            <p className="text-[var(--muted-foreground)] text-xs leading-relaxed font-bold text-white">
              Never use Calyxo to diagnose a medical condition, determine emergency treatment, alter prescribed medication, or delay professional medical care. IN AN EMERGENCY, IMMEDIATELY CONTACT LOCAL EMERGENCY SERVICES (112 / 911).
            </p>
          </div>
        </section>

        {/* 6. AI Terms */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> 6. AI Terms & Generative Intelligence
          </h3>
          <p className="text-[var(--muted-foreground)]">
            AI features may generate summaries, plans, explanations, estimates, food alternatives, and recommendations. Outputs are generated from available context and may be incorrect. You remain responsible for deciding whether an output is appropriate. AI-generated nutritional values, fitness age, recovery scores, and training splits are software-derived approximations unless identified as directly measured.
          </p>
        </section>

        {/* 7. User Content */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <FileText className="w-4 h-4" /> 7. User Content
          </h3>
          <p className="text-[var(--muted-foreground)]">
            You retain ownership of custom recipes and logs you submit. You grant Calyxo a limited license to host, process, reproduce, and transmit such content as reasonably necessary to operate, secure, and personalize the Services.
          </p>
        </section>

        {/* 8. Subscriptions and Premium Features */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> 8. Subscriptions and Premium Features
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo offers free and paid tiers (Calyxo High Monthly at ₹2, Annual VIP at ₹199). Premium features include unlimited AI intelligence, live workout coaching, advanced meal planners, and wearable data sync. Access is conditional on valid entitlements.
          </p>
        </section>

        {/* 9. Payments, Billing and Refunds */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 9. Payments, Billing and Refunds
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Payments are processed via authorized providers (Razorpay, Apple App Store, Google Play). Subscriptions auto-renew until cancelled at least 24 hours prior to renewal. Fees are non-refundable except where mandated by statutory consumer protection laws or App Store/Play Store policies.
          </p>
        </section>

        {/* 10. Cancellation */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> 10. Cancellation
          </h3>
          <p className="text-[var(--muted-foreground)]">
            You may cancel a subscription at any time through Account Settings or your App Store / Google Play subscription manager. Cancellation prevents future billing cycles while maintaining access through the prepaid period.
          </p>
        </section>

        {/* 11. Third-Party Platforms and Devices */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> 11. Third-Party Platforms and Devices
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo depends on third-party OS environments, health platforms (Apple HealthKit, Health Connect), and wearable manufacturers (Apple Watch, boAt, BLE sensors). Compatibility may vary by firmware, model, and OS permissions.
          </p>
        </section>

        {/* 12. Availability and Service Changes */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Layers className="w-4 h-4" /> 12. Availability and Changes to the Service
          </h3>
          <p className="text-[var(--muted-foreground)]">
            We may update, modify, or discontinue features for maintenance, security, or product evolution. We do not guarantee that the Services will be uninterrupted or error-free at all times.
          </p>
        </section>

        {/* 13. Intellectual Property */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> 13. Intellectual Property
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo and its licensors retain all rights, title, and interest in and to the Services, trademarks, visual designs, algorithms, codebases, and brand assets.
          </p>
        </section>

        {/* 14. Feedback */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> 14. Feedback
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Suggestions and bug reports submitted to Calyxo may be utilized without compensation or obligation, preserving your underlying privacy rights.
          </p>
        </section>

        {/* 15. Suspension and Termination */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> 15. Suspension and Termination
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo may suspend or terminate access for fraud, abuse, credential sharing, unauthorized scraping, or material Terms violations.
          </p>
        </section>

        {/* 16. Disclaimers */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> 16. Comprehensive Warranty Disclaimers
          </h3>
          <p className="text-[var(--muted-foreground)]">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICES ARE PROVIDED ON AN “<strong>AS IS</strong>” AND “<strong>AS AVAILABLE</strong>” BASIS WITHOUT WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR UNINTERRUPTED AVAILABILITY.
          </p>
        </section>

        {/* 17. Limitation of Liability */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Scale className="w-4 h-4" /> 17. Limitation of Liability
          </h3>
          <p className="text-[var(--muted-foreground)]">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, CALYXO’S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICES SHALL BE LIMITED TO THE GREATER OF (A) AMOUNTS PAID BY YOU TO CALYXO IN THE PRECEDING TWELVE (12) MONTHS, OR (B) ₹1,000 INR.
          </p>
        </section>

        {/* 18. Indemnification */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> 18. Indemnification
          </h3>
          <p className="text-[var(--muted-foreground)]">
            You agree to defend, indemnify, and hold harmless Calyxo, its directors, employees, and licensors from liabilities, damages, and costs arising from your unlawful use of the Services or Terms violation.
          </p>
        </section>

        {/* 19. Dispute Resolution and Governing Law */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Globe className="w-4 h-4" /> 19. Dispute Resolution, Arbitration & Governing Law
          </h3>
          <p className="text-[var(--muted-foreground)]">
            These Terms are governed by the laws of the <strong>Republic of India</strong>. Disputes shall be resolved through confidential individual arbitration in <strong>Bengaluru, Karnataka, India</strong> under the <strong>Arbitration and Conciliation Act, 1996</strong>.
          </p>
        </section>

        {/* 20 to 25 */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <FileText className="w-4 h-4" /> 20–25. General Contractual Provisions
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Force Majeure:</strong> Calyxo is not liable for delays caused by natural disasters, telecommunications outages, cloud failures, or platform API changes.</li>
            <li><strong>Severability:</strong> If any provision is deemed unenforceable, remaining provisions remain in full force.</li>
            <li><strong>No Waiver:</strong> Failure to enforce any provision does not constitute a waiver of future enforcement.</li>
            <li><strong>Entire Agreement:</strong> These Terms and the Privacy Policy constitute the entire binding agreement between the parties.</li>
          </ul>
        </section>

        {/* Appendix - Product Specific Disclosures */}
        <section className="space-y-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Database className="w-4 h-4" /> APPENDIX — Product-Specific Disclosures
          </h3>
          <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
            <p><strong>A. Health Data Source Labels:</strong> Calyxo distinguishes between directly measured, synchronized, estimated, stale, and unavailable metrics.</p>
            <p><strong>B. Wearable & BLE Limitations:</strong> Bluetooth devices vary in sensor accuracy; connection does not imply clinical medical certification.</p>
            <p><strong>C. Recovery & Fitness Age:</strong> Readiness and biological fitness age metrics are software algorithmic estimates, not clinical diagnoses.</p>
            <p><strong>D. Push Notifications:</strong> Alerts may be subject to OS battery optimization, sleep focus, or platform permission delivery constraints.</p>
            <p><strong>E. Conflict Resolution:</strong> Cross-device sync uses deterministic event IDs to preserve workout integrity across iOS, Android, and Web.</p>
          </div>
        </section>

        {/* 26. Contact & Legal Notices */}
        <section className="space-y-3 pt-4 border-t border-[var(--card-border)]">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> 26. Contact and Legal Notices
          </h3>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 font-mono text-xs text-[var(--muted-foreground)]">
            <p><strong className="text-white font-sans">Legal Entity:</strong> Calyxo Health Technologies Private Limited</p>
            <p><strong className="text-white font-sans">Grievance Officer:</strong> Supreeth Kiran</p>
            <p><strong className="text-white font-sans">Legal Email:</strong> legal@calyxo.app / supreethkiran23@gmail.com</p>
            <p><strong className="text-white font-sans">Support:</strong> support@calyxo.app</p>
            <p><strong className="text-white font-sans">Address:</strong> Bengaluru, Karnataka 560001, India</p>
            <p><strong className="text-white font-sans">Website:</strong> https://calyxo.vercel.app</p>
          </div>
        </section>

      </motion.div>
    </motion.div>
  );
}
