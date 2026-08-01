"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Smartphone, ShieldCheck, RefreshCw, Lock, Trash2, Download,
  CheckCircle2, AlertTriangle, Info, Database, Layers, ExternalLink
} from 'lucide-react';
import { HealthPermissionManager, REQUIRED_PERMISSIONS, OPTIONAL_PERMISSIONS } from '../../services/health/HealthPermissionManager';
import { HealthSyncEngine } from '../../services/health/HealthSyncEngine';
import { HealthHistoricalImporter } from '../../services/health/HealthHistoricalImporter';

export default function HealthConnectionsModal({ isOpen, onClose, onNotification }) {
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importTimeframe, setImportTimeframe] = useState('30d');
  const [importProgress, setImportProgress] = useState(null);

  const platform = HealthPermissionManager.getPlatform();
  const isConnected = HealthPermissionManager.isConnected();
  const grantedPerms = HealthPermissionManager.getGrantedPermissions();

  const platformName = platform === 'ios_apple_health'
    ? 'Apple Health (HealthKit)'
    : platform === 'android_health_connect'
    ? 'Android Health Connect'
    : 'Device Sensor & Health API';

  const handleConnect = async () => {
    await HealthPermissionManager.requestPermissions({ includeOptional: true });
    await HealthSyncEngine.triggerSync();
    if (onNotification) onNotification(`Connected to ${platformName}! Syncing health metrics.`);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    await HealthSyncEngine.triggerSync();
    setSyncing(false);
    if (onNotification) onNotification("Synced latest metrics from your device.");
  };

  const handleImportHistory = async () => {
    setImporting(true);
    try {
      const res = await HealthHistoricalImporter.importHistory(importTimeframe, (prog) => {
        setImportProgress(prog);
      });
      if (onNotification) onNotification(`Imported ${res.importedCount} historical workouts from ${platformName}!`);
    } catch (err) {
      if (onNotification) onNotification("Import error: " + err.message);
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  };

  const handleDeleteHistory = () => {
    if (window.confirm("Delete imported health records? This will clear local health cache.")) {
      HealthHistoricalImporter.deleteImportedHistory();
      if (onNotification) onNotification("Imported health cache cleared.");
    }
  };

  const handleDisconnect = () => {
    if (window.confirm("Disconnect health platform? Active sync will pause.")) {
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

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-surface border border-card-border rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-foreground"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-card-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide">Health Platform Connections</h3>
                <span className="text-xs text-muted font-medium">Apple Health (HealthKit) & Android Health Connect</span>
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
          <div className="p-4 rounded-2xl bg-card-bg border border-card-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted uppercase">Connected Platform</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-destructive/20 text-destructive border border-destructive/30'
              }`}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-black text-foreground">{platformName}</span>
              <span className="text-xs font-bold text-muted">
                {HealthSyncEngine.formatLastSyncTime()}
              </span>
            </div>

            {!isConnected && (
              <button
                onClick={handleConnect}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-md hover:brightness-110 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Connect {platformName}</span>
              </button>
            )}
          </div>

          {/* Historical Data Importer */}
          {isConnected && (
            <div className="p-4 rounded-2xl bg-card-bg border border-card-border space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase text-foreground">Import Health History</span>
                </div>
                <span className="text-[10px] font-bold text-muted">Multi-Timeframe</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {[
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: '90d', label: '90 Days' },
                  { id: '1y', label: '1 Year' }
                ].map(tf => (
                  <button
                    key={tf.id}
                    onClick={() => setImportTimeframe(tf.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                      importTimeframe === tf.id
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : 'bg-surface border-card-border text-muted hover:text-foreground'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {importProgress && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-muted">
                    <span>{importProgress.message}</span>
                    <span>{importProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${importProgress.percent}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={handleImportHistory}
                disabled={importing}
                className="w-full py-2.5 rounded-xl bg-surface border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${importing ? 'animate-bounce' : ''}`} />
                <span>{importing ? 'Importing History...' : `Import ${importTimeframe.toUpperCase()} History`}</span>
              </button>
            </div>
          )}

          {/* Granted Permissions Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted">Platform Permissions Scope</h4>
            <div className="grid grid-cols-2 gap-2">
              {[...REQUIRED_PERMISSIONS, ...OPTIONAL_PERMISSIONS].map(permKey => {
                const isGranted = !!grantedPerms[permKey];
                const label = permKey.replace(/_/g, ' ').toUpperCase();

                return (
                  <div key={permKey} className="flex justify-between items-center p-2 rounded-xl bg-card-bg/60 border border-card-border/60 text-[10px]">
                    <span className="font-bold text-foreground truncate">{label}</span>
                    <span className={`font-bold uppercase ${isGranted ? 'text-emerald-400' : 'text-muted'}`}>
                      {isGranted ? 'Granted' : 'Denied'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connection Troubleshooting */}
          <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-foreground font-bold uppercase">
              <Info className="w-4 h-4 text-emerald-400" /> Troubleshooting Guidance
            </div>
            <ul className="text-[11px] text-muted space-y-1 pl-4 list-disc leading-relaxed">
              <li><strong>iOS:</strong> Open iPhone Settings $\rightarrow$ Health $\rightarrow$ Data Access & Devices $\rightarrow$ Calyxo to re-enable permissions.</li>
              <li><strong>Android:</strong> Open Health Connect Settings $\rightarrow$ App Permissions $\rightarrow$ Calyxo $\rightarrow$ Allow All.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          {isConnected && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="py-3 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-md hover:brightness-110 flex items-center justify-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>

              <button
                onClick={handleDeleteHistory}
                className="py-3 rounded-2xl bg-surface border border-card-border text-muted font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-foreground flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="py-3 rounded-2xl bg-surface border border-destructive/40 text-destructive font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-destructive/10"
              >
                Disconnect
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
