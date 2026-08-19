import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { useStore } from '../../store/useStore';
import { verifyAdminAccessRPC, logoutSuperAdmin } from '../../services/adminService';
import AdminSidebarV2 from './AdminSidebarV2';
import AdminTopbarV2 from './AdminTopbarV2';
import AdminGlobalSearchModal from './AdminGlobalSearchModal';
import NotificationComposerModal from './NotificationComposerModal';
import UserProfileDetailModal from './UserProfileDetailModal';

const AdminAppShell = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const initializeTheme = useStore(state => state.initializeTheme);

  // Keyboard shortcut listener for Cmd+K global search
  useEffect(() => {
    initializeTheme();
    let isMounted = true;
    const verifyServerAccess = async () => {
      try {
        const isVerified = await verifyAdminAccessRPC();
        if (isMounted && !isVerified) {
          toast.error('Session expired or unauthorized.');
          await logoutSuperAdmin();
          navigate('/admin/login', { replace: true });
        }
      } catch (e) {
        console.warn('Admin access check error:', e);
      }
    };
    verifyServerAccess();

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, initializeTheme]);

  return (
    <div className="min-h-screen font-sans antialiased flex bg-neutral-950 text-neutral-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Toaster richColors position="top-right" />

      {/* New Enterprise Sidebar */}
      <AdminSidebarV2
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {/* Topbar Navigation */}
        <AdminTopbarV2
          setMobileOpen={setMobileOpen}
          onOpenSearch={() => setSearchOpen(true)}
          onQuickAction={() => setQuickActionOpen(true)}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            <Outlet context={{ onSelectUser: setSelectedUser }} />
          </div>
        </main>
      </div>

      {/* Global Command Search Palette */}
      <AdminGlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      {/* Broadcast Composer Modal */}
      <NotificationComposerModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onSuccess={() => toast.success('Quick broadcast dispatched successfully!')}
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

export default AdminAppShell;
