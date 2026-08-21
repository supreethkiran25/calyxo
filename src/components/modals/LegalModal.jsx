import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Scale, Heart, Activity, Sparkles, FileText, Lock, Mail, AlertTriangle, Globe, Database, Smartphone, UserCheck, Server, CheckCircle2 } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, type = 'terms' }) {
  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 pb-safe">
        {/* Full Screen Backdrop Overlay */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-0"
          onClick={onClose}
        />

        {/* Modal Dialog Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-4xl bg-[#111116] border border-white/15 rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden z-10"
        >
          {/* Header with Exactly ONE Clean Close Button */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#111116]/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-acid-green)]/15 border border-[var(--color-acid-green)]/30 flex items-center justify-center text-[var(--color-acid-green)] shrink-0">
                {isPrivacy ? <Shield className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  {isPrivacy ? 'Privacy Policy & Global Data Charter' : 'Terms of Service & Master User Agreement'}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Calyxo Health Operating System • 2026 Edition • Binding Legal Document
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none shrink-0"
              aria-label="Close Legal Document"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Document Body - Full Exhaustive Text */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-xs sm:text-sm text-gray-300 leading-relaxed custom-scrollbar flex-1">
            {isPrivacy ? (
              /* =========================================================================
                 FULL EXHAUSTIVE PRIVACY POLICY (MYFITNESSPAL GRADE)
                 ========================================================================= */
              <>
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1">
                    <Shield className="w-4 h-4" /> Global Privacy Standard & Data Charter
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
                  <p className="text-gray-400 text-xs mt-1">
                    Effective Date: January 1, 2026 • Last Revised: August 2026 • Compliant with Indian DPDP Act 2023, EU GDPR, California CCPA/CPRA & Apple HealthKit / Google Health Connect Guidelines
                  </p>
                </div>

                {/* Section 1 - OUR CORE COMMITMENT */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 1. Our Core Privacy Commitment & Zero-Sale Guarantee
                  </h3>
                  <p className="text-gray-300">
                    At Calyxo Health Technologies Private Limited (“<strong>Calyxo</strong>”, “<strong>we</strong>”, “<strong>us</strong>”, or “<strong>our</strong>”), your physical health telemetry, dietary records, and biometric measurements represent your most intimate personal data. We are dedicated to maintaining the highest industry standards of transparency, confidentiality, and data sovereignty.
                  </p>
                  <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                    <p className="font-bold text-cyan-300 text-xs uppercase tracking-wider">
                      🛡️ OUR UNCOMPROMISING DATA GUARANTEES:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-xs">
                      <li><strong>Zero Sale of Health Data:</strong> We NEVER sell, rent, lease, monetize, or trade your personal biometric, nutritional, or workout data to data brokers, advertising networks, pharmaceutical entities, or insurance providers under any circumstances.</li>
                      <li><strong>Apple HealthKit & Google Health Connect Protection:</strong> Health telemetry synced via Apple HealthKit or Android Health Connect is NEVER used for marketing, commercial profiling, or advertising purposes.</li>
                      <li><strong>Complete Data Ownership:</strong> You retain 100% ownership of your logged data. You have the absolute legal right to export your entire history or permanently scrub your account within 48 hours.</li>
                    </ul>
                  </div>
                </section>

                {/* Section 2 - INFORMATION WE COLLECT */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Database className="w-4 h-4" /> 2. Information We Collect
                  </h3>
                  <p className="text-gray-300">
                    To deliver real-time caloric balance modeling, progressive overload analysis, muscle volume distribution, and AI athletic coaching, we collect the following categories of information:
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wide">A. Account & Identification Information</h4>
                      <p className="text-gray-400 text-xs">
                        Email address, full name, username, authentication identifiers (via Supabase Auth / Google OAuth / Apple Sign-In), subscription status, and profile avatar.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wide">B. Biometrics & Physical Telemetry</h4>
                      <p className="text-gray-400 text-xs">
                        Age, biological sex, body weight timeline, height, body fat percentage, resting heart rate, sleep duration, and physical athletic objectives (hypertrophy, fat loss, VO2 max endurance).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wide">C. Nutrition & Dietary Telemetry</h4>
                      <p className="text-gray-400 text-xs">
                        Logged meals, food items, portion sizes (grams, ml), calculated macronutrients (calories, protein, carbs, fats), micronutrients, hydration/water logs, and dietary preferences (vegetarian, non-vegetarian, vegan, allergen exclusions).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wide">D. Workout & Athletic Training Telemetry</h4>
                      <p className="text-gray-400 text-xs">
                        Exercise names, muscle groups targeted, sets, reps, weight loaded (kg), rest interval durations, RPE ratings, calculated 1RM personal records, and workout session timestamps.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wide">E. Wearable & Device Sensor Data</h4>
                      <p className="text-gray-400 text-xs">
                        With your explicit permission: Step counts, active energy burned, resting heart rate, Heart Rate Variability (HRV), and Live Activity workout telemetry from Apple Watch, Bluetooth BLE heart rate straps, and smartphone sensors.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 3 - HOW WE USE DATA */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> 3. How We Use Your Information & Lawful Bases
                  </h3>
                  <p className="text-gray-300">
                    We process information strictly for legitimate athletic, operational, and service delivery purposes:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs">
                    <li><strong>Personalized Algorithms:</strong> Calculating your Mifflin-St Jeor Total Daily Energy Expenditure (TDEE), optimal protein-to-bodyweight ratios, daily recovery readiness, and autoregulated volume targets.</li>
                    <li><strong>AI Coaching & Intelligence:</strong> Powering generative AI coaching (Calyxo Intelligence) to provide grounded dietary suggestions, food alternative matching, routine modifications, and daily performance briefings.</li>
                    <li><strong>Multi-Device Cloud Synchronization:</strong> Synchronizing your training diaries and food logs across iOS, Android, watchOS, and Web dashboards via secure Supabase PostgreSQL databases.</li>
                    <li><strong>Billing & Entitlement Verification:</strong> Verifying Razorpay payment signatures and App Store/Play Store receipts to unlock premium subscription tiers (Calyxo High).</li>
                    <li><strong>Security & Anti-Abuse:</strong> Protecting our cloud infrastructure against malicious intrusions, automated scraping, and unauthorized access.</li>
                  </ul>
                </section>

                {/* Section 4 - SERVICE PROVIDERS */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Server className="w-4 h-4" /> 4. Service Providers & Third-Party Sharing
                  </h3>
                  <p className="text-gray-300">
                    We only share minimal necessary data with vetted, enterprise-grade cloud service providers bound by strict confidentiality and data protection agreements:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs">
                    <li><strong>Database & Authentication:</strong> Supabase Inc. (Encrypted PostgreSQL database with Row Level Security and OAuth authentication hosting).</li>
                    <li><strong>Payment Gateways:</strong> Razorpay Software Private Limited / Apple Inc. / Google LLC (PCI-DSS compliant payment processing).</li>
                    <li><strong>AI Inference APIs:</strong> Google Cloud / Gemini AI (Ephemeral processing of user prompts; prompts are not used to train public foundation models without consent).</li>
                    <li><strong>Cloud Hosting & CDN:</strong> Vercel Inc. (Global edge distribution and secure serverless execution).</li>
                  </ul>
                </section>

                {/* Section 5 - DATA RETENTION & RIGHT TO ERASURE */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> 5. Data Retention, Export & Right to be Forgotten
                  </h3>
                  <p className="text-gray-300">
                    We retain your health and workout data for as long as your account remains active. You possess absolute rights over your data:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs">
                    <li><strong>Account Deletion:</strong> You can initiate complete account deletion directly from the Profile & Settings menu. Upon deletion, all your food logs, workout logs, biometric history, and user identifiers are permanently scrubbed from our active production databases within 48 hours.</li>
                    <li><strong>Data Portability:</strong> You can export your historical training logs and nutrition diaries in standard CSV or JSON format at any time.</li>
                  </ul>
                </section>

                {/* Section 6 - SECURITY & ENCRYPTION */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 6. Security, Encryption & Storage Protocols
                  </h3>
                  <p className="text-gray-300">
                    All telemetry is secured via <strong>TLS 1.3 encryption in transit</strong> and <strong>AES-256 at rest</strong> on SOC 2 Type II certified cloud infrastructure. Access to production databases is strictly restricted by Row Level Security (RLS) policies ensuring no user can access another user's health logs.
                  </p>
                </section>

                {/* Section 7 - INTERNATIONAL COMPLIANCE */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> 7. Global Statutory Compliance (DPDP Act 2023, GDPR, CCPA/CPRA)
                  </h3>
                  <p className="text-gray-300">
                    Calyxo complies with the statutory mandates of the <strong>Digital Personal Data Protection Act, 2023 (India)</strong>, <strong>EU General Data Protection Regulation (Articles 15–22)</strong>, and <strong>California Consumer Privacy Act (CCPA/CPRA)</strong>. Users may exercise their statutory rights of access, correction, objection, and consent revocation at any time.
                  </p>
                </section>

                {/* Section 8 - DPO CONTACT */}
                <section className="space-y-3 pt-2 border-t border-white/10">
                  <h3 className="text-base font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> 8. Data Protection Officer (DPO) & Inquiries
                  </h3>
                  <p className="text-gray-400 text-xs">
                    For all privacy questions, data export requests, or regulatory communications:
                  </p>
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 font-mono text-xs text-gray-300">
                    <p><strong className="text-white font-sans">Data Protection Officer:</strong> Supreeth Kiran</p>
                    <p><strong className="text-white font-sans">Organization:</strong> Calyxo Health Technologies Private Limited</p>
                    <p><strong className="text-white font-sans">Email:</strong> privacy@calyxo.app / supreethkiran23@gmail.com</p>
                    <p><strong className="text-white font-sans">Jurisdiction:</strong> Bengaluru, Karnataka 560001, India</p>
                  </div>
                </section>
              </>
            ) : (
              /* =========================================================================
                 FULL EXHAUSTIVE TERMS OF SERVICE (MYFITNESSPAL GRADE)
                 ========================================================================= */
              <>
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">
                    <Scale className="w-4 h-4" /> Comprehensive User & Service Agreement
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Terms of Service</h1>
                  <p className="text-gray-400 text-xs mt-1">
                    Effective Date: January 1, 2026 • Last Revised: August 2026 • Governed under the Indian Contract Act, 1872, IT Act 2000 & International Consumer Regulations
                  </p>
                </div>

                {/* Section 1 */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Scale className="w-4 h-4" /> 1. Acceptance of Terms & Eligibility
                  </h3>
                  <p className="text-gray-300">
                    Welcome to Calyxo (“<strong>Calyxo</strong>”, “<strong>we</strong>”, “<strong>us</strong>”, or “<strong>our</strong>”), an advanced health, fitness, workout tracking, nutrition intelligence, and AI wellness platform operated by Calyxo Health Technologies Private Limited.
                  </p>
                  <p className="text-gray-300">
                    By downloading, installing, registering an account, or using any part of Calyxo (including our iOS app, Android app, watchOS companion, widget extensions, Web dashboard, and connected cloud services), you agree to be bound by these Terms of Service (“<strong>Terms</strong>”) and our Privacy Policy. If you do not agree to all terms and conditions, you must not access or use Calyxo.
                  </p>
                  <p className="text-gray-300">
                    <strong>Age Requirements:</strong> You must be at least 18 years old to purchase paid subscriptions (Calyxo High, VIP Passes, or coaching services). Individuals between 13 and 17 years old may use the free tier of Calyxo solely under the active supervision and explicit consent of a parent or legal guardian who agrees to be bound by these Terms.
                  </p>
                </section>

                {/* Section 2 - STATUTORY MEDICAL DISCLAIMER */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" /> 2. Critical Medical & Emergency Care Disclaimer (STATUTORY NOTICE)
                  </h3>
                  <div className="p-5 rounded-2xl bg-destructive/15 border border-destructive/30 space-y-3">
                    <p className="font-black text-red-400 text-xs uppercase tracking-wide">
                      CALYXO IS NOT A MEDICAL DEVICE, MEDICAL PRACTITIONER, CLINICAL HEALTHCARE PROVIDER, OR EMERGENCY RESCUE SERVICE.
                    </p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      <strong>General Fitness & Educational Purpose:</strong> All features of Calyxo—including, without limitation, macronutrient targets, caloric intake estimations, body composition models, recovery scores, biological fitness age approximations, exercise instructions, tempo recommendations, and AI-generated coaching briefings—are provided strictly for personal athletic tracking, recreational wellness, and educational purposes. Calyxo does NOT offer clinical diagnoses, disease prevention, medical prescriptions, or physical therapy.
                    </p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      <strong>Mandatory Physician Consultation:</strong> You must consult a qualified, licensed medical physician before initiating any new workout split, resistance training protocol, high-intensity exercise regimen, or caloric deficit/dietary intervention, particularly if you have a personal or family history of high blood pressure, heart disease, chest pain, orthopedic injury, eating disorders, or metabolic conditions.
                    </p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      <strong>Immediate Emergency Stop:</strong> If at any point during exercise or nutrition tracking you experience shortness of breath, dizziness, lightheadedness, chest tightness, irregular heartbeat, sudden acute musculoskeletal pain, or nausea, you must <strong>STOP IMMEDIATELY</strong> and contact emergency medical services (such as 112 in India, 911 in the USA, or your local emergency department). Never disregard or delay professional medical advice because of information provided by Calyxo.
                    </p>
                  </div>
                </section>

                {/* Section 3 - NUTRITION & FOOD DATABASE */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> 3. Nutrition Intelligence, Food Database & Allergen Warnings
                  </h3>
                  <p className="text-gray-300">
                    Calyxo provides an extensive database of 11,000+ regional Indian and international food items, macro calculators, dish normalizers, and portion estimators.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs">
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
                  <p className="text-gray-300">
                    Calyxo incorporates machine learning, deterministic rule engines, and generative AI models (including Gemini API and local inference pipelines) to deliver real-time feedback, workout recommendations, and nutrition insights.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs">
                    <li><strong>Probabilistic Intelligence:</strong> Generative AI output is probabilistic and produced by algorithms. While grounded in athletic science, AI output should never be construed as licensed fitness training or clinical dietetics.</li>
                    <li><strong>Autoregulation & Common Sense:</strong> If the AI recommends a weight, volume, or dietary change that feels unsafe, exceeds your physical capacity, or causes joint strain, you must adjust or decline the recommendation based on your bodily feedback.</li>
                  </ul>
                </section>

                {/* Section 5 - ASSUMPTION OF RISK */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> 5. Voluntary Assumption of Risk & Total Liability Release
                  </h3>
                  <p className="text-gray-300">
                    You acknowledge that physical conditioning, weightlifting, cardiovascular training, and sports activities carry inherent risks of serious bodily injury, permanent disability, paralysis, and death. To the fullest extent permitted by applicable law, you knowingly and freely assume all risks, both known and unknown, associated with your participation in any fitness program or dietary modification logged in or recommended by Calyxo.
                  </p>
                  <p className="text-gray-300">
                    You hereby release, waive, and forever discharge Calyxo Health Technologies, its founders, directors, employees, contractors, trainers, and service providers from any and all liabilities, claims, demands, or causes of action arising from personal injury, illness, property damage, or wrongful death resulting from your use of Calyxo.
                  </p>
                </section>

                {/* Section 6 - SUBSCRIPTIONS & BILLING */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 6. Subscriptions, In-App Purchases, Billing & Cancellations
                  </h3>
                  <p className="text-gray-300">
                    <strong>Paid Plans:</strong> Calyxo offers premium tiers (such as Calyxo High Monthly at ₹2 and Calyxo High Annual VIP Pass at ₹199, or promotional tiers) granting access to unlimited AI coaching, dynamic live workouts, advanced nutrition planners, and wearable data sync.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs">
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
                  <p className="text-gray-300">
                    You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree not to:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs">
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
                  <p className="text-gray-300">
                    Calyxo integrates with Apple HealthKit, Google Health Connect, Bluetooth BLE heart rate monitors, and smart devices. Third-party sensor data (e.g. photoplethysmography heart rate, accelerometry, GPS) is subject to sensor precision limitations, skin contact quality, and battery constraints. Calyxo is not liable for data transmission drops or inaccuracies stemming from third-party hardware or operating system telemetry.
                  </p>
                </section>

                {/* Section 9 - LIMITATION OF LIABILITY */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> 9. Limitation of Liability & Warranty Disclaimer
                  </h3>
                  <p className="text-gray-300">
                    CALYXO AND ALL ASSOCIATED SERVICES ARE PROVIDED ON AN “<strong>AS IS</strong>” AND “<strong>AS AVAILABLE</strong>” BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, CALYXO HEALTH TECHNOLOGIES DISCLAIMS ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                  <p className="text-gray-300">
                    IN NO EVENT SHALL CALYXO’S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE APPLICATION EXCEED THE TOTAL AMOUNT PAID BY YOU TO CALYXO IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ₹1,000 INR (WHICHEVER IS GREATER).
                  </p>
                </section>

                {/* Section 10 - DISPUTE RESOLUTION & ARBITRATION */}
                <section className="space-y-3">
                  <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> 10. Dispute Resolution, Binding Arbitration & Governing Law
                  </h3>
                  <p className="text-gray-300">
                    These Terms shall be governed by and construed in accordance with the substantive laws of the <strong>Republic of India</strong>, without regard to its conflict of law provisions.
                  </p>
                  <p className="text-gray-300">
                    <strong>Arbitration:</strong> Any dispute, controversy, or claim arising out of or relating to these Terms or the breach, termination, or invalidity thereof shall be resolved through binding, confidential individual arbitration administered in accordance with the <strong>Arbitration and Conciliation Act, 1996</strong> in <strong>Bengaluru, Karnataka, India</strong>. The language of arbitration shall be English.
                  </p>
                  <p className="text-gray-300">
                    <strong>Class Action Waiver:</strong> You agree that all disputes must be brought in an individual capacity, and not as a plaintiff or class member in any purported class, collective, or representative proceeding.
                  </p>
                </section>

                {/* Section 11 - CONTACT */}
                <section className="space-y-3 pt-2 border-t border-white/10">
                  <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> 11. Contact & Statutory Grievance Redressal
                  </h3>
                  <p className="text-gray-400 text-xs">
                    In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020, if you have questions, inquiries, or statutory grievances regarding these Terms:
                  </p>
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 font-mono text-xs text-gray-300">
                    <p><strong className="text-white font-sans">Grievance Officer:</strong> Supreeth Kiran</p>
                    <p><strong className="text-white font-sans">Entity:</strong> Calyxo Health Technologies Private Limited</p>
                    <p><strong className="text-white font-sans">Email:</strong> supreethkiran23@gmail.com / legal@calyxo.app</p>
                    <p><strong className="text-white font-sans">Location:</strong> Bengaluru, Karnataka 560001, India</p>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-white/10 bg-[#111116] flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              {isPrivacy ? '🔒 Calyxo DPDP & GDPR Protection' : '⚖️ Calyxo Master Terms 2026'}
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
