import React, { useState, useEffect } from 'react';
import { 
  Activity, Bell, Zap, Watch, RefreshCw, Check, ChevronRight
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { HealthPermissionManager } from '../services/health/HealthPermissionManager';
import { HealthSyncEngine } from '../services/health/HealthSyncEngine';
import { getNotificationStatus, requestNotificationPermission } from '../services/notificationService';
import { useStore } from '../store/useStore';
import WearableCompanionModal from './modals/WearableCompanionModal';

export default function PermissionsConnectionsSection({ onNotification }) {
  const user = useStore(state => state.user);
  const platform = HealthPermissionManager.getPlatform();

  const [isWearableOpen, setIsWearableOpen] = useState(false);
  const [healthConn, setHealthConn] = useState(HealthPermissionManager.isConnected());
  const [lastSyncTime, setLastSyncTime] = useState(HealthSyncEngine.formatLastSyncTime());
  const [nativeNotif, setNativeNotif] = useState({ status: 'notDetermined', isRegistered: false });
  const [isSyncing, setIsSyncing] = useState(false);

  const platformName = platform === 'ios_apple_health'
    ? 'Apple Health'
    : platform === 'android_health_connect'
    ? 'Health Connect'
    : 'Device Health';

  const loadAllStatuses = async () => {
    const notifRes = await getNotificationStatus();
    setNativeNotif(notifRes || { status: 'notDetermined', isRegistered: false });

    const isConn = HealthPermissionManager.isConnected();
    setHealthConn(isConn);
  };

  useEffect(() => {
    loadAllStatuses();
  }, []);

  const handleConnectOrSyncHealth = async () => {
    setIsSyncing(true);
    try {
      if (!healthConn) {
        await HealthPermissionManager.requestPermissions({ includeOptional: true });
        const isConnNow = HealthPermissionManager.isConnected();
        setHealthConn(isConnNow);
        if (isConnNow) {
          await HealthSyncEngine.triggerSync();
          setLastSyncTime(HealthSyncEngine.formatLastSyncTime());
          if (onNotification) onNotification(`Connected to ${platformName}! Sync active.`);
        }
      } else {
        await HealthSyncEngine.triggerSync();
        setLastSyncTime(HealthSyncEngine.formatLastSyncTime());
        if (onNotification) onNotification(`${platformName} telemetry synchronized.`);
      }
    } catch (e) {
      console.warn('Health sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEnableNotifications = async () => {
    const isCurrentlyOn = nativeNotif.status === 'authorized' || nativeNotif.isRegistered;
    if (!isCurrentlyOn) {
      const perm = await requestNotificationPermission();
      await loadAllStatuses();
      if (perm === 'granted' || perm === 'authorized') {
        if (onNotification) onNotification("Push notifications authorized!");
      }
    }
  };

  const isNotifActive = nativeNotif.status === 'authorized' || nativeNotif.isRegistered;

  return (
    <div className="space-y-3">
      {/* Sleek Minimalist System Connections Card */}
      <div className="rounded-2xl bg-surface border border-card-border overflow-hidden divide-y divide-card-border/50 shadow-md">

        {/* 1. Apple Health / Health Connect */}
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              healthConn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted/10 text-muted'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block truncate">
                {platformName}
              </span>
              <span className="text-[10px] text-muted block truncate">
                {healthConn ? `Sync active • ${lastSyncTime}` : 'Steps, calories & workouts'}
              </span>
            </div>
          </div>

          <button
            onClick={handleConnectOrSyncHealth}
            disabled={isSyncing}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
              healthConn 
                ? 'bg-surface border border-card-border hover:border-emerald-500/40 text-foreground'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold'
            }`}
          >
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : healthConn ? (
              <>
                <RefreshCw className="w-2.5 h-2.5 text-emerald-400" />
                <span>Sync</span>
              </>
            ) : (
              'Connect'
            )}
          </button>
        </div>

        {/* 2. Push & Workout Alerts */}
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isNotifActive ? 'bg-amber-500/15 text-amber-400' : 'bg-muted/10 text-muted'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block truncate">
                Workout & Rest Alerts
              </span>
              <span className="text-[10px] text-muted block truncate">
                {isNotifActive ? 'Live countdowns & reminders' : 'Rest timer countdowns'}
              </span>
            </div>
          </div>

          {isNotifActive ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold shrink-0 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Active
            </span>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shrink-0 cursor-pointer"
            >
              Enable
            </button>
          )}
        </div>

        {/* 3. Dynamic Island HUD */}
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block truncate">
                Dynamic Island HUD
              </span>
              <span className="text-[10px] text-muted block truncate">
                Live rest timer on Island & Lock Screen
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-bold shrink-0">
            Ready
          </span>
        </div>

        {/* 4. Smartwatch & Wearables */}
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Watch className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block truncate">
                Watch Companion
              </span>
              <span className="text-[10px] text-muted block truncate">
                Apple Watch, Garmin, boAt & Oura
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsWearableOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-surface border border-card-border hover:border-emerald-500/40 text-foreground text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
          >
            <span>Open</span>
            <ChevronRight className="w-3 h-3 text-muted" />
          </button>
        </div>

      </div>

      {/* Wearable OS Studio Modal */}
      <WearableCompanionModal
        isOpen={isWearableOpen}
        onClose={() => setIsWearableOpen(false)}
        onNotification={onNotification}
      />
    </div>
  );
}
