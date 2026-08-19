import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import AICoach from '../AICoach';
import PremiumGate from '../PremiumGate';
import { useStore } from '../../store/useStore';

export default function AIChatModal() {
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const plan = userProfile?.subscriptionPlan;
  const email = (user?.email || userProfile?.email || "").toLowerCase().trim();
  const isSubscribed = Boolean(
    userProfile?.isSubscribed || 
    (plan && plan !== 'FREE' && plan !== 'DEFAULT') ||
    email === 'supreethkiran25@gmail.com'
  );

  if (activeWorkflow !== 'start_chat') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeWorkflow} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-surface border border-card-border rounded-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-card-border shrink-0">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-acid-green" /> AI Coach
            </h2>
            <button onClick={closeWorkflow} className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSubscribed ? (
              <AICoach autoFocus={true} />
            ) : (
              <PremiumGate 
                title="AI Coach Chat Locked"
                description="AI Coach chat requires an active AI Premium subscription (₹2/month). Subscribe now to unlock full AI Coach features."
                requiredTier="MEDIUM"
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
