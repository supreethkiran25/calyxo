import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Dumbbell, TrendingUp, Droplets, Heart, PieChart, Info, HelpCircle, Shield, FileText, ChevronRight, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { signOutUser } from '../lib/dbService';

const MENU_ITEMS = [
  {
    group: 'Modules',
    items: [
      { id: 'coach', label: 'AI Coach', icon: Bot, color: 'text-[var(--color-acid-green)]' },
      { id: 'workout', label: 'Workout Logger', icon: Dumbbell, color: 'text-foreground' },
      { id: 'progress', label: 'Progress & Analytics', icon: TrendingUp, color: 'text-foreground' },
      { id: 'healthhub', label: 'Health Hub', icon: Heart, color: 'text-foreground' },
    ]
  }
];

export default function MobileDrawerMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { setActiveTab } = useStore();

  const handleNavigation = (id) => {
    if (id === 'coach') {
      navigate('/user/ai');
    } else if (['workout', 'progress', 'healthhub', 'about', 'support', 'privacy', 'terms'].includes(id)) {
      navigate(`/user/${id}`);
    } else {
      console.log('Navigate to static page:', id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-[var(--card-bg)] border-r border-[var(--card-border)] z-[101] flex flex-col md:hidden pt-safe-inset"
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)]">
              <span className="brand-name text-lg text-[var(--foreground)] tracking-wide">Menu</span>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-[var(--surface)] border border-[var(--card-border)] text-muted hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-safe p-5">
              {MENU_ITEMS.map((group, idx) => (
                <div key={idx} className="mb-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 pl-2">
                    {group.group}
                  </h4>
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.id)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface)] border border-transparent hover:border-[var(--card-border)] transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${item.color}`} />
                            <span className={`text-sm font-bold ${item.id === 'coach' ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted opacity-50" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Theme & Logout */}
              <div className="mt-auto pt-6 border-t border-[var(--card-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <span className="text-xs font-bold text-muted">Theme</span>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm('Sign out of Calyxo?')) {
                      await signOutUser();
                      window.location.href = '/';
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors bg-transparent border-none cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-bold">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
