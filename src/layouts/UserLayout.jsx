import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, BookOpen, BarChart2, User, Users, LogOut, Sparkles, X, TrendingUp, Heart, Search, Menu, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { signOutUser, subscribeToAuth, getUserProfile } from '../lib/dbService';

import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

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
    group: 'HOME',
    items: [
      { id: 'dashboard', href: '/user/dashboard', label: 'Dashboard', icon: HomeIcon },
      { id: 'progress', href: '/user/progress', label: "Today's Progress", icon: TrendingUp },
    ]
  },
  {
    group: 'HEALTH',
    items: [
      { id: 'nutrition', href: '/user/nutrition', label: 'Nutrition', icon: BookOpen },
      { id: 'workout', href: '/user/workout', label: 'Workouts', icon: BarChart2 },
      { id: 'healthhub', href: '/user/healthhub', label: 'Health Hub', icon: Heart },
    ]
  },
  {
    group: 'AI',
    items: [
      { id: 'ai', href: '/user/ai', label: 'AI Workspace', icon: Sparkles },
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { id: 'profile', href: '/user/profile', label: 'Profile', icon: User },
    ]
  },
  {
    group: 'INFO',
    items: [
      { id: 'about', href: '/user/about', label: 'About Calyxo', icon: Sparkles },
      { id: 'support', href: '/user/support', label: 'Help & Support', icon: Heart },
    ]
  }
];

export default function UserLayout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const navigate = useNavigate();
  const mainRef = useRef(null);

  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const bgEffects = userProfile?.appearance?.bgEffectsEnabled;
  const location = useLocation();
  const pathname = location.pathname;

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

  useEffect(() => {
    useStore.getState().checkDailyReset();
    const setUser = useStore.getState().setUser;
    const setUserProfile = useStore.getState().setUserProfile;
    const setFoodLogs = useStore.getState().setFoodLogs;
    const setWorkoutLogs = useStore.getState().setWorkoutLogs;
    const setWeightLogs = useStore.getState().setWeightLogs;
    const setWaterIntake = useStore.getState().setWaterIntake;
    const unsubscribe = subscribeToAuth(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const uid = authUser.uid || authUser.id;

        const [profile, foods, workouts, weights, water] = await Promise.all([
          getUserProfile(uid),
          getFoodLogs(uid),
          getWorkoutLogs(uid),
          getWeightLogs(uid),
          getWaterIntake(uid)
        ]);

        if (profile) {
          setUserProfile(profile);
        } else {
          setUserProfile({ onboarded: false });
        }
        if (foods) setFoodLogs(foods);
        if (workouts) setWorkoutLogs(workouts);
        if (weights) setWeightLogs(weights);
        if (water !== undefined && water !== null) setWaterIntake(water);
      } else {
        // Only redirect to landing page if user is explicitly signed out / missing
        const storeUser = useStore.getState().user;
        if (!storeUser) {
          window.location.href = '/';
        }
      }
    });
    return () => unsubscribe();
  }, []);

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
          className="p-6 flex items-center gap-2.5 border-b border-card-border cursor-pointer hover:opacity-90 transition-opacity no-underline text-current group"
        >
          <Logo className="w-7 h-7 text-acid-green" glow={true} />
          <span className="brand-name text-lg text-foreground tracking-wider group-hover:text-acid-green transition-colors">CALYXO</span>
        </Link>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
          {DESKTOP_NAV.map((group, idx) => (
            <div key={idx}>
              <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-3 px-4">{group.group}</h4>
              <nav className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer border-none group ${
                        isActive 
                          ? 'bg-acid-green/10 text-acid-green' 
                          : 'bg-transparent text-muted hover:bg-surface hover:text-foreground'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-acid-green/20 text-acid-green shadow-sm shadow-acid-green/20'
                          : 'bg-surface/60 text-muted-foreground group-hover:bg-surface group-hover:text-foreground'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {item.label}
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
          <ThemeToggle />
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
              <Logo className="w-6 h-6 text-acid-green" glow={true} />
              <span className="brand-name text-base text-foreground tracking-wider">CALYXO</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSearchOpen(true)} aria-label="Open Search" className="p-2 text-foreground bg-transparent border-none cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
          <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
            <Outlet />
          </div>
        </main>
        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-2xl border-t border-card-border z-30 px-2 pb-safe shadow-2xl">
          <div className="flex items-center justify-around h-16 max-w-md mx-auto">
            <Link
              to="/user/dashboard"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none ${
                pathname === '/user/dashboard' ? 'text-acid-green font-black' : 'text-muted hover:text-foreground'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-[9.5px] tracking-wide">Home</span>
            </Link>
            <Link
              to="/user/nutrition"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none ${
                pathname === '/user/nutrition' ? 'text-acid-green font-black' : 'text-muted hover:text-foreground'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[9.5px] tracking-wide">Nutrition</span>
            </Link>
            
            {/* Quick Create Action Button */}
            <button
              onClick={() => setIsQuickActionsOpen(true)}
              aria-label="Quick Action Menu"
              className="flex flex-col items-center justify-center -mt-5 border-none bg-transparent outline-none cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-acid-green text-black flex items-center justify-center shadow-lg shadow-acid-green/40 active:scale-90 group-hover:scale-105 transition-all">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
            </button>

            <Link
              to="/user/workout"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none ${
                pathname === '/user/workout' ? 'text-acid-green font-black' : 'text-muted hover:text-foreground'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
              <span className="text-[9.5px] tracking-wide">Workout</span>
            </Link>
            <Link
              to="/user/profile"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none ${
                pathname === '/user/profile' ? 'text-acid-green font-black' : 'text-muted hover:text-foreground'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[9.5px] tracking-wide">Profile</span>
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
    </div>
  );
}
