"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, BookOpen, BarChart2, User, Plus, LogOut, Bot, Sparkles, X, TrendingUp, Activity, ShieldAlert, Dumbbell } from 'lucide-react';
import { useRBACStore } from '../store/useRBACStore';
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

const Dashboard = dynamic(() => import('../components/Dashboard'), { loading: () => <TabSkeleton /> });
const FoodTracker = dynamic(() => import('../components/FoodTracker'), { loading: () => <TabSkeleton /> });
const WorkoutLogger = dynamic(() => import('../components/WorkoutLogger'), { loading: () => <TabSkeleton /> });
const AICoach = dynamic(() => import('../components/AICoach'), { loading: () => <TabSkeleton /> });
const UserProfile = dynamic(() => import('../components/UserProfile'), { loading: () => <TabSkeleton /> });
const Progress = dynamic(() => import('../components/Progress'), { loading: () => <TabSkeleton /> });
const HealthHub = dynamic(() => import('../components/HealthHub'), { loading: () => <TabSkeleton /> });
const TrainerDashboard = dynamic(() => import('../components/TrainerDashboard'), { loading: () => <TabSkeleton /> });
const DietitianDashboard = dynamic(() => import('../components/DietitianDashboard'), { loading: () => <TabSkeleton /> });
const AdminDashboard = dynamic(() => import('../components/AdminDashboard'), { loading: () => <TabSkeleton /> });

const USER_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'coach', label: 'AI Coach', icon: Bot },
  { id: 'nutrition', label: 'Nutrition', icon: BookOpen },
  { id: 'workout', label: 'Workouts', icon: BarChart2 },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'healthhub', label: 'Health Hub', icon: Activity },
  { id: 'profile', label: 'Profile', icon: User },
];

const TRAINER_NAV = [
  { id: 'trainer_dashboard', label: 'Trainer Hub', icon: HomeIcon },
  { id: 'trainer_clients', label: 'Client Roster', icon: Dumbbell },
  { id: 'trainer_analytics', label: 'Client Analytics', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

const DIETITIAN_NAV = [
  { id: 'dietitian_dashboard', label: 'Dietitian Hub', icon: HomeIcon },
  { id: 'dietitian_clients', label: 'Meal Planner', icon: BookOpen },
  { id: 'dietitian_analytics', label: 'Nutrition Analytics', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

const ADMIN_NAV = [
  { id: 'admin_dashboard', label: 'Admin Panel', icon: ShieldAlert },
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'coach', label: 'AI Coach', icon: Bot },
  { id: 'nutrition', label: 'Nutrition', icon: BookOpen },
  { id: 'workout', label: 'Workouts', icon: BarChart2 },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'healthhub', label: 'Health Hub', icon: Activity },
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

  const userId = user?.uid;

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const rbac = useRBACStore();

  const userRole = userProfile?.role || 'user';
  let navItems = USER_NAV;
  if (userRole === 'trainer') navItems = TRAINER_NAV;
  else if (userRole === 'dietitian') navItems = DIETITIAN_NAV;
  else if (userRole === 'admin') navItems = ADMIN_NAV;

  // Dynamic routing redirection when changing roles
  useEffect(() => {
    const role = userProfile?.role || 'user';
    if (role === 'trainer' && !activeTab.startsWith('trainer_') && activeTab !== 'profile') {
      setActiveTab('trainer_dashboard');
    } else if (role === 'dietitian' && !activeTab.startsWith('dietitian_') && activeTab !== 'profile') {
      setActiveTab('dietitian_dashboard');
    } else if (role === 'admin' && activeTab === 'trainer_dashboard') {
      setActiveTab('admin_dashboard');
    } else if (role === 'user' && (activeTab.startsWith('trainer_') || activeTab.startsWith('dietitian_') || activeTab === 'admin_dashboard')) {
      setActiveTab('dashboard');
    }
  }, [userProfile?.role]);

  // Fetch client assignments
  useEffect(() => {
    if (userId && (userProfile?.role === 'user' || !userProfile?.role)) {
      rbac.getClientPrograms(userId);
    }
  }, [userId, userProfile?.role]);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

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
        }
      }
      const timer = setTimeout(() => setLoading(false), 1800);
      return () => clearTimeout(timer);
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
  if (!user) return <AuthFlow />;
  if (!userProfile?.onboarded) {
    return <OnboardingFlow onComplete={() => showNotification("Welcome to Calyxo! Let's smash your goals.")} />;
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
            <span className="text-lg font-black tracking-widest text-[var(--foreground)] uppercase">
              calyxo
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 mt-4">
            {navItems.map((item) => {
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
          className="md:hidden fixed bottom-20 right-5 z-40 w-12 h-12 rounded-full bg-[var(--color-acid-green)] text-accent-foreground flex items-center justify-center shadow-lg shadow-[var(--color-acid-green)]/35 cursor-pointer active:scale-90 transition-transform"
          style={{ bottom: '80px' }}
        >
          <Plus className="w-6 h-6 text-accent-foreground" />
        </button>

        {/* Dashboard Greeting & Assignments (Only on dashboard tab) */}
        {activeTab === 'dashboard' && (
          <div className="px-6 pt-6 pb-2 space-y-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-[var(--foreground)]">
                Hello, {firstName} 👋
              </h1>
              <p className="text-xs md:text-sm text-[var(--text-muted)] font-medium mt-1">
                Let&apos;s crash your goals today!
              </p>
            </div>

            {/* Assignments Panel */}
            {userRole === 'user' && (rbac.assignedWorkouts.length > 0 || rbac.assignedMealPlans.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rbac.assignedWorkouts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-acid-green/10 to-transparent border border-acid-green/20 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[8.5px] font-black uppercase text-acid-green bg-acid-green/10 px-2 py-0.5 rounded-md">Workout Routine Assigned</span>
                      <h4 className="text-xs font-black text-foreground mt-2">{rbac.assignedWorkouts[0].workoutName}</h4>
                      <p className="text-[9px] text-muted font-bold mt-1">Trainer: {rbac.assignedWorkouts[0].trainerName}</p>
                      <div className="mt-3 space-y-1">
                        {rbac.assignedWorkouts[0].exercises?.map((ex, i) => (
                          <div key={i} className="text-[10px] font-semibold text-foreground flex justify-between">
                            <span>• {ex.name}</span>
                            <span className="text-muted">{ex.sets} sets × {ex.reps} reps @ {ex.weight}kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {rbac.assignedWorkouts[0].notes && (
                      <p className="text-[9px] text-muted italic mt-3 border-t border-card-border pt-2">Notes: {rbac.assignedWorkouts[0].notes}</p>
                    )}
                  </motion.div>
                )}

                {rbac.assignedMealPlans.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-blue-400/10 to-transparent border border-blue-400/20 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[8.5px] font-black uppercase text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">Diet Plan Assigned</span>
                      <h4 className="text-xs font-black text-foreground mt-2">{rbac.assignedMealPlans[0].calories} kcal Target</h4>
                      <p className="text-[9px] text-muted font-bold mt-1">Dietitian: {rbac.assignedMealPlans[0].dietitianName}</p>
                      
                      <div className="mt-3 space-y-1.5 text-[10px] font-semibold text-foreground">
                        <div className="flex justify-between border-b border-card-border pb-1">
                          <span>Protein: {rbac.assignedMealPlans[0].protein}g</span>
                          <span>Carbs: {rbac.assignedMealPlans[0].carbs}g</span>
                          <span>Fat: {rbac.assignedMealPlans[0].fat}g</span>
                        </div>
                        <div className="space-y-1 text-[9.5px] text-muted mt-2">
                          <span className="block truncate">🌅 Breakfast: {rbac.assignedMealPlans[0].meals.breakfast}</span>
                          <span className="block truncate">☀️ Lunch: {rbac.assignedMealPlans[0].meals.lunch}</span>
                          <span className="block truncate">🌙 Dinner: {rbac.assignedMealPlans[0].meals.dinner}</span>
                          <span className="block truncate">🍿 Snacks: {rbac.assignedMealPlans[0].meals.snacks}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 ${
          activeTab === 'coach' ? 'overflow-hidden pb-20 md:pb-6' : 'overflow-y-auto pb-24 md:pb-6'
        }`}>
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
              {activeTab === 'coach' && <AICoach />}
              {activeTab === 'nutrition' && <FoodTracker onNotification={showNotification} />}
              {activeTab === 'workout' && <WorkoutLogger onNotification={showNotification} />}
              {activeTab === 'progress' && <Progress onNotification={showNotification} />}
              {activeTab === 'healthhub' && <HealthHub onNotification={showNotification} />}
              {activeTab === 'profile' && <UserProfile onNotification={showNotification} />}

              {/* Trainer views */}
              {activeTab === 'trainer_dashboard' && <TrainerDashboard onNotification={showNotification} />}
              {activeTab === 'trainer_clients' && <TrainerDashboard initialTab="clients" onNotification={showNotification} />}
              {activeTab === 'trainer_analytics' && <TrainerDashboard initialTab="analytics" onNotification={showNotification} />}

              {/* Dietitian views */}
              {activeTab === 'dietitian_dashboard' && <DietitianDashboard onNotification={showNotification} />}
              {activeTab === 'dietitian_clients' && <DietitianDashboard initialTab="clients" onNotification={showNotification} />}
              {activeTab === 'dietitian_analytics' && <DietitianDashboard initialTab="analytics" onNotification={showNotification} />}

              {/* Admin views */}
              {activeTab === 'admin_dashboard' && <AdminDashboard onNotification={showNotification} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--nav-bg)] border-t border-[var(--nav-border)] backdrop-blur-lg px-1 py-2 flex justify-around items-center md:hidden h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            const getMobileLabel = (navItem) => {
              if (navItem.id === 'dashboard') return 'Dashboard';
              if (navItem.id === 'coach') return 'Coach';
              if (navItem.id === 'nutrition') return 'Food';
              if (navItem.id === 'workout') return 'Workouts';
              if (navItem.id === 'progress') return 'Trends';
              if (navItem.id === 'healthhub') return 'Health';
              if (navItem.id === 'profile') return 'Profile';
              return navItem.label;
            };

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-1.5 py-1 bg-none border-none cursor-pointer relative transition-colors ${
                  isActive ? 'text-[var(--color-acid-green)]' : 'text-[var(--text-muted)]'
                }`}
              >
                <Icon className="w-4.5 h-4.5 mb-0.5" />
                <span className="text-[8.5px] font-bold tracking-tight">
                  {getMobileLabel(item)}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="nav-dot-active"
                    className="absolute -bottom-1 w-1 h-1 bg-[var(--color-acid-green)] rounded-full"
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
