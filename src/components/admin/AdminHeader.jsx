import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Plus,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const PATH_MAP = {
  '/admin': 'Home Dashboard',
  '/admin/users': 'User Management',
  '/admin/premium': 'Premium Management',
  '/admin/analytics': 'Analytics & Performance',
  '/admin/workout-db': 'Workout Database',
  '/admin/nutrition-db': 'Nutrition Database',
  '/admin/ai': 'AI System & Models',
  '/admin/notifications': 'Notification Broadcasts',
  '/admin/feedback': 'Feedback Center',
  '/admin/revenue': 'Revenue & Billing',
  '/admin/logs': 'System Audit Logs',
  '/admin/settings': 'Platform Settings',
};

const AdminHeader = ({ setMobileOpen, onOpenSearch, onQuickAction }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, user } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const isLight = theme === 'light';

  const currentTitle = PATH_MAP[location.pathname] || 'Super Admin';

  return (
    <header className={`h-16 sticky top-0 z-30 backdrop-blur-xl border-b px-4 lg:px-6 flex items-center justify-between transition-colors duration-200 ${
      isLight ? 'bg-white/80 border-slate-200/80 text-slate-800' : 'bg-neutral-950/80 border-neutral-800/80 text-neutral-100'
    }`}>
      {/* Left section: Mobile menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className={`lg:hidden p-2 rounded-xl transition-colors ${
            isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={isLight ? 'text-slate-400' : 'text-neutral-500'}>Admin</span>
          <span className={isLight ? 'text-slate-300' : 'text-neutral-700'}>/</span>
          <span className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentTitle}</span>
        </div>
      </div>

      {/* Center/Right section: Search, Quick Action, Theme, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all shadow-inner ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
            isLight ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
          }`}>⌘K</kbd>
        </button>

        {/* Quick Action Trigger */}
        <button
          onClick={onQuickAction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Action</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isLight ? 'text-amber-600 hover:bg-slate-100' : 'text-indigo-400 hover:text-white hover:bg-neutral-800/60'
          }`}
          title="Toggle Dark/Light Mode"
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
              isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-neutral-900 border-neutral-800 text-neutral-100'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Notifications Broadcast Hub
                </span>
                <button onClick={() => setShowNotifications(false)} className="text-neutral-500 hover:text-neutral-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-4 text-center text-xs text-neutral-500">
                System notifications active. Check Notification Broadcasts tab for live analytics.
              </div>
              <button 
                onClick={() => { setShowNotifications(false); navigate('/admin/notifications'); }} 
                className="w-full text-center py-1.5 text-xs text-indigo-500 hover:text-indigo-400 font-medium cursor-pointer"
              >
                View Broadcast Hub →
              </button>
            </div>
          )}
        </div>

        {/* Super Admin Badge & Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20">
            <img
              src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="Admin Avatar"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className={`text-xs font-bold leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>Supreeth Kiran</span>
            <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 inline" /> Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
