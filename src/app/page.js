"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, BookOpen, BarChart2, User, Plus, LogOut, Bot, Sparkles, X, TrendingUp, Heart, Users, Grid, ChevronRight, MoreHorizontal, Share2, Search } from 'lucide-react';
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
import UsernameMigrationFlow from '../components/UsernameMigrationFlow';
import LandingPage from '../components/LandingPage';
import BackgroundEffects from '../components/BackgroundEffects';
import QuickActionsSheet from '../components/QuickActionsSheet';
import GlobalSearch from '../components/GlobalSearch';
import AIWorkspace from '../components/AIWorkspace';

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

const DESKTOP_NAV = [
  {
    group: 'HOME',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
      { id: 'progress', label: "Today's Progress", icon: TrendingUp },
    ]
  },
  {
    group: 'HEALTH',
    items: [
      { id: 'nutrition', label: 'Nutrition', icon: BookOpen },
      { id: 'workout', label: 'Workouts', icon: BarChart2 },
      { id: 'healthhub', label: 'Health Hub', icon: Heart },
    ]
  },
  {
    group: 'SOCIAL',
    items: [
      { id: 'social', label: 'Social Hub', icon: Share2 },
    ]
  },
  {
    group: 'AI',
    items: [
      { id: 'ai', label: 'AI Workspace', icon: Sparkles },
    ]
  },
  {
    group: 'ECOSYSTEM',
    items: [
      { id: 'trainerhub', label: 'Trainer Hub', icon: Users, roleGated: true },
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { id: 'profile', label: 'Profile', icon: User },
    ]
  }
];

const MOBILE_NAV = [
  { id: 'dashboard', label: 'Home', icon: HomeIcon },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'create', label: 'Create', icon: Plus, isCreate: true },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'profile', label: 'Profile', icon: User },
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
  
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


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

      {/* Global Search */}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Quick-Log Overlay / Modal */}
      <QuickActionsSheet
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onAction={(actionId) => {
          // Handle actions contextually
          if (actionId === 'log_workout') setActiveTab('workout');
          else if (actionId === 'log_meal') setActiveTab('nutrition');
          else if (actionId === 'start_chat') setActiveTab('ai');
          else setToast(`Action: ${actionId} selected`);
        }}
      />

      {/* ── Desktop Left Sidebar ── */}
      <aside className={`hidden md:flex flex-col bg-[var(--card-bg)] border-r border-[var(--card-border)] fixed left-0 top-0 bottom-0 z-30 justify-between transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar pt-6">
          
          {/* Logo & Toggle */}
          <div className={`flex items-center px-6 mb-8 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8 text-[var(--color-acid-green)]" glow={true} />
              {!isSidebarCollapsed && (
                <span className="brand-name text-lg text-[var(--foreground)]">calyxo</span>
              )}
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="flex flex-col flex-1 px-4 pb-4">
            {DESKTOP_NAV.map((group, idx) => (
              <div key={group.group} className="mb-6">
                {!isSidebarCollapsed && (
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 px-3">
                    {group.group}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        title={isSidebarCollapsed ? item.label : ''}
                        className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[var(--color-acid-green)]/10 text-[var(--color-acid-green)]' 
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
                        } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar Actions */}
        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)]">
          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsQuickActionsOpen(true)}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-lg mb-4"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          )}

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
      <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="flex md:hidden justify-between items-center px-5 py-4 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-lg sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" glow={false} />
            <span className="brand-name text-md text-[var(--foreground)]">calyxo</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--card-border)] text-[var(--text-muted)] cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--card-border)] text-[var(--text-muted)] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Desktop Header Search */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-card-border bg-background/80 backdrop-blur-lg sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl bg-surface border border-card-border text-muted hover:text-foreground transition-colors"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--input)] border border-card-border rounded-xl text-muted text-xs hover:border-acid-green transition-colors w-64"
            >
              <Search className="w-4 h-4" />
              <span>Search ecosystem...</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 w-full max-w-7xl mx-auto px-3 py-4 md:p-6 ${
          (activeTab === 'coach' || activeTab === 'ai') ? 'overflow-hidden' : 'overflow-y-auto'
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
              {activeTab === 'ai' && <AIWorkspace onNotification={showNotification} />}
              {activeTab === 'healthhub' && <HealthHub onNotification={showNotification} />}
              {activeTab === 'nutrition' && <FoodTracker onNotification={showNotification} />}
              {activeTab === 'workout' && <WorkoutLogger onNotification={showNotification} />}
              {activeTab === 'progress' && <Progress />}
              {activeTab === 'trainerhub' && <TrainerEcosystem currentUserId={user.uid} />}
              {activeTab === 'social' && <SocialHub onNotification={showNotification} />}
              {activeTab === 'profile' && <UserProfile />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {/* ── Mobile Bottom Navigation ── */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--background)]/90 backdrop-blur-xl border-t border-[var(--card-border)] z-30 px-2 pb-safe"
      >
        <div className="flex items-center justify-around h-16">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            if (item.isCreate) {
              return (
                <button
                  key={item.id}
                  onClick={() => setIsQuickActionsOpen(true)}
                  className="flex flex-col items-center justify-center -mt-6 outline-none"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-acid-green)] text-accent-foreground flex items-center justify-center shadow-lg shadow-[var(--color-acid-green)]/30 active:scale-95 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                </button>
              );
            }

            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors outline-none ${
                  isActive ? 'text-[var(--color-acid-green)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-[var(--color-acid-green)]/20' : ''}`} />
                <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
