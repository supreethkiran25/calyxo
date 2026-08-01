"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, Bell, CheckCircle2, X } from 'lucide-react';
import { pwaManager } from '../services/pwaManager';
import { useStore } from '../store/useStore';

export default function PWAInstallBanner() {
  const [pwaState, setPwaState] = useState(pwaManager.getState());
  const [dismissed, setDismissed] = useState(false);
  const user = useStore(state => state.user);

  useEffect(() => {
    const unsubscribe = pwaManager.subscribe((newState) => {
      setPwaState(newState);
    });
    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    await pwaManager.promptInstall();
  };

  const handleUpdateClick = () => {
    pwaManager.updateApp();
  };

  const handleNotificationClick = async () => {
    await pwaManager.enableNotifications(user?.uid);
  };

  if (dismissed) return null;

  // Render Update Prompt
  if (pwaState.hasUpdateAvailable) {
    return (
      <div className="fixed bottom-20 right-4 z-50 max-w-sm bg-surface border border-emerald-500/40 rounded-2xl p-4 shadow-2xl space-y-2 text-foreground">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-xs font-black uppercase tracking-wider">Update Available</span>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 text-muted hover:text-foreground cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-muted">A new version of Calyxo is ready to install.</p>
        <button
          onClick={handleUpdateClick}
          className="w-full py-2 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-md hover:brightness-110"
        >
          Update Now
        </button>
      </div>
    );
  }

  // Render PWA Install Prompt (only when installable and not installed)
  if (pwaState.isInstallable && !pwaState.isInstalled) {
    return (
      <div className="fixed bottom-20 right-4 z-50 max-w-sm bg-surface border border-card-border rounded-2xl p-4 shadow-2xl space-y-2 text-foreground">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider">Install Calyxo App</span>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 text-muted hover:text-foreground cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-muted">Install Calyxo on your home screen for quick offline access and real-time step tracking.</p>
        <button
          onClick={handleInstallClick}
          className="w-full py-2 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-md hover:brightness-110"
        >
          Install App
        </button>
      </div>
    );
  }

  return null;
}
