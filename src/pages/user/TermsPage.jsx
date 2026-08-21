import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Heart, Activity, Sparkles, Shield, Mail, AlertTriangle, FileText, CheckCircle2, Lock, Globe, Database, Smartphone } from 'lucide-react';

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
          <Scale className="w-4 h-4" /> Comprehensive User & Service Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">Terms of Service</h1>
        <p className="text-[var(--muted-foreground)] text-xs sm:text-sm mt-1">
          Effective Date: January 1, 2026 • Last Revised: August 2026 • Governed under the Indian Contract Act, 1872, IT Act 2000 & International Consumer Regulations
        </p>
      </div>

      <motion.div variants={itemVariants} className="bg-[var(--surface)] p-6 sm:p-10 rounded-3xl border border-[var(--card-border)] shadow-2xl space-y-8 text-[var(--foreground)] text-xs sm:text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Scale className="w-4 h-4" /> 1. Acceptance of Terms & Eligibility
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Welcome to Calyxo (“<strong>Calyxo</strong>”, “<strong>we</strong>”, “<strong>us</strong>”, or “<strong>our</strong>”), an advanced health, fitness, workout tracking, nutrition intelligence, and AI wellness application operated by Calyxo Health Technologies Private Limited.
          </p>
          <p className="text-[var(--muted-foreground)]">
            By downloading, installing, registering an account, or using any part of Calyxo (including our iOS app, Android app, watchOS companion, widget extensions, Web dashboard, and connected cloud services), you agree to be bound by these Terms of Service (“<strong>Terms</strong>”) and our Privacy Policy. If you do not agree to all terms and conditions, you must not access or use Calyxo.
          </p>
          <p className="text-[var(--muted-foreground)]">
            <strong>Age Requirements:</strong> You must be at least 18 years old to purchase paid subscriptions (Calyxo High, VIP Passes, or coaching services). Individuals between 13 and 17 years old may use the free tier of Calyxo solely under the active supervision and explicit consent of a parent or legal guardian who agrees to be bound by these Terms.
          </p>
        </section>

        {/* Section 2 - STATUTORY MEDICAL DISCLAIMER */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" /> 2. Critical Medical & Emergency Care Disclaimer (STATUTORY NOTICE)
          </h3>
          <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-3">
            <p className="font-black text-destructive text-xs uppercase tracking-wide">
              CALYXO IS NOT A MEDICAL DEVICE, MEDICAL PRACTITIONER, CLINICAL HEALTHCARE PROVIDER, OR EMERGENCY RESCUE SERVICE.
            </p>
            <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
              <strong>General Fitness & Educational Purpose:</strong> All features of Calyxo—including, without limitation, macronutrient targets, caloric intake estimations, body composition models, recovery scores, biological fitness age approximations, exercise instructions, tempo recommendations, and AI-generated coaching briefings—are provided strictly for personal athletic tracking, recreational wellness, and educational purposes. Calyxo does NOT offer clinical diagnoses, disease prevention, medical prescriptions, or physical therapy.
            </p>
            <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
              <strong>Mandatory Physician Consultation:</strong> You must consult a qualified, licensed medical physician before initiating any new workout split, resistance training protocol, high-intensity exercise regimen, or caloric deficit/dietary intervention, particularly if you have a personal or family history of high blood pressure, heart disease, chest pain, orthopedic injury, eating disorders, or metabolic conditions.
            </p>
            <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
              <strong>Immediate Emergency Stop:</strong> If at any point during exercise or nutrition tracking you experience shortness of breath, dizziness, lightheadedness, chest tightness, irregular heartbeat, sudden acute musculoskeletal pain, or nausea, you must <strong>STOP IMMEDIATELY</strong> and contact emergency medical services (such as 112 in India, 911 in the USA, or your local emergency department). Never disregard or delay professional medical advice because of information provided by Calyxo.
            </p>
          </div>
        </section>

        {/* Section 3 - NUTRITION & FOOD DATABASE */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 3. Nutrition Intelligence, Food Database & Allergen Warnings
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo provides an extensive database of 11,000+ regional Indian and international food items, macro calculators, dish normalizers, and portion estimators.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Approximations Only:</strong> Nutritional values (calories, protein, carbohydrates, fats, fiber, micronutrients) are scientific approximations based on published nutritional tables (including IFCT/NIN and USDA) and standard preparation methods. Actual restaurant or home-cooked preparation, oil absorption, brand variations, and serving sizes may vary significantly.</li>
            <li><strong>Severe Allergens:</strong> Calyxo does NOT guarantee that food entries or suggestions are allergen-free (e.g., peanuts, tree nuts, gluten, shellfish, dairy, soy). You are solely responsible for inspecting physical food packaging, ingredients, and allergen notices prior to consumption.</li>
            <li><strong>User-Generated Dishes:</strong> Calyxo may allow users to input custom dishes or recipes. Calyxo is not responsible for the accuracy or nutritional validity of user-contributed food entries.</li>
          </ul>
        </section>

        {/* Section 4 - AI COACHING & GENERATIVE REASONING */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> 4. AI Coaching, Twin Modeling & Generative Intelligence
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo incorporates machine learning, deterministic rule engines, and generative AI models (including Gemini API and local inference pipelines) to deliver real-time feedback, workout recommendations, and nutrition insights.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Probabilistic Intelligence:</strong> Generative AI output is probabilistic and produced by algorithms. While grounded in athletic science, AI output should never be construed as licensed fitness training or clinical dietetics.</li>
            <li><strong>Autoregulation & Common Sense:</strong> If the AI recommends a weight, volume, or dietary change that feels unsafe, exceeds your physical capacity, or causes joint strain, you must adjust or decline the recommendation based on your bodily feedback.</li>
          </ul>
        </section>

        {/* Section 5 - ASSUMPTION OF RISK & LIABILITY RELEASE */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> 5. Voluntary Assumption of Risk & Total Liability Release
          </h3>
          <p className="text-[var(--muted-foreground)]">
            You acknowledge that physical conditioning, weightlifting, cardiovascular training, and sports activities carry inherent risks of serious bodily injury, permanent disability, paralysis, and death. To the fullest extent permitted by applicable law, you knowingly and freely assume all risks, both known and unknown, associated with your participation in any fitness program or dietary modification logged in or recommended by Calyxo.
          </p>
          <p className="text-[var(--muted-foreground)]">
            You hereby release, waive, and forever discharge Calyxo Health Technologies, its founders, directors, employees, contractors, trainers, and service providers from any and all liabilities, claims, demands, or causes of action arising from personal injury, illness, property damage, or wrongful death resulting from your use of Calyxo.
          </p>
        </section>

        {/* Section 6 - SUBSCRIPTIONS & BILLING */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> 6. Subscriptions, In-App Purchases, Billing & Cancellations
          </h3>
          <p className="text-[var(--muted-foreground)]">
            <strong>Paid Plans:</strong> Calyxo offers premium tiers (such as Calyxo High Monthly at ₹2 and Calyxo High Annual VIP Pass at ₹199, or promotional tiers) granting access to unlimited AI coaching, dynamic live workouts, advanced nutrition planners, and wearable data sync.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li><strong>Payment Processing:</strong> Payments are processed via authorized PCI-DSS compliant aggregators (Razorpay, Apple In-App Purchase, Google Play Billing). Calyxo never stores your complete credit card numbers, CVVs, or bank passwords on our servers.</li>
            <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew at the conclusion of each billing period (monthly or annually) unless cancelled by you at least 24 hours prior to the renewal date.</li>
            <li><strong>Cancellation:</strong> You can cancel auto-renewal at any time through Account Settings or through Apple App Store / Google Play Subscription Management. Upon cancellation, you retain access until the end of your prepaid period.</li>
            <li><strong>Refund Policy:</strong> Because digital entitlements are activated immediately upon payment verification, subscription fees are generally non-refundable, except where mandated by statutory consumer protection laws or App Store/Play Store policies.</li>
          </ul>
        </section>

        {/* Section 7 - USER ACCOUNTS & ACCEPTABLE USE */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <FileText className="w-4 h-4" /> 7. User Accounts & Acceptable Use Policy
          </h3>
          <p className="text-[var(--muted-foreground)]">
            You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted-foreground)] text-xs">
            <li>Reverse-engineer, decompile, extract source code, or tamper with Calyxo binaries, APIs, or encrypted tokens.</li>
            <li>Use automated scrapers, bots, or crawlers to extract food database items, workout libraries, or user profiles.</li>
            <li>Upload malicious code, viruses, or attempts to exploit vulnerabilities in our infrastructure.</li>
            <li>Impersonate any trainer, athlete, or organization, or misrepresent biometrics to falsify competitive leaderboards.</li>
          </ul>
        </section>

        {/* Section 8 - WEARABLE & THIRD PARTY INTEGRATIONS */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> 8. Third-Party Integrations & Wearable Sensors
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Calyxo integrates with Apple HealthKit, Google Health Connect, Bluetooth BLE heart rate monitors, and smart devices. Third-party sensor data (e.g. photoplethysmography heart rate, accelerometry, GPS) is subject to sensor precision limitations, skin contact quality, and battery constraints. Calyxo is not liable for data transmission drops or inaccuracies stemming from third-party hardware or operating system telemetry.
          </p>
        </section>

        {/* Section 9 - LIMITATION OF LIABILITY */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> 9. Limitation of Liability & Warranty Disclaimer
          </h3>
          <p className="text-[var(--muted-foreground)]">
            CALYXO AND ALL ASSOCIATED SERVICES ARE PROVIDED ON AN “<strong>AS IS</strong>” AND “<strong>AS AVAILABLE</strong>” BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, CALYXO HEALTH TECHNOLOGIES DISCLAIMS ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="text-[var(--muted-foreground)]">
            IN NO EVENT SHALL CALYXO’S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE APPLICATION EXCEED THE TOTAL AMOUNT PAID BY YOU TO CALYXO IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ₹1,000 INR (WHICHEVER IS GREATER).
          </p>
        </section>

        {/* Section 10 - DISPUTE RESOLUTION & ARBITRATION */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Globe className="w-4 h-4" /> 10. Dispute Resolution, Binding Arbitration & Governing Law
          </h3>
          <p className="text-[var(--muted-foreground)]">
            These Terms shall be governed by and construed in accordance with the substantive laws of the <strong>Republic of India</strong>, without regard to its conflict of law provisions.
          </p>
          <p className="text-[var(--muted-foreground)]">
            <strong>Arbitration:</strong> Any dispute, controversy, or claim arising out of or relating to these Terms or the breach, termination, or invalidity thereof shall be resolved through binding, confidential individual arbitration administered in accordance with the <strong>Arbitration and Conciliation Act, 1996</strong> in <strong>Bengaluru, Karnataka, India</strong>. The language of arbitration shall be English.
          </p>
          <p className="text-[var(--muted-foreground)]">
            <strong>Class Action Waiver:</strong> You agree that all disputes must be brought in an individual capacity, and not as a plaintiff or class member in any purported class, collective, or representative proceeding.
          </p>
        </section>

        {/* Section 11 - CONTACT */}
        <section className="space-y-3 pt-2 border-t border-[var(--card-border)]">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> 11. Contact & Grievance Redressal
          </h3>
          <p className="text-[var(--muted-foreground)]">
            In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020, if you have questions, inquiries, or statutory grievances regarding these Terms:
          </p>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 font-mono text-xs text-[var(--muted-foreground)]">
            <p><strong className="text-white font-sans">Grievance Officer:</strong> Supreeth Kiran</p>
            <p><strong className="text-white font-sans">Entity:</strong> Calyxo Health Technologies Private Limited</p>
            <p><strong className="text-white font-sans">Email:</strong> supreethkiran23@gmail.com / legal@calyxo.app</p>
            <p><strong className="text-white font-sans">Location:</strong> Bengaluru, Karnataka 560001, India</p>
          </div>
        </section>

      </motion.div>
    </motion.div>
  );
}
