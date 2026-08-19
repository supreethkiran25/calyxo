"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, Smartphone, ShieldCheck, Wifi, RefreshCw, CheckCircle2, 
  AlertCircle, Lock, Download, Activity, Zap, Info 
} from 'lucide-react';
import { pwaManager } from '../services/pwaManager';
import { HealthPermissionManager } from '../services/health/HealthPermissionManager';
import { HealthSyncEngine } from '../services/health/HealthSyncEngine';
import { useStore } from '../store/useStore';

export default function PermissionsConnectionsSection({ onNotification }) {
  const user = useStore(state => state.user);
  
  const [pwaState, setPwaState] = useState(pwaManager.getState());
  const [swStatus, setSwStatus] = useState('Checking...');
  const [bgSyncSupported, setBgSyncSupported] = useState(false);
  const [healthConn, setHealthConn] = useState(HealthPermissionManager.isConnected());
  const [healthPlatform, setHealthPlatform] = useState(HealthPermissionManager.getPlatform());
  const [lastSyncTime, setLastSyncTime] = useState(HealthSyncEngine.formatLastSyncTime());

  useEffect(() => {
    // Subscribe to PWA state changes
    const unsubscribePWA = pwaManager.subscribe((newState) => {
      setPwaState(newState);
    });

    // Check SW status
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setSwStatus(reg.active ? 'Active & Controlling Page' : 'Registered');
      }).catch(() => {
        setSwStatus('Disabled');
      });
      setBgSyncSupported('SyncManager' in window);
    } else {
      setSwStatus('Unsupported');
    }

    return () => unsubscribePWA();
  }, []);

  const handleEnablePush = async () => {
    const perm = await pwaManager.enableNotifications(user?.uid);
    setPwaState(pwaManager.getState());
    if (onNotification) {
      if (perm === 'granted') onNotification("Push notifications enabled successfully!");
      else if (perm === 'denied') onNotification("Notification permission was denied in browser settings.");
    }
  };

  const handleInstallPWA = async () => {
    await pwaManager.promptInstall();
    setPwaState(pwaManager.getState());
  };

  const handleToggleHealth = async () => {
    if (healthConn) {
      HealthPermissionManager.disconnect();
      setHealthConn(false);
      if (onNotification) onNotification("Health platform disconnected.");
    } else {
      const res = await HealthPermissionManager.requestPermissions({ includeOptional: true });
      const isConnNow = HealthPermissionManager.isConnected();
      setHealthConn(isConnNow);
      if (onNotification) onNotification(isConnNow ? "Connected to health platform!" : "Permission partial.");
    }
  };

  return (
    <div className="space-y-4 text-foreground">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Permissions & Connections</h3>
          <p className="text-[11px] text-muted">Verified real-time device & platform features</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* 1. PWA INSTALLATION STATUS */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">PWA App Installation</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
              pwaState.isInstalled 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : pwaState.isInstallable 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-muted/20 text-muted'
            }`}>
              {pwaState.isInstalled ? 'Installed App' : pwaState.isInstallable ? 'Install Available' : 'Web Browser'}
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            {pwaState.isInstalled 
              ? 'Calyxo is running in Standalone App mode with offline cache.' 
              : pwaState.isInstallable 
              ? 'Install Calyxo to your home screen for quick offline access.' 
              : 'App installation is managed by your browser or already installed.'}
          </p>

          {pwaState.isInstallable && !pwaState.isInstalled && (
            <button
              onClick={handleInstallPWA}
              className="w-full py-2 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider border-none cursor-pointer shadow-md hover:brightness-110"
            >
              Install Application
            </button>
          )}
        </div>

        {/* 2. PUSH NOTIFICATIONS STATUS */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">Push Notifications</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
              pwaState.notificationPermission === 'granted' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : pwaState.notificationPermission === 'denied' 
                ? 'bg-destructive/20 text-destructive border border-destructive/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {pwaState.notificationPermission.toUpperCase()}
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            {pwaState.notificationPermission === 'granted'
              ? 'W3C Push notifications are active. Reminders reach your device even when closed.'
              : 'Enable notifications to receive workout, hydrations, and milestone alerts.'}
          </p>

          {pwaState.notificationPermission !== 'granted' && (
            <button
              onClick={handleEnablePush}
              className="w-full py-2 rounded-xl bg-surface border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-emerald-500/10"
            >
              Enable Notifications
            </button>
          )}
        </div>

        {/* 3. HEALTH DATA INTEGRATION STATUS */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">Health Integration</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
              healthConn 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
              {healthConn ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            {healthConn 
              ? `Connected to ${healthPlatform === 'ios_apple_health' ? 'Apple Health' : 'Android Health Connect'}. ${lastSyncTime}.` 
              : 'Connect Apple Health or Android Health Connect to automatically sync daily steps and workouts.'}
          </p>

          <button
            onClick={handleToggleHealth}
            className={`w-full py-2 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer border transition-all ${
              healthConn 
                ? 'bg-surface border-destructive/40 text-destructive hover:bg-destructive/10' 
                : 'bg-emerald-500 text-black border-none shadow-md hover:brightness-110'
            }`}
          >
            {healthConn ? 'Disconnect Health Platform' : 'Connect Health Data'}
          </button>
        </div>

        {/* 4. OFFLINE & SERVICE WORKER STATUS */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">Offline & Service Worker</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
              {swStatus.includes('Active') ? 'Active' : 'Checking'}
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            Service Worker Controller: <strong className="text-foreground">{swStatus}</strong>.<br />
            Background Sync API: <strong className={bgSyncSupported ? 'text-emerald-400' : 'text-amber-400'}>{bgSyncSupported ? 'Supported' : 'Unsupported on Browser'}</strong>.
          </p>
        </div>

      </div>
    </div>
  );
}
