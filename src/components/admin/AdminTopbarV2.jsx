import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, HelpCircle, ChevronDown, LogOut, Settings, ShieldCheck, User } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { logoutSuperAdmin } from '../../services/adminService';

const AdminTopbarV2 = ({ setMobileOpen, onOpenSearch, onQuickAction }) => {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await logoutSuperAdmin();
    navigate('/admin/login', { replace: true });
  };

  const displayName = user?.displayName || user?.full_name || 'Supreeth Kiran';
  const roleName = 'Super Admin';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SK';

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#090b10]/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 cursor-pointer transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Search Bar (CMD+K) */}
        <div 
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#121522] hover:bg-[#161a29] border border-white/10 text-xs text-slate-400 cursor-pointer transition-all duration-200 group shadow-inner"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-lime-400 transition-colors shrink-0" />
            <span className="truncate text-slate-400 group-hover:text-slate-200">Search users, workouts, foods, or anything...</span>
          </div>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 shrink-0">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* Right: Notification Bell, Help, Admin Profile */}
      <div className="flex items-center gap-3 ml-4">
        {/* Notifications Icon with Badge (3) */}
        <button
          onClick={onQuickAction}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative cursor-pointer"
          title="Notifications & Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-[#090b10]">
            3
          </span>
        </button>

        {/* Help Circle */}
        <button
          onClick={() => navigate('/admin/support')}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Support & Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-lime-400 text-black flex items-center justify-center font-black text-xs shrink-0 shadow-md">
              {initials}
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-white">{displayName}</span>
              <span className="text-[10px] text-lime-400 font-semibold">{roleName}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Popover Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0f121d] border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95 font-sans">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs font-bold text-white">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'supreethkiran25@gmail.com'}</p>
                <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-lime-400/15 text-lime-400 rounded-full border border-lime-400/30">
                  {roleName}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setMenuOpen(false); navigate('/admin/settings'); }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Platform Settings</span>
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/admin/audit-logs'); }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Audit Logs</span>
                </button>
              </div>

              <div className="border-t border-white/5 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbarV2;
