import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell, LogOut, Radio } from 'lucide-react';
import { useStore } from '../../store/useStore';

const ROUTE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/premium': 'Subscriptions',
  '/admin/revenue': 'Revenue',
  '/admin/analytics': 'Analytics',
  '/admin/workout-db': 'Workouts',
  '/admin/nutrition-db': 'Nutrition',
  '/admin/ai': 'AI Engine',
  '/admin/notifications': 'Notifications',
  '/admin/feedback': 'Feedback',
  '/admin/logs': 'Audit Logs',
  '/admin/settings': 'Settings'
};

const AdminTopbarV2 = ({ setMobileOpen, onOpenSearch, onQuickAction }) => {
  const location = useLocation();
  const user = useStore(state => state.user);

  const title = ROUTE_TITLES[location.pathname] || 'Dashboard';

  const handleSignOut = async () => {
    const { logoutSuperAdmin } = await import('../../services/adminService');
    await logoutSuperAdmin();
    window.location.href = '/admin/login';
  };

  return (
    <header className="h-16 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-neutral-500 hidden sm:inline-block">Admin /</span>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h1>
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-2">
        {/* Global Command Search */}
        <button
          onClick={onOpenSearch}
          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer flex items-center gap-2"
          title="Search (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs font-mono hidden md:inline-block">Search (⌘K)</span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={onQuickAction}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer relative"
          title="Push Broadcasts"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center justify-center font-mono font-bold text-xs">
            {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'SK'}
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbarV2;

