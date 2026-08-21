import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Scale, Heart, Activity, FileText, Bot, Lock, Mail, AlertTriangle, Globe, Database, Smartphone } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, type = 'terms' }) {
  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 pb-safe">
        {/* Full Backdrop Overlay */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl z-0"
          onClick={onClose}
        />

        {/* Modal Dialog Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-3xl bg-[#111116] border border-white/15 rounded-3xl shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden z-10"
        >
          {/* Header with Exactly ONE Clean Close Button */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#111116]/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-acid-green)]/15 border border-[var(--color-acid-green)]/30 flex items-center justify-center text-[var(--color-acid-green)] shrink-0">
                {isPrivacy ? <Shield className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  {isPrivacy ? 'Privacy Policy & Data Charter' : 'Terms of Service & User Agreement'}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Calyxo Health Operating System • 2026 Edition
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

          {/* Scrollable Document Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-300 leading-relaxed custom-scrollbar flex-1">
            {isPrivacy ? (
              <>
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 1. Core Data Protection & Non-Negotiable Guarantees
                  </h3>
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1.5 text-xs text-cyan-200">
                    <p className="font-bold">🛡️ ZERO-SALE COMMITMENT:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300">
                      <li>We NEVER sell, rent, or trade your personal biometric, dietary, or workout telemetry to data brokers or advertising networks.</li>
                      <li>Health data synced via Apple HealthKit or Google Health Connect is NEVER used for marketing or advertising purposes.</li>
                      <li>You retain 100% ownership of your data with immediate export and 48-hour permanent account erasure rights.</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Database className="w-4 h-4" /> 2. Information We Collect
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li><strong>Account Identifiers:</strong> Name, email address, avatar, authentication credentials.</li>
                    <li><strong>Biometric Data:</strong> Height, weight history, age, biological sex, resting heart rate, sleep duration.</li>
                    <li><strong>Nutritional Intake:</strong> Food logs, macros (calories, protein, carbs, fats), micronutrients, hydration records.</li>
                    <li><strong>Workout Logs:</strong> Exercise names, sets, reps, weight loaded (kg), RPE, rest timestamps.</li>
                    <li><strong>Wearable Sensors:</strong> Authorized Apple Health / Health Connect / Bluetooth BLE heart rate telemetry.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> 3. Security, Encryption & Global Compliance
                  </h3>
                  <p className="text-gray-400">
                    All telemetry is secured via <strong>TLS 1.3 encryption in transit</strong> and <strong>AES-256 at rest</strong> on SOC 2 Type II certified cloud infrastructure. Compliant with the <strong>Indian Digital Personal Data Protection Act 2023</strong>, <strong>EU GDPR</strong>, and <strong>California CCPA/CPRA</strong>.
                  </p>
                </section>

                <section className="space-y-2 pt-2 border-t border-white/10">
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> 4. Data Protection Officer (DPO)
                  </h3>
                  <p className="text-gray-400">
                    Contact: <strong className="text-white">Supreeth Kiran</strong> (privacy@calyxo.app / supreethkiran23@gmail.com).
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Scale className="w-4 h-4" /> 1. Acceptance of Terms & Eligibility
                  </h3>
                  <p className="text-gray-400">
                    By downloading or using Calyxo, you enter into a legally binding contract with Calyxo Health Technologies Private Limited under the <strong>Indian Contract Act, 1872</strong>. You must be at least 18 years old (or 13+ with verified parental consent).
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" /> 2. Comprehensive Medical & Emergency Disclaimer (STATUTORY NOTICE)
                  </h3>
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-2 text-xs">
                    <p className="font-black text-red-400 uppercase">
                      CALYXO IS NOT A MEDICAL DEVICE, MEDICAL PRACTITIONER, OR EMERGENCY CARE SERVICE.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                      All fitness routines, caloric estimates, macronutrient targets, and AI coaching briefings are for general athletic conditioning and educational purposes only. Always consult a licensed physician before beginning any training program or dietary modification. If you experience dizziness, chest pain, or acute discomfort, <strong>STOP IMMEDIATELY</strong> and call emergency medical services.
                    </p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> 3. Nutrition Intelligence & Food Database Approximations
                  </h3>
                  <p className="text-gray-400">
                    Nutritional values for our 11,000+ food database are scientific approximations based on published food tables. Calyxo is not responsible for food allergen exposure; users must independently verify physical ingredients.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 4. Subscriptions, Payments & Cancellations
                  </h3>
                  <p className="text-gray-400">
                    Payments are securely tokenized via authorized aggregators (Razorpay, Apple In-App Purchases, Google Play). Subscriptions auto-renew until cancelled at least 24 hours prior to the billing cycle directly through Account Settings or App Store management.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> 5. Dispute Resolution & Binding Arbitration
                  </h3>
                  <p className="text-gray-400">
                    Governed by the substantive laws of the <strong>Republic of India</strong>. All disputes shall be resolved through confidential individual arbitration in <strong>Bengaluru, Karnataka, India</strong> under the Arbitration and Conciliation Act, 1996.
                  </p>
                </section>

                <section className="space-y-2 pt-2 border-t border-white/10">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> 6. Grievance Redressal
                  </h3>
                  <p className="text-gray-400">
                    Grievance Officer: <strong className="text-white">Supreeth Kiran</strong> (legal@calyxo.app / supreethkiran23@gmail.com, Bengaluru, Karnataka, India).
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-white/10 bg-[#111116] flex items-center justify-end">
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
