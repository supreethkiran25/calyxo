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
  ShieldAlert,
  ExternalLink
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/users', label: 'Users', icon: Users, badge: '14.2k' },
  { path: '/admin/premium', label: 'Premium', icon: Crown, badge: 'PRO' },
  { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/admin/workout-db', label: 'Workout DB', icon: Dumbbell },
  { path: '/admin/nutrition-db', label: 'Nutrition DB', icon: Utensils },
  { path: '/admin/ai', label: 'AI Management', icon: Bot },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare, badge: '8' },
  { path: '/admin/revenue', label: 'Revenue', icon: DollarSign },
  { path: '/admin/logs', label: 'System Logs', icon: FileText },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const location = useLocation();

  const isLinkActive = (item) => {
    if (item.exact) {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard' || location.pathname === '/app/admin';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-neutral-950/90 backdrop-blur-xl border-r border-neutral-800/80 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  CALYXO <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">ADMIN</span>
                </span>
                <span className="text-xs text-neutral-400 font-mono">Super Command Center</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  active
                    ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-indigo-400' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    item.badge === 'PRO' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : active ? 'bg-indigo-500/30 text-indigo-200' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Footer Actions */}
        <div className="p-3 border-t border-neutral-800/80">
          <NavLink
            to="/user/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900/80 transition-colors border border-neutral-800/50"
            title="Return to Main Calyxo Web App"
          >
            <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
            {!collapsed && <span>Return to Main App</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
