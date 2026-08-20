import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Heart, Activity, Sparkles } from 'lucide-react';

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

export default function AboutPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">About Calyxo</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">Track Today. Transform Tomorrow.</p>
      </div>

      <motion.div variants={itemVariants} className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--card-border)] shadow-lg space-y-4">
        <h2 className="text-lg font-black text-emerald-400 flex items-center gap-2">
          <Activity className="w-5 h-5" /> The Health Operating System
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          Calyxo is a premium, unified fitness and nutrition platform built to bridge the gap between clients and elite coaches. Our mission is to combine state-of-the-art tracking engines, interactive 3D indicators, gamified leveling loops, and professional trainer CRM workflows into a singular, cohesive health operating system.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-[var(--surface)] border border-[var(--card-border)] p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[var(--foreground)]">AI Health Twin</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Deep learning engine that analyzes your weight logs, macro intake, sleep cycles, and physical workouts to predict recovery indices and biological trends.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[var(--surface)] border border-[var(--card-border)] p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[var(--foreground)]">Coaching Integrations</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Direct trainer-client pipelines enabling real-time workout assignment, diet plan prescriptions, calendar meetings, and messaging vaults.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[var(--surface)] border border-[var(--card-border)] p-5 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[var(--foreground)]">Ecosystem & XP</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Every logged food item, completed workout, and hydration milestone grants experience points (XP) to fuel your health score leveling system.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
