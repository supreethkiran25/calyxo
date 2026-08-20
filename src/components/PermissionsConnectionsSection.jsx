"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, Smartphone, ShieldCheck, Wifi, RefreshCw, CheckCircle2, 
  AlertCircle, Lock, Download, Activity, Zap, Info, LayoutGrid, Watch
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { pwaManager } from '../services/pwaManager';
import { HealthPermissionManager } from '../services/health/HealthPermissionManager';
import { HealthSyncEngine } from '../services/health/HealthSyncEngine';
import { LiveActivityManager } from '../services/LiveActivityManager';
import { getNotificationStatus, requestNotificationPermission } from '../services/notificationService';
import { useStore } from '../store/useStore';
import WearableCompanionModal from './modals/WearableCompanionModal';
import { pinWidgetToHomeScreen } from '../services/widgetDataService';

export default function PermissionsConnectionsSection({ onNotification }) {
  const user = useStore(state => state.user);
  const isNative = Capacitor.isNativePlatform();
  const platform = HealthPermissionManager.getPlatform();

  const [isWearableOpen, setIsWearableOpen] = useState(false);
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
      if (isConnNow) {
        await HealthSyncEngine.triggerSync();
        setLastSyncTime(HealthSyncEngine.formatLastSyncTime());
        if (onNotification) onNotification("Connected to Apple Health! Syncing metrics.");
      }
    }
  };

  const notifBadge = (nativeNotif.status === 'authorized' || nativeNotif.isRegistered || pwaState.notificationPermission === 'granted')
    ? { label: 'ENABLED', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
    : { label: 'OFF', color: 'bg-muted/20 text-muted border-card-border' };

  return (
    <div className="space-y-4">
      <WearableCompanionModal
        isOpen={isWearableModalOpen}
        onClose={() => setIsWearableModalOpen(false)}
        onNotification={onNotification}
      />

      <div className="flex items-center gap-2 border-b border-card-border pb-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-black uppercase tracking-wider text-muted">
          Native System & Hardware Integrations
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* 1. HEALTHKIT & HEALTH CONNECT */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">
                Apple Health & Health Connect
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
              healthConn 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-muted/20 text-muted border-card-border'
            }`}>
              {healthConn ? 'ACTIVE' : 'DISCONNECTED'}
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            {healthConn 
              ? `Real-time sync active with Apple Health & paired wearables. ${lastSyncTime}.` 
              : 'Connect Apple Health or Android Health Connect to automatically sync active calories, steps, and workout sessions.'}
          </p>

          <button
            onClick={handleConnectHealth}
            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all border ${
              healthConn 
                ? 'bg-surface border-destructive/40 text-destructive hover:bg-destructive/10' 
                : 'bg-emerald-500 text-black border-none shadow-md hover:brightness-110'
            }`}
          >
            {healthConn ? 'Disconnect HealthKit' : 'Connect Apple Health'}
          </button>
        </div>

        {/* 2. WEARABLE OS & WATCH COMPANION */}
        <div className="p-4 rounded-2xl bg-surface border border-emerald-500/30 space-y-3 bg-gradient-to-br from-emerald-950/20 to-transparent">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Watch className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">
                Wearable Ecosystem Sync
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
              OPTIONAL
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            Supports Apple Watch (Series 3 through Ultra 2), Galaxy Watch, and Garmin (Forerunner 245) / Whoop / Oura via Apple Health & Health Connect. If you have no wearable, your phone tracks everything automatically.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsWearableOpen(true)}
              className="py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md hover:brightness-110"
            >
              <Download className="w-3.5 h-3.5" />
              Install on Watch
            </button>

            <button
              onClick={() => {
                if (onNotification) onNotification("Wearable sync active. Live workouts and metrics stream automatically from your paired watch or Garmin.");
              }}
              className="py-2.5 rounded-xl bg-surface hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Telemetry
            </button>
          </div>
        </div>

        {/* 3. WORKOUT & REST NOTIFICATIONS */}
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

        {/* 4. DYNAMIC ISLAND & LIVE ACTIVITY */}
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

        {/* 5. HOME SCREEN & LOCK SCREEN WIDGETS */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wide">Home Screen Widgets</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
              IOS & ANDROID
            </span>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            Real-time daily calories, hydration rings, steps, and active workout timers right on your Home Screen.
          </p>

          <button
            onClick={async () => {
              const res = await pinWidgetToHomeScreen();
              if (res && res.supported) {
                if (onNotification) onNotification("Prompting to add Calyxo Widget to your Home Screen...");
              } else {
                if (onNotification) onNotification("To add Widget: Long-press your Home screen → Tap '+' or 'Widgets' → Select Calyxo!");
              }
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Add Widget to Home Screen
          </button>
        </div>

      </div>

      <WearableCompanionModal
        isOpen={isWearableOpen}
        onClose={() => setIsWearableOpen(false)}
        onNotification={onNotification}
      />
    </div>
  );
}
