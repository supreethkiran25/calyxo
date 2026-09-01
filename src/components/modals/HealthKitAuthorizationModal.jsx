import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, Activity, Flame, Moon, Dumbbell, 
  Check, ShieldCheck, ChevronRight, CheckCircle2, Watch
} from 'lucide-react';
import { HealthPermissionManager } from '../../services/health/HealthPermissionManager';
import { HealthDataService } from '../../services/health/HealthDataService';
import { HealthSyncEngine } from '../../services/health/HealthSyncEngine';

export default function HealthKitAuthorizationModal({ isOpen, onClose, onAuthorized, onNotification }) {
  const [turnOnAll, setTurnOnAll] = useState(true);
  const [categories, setCategories] = useState({
    steps: true,
    active_calories: true,
    heart_rate: true,
    sleep: true,
    exercise_sessions: true,
    distance: true,
    resting_heart_rate: true
  });
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  if (!isOpen) return null;

  const handleToggleAll = () => {
    const nextVal = !turnOnAll;
    setTurnOnAll(nextVal);
    setCategories({
      steps: nextVal,
      active_calories: nextVal,
      heart_rate: nextVal,
      sleep: nextVal,
      exercise_sessions: nextVal,
      distance: nextVal,
      resting_heart_rate: nextVal
    });
  };

  const handleToggleCategory = (key) => {
    const next = { ...categories, [key]: !categories[key] };
    setCategories(next);
    setTurnOnAll(Object.values(next).every(Boolean));
  };

  const handleAllow = async () => {
    setIsAuthorizing(true);
    try {
      // 1. Request real platform permissions
      const res = await HealthPermissionManager.requestPermissions({ includeOptional: true });
      const isGranted = Boolean(res && (res.hasRequired || res.isConnected));
      
      if (isGranted) {
        // 2. Query initial live metrics snapshot
        await HealthDataService.fetchTodayMetrics();
        await HealthSyncEngine.triggerSync().catch(() => {});

        if (onNotification) {
          onNotification('Apple Health permissions granted! Data sync is now active. ⌚');
        }

        if (onAuthorized) {
          onAuthorized({ authorized: true, categories });
        }
      } else {
        if (onNotification) {
          onNotification('Apple Health permission was not granted.');
        }
        if (onAuthorized) onAuthorized({ authorized: false });
      }
      onClose();
    } catch (err) {
      console.warn('[HealthKitModal] Authorization note:', err);
      if (onNotification) {
        onNotification('Could not complete authorization.');
      }
      if (onAuthorized) onAuthorized({ authorized: false });
      onClose();
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg bg-surface border border-card-border rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-card-border flex items-center justify-between bg-surface-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-foreground tracking-tight">Apple Health Access</h3>
                <p className="text-[11px] text-muted">Permissions & Data Sharing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-interactive flex items-center justify-center text-muted hover:text-foreground transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-foreground">
                "Calyxo" would like to access and update your Health data
              </h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Turn on categories below so Calyxo can calculate strain, recovery, burned calories, and workouts.
              </p>
            </div>

            {/* Turn On All Switch */}
            <div 
              onClick={handleToggleAll}
              className="p-3.5 rounded-2xl bg-surface-subtle border border-card-border flex items-center justify-between cursor-pointer hover:bg-surface-interactive transition-all"
            >
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Turn On All Categories</span>
              <div className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${turnOnAll ? 'bg-[#34C759] justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                <motion.div 
                  layout 
                  className="w-5 h-5 rounded-full shadow-md bg-white" 
                />
              </div>
            </div>

            {/* Category Checkboxes */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase text-muted tracking-wider">ALLOW "CALYXO" TO READ:</p>

              {[
                { key: 'steps', label: 'Steps & Daily Movement', desc: 'Hardware-verified daily step counts', icon: Activity, color: '#A3E635' },
                { key: 'active_calories', label: 'Active Energy Burned', desc: 'Total active calories burned from workouts & activity', icon: Flame, color: '#F97316' },
                { key: 'heart_rate', label: 'Heart Rate & Resting HR', desc: 'Cardiovascular strain, recovery & HRV analysis', icon: Heart, color: '#EC4899' },
                { key: 'sleep', label: 'Sleep Analysis', desc: 'Sleep duration, efficiency and deep sleep stages', icon: Moon, color: '#6366F1' },
                { key: 'exercise_sessions', label: 'Workouts & Training History', desc: 'Sync gym, running, cycling and HIIT sessions', icon: Dumbbell, color: '#00F0FF' }
              ].map((item) => {
                const isChecked = categories[item.key] ?? true;
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleCategory(item.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked ? 'bg-surface border-card-border shadow-sm' : 'bg-surface-subtle border-card-border/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-surface-subtle flex items-center justify-center shrink-0" style={{ color: item.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted">{item.desc}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isChecked ? 'bg-accent border-accent' : 'border-card-border'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-surface-subtle border border-card-border flex items-center gap-2 text-[11px] text-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>All biometric data remains strictly on your device and is never shared with third parties.</span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-4 border-t border-card-border flex items-center gap-3 bg-surface-subtle">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-card-border text-xs font-bold text-foreground hover:bg-surface-interactive transition-all cursor-pointer"
            >
              Don't Allow
            </button>
            <button
              type="button"
              disabled={isAuthorizing}
              onClick={handleAllow}
              className="flex-1 py-3 rounded-xl bg-accent hover:brightness-110 text-accent-foreground text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
            >
              {isAuthorizing ? (
                <span className="animate-spin text-xs">⚡ Authorizing...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Allow Access
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
