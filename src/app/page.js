"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, BookOpen, BarChart2, User, Plus, LogOut, Bot, Sparkles, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { subscribeToAuth, signOutUser } from '../lib/dbService';

// Component imports
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import LaunchScreen from '../components/LaunchScreen';
import AuthFlow from '../components/AuthFlow';
import Dashboard from '../components/Dashboard';
import FoodTracker from '../components/FoodTracker';
import WorkoutLogger from '../components/WorkoutLogger';
import AICoach from '../components/AICoach';
import UserProfile from '../components/UserProfile';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: HomeIcon },
  { id: 'nutrition', label: 'Diary', icon: BookOpen },
  { id: 'workout', label: 'Stats', icon: BarChart2 },
  { id: 'coach', label: 'AI Coach', icon: Bot },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function Home() {
  const {
    user,
    setUser,
    activeTab,
    setActiveTab,
    initializeTheme,
    resetStore
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    initializeTheme();
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      const timer = setTimeout(() => setLoading(false), 1800);
      return () => clearTimeout(timer);
    });
    return () => unsubscribe();
  }, [setUser, initializeTheme]);

  const handleLogout = async () => {
    if (window.confirm("Sign out of Calyxo?")) {
      await signOutUser();
      resetStore();
      showNotification("Signed out successfully.");
    }
  };

  if (loading) return <LaunchScreen isLoading={loading} />;
  if (!user) return <AuthFlow />;

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen flex flex-row relative select-none bg-[var(--background)] text-[var(--foreground)]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -16, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              zIndex: 100,
              background: 'var(--card-bg)',
              border: '1px solid var(--color-acid-green)',
              borderRadius: '24px',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 30px rgba(181,242,61,0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ width: '8px', height: '8px', background: '#b5f23d', borderRadius: '50%', flexShrink: 0 }} />
            <span className="text-xs font-bold text-[var(--foreground)]">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick-Log Overlay / Modal */}
      <AnimatePresence>
        {addMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl w-full max-w-[320px] shadow-2xl relative"
            >
              <button 
                onClick={() => setAddMenuOpen(false)}
                className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Quick Logger</p>
              
              <div className="space-y-3">
                {[
                  { label: 'Log Food Intake', action: 'nutrition', emoji: '🍽️' },
                  { label: 'Log Active Workout', action: 'workout', emoji: '💪' },
                  { label: 'Consult AI Coach', action: 'coach', emoji: '🤖' },
                ].map((item) => (
                  <button
                    key={item.action}
                    onClick={() => { setActiveTab(item.action); setAddMenuOpen(false); }}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--card-border)] text-[var(--foreground)] text-xs font-bold hover:border-[var(--color-acid-green)] hover:bg-[var(--color-acid-green)]/5 transition-all text-left cursor-pointer"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Desktop Left Sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 bg-[var(--card-bg)] border-r border-[var(--card-border)] p-6 flex-col fixed left-0 top-0 bottom-0 z-30 justify-between">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <Logo className="w-8 h-8 text-[var(--color-acid-green)]" glow={true} />
            <span className="text-lg font-black tracking-widest text-[var(--foreground)] uppercase">
              calyxo
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 mt-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    isActive 
                      ? 'bg-[var(--color-acid-green)]/10 text-[var(--color-acid-green)] border-[var(--color-acid-green)]/20' 
                      : 'text-[var(--text-muted)] border-transparent hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Actions */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setAddMenuOpen(true)}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-[var(--color-acid-green)]/10 cursor-pointer active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </button>

          <div className="flex items-center justify-between border-t border-[var(--card-border)] pt-4 px-2">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Theme</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/30 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Layout Wrapper ── */}
      <div className="flex-1 min-h-screen flex flex-col md:pl-64">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="flex md:hidden justify-between items-center px-5 py-4 border-b border-[var(--card-border)] bg-[var(--background)] sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" glow={false} />
            <span className="text-md font-black tracking-widest text-[var(--foreground)] uppercase">
              calyxo
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--card-border)] text-[var(--text-muted)] cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile FAB Button */}
        <button
          onClick={() => setAddMenuOpen(true)}
          className="md:hidden fixed bottom-20 right-5 z-40 w-12 h-12 rounded-full bg-[var(--color-acid-green)] text-black flex items-center justify-center shadow-lg shadow-[var(--color-acid-green)]/35 cursor-pointer active:scale-90 transition-transform"
          style={{ bottom: '80px' }}
        >
          <Plus className="w-6 h-6 text-black" />
        </button>

        {/* Dashboard Greeting (Only on dashboard tab) */}
        {activeTab === 'dashboard' && (
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-[var(--foreground)]">
              Hello, {firstName} 👋
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-muted)] font-medium mt-1">
              Let&apos;s crash your goals today!
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard onNotification={showNotification} />}
              {activeTab === 'nutrition' && <FoodTracker onNotification={showNotification} />}
              {activeTab === 'workout' && <WorkoutLogger onNotification={showNotification} />}
              {activeTab === 'coach' && <AICoach />}
              {activeTab === 'profile' && <UserProfile onNotification={showNotification} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--nav-bg)] border-t border-[var(--nav-border)] backdrop-blur-lg px-2 py-3 flex justify-around items-center md:hidden h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 bg-none border-none cursor-pointer relative transition-colors ${
                  isActive ? 'text-[var(--color-acid-green)]' : 'text-[var(--text-muted)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-wide">
                  {item.label === 'AI Coach' ? 'Coach' : item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="nav-dot-active"
                    className="absolute -bottom-1.5 w-1 h-1 bg-[var(--color-acid-green)] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
