"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, Smartphone, ShieldCheck, Wifi, RefreshCw, CheckCircle2, 
  AlertCircle, Lock, Download, Activity, Zap, Info, LayoutGrid
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { pwaManager } from '../services/pwaManager';
import { HealthPermissionManager } from '../services/health/HealthPermissionManager';
import { HealthSyncEngine } from '../services/health/HealthSyncEngine';
import { LiveActivityManager } from '../services/LiveActivityManager';
import { getNotificationStatus, requestNotificationPermission } from '../services/notificationService';
import { useStore } from '../store/useStore';

export default function PermissionsConnectionsSection({ onNotification }) {
  const user = useStore(state => state.user);
  const isNative = Capacitor.isNativePlatform();
  const platform = HealthPermissionManager.getPlatform();

  const [pwaState, setPwaState] = useState(pwaManager.getState());
  const [swStatus, setSwStatus] = useState('Checking...');
  const [bgSyncSupported, setBgSyncSupported] = useState(false);
  const [healthConn, setHealthConn] = useState(HealthPermissionManager.isConnected());
  const [healthPlatform, setHealthPlatform] = useState(platform);
  const [lastSyncTime, setLastSyncTime] = useState(HealthSyncEngine.formatLastSyncTime());
  const [liveActivityState, setLiveActivityState] = useState({ available: false, enabled: false });
  const [nativeNotif, setNativeNotif] = useState({ status: 'notDetermined', isRegistered: false });

  const loadAllStatuses = async () => {
    // 1. Live Activity Status
    const laRes = await LiveActivityManager.isAvailable();
    setLiveActivityState(laRes || { available: false, enabled: false });

    // 2. Notification Status
    const notifRes = await getNotificationStatus();
    setNativeNotif(notifRes || { status: 'notDetermined', isRegistered: false });

    // 3. HealthKit Status
    const isConn = HealthPermissionManager.isConnected();
    setHealthConn(isConn);
  };

  useEffect(() => {
    loadAllStatuses();

    if (!isNative) {
      const unsubscribePWA = pwaManager.subscribe((newState) => {
        setPwaState(newState);
      });

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
    }
  }, [isNative]);

  const handleEnablePush = async () => {
    const perm = await requestNotificationPermission();
    await loadAllStatuses();
    if (onNotification) {
      if (perm === 'granted' || perm === 'authorized') {
        onNotification("Native iOS Notifications authorized & registered!");
      } else if (perm === 'denied') {
        onNotification("Notifications denied in iOS Settings.");
      }
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
      if (onNotification) onNotification(isConnNow ? "Connected to Apple Health!" : "Permission requested.");
    }
  };

  const formatNotifBadge = () => {
    if (isNative) {
      if (nativeNotif.isRegistered) return { label: 'APNs REGISTERED', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      if (nativeNotif.status === 'authorized' || nativeNotif.status === 'granted') return { label: 'AUTHORIZED', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      if (nativeNotif.status === 'denied') return { label: 'DENIED', color: 'bg-destructive/20 text-destructive border-destructive/30' };
      return { label: 'NOT REQUESTED', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    } else {
      if (pwaState.notificationPermission === 'granted') return { label: 'AUTHORIZED', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      if (pwaState.notificationPermission === 'denied') return { label: 'DENIED', color: 'bg-destructive/20 text-destructive border-destructive/30' };
      return { label: 'NOT REQUESTED', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
  };

  const notifBadge = formatNotifBadge();

  return (
    <div className="space-y-4 text-foreground">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Device Integrations & Wearables</h3>
          <p className="text-[11px] text-muted">Manage Apple Watch, HealthKit, and live mobile widgets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* 1. HEALTH & WEARABLES INTEGRATION */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">
                {isNative ? 'Apple Health & Wearables' : 'Health Integration'}
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
              healthConn 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {healthConn ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            {healthConn 
              ? `Real-time sync active with Apple Health & paired wearables. ${lastSyncTime}.` 
              : 'Connect Apple Health to sync daily active calories, step counts, and workouts from your Apple Watch or smart band.'}
          </p>

          <button
            onClick={handleToggleHealth}
            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer border transition-all ${
              healthConn 
                ? 'bg-surface border-destructive/40 text-destructive hover:bg-destructive/10' 
                : 'bg-emerald-500 text-black border-none shadow-md hover:brightness-110'
            }`}
          >
            {healthConn ? 'Disconnect HealthKit' : 'Connect Apple Health'}
          </button>
        </div>

        {/* 2. WORKOUT & REST NOTIFICATIONS */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">
                Workout Alerts & Push
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${notifBadge.color}`}>
              {notifBadge.label}
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            {nativeNotif.status === 'authorized' || nativeNotif.isRegistered
              ? 'Alerts active. Rest timer countdowns and workout notifications will be delivered.'
              : 'Enable notifications to receive rest timer countdown alerts and hydration reminders.'}
          </p>

          {!(nativeNotif.status === 'authorized' || nativeNotif.isRegistered) && (
            <button
              onClick={handleEnablePush}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-md hover:brightness-110"
            >
              Enable Workout Alerts
            </button>
          )}
        </div>

        {/* 3. DYNAMIC ISLAND & LIVE ACTIVITY */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">Dynamic Island & Lock Screen</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
              READY
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            Active workout sets and rest timers stream automatically to your Dynamic Island, Lock Screen, and Apple Watch Smart Stack.
          </p>
        </div>

        {/* 4. HOME SCREEN WIDGETS */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">Home Screen Widgets</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
              AVAILABLE
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            Add the Calyxo Daily Rings and Calories widgets to your iPhone Home Screen for live glanceable tracking.
          </p>
        </div>

      </div>
    </div>
  );
}
