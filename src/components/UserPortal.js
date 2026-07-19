import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, BookOpen, BarChart2, User, Users, Plus, LogOut, Bot, Sparkles, X, TrendingUp, Heart, Grid, ChevronRight, Search, Menu, Dumbbell } from 'lucide-react';
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
import useCreateHubStore from '../store/useCreateHubStore';

// Component imports
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import LaunchScreen from '../components/LaunchScreen';
import AuthFlow from '../components/AuthFlow';
import OnboardingFlow from '../components/OnboardingFlow';

import LandingPage from '../components/LandingPage';
import BackgroundEffects from '../components/BackgroundEffects';
import QuickActionsSheet from '../components/QuickActionsSheet';
import WorkoutLoggerModal from '../components/CreateHub/WorkoutLoggerModal';
import MealLoggerModal from '../components/CreateHub/MealLoggerModal';
import FoodScannerModal from '../components/CreateHub/FoodScannerModal';
import ProgressUploadModal from '../components/CreateHub/ProgressUploadModal';
import AIChatModal from '../components/CreateHub/AIChatModal';
import GlobalSearch from '../components/GlobalSearch';
import AIWorkspace from '../components/AIWorkspace';
import MobileDrawerMenu from '../components/MobileDrawerMenu';

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

const Dashboard = lazy(() => import('../components/Dashboard'));
const TrainerDashboard = lazy(() => import('../components/TrainerDashboard'));
const FoodTracker = lazy(() => import('../components/FoodTracker'));
const WorkoutLogger = lazy(() => import('../components/WorkoutLogger'));
const AICoach = lazy(() => import('../components/AICoach'));
const UserProfile = lazy(() => import('../components/UserProfile'));
const Progress = lazy(() => import('../components/Progress'));
const HealthHub = lazy(() => import('../components/HealthHub'));
const TrainerConnect = lazy(() => import('../components/TrainerConnect'));

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
    group: 'AI',
    items: [
      { id: 'ai', label: 'AI Workspace', icon: Sparkles },
    ]
  },

  {
    group: 'ACCOUNT',
    items: [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'trainer_connect', label: 'My Coach', icon: Users },
    ]
  }
];

const MOBILE_NAV = [
  { id: 'dashboard', label: 'Home', icon: HomeIcon },
  { id: 'nutrition', label: 'Nutrition', icon: BookOpen },
  { id: 'create', label: 'Create', icon: Plus, isCreate: true },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function UserPortal() {
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
  const { activeWorkflow, setActiveWorkflow } = useCreateHubStore();
  
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


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

  const currentRole = userProfile?.role || 'user';

  const currentDesktopNav = React.useMemo(() => {
    const nav = DESKTOP_NAV.map(group => ({ ...group, items: [...group.items] }));
    if (currentRole === 'trainer') {
      const homeGroup = nav.find(g => g.group === 'HOME');
      if (homeGroup && !homeGroup.items.find(i => i.id === 'trainer')) {
        homeGroup.items.push({ id: 'trainer', label: 'Trainer Hub', icon: Users });
      }
    }
    return nav;
  }, [currentRole]);

  const currentMobileNav = React.useMemo(() => {
    const nav = [...MOBILE_NAV];
    if (currentRole === 'trainer' && !nav.find(i => i.id === 'trainer')) {
      const targetIdx = nav.findIndex(n => n.id === 'nutrition') + 1;
      nav.splice(targetIdx, 0, { id: 'trainer', label: 'Clients', icon: Users });
    }
    return nav;
  }, [currentRole]);

  // Removed early returns which are now handled in the page.js Orchestrator
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  return (
    <div className={`min-h-screen flex flex-row relative select-none bg-[var(--background)] text-[var(--foreground)] role-${currentRole}`}>
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
          // The QuickActionsSheet internally sets the active workflow in Zustand.
        }}
      />

      {/* Create Hub Modals */}
      <WorkoutLoggerModal />
      <MealLoggerModal />
      <FoodScannerModal />
      <ProgressUploadModal />
      <AIChatModal />
      <MobileDrawerMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />


      {/* â”€â”€ Desktop Left Sidebar â”€â”€ */}
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
            {currentDesktopNav.map((group, idx) => (
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
            </div>
            
            <button
              onClick={handleLogout}
              className={`p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--orange-theme)] hover:bg-[var(--orange-theme)]/10 transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ——— Main Layout Wrapper ——— */}
      <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="flex md:hidden justify-between items-center px-5 pb-4 pt-safe-inset border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-lg sticky top-0 z-30">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 rounded-xl bg-transparent text-[var(--foreground)] cursor-pointer outline-none hover:bg-[var(--surface)] transition-colors mr-0.5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo className="w-6 h-6" glow={false} />
            <span className="brand-name text-[15px] text-[var(--foreground)] -ml-0.5 mt-0.5">calyxo</span>
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
              <Suspense fallback={<TabSkeleton />}>
                {activeTab === 'dashboard' && <Dashboard onNotification={showNotification} />}
                {activeTab === 'trainer' && <TrainerDashboard userId={user?.id || user?.uid} />}
                {activeTab === 'coach' && <AICoach onNotification={showNotification} />}
                {activeTab === 'ai' && <AIWorkspace onNotification={showNotification} />}
                {activeTab === 'healthhub' && <HealthHub onNotification={showNotification} />}
                {activeTab === 'nutrition' && <FoodTracker onNotification={showNotification} />}
                {activeTab === 'workout' && <WorkoutLogger onNotification={showNotification} />}
                {activeTab === 'progress' && <Progress />}
                {activeTab === 'trainer_connect' && <TrainerConnect />}

                {activeTab === 'profile' && <UserProfile />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {/* â”€â”€ Mobile Bottom Navigation â”€â”€ */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--background)]/90 backdrop-blur-xl border-t border-[var(--card-border)] z-30 px-2 pb-safe"
      >
        <div className="flex items-center justify-around h-16">
          {currentMobileNav.map((item) => {
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
