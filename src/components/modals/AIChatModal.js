import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useQuickActionsStore from '../../store/useQuickActionsStore.js';
import AIIntelligenceHub from '../ai/AIIntelligenceHub.jsx';

export default function AIChatModal() {
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();

  if (activeWorkflow !== 'start_chat') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-background/80 backdrop-blur-md" 
          onClick={closeWorkflow} 
        />
        
        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, y: '100%' }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="relative w-full sm:max-w-5xl bg-background border-t sm:border border-card-border rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col h-[92dvh] sm:h-[85vh] max-h-[100dvh] overflow-hidden z-10"
        >
          <AIIntelligenceHub isModal={true} onClose={closeWorkflow} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
