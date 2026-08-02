import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { isMockMode } from '../../lib/dbService';
import { useStore } from '../../store/useStore';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminGlobalSearchModal from '../../components/admin/AdminGlobalSearchModal';
import NotificationComposerModal from '../../components/admin/NotificationComposerModal';
import UserProfileDetailModal from '../../components/admin/UserProfileDetailModal';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const theme = useStore(state => state.theme);
  const isLight = theme === 'light';

  // Supabase Realtime Event Listener for instant live dashboard stats
  useEffect(() => {
    if (isMockMode) return;
    try {
      const channel = supabase
        .channel('admin_realtime_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            console.log('⚡ Admin Supabase Realtime update event:', payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime channel subscription error:', e);
    }
  }, []);

  return (
    <div className={`min-h-screen font-sans antialiased flex transition-colors duration-200 ${
      isLight
        ? 'bg-slate-100 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900'
        : 'bg-neutral-950 text-neutral-100 selection:bg-indigo-500/30 selection:text-indigo-200'
    }`}>
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {/* Header */}
        <AdminHeader
          setMobileOpen={setMobileOpen}
          onOpenSearch={() => setSearchOpen(true)}
          onQuickAction={() => setQuickActionOpen(true)}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet context={{ onSelectUser: setSelectedUser }} />
        </main>
      </div>

      {/* Global Search Command Palette */}
      <AdminGlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      {/* Quick Action Broadcast Modal */}
      <NotificationComposerModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onSuccess={() => alert('Quick broadcast sent successfully!')}
      />

      {/* User Profile Detail Inspector Drawer */}
      {selectedUser && (
        <UserProfileDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRefresh={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
