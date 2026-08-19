"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, RefreshCw, Smartphone, Check, Lock, AlertTriangle } from 'lucide-react';
import { HealthPermissionManager, REQUIRED_PERMISSIONS, OPTIONAL_PERMISSIONS } from '../../services/health/HealthPermissionManager';
import { HealthSyncEngine } from '../../services/health/HealthSyncEngine';

export default function HealthSettingsModal({ isOpen, onClose, onNotification }) {
  const [syncing, setSyncing] = useState(false);
  const platform = HealthPermissionManager.getPlatform();
  const isConnected = HealthPermissionManager.isConnected();
  const grantedPerms = HealthPermissionManager.getGrantedPermissions();

  const platformName = platform === 'ios_apple_health'
    ? 'Apple Health (iOS)'
    : platform === 'android_health_connect'
    ? 'Android Health Connect'
    : 'Device Sensor & Health API';

  const handleSyncNow = async () => {
    setSyncing(true);
    await HealthSyncEngine.triggerSync();
    setSyncing(false);
    if (onNotification) onNotification("Synced health data with your device!");
  };

  const handleDisconnect = () => {
    if (window.confirm("Disconnect your health platform? Active data sync will stop.")) {
      HealthPermissionManager.disconnect();
      if (onNotification) onNotification("Health platform disconnected.");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-surface border border-card-border rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto text-foreground"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-card-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide">Health Data Settings</h3>
                <span className="text-xs text-muted font-medium">Single source of truth configuration</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-card-bg text-muted hover:text-foreground cursor-pointer border border-card-border"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Connection Status Card */}
          <div className="p-4 rounded-2xl bg-card-bg border border-card-border space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted uppercase">Connection Status</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-destructive/20 text-destructive border border-destructive/30'
              }`}>
                {isConnected ? 'Active & Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-bold text-foreground">{platformName}</span>
              <span className="text-[10px] font-bold text-muted">
                {HealthSyncEngine.formatLastSyncTime()}
              </span>
            </div>
          </div>

          {/* Granted Permissions List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted">Required & Optional Permissions</h4>

            <div className="space-y-2">
              {[...REQUIRED_PERMISSIONS, ...OPTIONAL_PERMISSIONS].map(permKey => {
                const isGranted = !!grantedPerms[permKey];
                const isRequired = REQUIRED_PERMISSIONS.includes(permKey);
                const label = permKey.replace(/_/g, ' ').toUpperCase();

                return (
                  <div key={permKey} className="flex justify-between items-center p-2.5 rounded-xl bg-card-bg/60 border border-card-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isGranted ? 'bg-emerald-400' : 'bg-muted'}`} />
                      <span className="font-bold uppercase tracking-wider text-foreground">{label}</span>
                      {isRequired && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">REQUIRED</span>
                      )}
                    </div>

                    <span className={`text-[10px] font-bold uppercase ${isGranted ? 'text-emerald-400' : 'text-muted'}`}>
                      {isGranted ? 'Granted' : 'Not Granted'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy Disclaimer */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" /> Privacy & Local Encryption
            </div>
            <p className="text-muted leading-relaxed text-[11px]">
              Calyxo imports health data strictly via native OS frameworks (Apple HealthKit & Android Health Connect). Your raw health data is encrypted and cached locally on your device.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleSyncNow}
              disabled={syncing || !isConnected}
              className="py-3.5 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-md hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Refresh Data'}</span>
            </button>

            <button
              onClick={handleDisconnect}
              disabled={!isConnected}
              className="py-3.5 rounded-2xl bg-surface border border-destructive/40 text-destructive font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-destructive/10 transition-all disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
