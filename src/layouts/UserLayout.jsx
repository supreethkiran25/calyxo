import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, BookOpen, BarChart2, User, Users, LogOut, Bot, X, TrendingUp, Heart, Search, Menu, Plus, Crown, Lock, Bell, CheckCheck, Trash } from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import useQuickActionsStore from '../store/useQuickActionsStore';
import { signOutUser, subscribeToAuth, loadUserData, invalidateUserDataCache, subscribeToUserDataChanges } from '../lib/dbService';
import { subscribeToInAppNotifications, markNotificationAsRead, deleteNotification, registerServiceWorker, subscribeToPushNotifications } from '../services/notificationService';
import { supabase } from '../lib/supabaseClient';

import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import OfflineSyncIndicator from '../components/OfflineSyncIndicator';
import PWAInstallBanner from '../components/PWAInstallBanner';
import LaunchScreen from '../components/LaunchScreen';
import { syncWidgetData } from '../services/widgetDataService';

const BackgroundEffects = lazy(() => import('../components/BackgroundEffects'));
const QuickActionsSheet = lazy(() => import('../components/QuickActionsSheet'));
const GlobalSearch = lazy(() => import('../components/GlobalSearch'));
const MobileDrawerMenu = lazy(() => import('../components/MobileDrawerMenu'));
const OnboardingFlow = lazy(() => import('../components/OnboardingFlow'));

// Quick Action Modals (lazy loaded for performance)
const WorkoutLoggerModal = lazy(() => import('../components/modals/WorkoutLoggerModal'));
const MealLoggerModal = lazy(() => import('../components/modals/MealLoggerModal'));
const ProgressUploadModal = lazy(() => import('../components/modals/ProgressUploadModal'));
const AIChatModal = lazy(() => import('../components/modals/AIChatModal'));
const WaterLoggerModal = lazy(() => import('../components/modals/WaterLoggerModal'));
const WeightLoggerModal = lazy(() => import('../components/modals/WeightLoggerModal'));

const DESKTOP_NAV = [
  {
    group: 'EXPERIENCES',
    items: [
      { id: 'dashboard', href: '/user/dashboard', label: 'Home', icon: HomeIcon },
      { id: 'nutrition', href: '/user/nutrition', label: 'Nutrition', icon: BookOpen },
      { id: 'workout', href: '/user/workout', label: 'Workout', icon: BarChart2 },
      { id: 'health', href: '/user/health', label: 'Recovery', icon: Heart },
      { id: 'progress', href: '/user/progress', label: 'Challenges', icon: TrendingUp },
      { id: 'ai', href: '/user/ai', label: 'AI', icon: Bot },
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { id: 'profile', href: '/user/profile', label: 'Profile', icon: User },
    ]
  }
];

export default function UserLayout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [systemSettings, setSystemSettings] = useState(() => {
    try {
      const local = localStorage.getItem('calyxo_system_settings');
      return local ? JSON.parse(local) : { maintenance_mode: false };
    } catch (e) {
      return { maintenance_mode: false };
    }
  });

  const navigate = useNavigate();
  const mainRef = useRef(null);

  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const bgEffects = userProfile?.appearance?.bgEffectsEnabled;
  const location = useLocation();
  const pathname = location.pathname;

  const subscriptionPlan = userProfile?.subscriptionPlan;
  const currentUserEmail = (user?.email || userProfile?.email || "").toLowerCase().trim();
  const hasAdminSession = typeof window !== 'undefined' && Boolean(localStorage.getItem('calyxo_admin_session'));
  const isSuperAdmin = currentUserEmail === 'supreethkiran25@gmail.com' || currentUserEmail === 'admin@calyxo.com' || hasAdminSession;
  const isSubscribed = Boolean(
    userProfile?.isSubscribed || 
    (subscriptionPlan && subscriptionPlan !== 'FREE' && subscriptionPlan !== 'DEFAULT') ||
    isSuperAdmin
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { getAdminSettings } = await import('../services/adminService');
        const res = await getAdminSettings();
        if (res) {
          setSystemSettings(res);
          localStorage.setItem('calyxo_system_settings', JSON.stringify(res));
        }
      } catch (e) {}
    };
    loadSettings();

    const handleSettingsUpdate = (evt) => {
      if (evt.detail) {
        setSystemSettings(evt.detail);
      }
    };
    window.addEventListener('calyxo_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('calyxo_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const activeWorkflow = useQuickActionsStore(state => state.activeWorkflow);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get('action');
      if (action) {
        if (action === 'log_water_250') {
          useStore.getState().addWaterIntake(250);
          const user = useStore.getState().user;
          if (user?.uid || user?.id) {
            import('../lib/dbService').then(m => m.saveWaterIntake(user.uid || user.id, useStore.getState().waterIntake));
          }
          import('sonner').then(m => m.toast.success('💧 Quick Log: +250ml water recorded!'));
        } else if (action === 'log_water_500') {
          useStore.getState().addWaterIntake(500);
          const user = useStore.getState().user;
          if (user?.uid || user?.id) {
            import('../lib/dbService').then(m => m.saveWaterIntake(user.uid || user.id, useStore.getState().waterIntake));
          }
          import('sonner').then(m => m.toast.success('🥛 Quick Log: +500ml water recorded!'));
        } else if (action === 'log_water') {
          useQuickActionsStore.getState().setActiveWorkflow('log_water');
        } else if (action === 'log_meal') {
          useQuickActionsStore.getState().setActiveWorkflow('log_meal');
        } else if (action === 'log_workout') {
          useQuickActionsStore.getState().setActiveWorkflow('log_workout');
        }
        // Clean URL parameter without triggering full reload
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {}
  }, [location.search]);

  useEffect(() => {
    if (activeWorkflow === 'start_live_session' && pathname !== '/user/workout') {
      navigate('/user/workout');
    }
  }, [activeWorkflow, pathname, navigate]);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (pathname !== '/user/dashboard') {
      navigate('/user/dashboard');
    }
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    if (window.confirm("Sign out of Calyxo?")) {
      await signOutUser();
      window.location.href = '/';
    }
  };

  const isMaintenanceActive = Boolean(systemSettings?.maintenance_mode === true || systemSettings?.maintenance_mode === 'true');

  // Lock out non-admin users ONLY if System Maintenance Mode is explicitly enabled by Admin in backend
  if (isMaintenanceActive && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 text-center font-sans relative overflow-hidden selection:bg-red-500/30 selection:text-red-200">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              SYSTEM MAINTENANCE IN PROGRESS
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Calyxo Under Maintenance</h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono mt-2">
              {systemSettings?.maintenance_message || 'Calyxo is currently undergoing scheduled platform upgrades and maintenance. Access is temporarily restricted.'}
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex flex-col gap-2 font-mono text-xs">
            <span className="text-neutral-500">Expected Uptime: Operational Shortly</span>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all cursor-pointer"
            >
              Check Maintenance Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    useStore.getState().checkDailyReset();
    useEcosystemStore.getState().checkDailyLoginStreak();
    const setUser = useStore.getState().setUser;
    const setUserProfile = useStore.getState().setUserProfile;
    const setWaterIntake = useStore.getState().setWaterIntake;

    let authSeq = 0;
    const unsubscribeAuth = subscribeToAuth(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const uid = authUser.uid || authUser.id;
        const seq = ++authSeq;

        const { profile, foods, workouts, weights, water, waterLogs, ecosystem } = await loadUserData(uid);

        // Discard if a newer auth callback already completed.
        if (seq !== authSeq) return;

        if (profile) {
          setUserProfile(profile);
        }

        const store = useStore.getState();
        if (foods && (foods.length > 0 || store.foodLogs.length === 0)) store.setFoodLogs(foods);
        if (workouts && (workouts.length > 0 || store.workoutLogs.length === 0)) store.setWorkoutLogs(workouts);
        if (weights && (weights.length > 0 || store.weightLogs.length === 0)) store.setWeightLogs(weights);
        if (water !== undefined && water !== null) setWaterIntake(water);
        if (ecosystem) useEcosystemStore.getState().syncEcosystemState(ecosystem);
        useEcosystemStore.getState().checkDailyLoginStreak();
        const waterTarget = Number(profile?.waterGoal || profile?.waterTarget || store.userProfile?.waterTarget || 2500);
        useEcosystemStore.getState().recalculateDynamicStreaks(foods || [], workouts || [], waterLogs || [], waterTarget);
        syncWidgetData();
        setIsProfileLoading(false);
      } else {
        setIsProfileLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Realtime cross-device data sync, Web Push engine, and tab focus re-sync
  useEffect(() => {
    const uid = user?.uid || user?.id;
    if (!uid) return;

    // Register service worker and subscribe to W3C Web Push
    registerServiceWorker().then(() => {
      subscribeToPushNotifications(uid);
    });

    // 1. In-app notifications realtime subscription
    const unsubNotifs = subscribeToInAppNotifications(uid, (notifsList) => {
      setNotifications(notifsList || []);
    });

    // 2. Full cross-device realtime subscription (Food, Workout, Weight, Profile, Ecosystem/Streak)
    // Non-regression guard: only overwrite store arrays if the incoming data is non-empty,
    // OR the store is already empty (prevents a failed/empty refetch from clearing real data).
    const unsubCrossDevice = subscribeToUserDataChanges(uid, async () => {
      invalidateUserDataCache(uid);
      const { profile, foods, workouts, weights, water, waterLogs, ecosystem } = await loadUserData(uid);
      const store = useStore.getState();
      if (profile) store.setUserProfile(profile);
      if (foods && (foods.length > 0 || store.foodLogs.length === 0)) store.setFoodLogs(foods);
      if (workouts && (workouts.length > 0 || store.workoutLogs.length === 0)) store.setWorkoutLogs(workouts);
      if (weights && (weights.length > 0 || store.weightLogs.length === 0)) store.setWeightLogs(weights);
      if (water !== undefined && water !== null) store.setWaterIntake(water);
      if (ecosystem) useEcosystemStore.getState().syncEcosystemState(ecosystem);
      const waterTarget = Number(profile?.waterGoal || profile?.waterTarget || store.userProfile?.waterTarget || 2500);
      useEcosystemStore.getState().recalculateDynamicStreaks(foods || [], workouts || [], waterLogs || [], waterTarget);
    });

    // 3. Tab visibility and window focus listener — refresh data when user returns to tab.
    // NOTE: 'storage' event is intentionally excluded — it fires on every Supabase JWT token
    // rotation (writes to localStorage), which would trigger spurious full reloads and
    // overwrite freshly-loaded nutrition/workout data with stale empty responses.
    // Cross-tab sync is handled by the 'calyxo_data_sync' CustomEvent and realtime subscription.
    let focusSyncSeq = 0;
    const handleFocusSync = async () => {
      const seq = ++focusSyncSeq;
      invalidateUserDataCache(uid);
      const { profile, foods, workouts, weights, water, waterLogs, ecosystem } = await loadUserData(uid);
      // Discard result if a newer sync started while this one was in-flight
      if (seq !== focusSyncSeq) return;
      const store = useStore.getState();
      if (profile) store.setUserProfile(profile);
      if (foods && (foods.length > 0 || store.foodLogs.length === 0)) store.setFoodLogs(foods);
      if (workouts && (workouts.length > 0 || store.workoutLogs.length === 0)) store.setWorkoutLogs(workouts);
      if (weights && (weights.length > 0 || store.weightLogs.length === 0)) store.setWeightLogs(weights);
      if (water !== undefined && water !== null) store.setWaterIntake(water);
      if (ecosystem) useEcosystemStore.getState().syncEcosystemState(ecosystem);
      const waterTarget = Number(profile?.waterGoal || profile?.waterTarget || store.userProfile?.waterTarget || 2500);
      useEcosystemStore.getState().recalculateDynamicStreaks(foods || [], workouts || [], waterLogs || [], waterTarget);
    };

    window.addEventListener('focus', handleFocusSync);
    window.addEventListener('calyxo_data_sync', handleFocusSync);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleFocusSync();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (unsubNotifs) unsubNotifs();
      if (unsubCrossDevice) unsubCrossDevice();
      window.removeEventListener('focus', handleFocusSync);
      window.removeEventListener('calyxo_data_sync', handleFocusSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);


  if (isProfileLoading) {
    return <LaunchScreen isLoading={true} />;
  }

  // If user is authenticated but has not completed onboarding, trigger OnboardingFlow
  if (user && (!userProfile || userProfile.onboarded !== true)) {
    return (
      <Suspense fallback={null}>
        <OnboardingFlow />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex overflow-hidden relative">
      <Suspense fallback={null}>
        {bgEffects && <BackgroundEffects />}
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </Suspense>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-card-border bg-card-bg/50 backdrop-blur-xl z-20">
        <Link 
          to="/user/dashboard" 
          onClick={handleLogoClick}
          className="p-6 flex items-center justify-between border-b border-card-border cursor-pointer hover:opacity-90 transition-opacity no-underline text-current group"
        >
          <div className="flex items-center gap-2.5">
            <Logo className="w-8 h-8 text-acid-green" glow={true} />
            <span className="brand-name text-lg text-foreground tracking-wider group-hover:text-acid-green transition-colors leading-none">CALYXO</span>
          </div>
          {isSubscribed && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-acid-green/15 text-acid-green border border-acid-green/30 text-[9px] font-black uppercase tracking-wider shadow-sm shadow-acid-green/10" title={`Subscribed: ${subscriptionPlan}`}>
              <Crown className="w-3.5 h-3.5 text-acid-green shrink-0 animate-pulse" />
              <span>{subscriptionPlan}</span>
            </div>
          )}
        </Link>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
          {DESKTOP_NAV.map((group, idx) => (
            <div key={idx}>
              <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-3 px-4">{group.group}</h4>
              <nav className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isLocked = item.isPremium && !isSubscribed;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer border-none group ${
                        isActive 
                          ? 'bg-acid-green/10 text-acid-green' 
                          : 'bg-transparent text-muted hover:bg-surface hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-acid-green/20 text-acid-green shadow-sm shadow-acid-green/20'
                            : 'bg-surface/60 text-muted-foreground group-hover:bg-surface group-hover:text-foreground'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {isLocked && (
                        <Lock className="w-3.5 h-3.5 text-muted opacity-60 group-hover:opacity-100" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-card-border">
          <button 
            onClick={() => setIsQuickActionsOpen(true)}
            className="w-full py-3 flex items-center justify-center gap-2 rounded-2xl bg-acid-green text-black text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none shadow-md shadow-acid-green/10"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        <div className="p-6 border-t border-card-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button 
              onClick={() => setIsNotifDrawerOpen(true)} 
              aria-label="Notifications" 
              className="p-2 text-muted hover:text-foreground transition-colors bg-transparent border-none cursor-pointer rounded-full hover:bg-surface relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-acid-green text-black text-[9px] font-black flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          </div>
          <button onClick={handleLogout} aria-label="Sign Out" className="p-2 text-muted hover:text-destructive transition-colors bg-transparent border-none cursor-pointer rounded-full hover:bg-surface">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col relative z-10 w-full lg:w-auto h-[100dvh] overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-safe border-b border-card-border bg-background/90 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setIsMobileDrawerOpen(true)} aria-label="Open Navigation Drawer" className="p-2 text-foreground bg-transparent border-none cursor-pointer">
              <Menu className="w-6 h-6" />
            </button>
            <Link 
              to="/user/dashboard" 
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity no-underline text-current"
            >
              <Logo className="w-7 h-7 text-acid-green" glow={true} />
              <span className="brand-name text-base text-foreground tracking-wider leading-none">CALYXO</span>
              {isSubscribed && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-acid-green/15 text-acid-green border border-acid-green/30 text-[8px] font-black uppercase tracking-wider" title={`Subscribed: ${subscriptionPlan}`}>
                  <Crown className="w-3 h-3 text-acid-green shrink-0 animate-pulse" />
                  <span>{subscriptionPlan}</span>
                </div>
              )}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsNotifDrawerOpen(true)} 
              aria-label="Open Notifications" 
              className="p-2 text-foreground bg-transparent border-none cursor-pointer relative"
            >
              <Bell className="w-5 h-5 text-muted hover:text-foreground transition-colors" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-acid-green text-black text-[9px] font-black flex items-center justify-center animate-bounce">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <button onClick={() => setIsSearchOpen(true)} aria-label="Open Search" className="p-2 text-foreground bg-transparent border-none cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main ref={mainRef} className={`flex-1 ${pathname === '/user/ai' ? 'overflow-hidden flex flex-col min-h-0 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0' : 'overflow-y-auto overflow-x-hidden pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8'} relative scrollbar-hide`}>
          <div className={`max-w-7xl mx-auto w-full ${pathname === '/user/ai' ? 'p-0 sm:p-4 flex-1 flex flex-col min-h-0' : 'px-3 sm:px-6 lg:px-8 py-4 sm:py-8'}`}>
            <Outlet />
          </div>
        </main>
        {/* Mobile Bottom Navigation */}
        <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-card-border z-30 px-2 pb-safe shadow-2xl transform-gpu will-change-transform">
          <div className="flex items-center justify-around h-16 max-w-md mx-auto">
            <Link
              to="/user/dashboard"
              aria-label="Home Dashboard"
              onClick={() => {
                setIsQuickActionsOpen(false);
                setIsMobileDrawerOpen(false);
                setIsNotifDrawerOpen(false);
                setIsSearchOpen(false);
                if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none touch-manipulation active:scale-95 transform-gpu ${
                pathname === '/user/dashboard' ? 'text-acid-green font-black' : 'text-muted hover:text-foreground'
              }`}
            >
              <HomeIcon className="w-5 h-5 pointer-events-none" />
              <span className="text-[9.5px] tracking-wide pointer-events-none">Home</span>
            </Link>
            <Link
              to="/user/nutrition"
              aria-label="Nutrition Page"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none touch-manipulation active:scale-95 transform-gpu ${
                pathname === '/user/nutrition' ? 'text-acid-green font-black' : 'text-muted hover:text-foreground'
              }`}
            >
              <BookOpen className="w-5 h-5 pointer-events-none" />
              <span className="text-[9.5px] tracking-wide pointer-events-none">Nutrition</span>
            </Link>
            
            {/* Quick Create Action Button */}
            <button
              onClick={() => setIsQuickActionsOpen(true)}
              aria-label="Quick Action Menu"
              className="flex flex-col items-center justify-center -mt-5 border-none bg-transparent outline-none cursor-pointer group touch-manipulation transform-gpu"
            >
              <div className="w-12 h-12 rounded-full bg-acid-green text-black flex items-center justify-center shadow-lg shadow-acid-green/40 active:scale-90 group-hover:scale-105 transition-all">
                <Plus className="w-6 h-6 stroke-[3] pointer-events-none" />
              </div>
            </button>

            <Link
              to="/user/workout"
              aria-label="Workout Page"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none touch-manipulation active:scale-95 transform-gpu ${
                pathname === '/user/workout' ? 'text-acid-green font-black' : 'text-muted hover:text-foreground'
              }`}
            >
              <BarChart2 className="w-5 h-5 pointer-events-none" />
              <span className="text-[9.5px] tracking-wide pointer-events-none">Workout</span>
            </Link>
            <Link
              to="/user/profile"
              aria-label="Profile Settings Page"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none touch-manipulation active:scale-95 transform-gpu ${
                pathname === '/user/profile' ? 'text-acid-green font-black' : 'text-muted hover:text-foreground'
              }`}
            >
              <User className="w-5 h-5 pointer-events-none" />
              <span className="text-[9.5px] tracking-wide pointer-events-none">Profile</span>
            </Link>
          </div>
        </nav>
      </div>

      <Suspense fallback={null}>
        <QuickActionsSheet isOpen={isQuickActionsOpen} onClose={() => setIsQuickActionsOpen(false)} />

        {/* Create Hub Modals */}
        <WorkoutLoggerModal />
        <MealLoggerModal />
        <ProgressUploadModal />
        <AIChatModal />
        <WaterLoggerModal />
        <WeightLoggerModal />

        <MobileDrawerMenu 
          isOpen={isMobileDrawerOpen} 
          onClose={() => setIsMobileDrawerOpen(false)} 
          userProfile={userProfile}
          navItems={DESKTOP_NAV.flatMap(g => g.items)}
        />
      </Suspense>

      {/* In-App Notification Drawer Slide-over */}
      <AnimatePresence>
        {isNotifDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-acid-green/10 text-acid-green border border-acid-green/20">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Notifications</h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      {notifications.filter(n => !n.read).length} Unread Messages
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNotifDrawerOpen(false)} 
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-neutral-500 text-xs">
                    <Bell className="w-8 h-8 mx-auto opacity-40" />
                    <p>No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-2xl border transition-all space-y-2 ${
                        n.read ? 'bg-neutral-950/40 border-neutral-800/60 opacity-80' : 'bg-neutral-900 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white leading-tight">{n.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          {!n.read && (
                            <button
                              onClick={async () => {
                                await markNotificationAsRead(n.id);
                                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                              }}
                              className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                              title="Mark as read"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              await deleteNotification(n.id);
                              setNotifications(prev => prev.filter(x => x.id !== n.id));
                            }}
                            className="p-1 text-neutral-500 hover:text-red-400 cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{n.body}</p>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1">
                        <span>{n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                        {n.cta_link && (
                          <Link 
                            to={n.cta_link} 
                            onClick={() => setIsNotifDrawerOpen(false)}
                            className="text-acid-green hover:underline font-bold"
                          >
                            {n.cta_label || 'View'} &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OfflineSyncIndicator />
      <PWAInstallBanner />
    </div>
  );
}
