import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaggeredMenu from './StaggeredMenu';
import SettingsDrawerPanel from './SettingsDrawerPanel';
import { signOutUser } from '../lib/dbService';

export default function MobileDrawerMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = [
    { label: 'Progress', ariaLabel: 'View Analytics & Progress', link: '/user/progress' },
    { label: 'Health Hub', ariaLabel: 'Open Health Hub', link: '/user/healthhub' },
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
