import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Sparkles, Shield, LogOut } from 'lucide-react';
import { useStore } from '../../store/useStore';

const ROUTE_TITLES = {
  '/admin': 'Command Center',
  '/admin/dashboard': 'Command Center',
  '/admin/users': 'Users Directory',
  '/admin/premium': 'Subscriptions Hub',
  '/admin/revenue': 'Financial Ledger',
  '/admin/analytics': 'Platform Analytics',
  '/admin/ai': 'AI Intelligence',
  '/admin/nutrition-db': 'Food Dataset',
  '/admin/workout-db': 'Exercise Library',
  '/admin/notifications': 'Push Broadcasts',
  '/admin/feedback': 'User Feedback',
  '/admin/logs': 'Audit Logs',
  '/admin/settings': 'Platform Settings'
};

const AdminTopbarV2 = ({ setMobileOpen, onOpenSearch, onQuickAction }) => {
  const location = useLocation();
  const user = useStore(state => state.user);

  const title = ROUTE_TITLES[location.pathname] || 'Admin Portal';

  const handleSignOut = async () => {
    const { logoutSuperAdmin } = await import('../../services/adminService');
    await logoutSuperAdmin();
    window.location.href = '/admin/login';
  };

  return (
    <header className="h-16 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider hidden sm:inline-block">CALYXO /</span>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right: Actions, Search, Notifications, Admin Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Broadcast Button */}
        <button
          onClick={onQuickAction}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all cursor-pointer border border-blue-400/30 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Broadcast</span>
        </button>

        {/* Global Command Search */}
        <button
          onClick={onOpenSearch}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 text-neutral-400 hover:text-white border border-neutral-800 transition-all cursor-pointer flex items-center gap-2"
          title="Global Search (Cmd+K)"
        >
          <Search className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-mono hidden md:inline-block">Search (⌘K)</span>
        </button>

        {/* Notifications Button */}
        <button
          onClick={onQuickAction}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer relative"
          title="Notifications & Broadcasts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        {/* Admin Profile Dropdown Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm border border-blue-400/30">
            {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'SK'}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-none">{user?.displayName || 'Supreeth Kiran'}</span>
            <span className="text-[10px] font-mono text-neutral-400 mt-0.5">Super Admin</span>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbarV2;
