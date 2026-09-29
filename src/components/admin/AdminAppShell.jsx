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
    <div className="min-h-screen font-sans antialiased flex bg-[#07080b] text-white selection:bg-lime-400 selection:text-black">
      <Toaster richColors position="top-right" theme="dark" />

      {/* Modern Calyxo Left Sidebar */}
      <AdminSidebarV2
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace Layout */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
        sidebarCollapsed ? 'lg:pl-18' : 'lg:pl-60'
      }`}>
        {/* Topbar Navigation Header */}
        <AdminTopbarV2
          setMobileOpen={setMobileOpen}
          onOpenSearch={() => setSearchOpen(true)}
          onQuickAction={() => setQuickActionOpen(true)}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-[#07080b]">
          <div className="max-w-[1600px] mx-auto w-full space-y-6">
            <Outlet context={{ onSelectUser: setSelectedUser }} />
          </div>
        </main>
      </div>

      {/* Global Command Search Palette (CMD+K) */}
      <AdminGlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      {/* Broadcast Composer Modal */}
      <NotificationComposerModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onSuccess={() => toast.success('Broadcast sent successfully!')}
      />

      {/* User 360 Profile Detail Inspector Drawer */}
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
