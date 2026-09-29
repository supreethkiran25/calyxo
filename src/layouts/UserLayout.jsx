import smartReminderEngine from '../services/notifications/SmartReminderEngine';
import { getUserTimezone } from '../utils/dateUtils';
import { toast } from 'sonner';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import React, { useState, useEffect, useRef, Suspense, lazy, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Utensils, Dumbbell, User, Users, LogOut, Bot, X, TrendingUp, Heart, Search, Menu, Plus, Crown, Lock, Bell, CheckCheck, Trash, Flame, Clock, AlertTriangle } from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import useQuickActionsStore from '../store/useQuickActionsStore';
import { signOutUser, subscribeToAuth, loadUserData, invalidateUserDataCache, subscribeToUserDataChanges } from '../lib/dbService';
import { subscribeToInAppNotifications, markNotificationAsRead, deleteNotification, registerServiceWorker, subscribeToPushNotifications } from '../services/notificationService';
import { SubscriptionManager } from '../services/subscription/SubscriptionManager';
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
const LegalModal = lazy(() => import('../components/modals/LegalModal'));

const DESKTOP_NAV = [
  {
    group: 'CORE',
    items: [
      { id: 'dashboard', href: '/user/dashboard', label: 'Home', icon: HomeIcon },
      { id: 'workout', href: '/user/workout', label: 'Workout', icon: Dumbbell },
      { id: 'nutrition', href: '/user/nutrition', label: 'Nutrition', icon: Utensils },
      { id: 'progress', href: '/user/progress', label: 'Progress', icon: TrendingUp },
      { id: 'ai', href: '/user/ai', label: 'AI Coach', icon: Bot },
    ]
  },
  {
    group: 'ECOSYSTEM',
    items: [
      { id: 'health', href: '/user/health', label: 'Health Hub', icon: Heart },
      { id: 'challenges', href: '/user/challenges', label: 'Challenges', icon: Flame },
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { id: 'profile', href: '/user/profile', label: 'Profile & Settings', icon: User },
    ]
  }
];

export default function UserLayout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const [systemSettings, setSystemSettings] = useState(() => {
    try {
      const local = localStorage.getItem('calyxo_system_settings');
      return local ? JSON.parse(local) : { maintenance_mode: false };
    } catch (e) {
      return { maintenance_mode: false };
    }
  });

  const navigate = useNavigate();
  const triggerNavHaptic = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {}
  }, []);

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

    const handleSubUpdated = (evt) => {
      const detail = evt.detail;
      if (!detail) return;
      const store = useStore.getState();
      const currentActiveUser = store.user;
      const curProfile = store.userProfile || {};
      const uid = currentActiveUser?.uid || currentActiveUser?.id || curProfile?.id;
      const uEmail = (currentActiveUser?.email || curProfile?.email || '').toLowerCase().trim();

      if (
        detail.userId === uid || 
        detail.targetUuid === uid || 
        (detail.targetEmail && detail.targetEmail.toLowerCase() === uEmail)
      ) {
        const updated = {
          ...curProfile,
          subscriptionPlan: detail.plan,
          subscription_plan: detail.plan,
          isSubscribed: !detail.isRevoke,
          is_subscribed: !detail.isRevoke,
          subscriptionStatus: detail.isRevoke ? 'EXPIRED' : 'ACTIVE',
          subscription_status: detail.isRevoke ? 'EXPIRED' : 'ACTIVE',
          subscriptionExpiresAt: detail.expiryDate,
          subscription_expires_at: detail.expiryDate,
          subscriptionPeriodEnd: detail.expiryDate,
          activePass: detail.plan,
          daysRemaining: detail.daysRemaining
        };
        store.setUserProfile(updated);
        localStorage.setItem('calyxo_user_profile', JSON.stringify(updated));
      }
    };

    const handleUserStatusUpdated = (evt) => {
      const detail = evt.detail;
      if (!detail) return;
      const store = useStore.getState();
      const uid = store.user?.uid || store.user?.id || store.userProfile?.id;
      if (detail.userId === uid) {
        const curProfile = store.userProfile || {};
        const updated = { ...curProfile, status: detail.status };
        store.setUserProfile(updated);
        localStorage.setItem('calyxo_user_profile', JSON.stringify(updated));
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'calyxo_system_settings' && e.newValue) {
        try { setSystemSettings(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === 'calyxo_admin_granted_subscriptions' && e.newValue) {
        try {
          const grants = JSON.parse(e.newValue);
          const store = useStore.getState();
          const uid = store.user?.uid || store.user?.id || store.userProfile?.id;
          const uEmail = (store.user?.email || store.userProfile?.email || '').toLowerCase().trim();
          const myGrant = (uid && grants[uid]) || (uEmail && grants[uEmail]);
          if (myGrant) {
            const isRev = myGrant.plan === 'FREE' || myGrant.status === 'Revoked';
            const cur = store.userProfile || {};
            const updated = {
              ...cur,
              subscriptionPlan: myGrant.plan,
              subscription_plan: myGrant.plan,
              isSubscribed: !isRev,
              is_subscribed: !isRev,
              subscriptionStatus: isRev ? 'EXPIRED' : 'ACTIVE',
              subscription_status: isRev ? 'EXPIRED' : 'ACTIVE',
              subscriptionExpiresAt: myGrant.expiryDate,
              subscription_expires_at: myGrant.expiryDate,
              activePass: myGrant.plan
            };
            store.setUserProfile(updated);
            localStorage.setItem('calyxo_user_profile', JSON.stringify(updated));
          }
        } catch (err) {}
      }
    };

    window.addEventListener('calyxo_settings_updated', handleSettingsUpdate);
    window.addEventListener('calyxo_subscription_updated', handleSubUpdated);
    window.addEventListener('calyxo_user_status_updated', handleUserStatusUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('calyxo_settings_updated', handleSettingsUpdate);
      window.removeEventListener('calyxo_subscription_updated', handleSubUpdated);
      window.removeEventListener('calyxo_user_status_updated', handleUserStatusUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const { activeWorkflow, legalModalType, closeLegalModal } = useQuickActionsStore();

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

  // Account Suspension Check (Admin-enforced)
  const isSuspended = userProfile?.status === 'Suspended';
  if (isSuspended && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900/90 border border-red-500/30 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/15 px-3 py-1 rounded-full border border-red-500/30">
              ACCOUNT SUSPENDED
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Account Restricted</h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono mt-2">
              Your Calyxo athlete account access has been suspended by an administrator. Please reach out to our team if you need support.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex flex-col gap-2 font-mono text-xs">
            <a
              href="mailto:support@calyxo.com"
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all text-center no-underline"
            >
              Contact Support (support@calyxo.com)
            </a>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-400 font-bold transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [isProfileLoading, setIsProfileLoading] = useState(() => {
    const u = useStore.getState().user;
    const p = useStore.getState().userProfile;
    return !(u && p);
  });

  // Calculate canonical subscription timeline with countdown and 5-day warning
  const subTimeline = useMemo(() => {
    return SubscriptionManager.getSubscriptionTimeline(userProfile, user);
  }, [userProfile, user]);

  // Check 5-day expiry and send toast alert
  useEffect(() => {
    if (user && userProfile && subTimeline.isExpiringSoon && subTimeline.isActive) {
      SubscriptionManager.checkAndSendExpiryAlert(userProfile, user, (msg) => {
        toast.warning(msg, {
          duration: 8000,
          action: {
            label: 'Renew',
            onClick: () => navigate('/user/profile')
          }
        });
      });
    }
  }, [user, userProfile, subTimeline, navigate]);

  useEffect(() => {
    useStore.getState().checkDailyReset();
    useEcosystemStore.getState().evaluateDailyStreakReset();
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

        // Initialize user-scoped ecosystem store for this specific user
        useEcosystemStore.getState().initUserEcosystem(uid);

        try {
          const { profile, foods, workouts, weights, water, waterLogs, ecosystem } = await loadUserData(uid);

          // Discard if a newer auth callback already completed.
          if (seq !== authSeq) return;

          if (profile) {
            setUserProfile(profile);
          }

          const store = useStore.getState();
          store.setFoodLogs(foods || []);
          store.setWorkoutLogs(workouts || []);
          store.setWeightLogs(weights || []);
          if (water !== undefined && water !== null && (water > 0 || store.waterIntake === 0)) setWaterIntake(water);
          if (ecosystem) useEcosystemStore.getState().syncEcosystemState(ecosystem);
          useEcosystemStore.getState().evaluateDailyStreakReset();
          useEcosystemStore.getState().checkDailyLoginStreak();
          const waterTarget = Number(profile?.waterGoal || profile?.waterTarget || store.userProfile?.waterTarget || 3000);
          useEcosystemStore.getState().recalculateDynamicStreaks(foods || [], workouts || [], waterLogs || [], waterTarget);
          syncWidgetData();
        } catch (err) {
          console.warn('[UserLayout] loadUserData error:', err);
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        setIsProfileLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Auto-sync widgets and evaluate streak freshness on focus, visibility change, and online reconnect
  useEffect(() => {
    const handleSync = () => {
      useStore.getState().checkDailyReset();
      useEcosystemStore.getState().evaluateDailyStreakReset();
      useEcosystemStore.getState().checkDailyLoginStreak();
      syncWidgetData();
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('online', handleSync);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleSync();
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('online', handleSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Smart User Engagement & Logging Reminders (Throttled to prevent spam & notification fatigue)
  const lastSmartReminderRunRef = useRef(0);
  const seenToastKeysRef = useRef(new Set());

  useEffect(() => {
    const runSmartReminders = async (isForced = false) => {
      try {
        const now = Date.now();
        if (!isForced && now - lastSmartReminderRunRef.current < 45 * 60 * 1000) {
          return;
        }
        lastSmartReminderRunRef.current = now;

        const uid = user?.uid || user?.id || 'user_default';
        const tz = getUserTimezone();
        const store = useStore.getState();
        const eco = useEcosystemStore.getState();

        const reminderContext = {
          userId: uid,
          userName: store.userProfile?.firstName || store.userProfile?.nickname || user?.displayName?.split(' ')[0] || 'Athlete',
          timeZone: tz,
          waterIntake: store.waterIntake || 0,
          waterTarget: Number(store.userProfile?.waterGoal || store.userProfile?.waterTarget || 3000),
          foodLogs: store.foodLogs || [],
          workoutLogs: store.workoutLogs || [],
          streak: eco.streaks?.loginStreak || 1,
          workoutStreak: eco.streaks?.workoutStreak || 0,
          stepCount: (() => {
            try {
              const todayKey = 'calyxo_pedometer_steps_' + new Date().toISOString().split('T')[0];
              return parseInt(localStorage.getItem(todayKey) || '0', 10);
            } catch (e) { return 0; }
          })(),
          stepGoal: Number(store.userProfile?.stepGoal || store.userProfile?.dailySteps || 10000),
          schedule: store.userProfile?.schedule || {
            wakeTime: '06:30',
            breakfastTime: '08:30',
            lunchTime: '13:00',
            snackTime: '17:00',
            workoutTime: '18:30',
            dinnerTime: '20:30',
            sleepTime: '23:00'
          }
        };

        // 1. Evaluate any milestones ready to fire right now (strictly deduplicated: max 1 message per type per day)
        await smartReminderEngine.evaluateAndTriggerReminders(reminderContext);
        // 2. Pre-schedule future daily milestones with OS if not already scheduled today
        await smartReminderEngine.scheduleDailyPlan(reminderContext);
      } catch (err) {
        console.warn('[UserLayout] Smart Reminder error:', err);
      }
    };

    runSmartReminders(false);
    const interval = setInterval(() => runSmartReminders(true), 45 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.uid]);

  // Realtime cross-device data sync, Web Push engine, and tab focus re-sync
  useEffect(() => {
    const uid = user?.uid || user?.id;
    if (!uid) return;

    // Register service worker and subscribe to W3C Web Push (non-fatal on native)
    try {
      registerServiceWorker().then(() => {
        try { subscribeToPushNotifications(uid); } catch (e) {}
      }).catch(() => {});
    } catch (e) {}

    // 1. In-app notifications realtime subscription with strict deduplication
    const unsubNotifs = subscribeToInAppNotifications(uid, (notifsList, incomingItem) => {
      try {
        setNotifications(notifsList || []);
        if (incomingItem && incomingItem.title) {
          const toastKey = `${incomingItem.id || incomingItem.notification_id || incomingItem.title}_${incomingItem.created_at || ''}`;
          if (!seenToastKeysRef.current.has(toastKey)) {
            seenToastKeysRef.current.add(toastKey);
            toast(incomingItem.title, {
              description: incomingItem.body,
              action: incomingItem.cta_link ? {
                label: incomingItem.cta_label || 'View',
                onClick: () => navigate(incomingItem.cta_link)
              } : undefined
            });
          }
        }
      } catch (e) {
        console.warn('[UserLayout] Notification display error:', e);
      }
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
      if (water !== undefined && water !== null && (water > 0 || store.waterIntake === 0)) store.setWaterIntake(water);
      if (ecosystem) useEcosystemStore.getState().syncEcosystemState(ecosystem);
      const waterTarget = Number(profile?.waterGoal || profile?.waterTarget || store.userProfile?.waterTarget || 3000);
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
      if (water !== undefined && water !== null && (water > 0 || store.waterIntake === 0)) store.setWaterIntake(water);
      if (ecosystem) useEcosystemStore.getState().syncEcosystemState(ecosystem);
      const waterTarget = Number(profile?.waterGoal || profile?.waterTarget || store.userProfile?.waterTarget || 3000);
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

  const uid = user?.uid || user?.id;
  // Strictly per-user onboarding verification (never use shared un-scoped key)
  const isOnboarded = Boolean(
    userProfile?.onboarded === true || 
    userProfile?.onboardingCompleted === true || 
    (uid && typeof window !== 'undefined' && localStorage.getItem(`calyxo_onboarded_${uid}`) === 'true')
  );

  // If user is authenticated but has not completed onboarding, trigger OnboardingFlow
  if (user && !isOnboarded) {
    return (
      <Suspense fallback={<LaunchScreen isLoading={true} />}>
        <OnboardingFlow onComplete={(completedProfile) => {
          if (typeof window !== 'undefined' && uid) {
            localStorage.setItem(`calyxo_onboarded_${uid}`, 'true');
          }
          const updated = { ...(userProfile || {}), ...completedProfile, onboarded: true, onboardingCompleted: true };
          useStore.getState().setUserProfile(updated);
        }} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex overflow-hidden relative">
      <Suspense fallback={null}>
        {bgEffects && <BackgroundEffects />}
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </Suspense>

      {/* Restrained Apple-Style Navigation Rail (Desktop) */}
      <aside className="hidden lg:flex w-20 flex-col items-center py-6 border-r border-card-border bg-card-bg/60 backdrop-blur-2xl z-20 shrink-0 select-none">
        <Link 
          to="/user/dashboard" 
          onClick={handleLogoClick}
          className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-surface-interactive transition-all cursor-pointer no-underline group mb-8"
          title="Calyxo Home"
        >
          <Logo className="w-8 h-8 text-accent transition-transform group-hover:scale-105" />
        </Link>

        {/* 5 Core Navigation Destinations */}
        <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2" aria-label="Desktop Primary Navigation">
          {[
            { id: 'dashboard', href: '/user/dashboard', label: 'Home', icon: HomeIcon },
            { id: 'workout', href: '/user/workout', label: 'Workout', icon: Dumbbell },
            { id: 'nutrition', href: '/user/nutrition', label: 'Nutrition', icon: Utensils },
            { id: 'progress', href: '/user/progress', label: 'Progress', icon: TrendingUp },
            { id: 'ai', href: '/user/ai', label: 'Coach', icon: Bot },
          ].map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                to={item.href}
                title={item.label}
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border no-underline group relative ${
                  isActive 
                    ? 'bg-accent/15 text-accent border-accent/25 shadow-sm shadow-accent/10 font-bold' 
                    : 'bg-transparent text-muted-foreground border-transparent hover:bg-surface-interactive hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className="text-[10px] tracking-tight leading-none">{item.label}</span>
                {isActive && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Utility Controls */}
        <div className="flex flex-col items-center gap-3 pt-4 border-t border-card-border/60 w-full px-2">
          <ThemeToggle />
          <Link
            to="/user/profile"
            title="Profile & Settings"
            className={`w-11 h-11 rounded-full border flex items-center justify-center overflow-hidden transition-all hover:scale-105 ${
              pathname === '/user/profile' ? 'border-accent shadow-sm shadow-accent/20' : 'border-card-border hover:border-foreground/30'
            }`}
          >
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </Link>
          <button 
            onClick={handleLogout} 
            title="Sign Out" 
            className="w-10 h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center cursor-pointer border-none bg-transparent"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area + Unified Top Header */}
      <div className="flex-1 flex flex-col w-full h-[100dvh] overflow-hidden">
        {/* Unified Top Header (Mobile & Desktop) */}
        <header className="pt-[max(env(safe-area-inset-top,0px),0.5rem)] border-b border-card-border bg-background/90 backdrop-blur-xl sticky top-0 z-30 shrink-0">
          <div className="h-14 flex items-center justify-between px-4 sm:px-8 w-full max-w-7xl mx-auto">
            {/* Left: Mobile Brand / Desktop Context Status */}
            <div className="flex items-center gap-3">
              <Link 
                to="/user/dashboard" 
                onClick={handleLogoClick}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity no-underline text-current lg:hidden"
              >
                <Logo className="w-7 h-7 text-accent" />
                <span className="brand-name text-base text-foreground tracking-wider leading-none">CALYXO</span>
              </Link>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-accent font-mono">CALYXO HEALTH OS</span>
                <span className="text-muted-foreground/40 text-xs">/</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {userProfile?.goal || 'Optimal Health'} · Week 6
                </span>
              </div>
            </div>

            {/* Right: Quick Actions, Search, Notifications & Profile Avatar */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSearchOpen(true)} 
                aria-label="Open Search" 
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-muted-foreground hover:text-foreground bg-surface-subtle border border-card-border flex items-center gap-2 cursor-pointer transition-all hover:border-foreground/20 text-xs"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-muted-foreground font-mono">Search... ⌘K</span>
              </button>
              
              <button 
                onClick={() => setIsNotifDrawerOpen(true)} 
                aria-label="Open Notifications" 
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground bg-surface-subtle border border-card-border cursor-pointer relative transition-all hover:border-foreground/20"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
              </button>

              <Link
                to="/user/profile"
                aria-label="Profile"
                onClick={triggerNavHaptic}
                className="w-8 h-8 rounded-full bg-surface-elevated border border-card-border flex items-center justify-center text-foreground hover:border-accent transition-all overflow-hidden cursor-pointer shrink-0 ml-1"
              >
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* 5-Day Expiry Countdown Alert Banner */}
        {subTimeline.isExpiringSoon && subTimeline.isActive && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300 z-20 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate">
                <strong className="font-bold">Subscription Expiring:</strong> Your {subTimeline.planName} pass has <span className="font-mono font-bold text-amber-200">{subTimeline.countdownString}</span> left.
              </span>
            </div>
            <Link
              to="/user/profile"
              className="px-2.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition-all no-underline shrink-0 ml-2"
            >
              Renew Now
            </Link>
          </div>
        )}

        {/* Dynamic Content */}
        <main ref={mainRef} className={`flex-1 ${pathname === '/user/ai' ? 'overflow-hidden flex flex-col min-h-0 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0' : 'overflow-y-auto overflow-x-hidden pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8'} relative scrollbar-hide`}>
          <div className={`max-w-7xl mx-auto w-full ${pathname === '/user/ai' ? 'p-0 sm:p-4 flex-1 flex flex-col min-h-0' : 'px-3 sm:px-6 lg:px-8 py-4 sm:py-8'}`}>
            <Outlet />
          </div>
        </main>
        {/* Mobile Bottom Navigation — 5 Primary Destinations */}
        <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-nav-bg/95 backdrop-blur-xl border-t border-card-border z-30 px-1 pb-safe shadow-card transform-gpu will-change-transform">
          <div className="flex items-center justify-around h-16 max-w-md mx-auto">
            <Link
              to="/user/dashboard"
              aria-label="Home"
              onClick={() => {
                triggerNavHaptic();
                setIsQuickActionsOpen(false);
                setIsMobileDrawerOpen(false);
                setIsNotifDrawerOpen(false);
                setIsSearchOpen(false);
                if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors border-none bg-transparent outline-none touch-manipulation active:scale-95 transform-gpu ${
                pathname === '/user/dashboard' ? 'text-accent font-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <HomeIcon className="w-5 h-5 pointer-events-none" />
              <span className="text-[9.5px] tracking-wide pointer-events-none">Home</span>
            </Link>

            <Link
              to="/user/workout"
              aria-label="Workout"
              onClick={triggerNavHaptic}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors border-none bg-transparent outline-none touch-manipulation active:scale-95 transform-gpu ${
                pathname === '/user/workout' ? 'text-accent font-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Dumbbell className="w-5 h-5 pointer-events-none" />
              <span className="text-[9.5px] tracking-wide pointer-events-none">Workout</span>
            </Link>

            <Link
              to="/user/nutrition"
              aria-label="Nutrition"
              onClick={triggerNavHaptic}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors border-none bg-transparent outline-none touch-manipulation active:scale-95 transform-gpu ${
                pathname === '/user/nutrition' ? 'text-accent font-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Utensils className="w-5 h-5 pointer-events-none" />
              <span className="text-[9.5px] tracking-wide pointer-events-none">Nutrition</span>
            </Link>

            <Link
              to="/user/progress"
              aria-label="Progress"
              onClick={triggerNavHaptic}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors border-none bg-transparent outline-none touch-manipulation active:scale-95 transform-gpu ${
                pathname === '/user/progress' ? 'text-accent font-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="w-5 h-5 pointer-events-none" />
              <span className="text-[9.5px] tracking-wide pointer-events-none">Progress</span>
            </Link>

            <Link
              to="/user/ai"
              aria-label="AI Coach"
              onClick={triggerNavHaptic}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors border-none bg-transparent outline-none touch-manipulation active:scale-95 transform-gpu ${
                pathname === '/user/ai' ? 'text-accent font-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bot className="w-5 h-5 pointer-events-none" />
              <span className="text-[9.5px] tracking-wide pointer-events-none">Coach</span>
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
        <LegalModal 
          isOpen={Boolean(legalModalType)} 
          onClose={closeLegalModal} 
          type={legalModalType || 'terms'} 
        />

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
            className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm p-0 sm:p-4"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md h-full bg-surface border-l sm:border border-card-border sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden p-5 sm:p-6 space-y-4 pt-[max(env(safe-area-inset-top,0px),1.25rem)] pb-[max(env(safe-area-inset-bottom,0px),1.25rem)]"
            >
              <div className="flex items-center justify-between border-b border-card-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-accent/15 text-accent border border-accent/20">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Notifications</h3>
                    <p className="text-xs text-muted font-mono">
                      {unreadCount} Unread Messages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        await markAllNotificationsAsRead();
                        setNotifications(prev => prev.map(x => ({ ...x, read: true })));
                      }}
                      className="text-[10px] font-bold text-accent px-2.5 py-1 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/20 cursor-pointer"
                    >
                      Read All
                    </button>
                  )}
                  <button 
                    onClick={() => setIsNotifDrawerOpen(false)} 
                    className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-elevated cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-muted text-xs">
                    <Bell className="w-8 h-8 mx-auto opacity-40" />
                    <p>No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-2xl border transition-all space-y-2 ${
                        n.read ? 'bg-surface/50 border-card-border/60 opacity-75' : 'bg-surface border-accent/30 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-foreground leading-tight">{n.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          {!n.read && (
                            <button
                              onClick={async () => {
                                await markNotificationAsRead(n.id);
                                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                              }}
                              className="p-1 text-accent hover:text-accent-dim cursor-pointer"
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
                            className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted font-mono pt-1">
                        <span>{n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                        {n.cta_link && (
                          <Link 
                            to={n.cta_link} 
                            onClick={() => setIsNotifDrawerOpen(false)}
                            className="text-accent hover:underline font-bold"
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
