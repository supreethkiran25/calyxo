import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, FileText, Calendar, Settings, Menu, X, LogOut, Dumbbell } from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { signOutUser } from '../lib/dbService';
import { fetchTrainerClients } from '../lib/crmService';
import { useStore } from '../store/useStore';

export default function TrainerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const user = useStore(state => state.user);
  const setTrainerClients = useStore(state => state.setTrainerClients);
  
  useEffect(() => {
    if (user?.uid) {
      fetchTrainerClients(user.uid).then(data => setTrainerClients(data || []));
    }
  }, [user, setTrainerClients]);

  const handleLogout = async () => {
    if (window.confirm("Sign out of Calyxo Trainer?")) {
      await signOutUser();
      window.location.href = '/';
    }
  };

  const NAV_ITEMS = [
    { id: 'dashboard', href: '/trainer/dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analytics', href: '/trainer/analytics', label: 'Analytics', icon: Activity },
    { id: 'clients', href: '/trainer/clients', label: 'Client CRM', icon: Users },
    { id: 'messages', href: '/trainer/messages', label: 'Messages', icon: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
    { id: 'workouts', href: '/trainer/workouts', label: 'Workout Builder', icon: Dumbbell },
    { id: 'nutrition', href: '/trainer/nutrition', label: 'Nutrition Planner', icon: FileText },
    { id: 'calendar', href: '/trainer/calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', href: '/trainer/tasks', label: 'Task Management', icon: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
    { id: 'reports', href: '/trainer/reports', label: 'AI Reports', icon: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'documents', href: '/trainer/documents', label: 'Documents Vault', icon: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg> },
    { id: 'settings', href: '/trainer/settings', label: 'Trainer Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-card-bg border-r border-card-border z-50 transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 text-blue-500" glow={true} />
            <span className="font-black text-lg tracking-tight">calyxo <span className="text-blue-500 font-bold text-xs uppercase ml-1 tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full">Pro</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer border-none group ${
                  isActive ? 'bg-blue-500/10 text-blue-500' : 'bg-transparent text-muted hover:bg-surface hover:text-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-500 shadow-sm shadow-blue-500/20'
                    : 'bg-surface/60 text-muted-foreground group-hover:bg-surface group-hover:text-foreground'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-card-border flex items-center justify-between">
          <ThemeToggle />
          <button onClick={handleLogout} className="p-2 text-muted hover:text-destructive transition-colors bg-transparent border-none cursor-pointer">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-foreground bg-transparent border-none">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-sm">calyxo Pro</span>
          </div>
          <div className="w-10"></div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
