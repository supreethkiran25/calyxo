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
      className="space-y-8 max-w-4xl"
    >
      <div>
        <h1 className="text-3xl font-black text-foreground">Privacy Policy</h1>
        <p className="text-muted text-sm mt-1">Last Updated: July 2026</p>
      </div>

      <motion.div variants={itemVariants} className="glass p-6 sm:p-8 rounded-3xl border border-card-border shadow-lg space-y-6">
        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Shield className="w-4 h-4" /> 1. Data Collection & Usage
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Calyxo collects biometric indicators (weight, height, age, activity level), logged nutrition items, sleeping duration logs, and workout metrics to feed our analytics engines. This data is exclusively used to tailor health predictions and calculations.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Shield className="w-4 h-4" /> 2. Security & AI Models
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All AI-driven analysis is proxied securely through serverless endpoints. No personal identifiability metadata (such as passwords, raw emails, or phone numbers) is shared with third-party generative intelligence models.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Shield className="w-4 h-4" /> 3. Coach Access Control
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your workout and nutrition logs are only visible to trainers with whom you have explicitly accepted a connection request. You can terminate connections at any time to instantly revoke access to your metrics history.
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
      className="space-y-8 max-w-4xl"
    >
      <div>
        <h1 className="text-3xl font-black text-foreground">Terms of Service</h1>
        <p className="text-muted text-sm mt-1">Last Updated: July 2026</p>
      </div>

      <motion.div variants={itemVariants} className="glass p-6 sm:p-8 rounded-3xl border border-card-border shadow-lg space-y-6">
        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Scale className="w-4 h-4" /> 1. User Responsibility
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By using Calyxo, you agree to input accurate biometric data to prevent skewed calculations. Any workout routines or nutritional suggestions generated by Calyxo AI are intended for informational guidance only. Always consult a physician before starting any extreme diet or weightlifting program.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Scale className="w-4 h-4" /> 2. Account Security
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You are responsible for keeping your login credentials confidential. Calyxo employs Supabase Auth and database RLS policies to safeguard data, but any suspicious activity should be reported immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-acid-green flex items-center gap-2">
            <Scale className="w-4 h-4" /> 3. Fair Usage Policy
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We reserve the right to limit, suspend, or terminate access for accounts that engage in system exploitation, API abuse, or spamming trainer directories.
          </p>
        </section>
      </motion.div>
    </motion.div>
  );
}
