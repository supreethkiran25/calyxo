"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-200 cursor-pointer"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--card-border)',
        color: 'var(--text-muted)'
      }}
      aria-label="Toggle Color Theme"
      title="Toggle Light/Dark Theme"
    >
      {(theme === 'dark' || theme === 'obsidian') ? (
        <Sun className="w-4 h-4" style={{ color: 'var(--accent)' }} />
      ) : (
        <Moon className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
      )}
    </button>
  );
}
