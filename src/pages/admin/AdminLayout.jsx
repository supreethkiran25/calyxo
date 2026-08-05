import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { useStore } from '../../store/useStore';
import { verifyAdminAccessRPC, logoutSuperAdmin } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminGlobalSearchModal from '../../components/admin/AdminGlobalSearchModal';
import NotificationComposerModal from '../../components/admin/NotificationComposerModal';
import UserProfileDetailModal from '../../components/admin/UserProfileDetailModal';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const theme = useStore(state => state.theme);
  const isLight = theme === 'light';

  // Server-side verification on mount
  useEffect(() => {
    let isMounted = true;
    const verifyServerAccess = async () => {
      const isVerified = await verifyAdminAccessRPC();
      if (isMounted && !isVerified) {
        toast.error('Session expired or unauthorized.');
        await logoutSuperAdmin();
        navigate('/admin/login', { replace: true });
      }
    };
    verifyServerAccess();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className={`min-h-screen font-sans antialiased flex transition-colors duration-200 ${
      isLight
        ? 'admin-light-mode bg-slate-50 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900'
        : 'bg-neutral-950 text-neutral-100 selection:bg-indigo-500/30 selection:text-indigo-200'
    }`}>
      <Toaster position="top-right" theme="dark" richColors />

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
        onSuccess={() => toast.success('Quick broadcast sent successfully!')}
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
