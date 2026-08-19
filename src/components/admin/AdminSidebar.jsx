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
  LogOut
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const MENU_SECTIONS = [
  {
    title: 'PLATFORM',
    items: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/admin/users', label: 'Users', icon: Users },
      { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    ],
  },
  {
    title: 'REVENUE',
    items: [
      { path: '/admin/revenue', label: 'Revenue', icon: DollarSign },
      { path: '/admin/premium', label: 'Premium', icon: Crown },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { path: '/admin/nutrition-db', label: 'Nutrition DB', icon: Utensils },
      { path: '/admin/workout-db', label: 'Workout DB', icon: Dumbbell },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/admin/ai', label: 'AI Hub', icon: Bot },
      { path: '/admin/notifications', label: 'Notifications', icon: Bell },
      { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
      { path: '/admin/logs', label: 'Audit Logs', icon: FileText },
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const AdminSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, onOpenSearch }) => {
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
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-neutral-900 border-r border-neutral-800 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-white">CALYXO</span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ADMIN
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Search shortcut button inside sidebar when expanded */}
        {!collapsed && onOpenSearch && (
          <div className="px-3 pt-3">
            <button
              onClick={onOpenSearch}
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-500" />
                <span>Search...</span>
              </div>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium px-3 mb-1 mt-2">
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
                      className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors group ${
                        active
                          ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500 rounded-r-lg font-medium'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg font-normal'
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

        {/* Admin Profile & Sign Out Footer */}
        <div className="p-3 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold text-xs shrink-0 border border-blue-500/30">
              {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SK'}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{user?.displayName || 'Admin'}</span>
                <span className="text-[10px] text-neutral-500 truncate">{user?.email || 'admin@calyxo.app'}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
