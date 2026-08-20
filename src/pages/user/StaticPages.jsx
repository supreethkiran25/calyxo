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
      className="space-y-8 max-w-4xl pb-12"
    >
      <div>
        <div className="flex items-center gap-2 text-acid-green text-xs font-black uppercase tracking-widest mb-1">
          <Shield className="w-4 h-4" /> Official Legal Agreement
        </div>
        <h1 className="text-3xl font-black text-foreground">Privacy Policy</h1>
        <p className="text-muted text-sm mt-1">Effective & Last Updated: 2026</p>
      </div>

      <motion.div variants={itemVariants} className="glass p-6 sm:p-8 rounded-3xl border border-card-border shadow-lg space-y-6 text-foreground text-xs leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Shield className="w-4 h-4" /> 1. Commitment to Health Data Privacy
          </h3>
          <p className="text-muted-foreground">
            Calyxo ("we", "our", or "us") is dedicated to protecting your privacy and biometric information. This Privacy Policy details how we collect, store, process, and protect your personal fitness, nutrition, and device data when you use the Calyxo mobile application, web dashboard, widgets, and live activities.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Activity className="w-4 h-4" /> 2. Apple HealthKit & Wearables Data Handling
          </h3>
          <p className="text-muted-foreground">
            When you connect Apple Health (HealthKit), Android Health Connect, or paired fitness wearables (Apple Watch, Garmin, Galaxy Watch, WHOOP, Oura), Calyxo reads only the data categories you explicitly authorize (e.g., active energy burned, daily step count, heart rate, and logged workouts).
          </p>
          <div className="p-3.5 rounded-2xl bg-surface/80 border border-card-border space-y-1.5 mt-2">
            <span className="font-black text-foreground block text-[11px] uppercase tracking-wider text-acid-green">Strict HealthKit Compliance Guarantee:</span>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li>We will <strong>NEVER</strong> use HealthKit or Health Connect data for marketing, advertising, or behavioral retargeting.</li>
              <li>We will <strong>NEVER</strong> sell, rent, or trade your health or biometric information to third parties, data brokers, or insurers.</li>
              <li>HealthKit data is processed securely on-device and in encrypted personal storage solely to power your live health rings, workout logs, and recovery metrics.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <FileText className="w-4 h-4" /> 3. Information We Collect
          </h3>
          <p className="text-muted-foreground">
            We collect information that you directly provide and data generated through app usage:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Account Identifiers:</strong> Email address, username, and authentication tokens via Supabase Auth.</li>
            <li><strong>Biometrics & Physical Profile:</strong> Age, biological sex, height, weight, target body weight, fitness experience level, and daily water targets.</li>
            <li><strong>Nutrition & Food Logs:</strong> Meal entries, timestamps, caloric intake, and macronutrient breakdowns (protein, carbohydrates, dietary fat).</li>
            <li><strong>Workout Sessions & Exercise Metrics:</strong> Exercise names, sets, repetitions, weights lifted, workout duration, and rest interval timestamps.</li>
            <li><strong>Device & Telemetry Data:</strong> Push notification device tokens, App Group shared preferences for Home Screen widgets, and ActivityKit attributes for Dynamic Island live countdowns.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Bot className="w-4 h-4" /> 4. AI Processing & Generative Intelligence
          </h3>
          <p className="text-muted-foreground">
            Calyxo integrates Google Gemini AI models to generate personalized workout routines and customized macro suggestions. All AI requests are dispatched through secure serverless backend functions. No personal credentials, passwords, or raw identifying profiles are transmitted to or stored by external generative AI providers for model training.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Lock className="w-4 h-4" /> 5. Data Security, Storage & Coach Access Controls
          </h3>
          <p className="text-muted-foreground">
            Your data is stored using enterprise-grade database encryption and safeguarded by Supabase Row Level Security (RLS) policies. By default, your health metrics are completely private. If you connect with a certified trainer on Calyxo, only that verified coach is granted read access to your workout and nutrition history. You may disconnect a coach at any time to instantly revoke access.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Scale className="w-4 h-4" /> 6. Your Legal Rights & Account Deletion
          </h3>
          <p className="text-muted-foreground">
            Under GDPR, CCPA, and applicable health data regulations, you have the right to request a full export of your biometric records, modify inaccurate profile details, or permanently delete your Calyxo account and all associated health records at any time directly through the app Settings or by contacting <a href="mailto:privacy@calyxo.com" className="text-acid-green font-bold underline">privacy@calyxo.com</a>.
          </p>
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
      className="space-y-8 max-w-4xl pb-12"
    >
      <div>
        <div className="flex items-center gap-2 text-acid-green text-xs font-black uppercase tracking-widest mb-1">
          <Scale className="w-4 h-4" /> User Agreement
        </div>
        <h1 className="text-3xl font-black text-foreground">Terms of Service</h1>
        <p className="text-muted text-sm mt-1">Effective & Last Updated: 2026</p>
      </div>

      <motion.div variants={itemVariants} className="glass p-6 sm:p-8 rounded-3xl border border-card-border shadow-lg space-y-6 text-foreground text-xs leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Scale className="w-4 h-4" /> 1. Acceptance of Terms
          </h3>
          <p className="text-muted-foreground">
            By creating an account, accessing, downloading, or using the Calyxo application, widgets, or services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you must discontinue using Calyxo immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" /> 2. Medical & Physical Exercise Disclaimer (IMPORTANT)
          </h3>
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-2">
            <p className="font-bold text-destructive text-[11px] leading-relaxed">
              CALYXO IS NOT A MEDICAL DEVICE AND DOES NOT PROVIDE MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT.
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              All nutritional recommendations, workout splits, calorie targets, AI health twin forecasts, and recovery indicators provided by Calyxo are intended solely for general athletic conditioning, fitness tracking, and informational purposes. Physical exercise carries inherent risk of injury. You should ALWAYS consult a qualified physician, doctor, or healthcare professional before beginning any new training regimen, strenuous weightlifting program, or dietary caloric restriction. If you experience chest pain, dizziness, shortness of breath, or joint pain while exercising, stop immediately and seek medical care.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Activity className="w-4 h-4" /> 3. Assumption of Risk & Release of Liability
          </h3>
          <p className="text-muted-foreground">
            You expressly acknowledge and agree that your athletic activities, workouts, and dietary choices involve risks to your physical body. To the maximum extent permitted by law, you voluntarily assume all known and unknown risks associated with your training, and release Calyxo, its founders, trainers, and affiliates from any claims, injuries, or damages arising out of your reliance on the app.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 4. Subscriptions, Premium Passes & Billing
          </h3>
          <p className="text-muted-foreground">
            Certain advanced capabilities (including Calyxo High, annual passes, custom AI program generation, and advanced analytics) are available via paid subscriptions. Subscriptions are billed through authorized payment processors (Razorpay / Apple In-App Purchases) on a recurring basis. You may manage or cancel your subscription at any time prior to the renewal date via your Account Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Shield className="w-4 h-4" /> 5. Account Eligibility & Acceptable Use
          </h3>
          <p className="text-muted-foreground">
            You must be at least 13 years old to use Calyxo. You agree to provide accurate registration information and not share your account credentials. You may not reverse-engineer, decompile, scrape, or disrupt Calyxo's systems, APIs, or trainer directories. We reserve the right to suspend or terminate accounts that violate community rules or engage in fraudulent activity.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Mail className="w-4 h-4" /> 6. Contact & Inquiries
          </h3>
          <p className="text-muted-foreground">
            For questions regarding these Terms of Service or to submit legal notices, contact our compliance team at <a href="mailto:support@calyxo.com" className="text-acid-green font-bold underline">support@calyxo.com</a>.
          </p>
        </section>
      </motion.div>
    </motion.div>
  );
}
