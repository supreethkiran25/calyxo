"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ThemeToggle() {
  const { theme, toggleTheme, user, userProfile, updateUserProfile } = useStore();

  const handleToggle = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    
    if (user?.uid && userProfile) {
      const updatedProfile = {
        ...userProfile,
        appearance: {
          ...userProfile.appearance,
          themeMode: nextTheme
        }
      };
      updateUserProfile(updatedProfile);
      try {
        await import('../lib/dbService').then(({ saveUserProfile }) => {
          saveUserProfile(user.uid, updatedProfile);
        });
      } catch (err) {
        console.warn("Failed to save theme preference to database", err);
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full transition-all duration-200 cursor-pointer"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--card-border)',
        color: 'var(--text-muted)'
      }}
      aria-label="Toggle Color Theme"
      title="Toggle Light/Dark Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" style={{ color: 'var(--accent)' }} />
      ) : (
        <Moon className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
      )}
    </button>
  );
}
