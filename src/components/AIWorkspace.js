import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Utensils, Dumbbell, Activity, BrainCircuit } from 'lucide-react';
import AICoach from './AICoach';

export default function AIWorkspace({ onNotification }) {
  const [activeTab, setActiveTab] = useState('coach');

  const tabs = [
    { id: 'coach', label: 'Coach', icon: Bot },
    { id: 'meals', label: 'Meals', icon: Utensils },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'reports', label: 'Reports', icon: Activity },
    { id: 'twin', label: 'Health Twin', icon: BrainCircuit }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'coach':
        return <AICoach onNotification={onNotification} />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted">
            <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Advanced AI Features</h2>
            <p className="text-xs font-medium mt-2 max-w-sm">This module is part of the upcoming AI expansion phase. For now, use the AI Coach.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Navigation */}
      <div className="px-4 py-2 border-b border-card-border glass sticky top-0 z-20 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  isActive 
                    ? 'bg-acid-green text-accent-foreground shadow-lg' 
                    : 'bg-surface border border-card-border text-muted hover:text-foreground hover:border-acid-green/50'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
