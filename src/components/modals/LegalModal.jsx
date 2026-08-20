import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Scale, Heart, Activity, FileText, Bot, Lock, Mail } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, type = 'terms' }) {
  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pb-safe">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/85 backdrop-blur-xl"
          onClick={onClose}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-2xl bg-surface border border-card-border rounded-3xl shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-card-border flex items-center justify-between bg-surface/90 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-acid-green/10 border border-acid-green/20 flex items-center justify-center text-acid-green">
                {isPrivacy ? <Shield className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground uppercase tracking-wider">
                  {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
                </h2>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                  Calyxo Health Operating System • 2026 Edition
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2.5 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Document Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-muted-foreground leading-relaxed custom-scrollbar flex-1">
            {isPrivacy ? (
              <>
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
                    <Shield className="w-4 h-4" /> 1. Commitment to Health Data Privacy
                  </h3>
                  <p>
                    Calyxo is committed to protecting your biometric information. This Privacy Policy outlines how your personal fitness, nutrition, and device data are collected, processed, and secured.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
                    <Activity className="w-4 h-4" /> 2. Apple HealthKit & Wearables Compliance
                  </h3>
                  <p>
                    When you authorize Apple Health (HealthKit), Android Health Connect, or paired fitness wearables (Apple Watch, Garmin, Galaxy Watch, WHOOP, Oura), Calyxo reads only explicit authorized categories (active energy, steps, heart rate, workouts).
                  </p>
                  <div className="p-3.5 rounded-2xl bg-[var(--input)] border border-card-border space-y-1.5 text-[11px]">
                    <span className="font-black text-acid-green uppercase">Strict HealthKit Guarantee:</span>
                    <ul className="list-disc list-inside space-y-1">
                      <li>HealthKit data is <strong>NEVER</strong> used for marketing or behavioral advertising.</li>
                      <li>HealthKit data is <strong>NEVER</strong> sold to data brokers or third parties.</li>
                      <li>Data is processed on-device and in encrypted personal storage solely to power your live health rings, workout logs, and recovery metrics.</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
                    <FileText className="w-4 h-4" /> 3. Information We Collect
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Account Credentials:</strong> Email, username, authentication identifiers.</li>
                    <li><strong>Biometric Data:</strong> Height, weight, target body weight, age, biological sex, experience level.</li>
                    <li><strong>Nutrition Logs:</strong> Meal logs, calories, macronutrients (protein, carbs, fat), water intake.</li>
                    <li><strong>Workout Telemetry:</strong> Exercises, sets, repetitions, weights lifted, rest countdown timestamps.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
                    <Bot className="w-4 h-4" /> 4. AI & Generative Processing
                  </h3>
                  <p>
                    AI workout routines and nutritional suggestions powered by Google Gemini are processed via secure serverless endpoints. No personal credentials or raw identifying metadata are shared with external models for training.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 5. Security & Coach Access Controls
                  </h3>
                  <p>
                    Data is protected via Supabase Row Level Security (RLS) policies. Health data is completely private by default. Only trainers you explicitly approve have access to your metrics, and consent can be revoked with 1 tap.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
                    <Scale className="w-4 h-4" /> 1. Acceptance of Terms
                  </h3>
                  <p>
                    By creating an account, accessing, or downloading Calyxo, you agree to these Terms of Service. If you do not agree, you must discontinue using Calyxo immediately.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" /> 2. Medical & Exercise Disclaimer
                  </h3>
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-2">
                    <p className="font-bold text-destructive text-[11px]">
                      CALYXO IS NOT A MEDICAL DEVICE AND DOES NOT PROVIDE MEDICAL ADVICE OR DIAGNOSIS.
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      All workout splits, nutrition suggestions, calorie targets, and AI recommendations are for general athletic conditioning only. Always consult a physician before beginning any strenuous workout routine or diet.
                    </p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
                    <Activity className="w-4 h-4" /> 3. Assumption of Risk
                  </h3>
                  <p>
                    You voluntarily assume all risks associated with your physical exercise and dietary choices, releasing Calyxo, its trainers, and affiliates from liability for any injuries or damages.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
                    <Shield className="w-4 h-4" /> 4. Subscriptions & Billing
                  </h3>
                  <p>
                    Subscriptions (Calyxo High / Annual Pass) are billed on a recurring basis via authorized payment gateways (Razorpay / Apple IAP) and can be canceled anytime prior to renewal in Account Settings.
                  </p>
                </section>
              </>
            )}

            <div className="p-4 rounded-2xl bg-surface/80 border border-card-border flex items-center justify-between text-xs">
              <span className="text-muted font-semibold">Questions or Data Privacy Inquiries?</span>
              <a href="mailto:support@calyxo.com" className="text-acid-green font-bold hover:underline flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> support@calyxo.com
              </a>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-card-border bg-surface/90 backdrop-blur-md flex justify-end">
            <button 
              onClick={onClose}
              className="py-3 px-6 rounded-xl bg-acid-green text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
            >
              I Understand & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
