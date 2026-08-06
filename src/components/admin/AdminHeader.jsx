import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  Plus,
  X,
  LogOut,
  Sun,
  Moon,
  Radio
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';

const PATH_MAP = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/premium': 'Premium',
  '/admin/analytics': 'Analytics',
  '/admin/workout-db': 'Workout DB',
  '/admin/nutrition-db': 'Nutrition DB',
  '/admin/ai': 'AI Hub',
  '/admin/notifications': 'Notifications',
  '/admin/feedback': 'Feedback',
  '/admin/revenue': 'Revenue',
  '/admin/logs': 'Audit Logs',
  '/admin/settings': 'Settings',
};

const AdminHeader = ({ setMobileOpen, onOpenSearch, onQuickAction }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const [showNotifications, setShowNotifications] = useState(false);
  const { status: realtimeStatus } = useAdminRealtime(['user_profiles', 'subscriptions', 'admin_audit_logs', 'user_feedback'], null, true);

  const isDark = theme === 'dark' || theme === 'obsidian' || !theme;
  const currentPage = PATH_MAP[location.pathname] || 'Dashboard';

  const handleSignOut = async () => {
    const { logoutSuperAdmin } = await import('../../services/adminService');
    await logoutSuperAdmin();
    window.location.href = '/admin/login';
  };

  const userInitials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SK';

  return (
    <header className="bg-neutral-900 border-b border-neutral-800 h-14 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <span>Admin</span>
          <span className="text-neutral-600">/</span>
          <span className="text-white font-medium">{currentPage}</span>
        </div>
      </div>

      {/* Right: Actions, Realtime Pill, Search, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Realtime Live Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Radio className="w-3 h-3 text-emerald-400" />
          <span>REALTIME {realtimeStatus === 'CONNECTED' ? 'LIVE' : 'SYNCING'}</span>
        </div>

        {/* Search button */}
        <button
          onClick={onOpenSearch}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-400 flex items-center gap-2 hover:border-neutral-600 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-700">⌘K</kbd>
        </button>

        {/* Quick Action Button */}
        <button
          onClick={onQuickAction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick action</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-neutral-900 border border-neutral-800 p-4 z-50 shadow-none">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-semibold text-white">Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-3 text-xs text-neutral-400">
                System notifications active. Go to Notifications tab for campaigns and broadcasts.
              </div>
              <button 
                onClick={() => { setShowNotifications(false); navigate('/admin/notifications'); }} 
                className="w-full text-center py-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                View Notifications →
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar & Sign Out */}
        <div className="flex items-center gap-3 pl-2 border-l border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold text-xs border border-blue-500/30 shrink-0">
              {userInitials}
            </div>
            <span className="hidden xl:inline text-xs font-medium text-white">{user?.displayName || 'Admin'}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
