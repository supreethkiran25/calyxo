import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Crown,
  TrendingUp,
  Dumbbell,
  Utensils,
  Bot,
  Bell,
  MessageSquare,
  DollarSign,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import Logo from '../Logo';

const NAVIGATION_GROUPS = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    title: 'PEOPLE',
    items: [
      { path: '/admin/users', label: 'Users', icon: Users },
    ]
  },
  {
    title: 'BUSINESS',
    items: [
      { path: '/admin/premium', label: 'Subscriptions', icon: Crown },
      { path: '/admin/revenue', label: 'Revenue', icon: DollarSign },
      { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    ]
  },
  {
    title: 'HEALTH & PRODUCT',
    items: [
      { path: '/admin/workout-db', label: 'Workouts', icon: Dumbbell },
      { path: '/admin/nutrition-db', label: 'Nutrition', icon: Utensils },
      { path: '/admin/ai', label: 'AI Engine', icon: Bot },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { path: '/admin/notifications', label: 'Notifications', icon: Bell },
      { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
      { path: '/admin/logs', label: 'Audit Logs', icon: FileText },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ]
  }
];

const AdminSidebarV2 = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, onOpenSearch }) => {
  const location = useLocation();
  const user = useStore(state => state.user);

  const isLinkActive = (item) => {
    if (item.exact) {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard' || location.pathname === '/app/admin';
    }
    return location.pathname.startsWith(item.path);
  };

  const handleSignOut = async () => {
    const { logoutSuperAdmin } = await import('../../services/adminService');
    await logoutSuperAdmin();
    window.location.href = '/admin/login';
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-neutral-950 border-r border-neutral-800/80 transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding with Authentic Calyxo Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <Logo className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-wider text-white font-mono">CALYXO</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  ADMIN
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors border border-transparent hover:border-neutral-800 cursor-pointer"
            title={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Command Palette Trigger */}
        {!collapsed && onOpenSearch && (
          <div className="px-3 pt-3">
            <button
              onClick={onOpenSearch}
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between hover:border-neutral-700 hover:text-white transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                <span className="font-mono text-[11px]">Quick search...</span>
              </div>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {NAVIGATION_GROUPS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <div className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase px-3 mb-1.5">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-xs transition-all group rounded-lg ${
                        active
                          ? 'bg-neutral-900 text-white border border-neutral-700 font-semibold'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 border border-transparent font-medium'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin User Footer */}
        <div className="p-3 border-t border-neutral-800/80 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-neutral-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-neutral-800">
              {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SK'}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{user?.displayName || 'Operations Admin'}</span>
                <span className="text-[10px] font-mono text-neutral-400 truncate">{user?.email || 'supreethkiran25@gmail.com'}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer border border-transparent hover:border-rose-500/20"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebarV2;

