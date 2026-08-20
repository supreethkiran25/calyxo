import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaggeredMenu from './StaggeredMenu';
import SettingsDrawerPanel from './SettingsDrawerPanel';
import { signOutUser } from '../lib/dbService';

export default function MobileDrawerMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleShareApp = async () => {
    const isLocalOrCapacitor = typeof window !== 'undefined' && (
      window.location.origin.includes('localhost') || 
      window.location.origin.includes('capacitor://') ||
      window.location.origin.includes('http://127.0.0.1')
    );
    const downloadUrl = isLocalOrCapacitor ? 'https://calyxo.vercel.app' : window.location.origin;

    const shareData = {
      title: 'Calyxo — Health, Workout & Nutrition OS',
      text: `Join me on Calyxo! Track nutrition with 11,000+ Indian dishes, stream workout sets to Dynamic Island, and sync Apple Health & Google Health Connect. Download & install here: ${downloadUrl}`,
      url: downloadUrl
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {}
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.text);
      alert(`Calyxo invite link copied to clipboard!\n\n${downloadUrl}`);
    }
  };

  const menuItems = [
    { label: 'Health Hub', ariaLabel: 'View Universal Health Data', link: '/user/health' },
    { label: 'Progress', ariaLabel: 'View Analytics & Progress', link: '/user/progress' },
    { label: 'AI Coach', ariaLabel: 'Open AI Assistant', link: '/user/ai' },
    { label: 'Profile', ariaLabel: 'User Profile', link: '/user/profile' },
    { 
      label: 'Settings', 
      ariaLabel: 'Open App Settings & Preferences',
      onClick: () => {
        setIsSettingsOpen(true);
      }
    },
  ];

  const socialItems = [
    { label: 'Invite', onClick: handleShareApp },
    { label: 'Privacy Policy', link: '/user/privacy' },
    { label: 'Terms of Service', link: '/user/terms' },
    { label: 'Support', link: '/user/support' },
    { label: 'About Calyxo', link: '/user/about' },
    {
      label: 'Sign Out',
      onClick: async () => {
        if (window.confirm('Sign out of Calyxo?')) {
          await signOutUser();
          window.location.href = '/';
        }
      }
    }
  ];

  if (!isOpen && !isSettingsOpen) return null;

  return (
    <div className="lg:hidden">
      {isOpen && (
        <StaggeredMenu
          position="left"
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={false}
          menuButtonColor="var(--foreground, #ffffff)"
          openMenuButtonColor="var(--foreground, #ffffff)"
          changeMenuColorOnOpen={true}
          colors={['#4c7a00', '#181824', '#0A0A0F']}
          logoUrl="/icon-192x192.png"
          accentColor="#b5f23d"
          isFixed={true}
          isOpenExternal={isOpen}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleExternal={(openState) => {
            if (!openState) onClose();
          }}
          onNavigate={(link) => {
            navigate(link);
            onClose();
          }}
          onMenuClose={onClose}
        />
      )}

      {/* Interactive In-Menu Settings Panel */}
      <SettingsDrawerPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onNavigate={(link) => {
          navigate(link);
          setIsSettingsOpen(false);
          onClose();
        }}
      />
    </div>
  );
}
