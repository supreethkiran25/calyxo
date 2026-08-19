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
  Shield,
  Search,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const NAVIGATION_GROUPS = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/admin', label: 'Command Center', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/admin/users', label: 'Users Directory', icon: Users },
      { path: '/admin/premium', label: 'Subscriptions', icon: Crown },
      { path: '/admin/revenue', label: 'Financial Ledger', icon: DollarSign },
    ]
  },
  {
    title: 'INSIGHTS',
    items: [
      { path: '/admin/analytics', label: 'Platform Analytics', icon: TrendingUp },
      { path: '/admin/ai', label: 'AI Intelligence', icon: Bot },
    ]
  },
  {
    title: 'CONTENT & DATASETS',
    items: [
      { path: '/admin/nutrition-db', label: 'Food Dataset', icon: Utensils },
      { path: '/admin/workout-db', label: 'Exercise Library', icon: Dumbbell },
    ]
  },
  {
    title: 'SYSTEM & SECURITY',
    items: [
      { path: '/admin/notifications', label: 'Push Broadcasts', icon: Bell },
      { path: '/admin/feedback', label: 'User Feedback', icon: MessageSquare },
      { path: '/admin/logs', label: 'Audit Logs', icon: FileText },
      { path: '/admin/settings', label: 'Platform Settings', icon: Settings },
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
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-neutral-950 border-r border-neutral-800/80 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20 border border-blue-400/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-wider text-white font-mono">CALYXO</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    CONTROL
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Enterprise v2.0</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors border border-transparent hover:border-neutral-800"
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
              className="w-full px-3 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between hover:border-neutral-700 hover:text-white transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                <span className="font-mono text-[11px]">Command palette...</span>
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
                <div className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase px-3 mb-2">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-xs transition-all group rounded-xl ${
                        active
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 font-bold shadow-sm shadow-blue-500/5'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80 border border-transparent font-medium'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-blue-400' : 'text-neutral-400 group-hover:text-white'}`} />
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
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/30">
              {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SK'}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{user?.displayName || 'Supreeth Kiran'}</span>
                <span className="text-[10px] font-mono text-neutral-400 truncate">{user?.email || 'supreethkiran25@gmail.com'}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer border border-transparent hover:border-rose-500/20"
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
