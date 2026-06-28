"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, BookOpen, BarChart2, User, Plus, LogOut, Bot, Sparkles, X, TrendingUp, Heart, Users, Grid, ChevronRight, MoreHorizontal, Share2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { 
  subscribeToAuth, 
  signOutUser, 
  getEcosystemState, 
  getUserProfile, 
  saveUserProfile,
  getFoodLogs, 
  getWorkoutLogs, 
  getWeightLogs, 
  getWaterIntake 
} from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';

import dynamic from 'next/dynamic';

// Component imports
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import LaunchScreen from '../components/LaunchScreen';
import AuthFlow from '../components/AuthFlow';
import OnboardingFlow from '../components/OnboardingFlow';
import LandingPage from '../components/LandingPage';
import BackgroundEffects from '../components/BackgroundEffects';

// Reusable loader skeleton for lazy-loaded tabs
function TabSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse p-4">
      <div className="flex gap-4">
        <div className="skeleton h-10 w-36" />
        <div className="skeleton h-10 w-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );
}

const Dashboard = dynamic(() => import('../components/Dashboard'), { ssr: false, loading: () => <TabSkeleton /> });
const FoodTracker = dynamic(() => import('../components/FoodTracker'), { ssr: false, loading: () => <TabSkeleton /> });
const WorkoutLogger = dynamic(() => import('../components/WorkoutLogger'), { ssr: false, loading: () => <TabSkeleton /> });
const AICoach = dynamic(() => import('../components/AICoach'), { ssr: false, loading: () => <TabSkeleton /> });
const UserProfile = dynamic(() => import('../components/UserProfile'), { ssr: false, loading: () => <TabSkeleton /> });
const Progress = dynamic(() => import('../components/Progress'), { ssr: false, loading: () => <TabSkeleton /> });
const HealthHub = dynamic(() => import('../components/HealthHub'), { ssr: false, loading: () => <TabSkeleton /> });
const TrainerEcosystem = dynamic(() => import('../components/TrainerEcosystem'), { ssr: false, loading: () => <TabSkeleton /> });
const SocialHub = dynamic(() => import('../components/SocialHub'), { ssr: false, loading: () => <TabSkeleton /> });

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'coach', label: 'AI Coach', icon: Bot },
  { id: 'healthhub', label: 'Health Hub', icon: Heart },
  { id: 'nutrition', label: 'Nutrition', icon: BookOpen },
  { id: 'workout', label: 'Workouts', icon: BarChart2 },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'social', label: 'Social Hub', icon: Share2 },
  { id: 'trainerhub', label: 'Trainer Hub', icon: Users, roleGated: true },
  { id: 'profile', label: 'Profile', icon: User },
];

// Primary items shown in mobile bottom bar (max 4 + More)
const MOBILE_PRIMARY = [
  { id: 'dashboard', label: 'Home', icon: HomeIcon },
  { id: 'coach',     label: 'Coach', icon: Bot },
  { id: 'nutrition', label: 'Food',  icon: BookOpen },
  { id: 'workout',   label: 'Train', icon: BarChart2 },
];

// Items accessible via the "More" sheet on mobile
const MOBILE_MORE = [
  { id: 'progress',   label: 'Progress',    icon: TrendingUp },
  { id: 'healthhub', label: 'Health Hub',   icon: Heart },
  { id: 'social',     label: 'Social Hub',   icon: Share2 },
  { id: 'trainerhub',label: 'Trainer Hub',  icon: Users },
  { id: 'profile',   label: 'Profile',      icon: User },
];

export default function Home() {
  const {
    user,
    setUser,
    activeTab,
    setActiveTab,
    initializeTheme,
    resetStore,
    userProfile,
    setUserProfile,
    setFoodLogs,
    setWorkoutLogs,
    setWeightLogs,
    setWaterIntake
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreSheetRef = useRef(null);

  // Close More sheet on outside tap
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => {
      if (moreSheetRef.current && !moreSheetRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [moreOpen]);

  const showNotification = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    initializeTheme();
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Sync Ecosystem State
          const ecoState = await getEcosystemState(currentUser.uid);
          if (ecoState) {
            useEcosystemStore.getState().syncEcosystemState(ecoState);
          }

          // Fetch User Profile
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            // Check if user has biometrics but is not marked onboarded yet
            if (profile.onboarded === undefined || profile.onboarded === null) {
              if (profile.weight && profile.height && profile.firstName) {
                profile.onboarded = true;
                await saveUserProfile(currentUser.uid, profile);
              } else {
                profile.onboarded = false;
              }
            }
            setUserProfile(profile);

            // Fetch other logs if already onboarded
            if (profile.onboarded) {
              const food = await getFoodLogs(currentUser.uid);
              if (food) setFoodLogs(food);

              const workouts = await getWorkoutLogs(currentUser.uid);
              if (workouts) setWorkoutLogs(workouts);

              const weights = await getWeightLogs(currentUser.uid);
              if (weights) setWeightLogs(weights);

              const water = await getWaterIntake(currentUser.uid);
              if (water !== undefined && water !== null) setWaterIntake(water);
            }
          }
        } catch (e) {
          console.error("Auth sync profile/logs error", e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [setUser, initializeTheme, setUserProfile, setFoodLogs, setWorkoutLogs, setWeightLogs, setWaterIntake]);

  const handleLogout = async () => {
    if (window.confirm("Sign out of Calyxo?")) {
      await signOutUser();
      resetStore();
      useEcosystemStore.getState().resetEcosystemStore();
      showNotification("Signed out successfully.");
    }
  };

  if (loading) return <LaunchScreen isLoading={loading} />;
  if (!user) return <LandingPage />;
  if (!userProfile?.onboarded) {
    return <OnboardingFlow onComplete={() => showNotification("Welcome to Calyxo! Let's smash your goals.")} onNotification={showNotification} />;
  }

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen flex flex-row relative select-none bg-[var(--background)] text-[var(--foreground)]">
      {/* Immersive Optional Background Effects */}
      <BackgroundEffects activeTab={activeTab} />

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
              border: '1px solid var(--accent)',
              borderRadius: '24px',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 30px var(--accent-glow)',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', flexShrink: 0 }} />
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
            <span className="brand-name text-lg text-[var(--foreground)]">
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
              className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
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
            <span className="brand-name text-md text-[var(--foreground)]">
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

        {/* Mobile FAB Button — sits above the nav bar with safe-area support */}
        <button
          onClick={() => setAddMenuOpen(true)}
          className="md:hidden fixed z-40 w-13 h-13 rounded-full bg-[var(--color-acid-green)] text-accent-foreground flex items-center justify-center shadow-xl shadow-[var(--color-acid-green)]/40 cursor-pointer active:scale-90 transition-transform"
          style={{ bottom: 'calc(64px + 12px + env(safe-area-inset-bottom, 0px))', right: '20px' }}
          aria-label="Quick log"
        >
          <Plus className="w-6 h-6 text-accent-foreground" />
        </button>

        {/* Main Content Area */}
        <main className={`flex-1 w-full max-w-7xl mx-auto px-3 py-4 md:p-6 ${
          activeTab === 'coach' ? 'overflow-hidden' : 'overflow-y-auto'
        }`}
          style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
        >
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
              {activeTab === 'coach' && <AICoach onNotification={showNotification} />}
              {activeTab === 'healthhub' && <HealthHub onNotification={showNotification} />}
              {activeTab === 'nutrition' && <FoodTracker onNotification={showNotification} />}
              {activeTab === 'workout' && <WorkoutLogger onNotification={showNotification} />}
              {activeTab === 'progress' && <Progress onNotification={showNotification} />}
              {activeTab === 'trainerhub' && <TrainerEcosystem onNotification={showNotification} />}
              {activeTab === 'social' && <SocialHub onNotification={showNotification} />}
              {activeTab === 'profile' && <UserProfile onNotification={showNotification} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Mobile Bottom Navigation (4 primary + More) ── */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--nav-bg)] border-t border-[var(--nav-border)] backdrop-blur-xl md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex justify-around items-center px-1 pt-1 pb-1 h-16">
            {MOBILE_PRIMARY.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMoreOpen(false); }}
                  className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-colors cursor-pointer border-none relative ${
                    isActive ? 'text-[var(--color-acid-green)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-bg"
                      className="absolute inset-0 bg-[var(--color-acid-green)]/10 rounded-xl"
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="text-[10px] font-bold tracking-tight relative z-10">{item.label}</span>
                </button>
              );
            })}

            {/* More button */}
            <button
              onClick={() => setMoreOpen(prev => !prev)}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-colors cursor-pointer border-none relative ${
                moreOpen || MOBILE_MORE.some(m => m.id === activeTab)
                  ? 'text-[var(--color-acid-green)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {(moreOpen || MOBILE_MORE.some(m => m.id === activeTab)) && (
                <motion.div
                  layoutId="mobile-nav-bg"
                  className="absolute inset-0 bg-[var(--color-acid-green)]/10 rounded-xl"
                />
              )}
              <MoreHorizontal className="w-5 h-5 relative z-10" />
              <span className="text-[10px] font-bold tracking-tight relative z-10">More</span>
            </button>
          </div>
        </nav>

        {/* ── More Sheet (backdrop + slide-up panel) ── */}
        <AnimatePresence>
          {moreOpen && (
            <>
              <motion.div
                key="more-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                onClick={() => setMoreOpen(false)}
              />
              <motion.div
                key="more-sheet"
                ref={moreSheetRef}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed left-0 right-0 bottom-16 z-40 md:hidden rounded-t-2xl border-t border-[var(--card-border)] shadow-2xl"
                style={{
                  background: 'var(--background)',
                  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                  bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))'
                }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-8 h-1 rounded-full bg-[var(--text-muted)]/30" />
                </div>

                <div className="px-4 pb-4">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-1">More</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MOBILE_MORE.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveTab(item.id); setMoreOpen(false); }}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[var(--color-acid-green)]/10 text-[var(--color-acid-green)] border-[var(--color-acid-green)]/25'
                              : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--card-border)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Theme + Sign Out row */}
                  <div className="flex gap-2 mt-3">
                    <div className="flex items-center gap-2 flex-1 px-4 py-3 bg-[var(--surface)] border border-[var(--card-border)] rounded-xl">
                      <ThemeToggle />
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Theme</span>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMoreOpen(false); }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive/5 border border-destructive/20 rounded-xl text-destructive text-xs font-bold cursor-pointer hover:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
