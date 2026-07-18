import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, BookOpen, BarChart2, User, Users, LogOut, Sparkles, X, TrendingUp, Heart, Search, Menu, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { signOutUser } from '../lib/dbService';

import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import BackgroundEffects from '../components/BackgroundEffects';
import QuickActionsSheet from '../components/QuickActionsSheet';
import GlobalSearch from '../components/GlobalSearch';
import MobileDrawerMenu from '../components/MobileDrawerMenu';

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
      { id: 'trainer', href: '/user/trainer', label: 'My Coach', icon: Users },
    ]
  }
];

export default function UserLayout() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const userProfile = useStore(state => state.userProfile);
  const bgEffects = userProfile?.appearance?.bgEffectsEnabled;
  const location = useLocation();
  const pathname = location.pathname;

  const handleLogout = async () => {
    if (window.confirm("Sign out of Calyxo?")) {
      await signOutUser();
      window.location.href = '/';
    }
  };

  useEffect(() => {
    // Basic Auth Guard
    const timer = setTimeout(() => {
      const currentUser = useStore.getState().user;
      if (!currentUser) {
        window.location.href = '/';
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden relative">
      {bgEffects && <BackgroundEffects />}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-card-border bg-card-bg/50 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-card-border">
          <Logo className="w-8 h-8 text-acid-green" glow={true} />
          <span className="font-black text-xl tracking-tight">calyxo</span>
        </div>

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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer border-none ${
                        isActive 
                          ? 'bg-acid-green/10 text-acid-green' 
                          : 'bg-transparent text-muted hover:bg-surface hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
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
          <button onClick={handleLogout} className="p-2 text-muted hover:text-destructive transition-colors bg-transparent border-none cursor-pointer rounded-full hover:bg-surface">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col relative z-10 w-full lg:w-auto h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-card-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileDrawerOpen(true)} className="p-2 text-foreground bg-transparent border-none">
              <Menu className="w-6 h-6" />
            </button>
            <Logo className="w-6 h-6 text-acid-green" glow={true} />
            <span className="font-black text-lg tracking-tight">calyxo</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSearchOpen(true)} className="p-2 text-foreground bg-transparent border-none">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-card-border z-30 px-2 pb-safe">
          <div className="flex items-center justify-around h-16">
            <Link
              to="/user/dashboard"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none ${
                pathname === '/user/dashboard' ? 'text-acid-green' : 'text-muted hover:text-foreground'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-wide">Home</span>
            </Link>
            <Link
              to="/user/nutrition"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none ${
                pathname === '/user/nutrition' ? 'text-acid-green' : 'text-muted hover:text-foreground'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-wide">Nutrition</span>
            </Link>
            
            {/* Create Button */}
            <button
              onClick={() => setIsQuickActionsOpen(true)}
              className="flex flex-col items-center justify-center -mt-6 border-none bg-transparent outline-none cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-acid-green text-black flex items-center justify-center shadow-lg shadow-acid-green/30 active:scale-95 transition-transform">
                <span className="text-2xl font-bold">+</span>
              </div>
            </button>

            <Link
              to="/user/workout"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none ${
                pathname === '/user/workout' ? 'text-acid-green' : 'text-muted hover:text-foreground'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-wide">Workout</span>
            </Link>
            <Link
              to="/user/profile"
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors border-none bg-transparent outline-none ${
                pathname === '/user/profile' ? 'text-acid-green' : 'text-muted hover:text-foreground'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-wide">Profile</span>
            </Link>
          </div>
        </nav>
      </div>

      <QuickActionsSheet isOpen={isQuickActionsOpen} onClose={() => setIsQuickActionsOpen(false)} />

      <MobileDrawerMenu 
        isOpen={isMobileDrawerOpen} 
        onClose={() => setIsMobileDrawerOpen(false)} 
        userProfile={userProfile}
        navItems={DESKTOP_NAV.flatMap(g => g.items)}
      />
    </div>
  );
}
