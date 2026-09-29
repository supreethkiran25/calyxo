import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  BarChart3,
  Users,
  UserCheck,
  Shield,
  UserPlus,
  MessageSquare,
  Dumbbell,
  Sparkles,
  Utensils,
  Apple,
  Bot,
  LineChart,
  Calendar,
  CreditCard,
  Layers,
  IndianRupee,
  Bell,
  FileText,
  ClipboardList,
  ShieldCheck,
  Settings,
  KeyRound,
  ChevronsLeft,
  ChevronsRight,
  LogOut
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import Logo from '../Logo';

export const ADMIN_NAVIGATION_GROUPS = [
  {
    title: 'Overview',
    items: [
      { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
      { path: '/admin/live-activity', label: 'Live Activity', icon: Radio },
      { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
    ]
  },
  {
    title: 'CRM',
    items: [
      { path: '/admin/users', label: 'Athletes & Users', icon: Users },
      { path: '/admin/leads', label: 'Leads / Prospects', icon: UserPlus },
      { path: '/admin/support', label: 'Support & Tickets', icon: MessageSquare }
    ]
  },
  {
    title: 'Health Platform',
    items: [
      { path: '/admin/workouts', label: 'Workouts', icon: Dumbbell },
      { path: '/admin/exercises', label: 'Exercises', icon: Sparkles },
      { path: '/admin/meals', label: 'Meals & Foods', icon: Utensils },
      { path: '/admin/nutrition', label: 'Nutrition', icon: Apple },
      { path: '/admin/ai', label: 'AI Coach', icon: Bot },
      { path: '/admin/progress', label: 'Progress', icon: LineChart }
    ]
  },
  {
    title: 'Business',
    items: [
      { path: '/admin/subscriptions', label: 'Subscriptions', icon: Calendar },
      { path: '/admin/payments', label: 'Payments', icon: CreditCard },
      { path: '/admin/plans', label: 'Plans', icon: Layers },
      { path: '/admin/revenue', label: 'Revenue', icon: IndianRupee }
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/admin/notifications', label: 'Notifications', icon: Bell },
      { path: '/admin/reports', label: 'Reports', icon: FileText },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
      { path: '/admin/system-health', label: 'System Health', icon: ShieldCheck }
    ]
  },
  {
    title: 'Administration',
    items: [
      { path: '/admin/settings', label: 'Settings', icon: Settings },
      { path: '/admin/roles', label: 'Roles & Permissions', icon: KeyRound }
    ]
  }
];

const AdminSidebarV2 = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const user = useStore(state => state.user);

  const isLinkActive = (item) => {
    if (item.exact) {
      return location.pathname === '/admin' || location.pathname === '/admin/' || location.pathname === '/admin/dashboard' || location.pathname === '/app/admin';
    }
    // Also match legacy route aliases
    if (item.path === '/admin/subscriptions' && location.pathname.startsWith('/admin/premium')) return true;
    if (item.path === '/admin/workouts' && location.pathname.startsWith('/admin/workout-db')) return true;
    if (item.path === '/admin/nutrition' && location.pathname.startsWith('/admin/nutrition-db')) return true;
    if (item.path === '/admin/support' && location.pathname.startsWith('/admin/feedback')) return true;
    if (item.path === '/admin/audit-logs' && location.pathname.startsWith('/admin/logs')) return true;
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#0d0f12] text-slate-300 border-r border-[#1e232e] transition-all duration-200 select-none ${
          collapsed ? 'w-18' : 'w-60'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1e232e] shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-base font-bold tracking-tight text-white font-sans">
              Calyxo
            </span>
            {!collapsed && (
              <span className="text-[10px] text-slate-400 font-sans leading-tight border-l border-slate-700/60 pl-2">
                AI-Powered Health<br/>Operating System
              </span>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 custom-scrollbar">
          {ADMIN_NAVIGATION_GROUPS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <div className="text-[11px] font-medium text-slate-400 px-2.5 mb-1 tracking-tight">
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
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 text-xs transition-colors rounded-lg group ${
                        active
                          ? 'bg-[#181c24] text-white font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 font-normal'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with System Online indicator */}
        <div className="px-4 py-3 border-t border-[#1e232e] shrink-0 bg-[#0d0f12] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {!collapsed && (
              <span className="text-slate-300 text-xs font-sans truncate">System Online</span>
            )}
          </div>
          {!collapsed && (
            <span className="text-[11px] text-slate-400">v2.4.0</span>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebarV2;
